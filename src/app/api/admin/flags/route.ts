import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  enabledAt?: string;
  disabledAt?: string;
  adminNotes?: string;
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  { name: 'crisis_detection', enabled: true, description: 'Enable crisis/mental health detection system' },
  { name: 'ai_resume_builder', enabled: true, description: 'Enable AI-powered resume builder' },
  { name: 'recruiter_verification', enabled: true, description: 'Require recruiter verification' },
  { name: 'mentor_verification', enabled: true, description: 'Require mentor verification' },
  { name: 'scholarship_board', enabled: true, description: 'Show scholarship opportunities section' },
  { name: 'community_posts', enabled: true, description: 'Enable community posting' },
  { name: 'job_board', enabled: true, description: 'Enable job listings board' },
  { name: 'interview_simulator', enabled: true, description: 'Enable mock interview simulator' },
  { name: 'roadmap_generator', enabled: true, description: 'Enable career roadmap AI generator' },
  { name: 'portfolio_ai', enabled: true, description: 'Enable AI portfolio builder' },
  { name: 'analytics_dashboard', enabled: true, description: 'Show analytics to super admin' },
  { name: 'maintenance_mode', enabled: false, description: 'Put platform in maintenance mode' }
];

export async function GET(req: NextRequest) {
  try {
    const snapshot = await getDocs(collection(db, 'featureFlags'));

    let flags: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no flags exist, initialize defaults
    if (flags.length === 0) {
      for (const flag of DEFAULT_FLAGS) {
        await setDoc(doc(db, 'featureFlags', flag.name), flag);
      }
      flags = DEFAULT_FLAGS.map((f, i) => ({ id: f.name, ...f }));
    }

    return NextResponse.json({
      success: true,
      flags
    });
  } catch (err) {
    console.error('[Feature Flags] Error:', err);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { flagName, enabled, adminNotes } = await req.json();

    if (!flagName || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const timestamp = enabled ? Timestamp.now() : null;

    await setDoc(doc(db, 'featureFlags', flagName), {
      name: flagName,
      enabled,
      description: `Feature flag: ${flagName}`,
      enabledAt: enabled ? new Date().toISOString() : null,
      disabledAt: !enabled ? new Date().toISOString() : null,
      adminNotes: adminNotes || '',
      lastUpdated: Timestamp.now()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      flagName,
      enabled,
      message: `Feature flag ${enabled ? 'enabled' : 'disabled'}`
    });
  } catch (err) {
    console.error('[Feature Flag Update] Error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
