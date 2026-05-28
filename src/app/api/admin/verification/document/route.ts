import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, documentUrl, documentName, applicantType, uploadedAt } = await req.json();

    if (!userId || !documentUrl || !applicantType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'verification_documents'), {
      userId,
      userEmail: userEmail || 'unknown@email.com',
      documentUrl,
      documentName: documentName || 'Verification Document',
      applicantType,
      status: 'pending',
      uploadedAt: uploadedAt || Timestamp.now(),
      reviewedAt: null,
      reviewedBy: null,
      verified: false,
      adminNotes: '',
      rejectionReason: null
    });

    // Update user profile to link document
    await updateDoc(doc(db, 'users', userId), {
      verificationDocumentId: docRef.id,
      pendingVerification: true,
      verificationUpdatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      documentId: docRef.id,
      message: 'Document uploaded for verification'
    });
  } catch (err) {
    console.error('[Document Upload] Error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const applicantType = searchParams.get('type'); // 'recruiter' or 'mentor'

    let q: any = query(
      collection(db, 'verification_documents'),
      where('status', '==', status)
    );

    if (applicantType) {
      q = query(
        collection(db, 'verification_documents'),
        where('status', '==', status),
        where('applicantType', '==', applicantType)
      );
    }

    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt?.toDate?.().toISOString() || new Date().toISOString(),
        reviewedAt: data.reviewedAt?.toDate?.().toISOString() || null
      };
    });

    return NextResponse.json({
      success: true,
      total: documents.length,
      documents
    });
  } catch (err) {
    console.error('[Verification Query] Error:', err);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
