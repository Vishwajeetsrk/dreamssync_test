import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export async function PATCH(req: NextRequest) {
  try {
    const { documentId, userId, action, adminNotes } = await req.json();

    if (!documentId || !userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (action === 'approve') {
      await updateDoc(doc(db, 'verification_documents', documentId), {
        status: 'approved',
        verified: true,
        reviewedAt: Timestamp.now(),
        adminNotes: adminNotes || 'Approved by admin'
      });

      await updateDoc(doc(db, 'users', userId), {
        verified: true,
        pendingVerification: false,
        verificationApprovedAt: Timestamp.now()
      });
    } else if (action === 'reject') {
      await updateDoc(doc(db, 'verification_documents', documentId), {
        status: 'rejected',
        verified: false,
        reviewedAt: Timestamp.now(),
        rejectionReason: adminNotes || 'Document rejected by admin',
        adminNotes: adminNotes || 'Rejected - please resubmit'
      });

      await updateDoc(doc(db, 'users', userId), {
        verified: false,
        pendingVerification: false
      });
    }

    return NextResponse.json({
      success: true,
      action,
      documentId,
      message: `Document ${action}ed successfully`
    });
  } catch (err) {
    console.error('[Verification Action] Error:', err);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
