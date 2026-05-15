import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { toolRateLimit } from '@/lib/ratelimit';
import { MockInterviewRequestSchema } from '@/lib/security';
import { verifySession } from '@/lib/auth-verifier';

export async function POST(req: Request) {
  try {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: 'Auth Required' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await toolRateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    
    const validatedData = MockInterviewRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid Input', details: validatedData.error.issues }, 
        { status: 400 }
      );
    }

    const { messages, category } = validatedData.data;
    const score_request = body.score_request === true;

    const systemPrompt = score_request 
      ? `Analyze this interview transcript for ${category}. Provide: 1. Score (0-100), 2. Three strengths, 3. Three areas for improvement. Format as JSON.`
      : `You are a professional technical interviewer for a ${category} position. Be professional but encouraging. Ask one question at a time. Start by introducing yourself and asking the first question.`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await callAI(aiMessages as any, {
      temperature: score_request ? 0.3 : 0.7,
      maxTokens: 1000,
    });
    
    return NextResponse.json({ result: response.content });
  } catch (error) {
    console.error('[INTERVIEW_API_ERROR]', error);
    return NextResponse.json({ error: 'Interview Engine Failure' }, { status: 500 });
  }
}
