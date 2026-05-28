import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/auth-verifier';
import { globalRateLimit } from '@/lib/ratelimit';
import { getAdminDb } from '@/lib/firebase-admin';
import { logAdminAction } from '@/lib/audit';

// ── Validation Schemas ──────────────────────────────────────────────
const JobCreateSchema = z.object({
  title: z.string().min(2).max(100),
  company: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  salary: z.string().optional().default('Competitive'),
  type: z.enum(['Full-time', 'Internship', 'Contract']),
  link: z.string().url(),
  approved: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false)
});

const JobUpdateSchema = JobCreateSchema.partial().extend({
  id: z.string().min(1)
});

// ── GET: Fetch jobs list (including unapproved) for Admin view ───────
export async function GET(req: NextRequest) {
  // 1. Auth Guard
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Administrative clearance required.' }, { status: 403 });
  }

  // 2. Fetch from Firestore
  try {
    const db = getAdminDb();
    const snap = await db.collection('jobs').orderBy('created_at', 'desc').get();
    const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    console.error('[Admin Jobs GET] failed:', err);
    return NextResponse.json({ error: 'Failed to sync job buffers.' }, { status: 500 });
  }
}

// ── POST: Create Job Posting ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth Guard
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Administrative clearance required.' }, { status: 403 });
  }

  // 2. Rate Limit
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await globalRateLimit.limit(`admin_jobs:${adminUser.uid}:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  // 3. Parse and Validate
  try {
    const raw = await req.json();
    const parsed = JobCreateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Schema validation error.', details: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const db = getAdminDb();
    const newJob = {
      ...parsed.data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reportsCount: 0,
      createdBy: adminUser.uid
    };

    const docRef = await db.collection('jobs').add(newJob);
    
    // Log Admin Action
    await logAdminAction(
      adminUser.name || adminUser.email || 'Admin',
      'CREATE_JOB',
      `Created job "${parsed.data.title}" at "${parsed.data.company}" (ID: ${docRef.id})`
    );

    return NextResponse.json({ success: true, id: docRef.id, job: newJob });
  } catch (err: any) {
    console.error('[Admin Jobs POST] failed:', err);
    return NextResponse.json({ error: 'Failed to deploy job resource.' }, { status: 400 });
  }
}

// ── PUT: Modify / Approve / Feature Job ────────────────────────────────
export async function PUT(req: NextRequest) {
  // 1. Auth Guard
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Administrative clearance required.' }, { status: 403 });
  }

  // 2. Parse & Validate
  try {
    const raw = await req.json();
    const parsed = JobUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Schema validation error.', details: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { id, ...updateFields } = parsed.data;
    const db = getAdminDb();
    const jobRef = db.collection('jobs').doc(id);
    
    const existingSnap = await jobRef.get();
    if (!existingSnap.exists) {
      return NextResponse.json({ error: 'Job resource not found.' }, { status: 444 });
    }

    await jobRef.update({
      ...updateFields,
      updated_at: new Date().toISOString()
    });

    // Log Action
    await logAdminAction(
      adminUser.name || adminUser.email || 'Admin',
      'UPDATE_JOB',
      `Modified job properties for "${existingSnap.data()?.title}" (ID: ${id})`
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Jobs PUT] failed:', err);
    return NextResponse.json({ error: 'Failed to modify job resource.' }, { status: 400 });
  }
}

// ── DELETE: Purge Job Listing ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  // 1. Auth Guard
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: 'Administrative clearance required.' }, { status: 403 });
  }

  // 2. Parse
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Job ID parameter required.' }, { status: 400 });
    }

    const db = getAdminDb();
    const jobRef = db.collection('jobs').doc(id);
    const existingSnap = await jobRef.get();
    
    if (!existingSnap.exists) {
      return NextResponse.json({ error: 'Job resource already purged.' }, { status: 444 });
    }

    await jobRef.delete();

    // Log Action
    await logAdminAction(
      adminUser.name || adminUser.email || 'Admin',
      'DELETE_JOB',
      `Purged job listing "${existingSnap.data()?.title}" by "${existingSnap.data()?.company}" (ID: ${id})`
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Jobs DELETE] failed:', err);
    return NextResponse.json({ error: 'Failed to delete job resource.' }, { status: 500 });
  }
}
