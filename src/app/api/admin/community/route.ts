import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/auth-verifier';
import { globalRateLimit } from '@/lib/ratelimit';
import { getAdminDb } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/audit';

// ── Validation Schemas ──────────────────────────────────────────────
const ModerateActionSchema = z.object({
  postId: z.string().optional(),
  reportId: z.string().optional(),
  userId: z.string().optional(),
  action: z.enum(['hide_post', 'dismiss_report', 'shadow_ban', 'restore_post'])
});

// ── POST: Moderation operations ──────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth Guard
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Administrative clearance required.' }, { status: 403 });
  }

  // 2. Rate Limit
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await globalRateLimit.limit(`admin_community:${adminUser.uid}:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  // 3. Parse & Moderate
  try {
    const raw = await req.json();
    const parsed = ModerateActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Schema validation error.', details: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { postId, reportId, userId, action } = parsed.data;
    const db = getAdminDb();

    // SCENARIO 1: Hide flagged post (Shadow Hide)
    if (action === 'hide_post' && postId) {
      const postRef = db.collection('community_posts').doc(postId);
      const snap = await postRef.get();
      if (!snap.exists) return NextResponse.json({ error: 'Post not found.' }, { status: 444 });
      
      await postRef.update({ hidden: true });
      
      // Update matching reports to "resolved"
      if (reportId) {
        await db.collection('reports').doc(reportId).update({ status: 'resolved' });
      }

      await logAdminAction(
        adminUser.name || adminUser.email || 'Admin',
        'MODERATE_POST_HIDE',
        `Hided community post by "${snap.data()?.authorName}" (PostID: ${postId})`
      );
      
      return NextResponse.json({ success: true, message: 'Post concealed successfully.' });
    }

    // SCENARIO 2: Dismiss community report (Dismiss Alarm)
    if (action === 'dismiss_report' && reportId) {
      const reportRef = db.collection('reports').doc(reportId);
      const snap = await reportRef.get();
      if (!snap.exists) return NextResponse.json({ error: 'Report not found.' }, { status: 444 });

      await reportRef.update({ status: 'dismissed' });

      // Reset reportsCount on target post if applicable
      const targetId = snap.data()?.targetId;
      if (targetId && snap.data()?.type === 'community_post') {
        const postRef = db.collection('community_posts').doc(targetId);
        const postSnap = await postRef.get();
        if (postSnap.exists) {
          await postRef.update({ reportsCount: 0 });
        }
      } else if (targetId && snap.data()?.type === 'job') {
        const jobRef = db.collection('jobs').doc(targetId);
        const jobSnap = await jobRef.get();
        if (jobSnap.exists) {
          await jobRef.update({ reportsCount: 0 });
        }
      }

      await logAdminAction(
        adminUser.name || adminUser.email || 'Admin',
        'MODERATE_REPORT_DISMISS',
        `Dismissed report on target ${targetId} (ReportID: ${reportId})`
      );

      return NextResponse.json({ success: true, message: 'Report dismissed.' });
    }

    // SCENARIO 3: Shadow Ban user
    if (action === 'shadow_ban' && userId) {
      const userRef = db.collection('users').doc(userId);
      const snap = await userRef.get();
      if (!snap.exists) return NextResponse.json({ error: 'User document not found.' }, { status: 444 });

      const currentStatus = snap.data()?.status || 'active';
      const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      
      await userRef.update({ 
        status: nextStatus,
        role: nextStatus === 'suspended' ? 'suspended' : 'student' // Locks out permissions
      });

      await logAdminAction(
        adminUser.name || adminUser.email || 'Admin',
        nextStatus === 'suspended' ? 'MODERATE_USER_BAN' : 'MODERATE_USER_UNBAN',
        `Toggled user status of "${snap.data()?.name || snap.data()?.email}" to "${nextStatus}" (UID: ${userId})`
      );

      return NextResponse.json({ success: true, message: `User status updated to ${nextStatus}.` });
    }

    // SCENARIO 4: Restore post (Unhide)
    if (action === 'restore_post' && postId) {
      const postRef = db.collection('community_posts').doc(postId);
      const snap = await postRef.get();
      if (!snap.exists) return NextResponse.json({ error: 'Post not found.' }, { status: 444 });

      await postRef.update({ hidden: false, reportsCount: 0 });

      await logAdminAction(
        adminUser.name || adminUser.email || 'Admin',
        'MODERATE_POST_RESTORE',
        `Restored community post by "${snap.data()?.authorName}" (PostID: ${postId})`
      );

      return NextResponse.json({ success: true, message: 'Post restored successfully.' });
    }

    return NextResponse.json({ error: 'Unsupported moderation action.' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Community POST] failed:', err);
    return NextResponse.json({ error: 'Administrative operation failed.' }, { status: 500 });
  }
}

// ── DELETE: Permanent post purge ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  // 1. Auth Guard
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Administrative clearance required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Post ID parameter required.' }, { status: 400 });
    }

    const db = getAdminDb();
    const postRef = db.collection('community_posts').doc(id);
    const snap = await postRef.get();
    
    if (!snap.exists) {
      return NextResponse.json({ error: 'Post already purged.' }, { status: 444 });
    }

    await postRef.delete();

    // Log Action
    await logAdminAction(
      adminUser.name || adminUser.email || 'Admin',
      'MODERATE_POST_PURGE',
      `Permanently purged post by "${snap.data()?.authorName}" (ID: ${id})`
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Community DELETE] failed:', err);
    return NextResponse.json({ error: 'Purge operation failed.' }, { status: 500 });
  }
}
