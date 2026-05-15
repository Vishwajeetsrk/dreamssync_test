import { NextResponse, NextRequest } from 'next/server';

import { verifySession } from '@/lib/auth-verifier';
import { globalRateLimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Auth Required' }, { status: 401 });
    }

    // 2. Rate Limit
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await globalRateLimit.limit(`${user.uid}:${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const data = await req.json();
    
    // In production, sync this to Supabase, Redis, or an analytics db
    console.log(`[USAGE LOG] User: ${data.userId || 'anon'} | Tokens: ${data.tokens || 0} | Tool: ${data.tool || 'chat'}`);
    
    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log usage' }, { status: 400 });
  }
}
