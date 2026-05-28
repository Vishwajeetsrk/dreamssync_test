import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp, query, where, orderBy } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { title, description, eligibility, deadline, state, link, tags, amount, provider } = await req.json();

    if (!title || !description || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const scholarshipRef = await addDoc(collection(db, 'scholarships'), {
      title,
      description,
      eligibility: eligibility || 'All students',
      deadline,
      state: state || 'All India',
      link: link || '',
      tags: tags || [],
      amount: amount || 'Not specified',
      provider: provider || 'Unknown',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      active: true
    });

    return NextResponse.json({
      success: true,
      id: scholarshipRef.id,
      message: 'Scholarship created'
    });
  } catch (err) {
    console.error('[Scholarship Create] Error:', err);
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const tag = searchParams.get('tag');
    const active = searchParams.get('active') !== 'false';

    let q: any = query(
      collection(db, 'scholarships'),
      where('active', '==', active),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    let scholarships = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString()
      };
    });

    // Client-side filtering
    if (state) {
      scholarships = scholarships.filter(s => s.state.includes(state));
    }
    if (tag) {
      scholarships = scholarships.filter(s => s.tags?.includes(tag));
    }

    return NextResponse.json({
      success: true,
      total: scholarships.length,
      scholarships
    });
  } catch (err) {
    console.error('[Scholarship Query] Error:', err);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { scholarshipId, ...updates } = await req.json();

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Missing scholarship ID' }, { status: 400 });
    }

    await updateDoc(doc(db, 'scholarships', scholarshipId), {
      ...updates,
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      scholarshipId,
      message: 'Scholarship updated'
    });
  } catch (err) {
    console.error('[Scholarship Update] Error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scholarshipId = searchParams.get('id');

    if (!scholarshipId) {
      return NextResponse.json({ error: 'Missing scholarship ID' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'scholarships', scholarshipId));

    return NextResponse.json({
      success: true,
      scholarshipId,
      message: 'Scholarship deleted'
    });
  } catch (err) {
    console.error('[Scholarship Delete] Error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
