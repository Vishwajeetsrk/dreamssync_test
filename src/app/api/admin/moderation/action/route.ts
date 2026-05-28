import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, deleteDoc, collection, getDoc } from 'firebase/firestore';

export async function PATCH(req: NextRequest) {
  try {
    const { reportId, action, adminNotes, adminId } = await req.json();

    if (!reportId || !['approve', 'reject', 'escalate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const reportRef = doc(db, 'moderation_reports', reportId);
    const reportDoc = await getDoc(reportRef);

    if (!reportDoc.exists()) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reportData = reportDoc.data();

    if (action === 'approve') {
      // Mark as approved and optionally delete the flagged content
      await updateDoc(reportRef, {
        status: 'approved',
        reviewedAt: Timestamp.now(),
        reviewedBy: adminId || 'system',
        adminNotes: adminNotes || 'Content approved by moderator'
      });

      // Delete the flagged content
      if (reportData.contentType === 'community_post') {
        try {
          await deleteDoc(doc(db, 'community_posts', reportData.contentId));
        } catch (err) {
          console.warn('Could not delete post:', err);
        }
      }
    } else if (action === 'reject') {
      // Mark as rejected (content stays visible)
      await updateDoc(reportRef, {
        status: 'rejected',
        reviewedAt: Timestamp.now(),
        reviewedBy: adminId || 'system',
        adminNotes: adminNotes || 'Report marked false positive'
      });
    } else if (action === 'escalate') {
      // Mark for higher-level review
      await updateDoc(reportRef, {
        status: 'escalated',
        reviewedAt: Timestamp.now(),
        reviewedBy: adminId || 'system',
        adminNotes: adminNotes || 'Escalated for senior review'
      });
    }

    return NextResponse.json({
      success: true,
      action,
      reportId,
      message: `Report ${action}ed successfully`
    });
  } catch (err) {
    console.error('[Moderation Action] Error:', err);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
