import { callAI, parseJSON } from '@/lib/ai';
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
      ? `Analyze the following interview transcript for a ${category} candidate.
Evaluate their responses carefully and provide a structured critique in the EXACT JSON format below. Do not include any text other than the JSON object:
{
  "score": 85,
  "strengths": ["Strong answer regarding scalability", "Excellent problem decomposition", "Professional and concise articulation"],
  "areas": ["Could expand more on specific failure cases", "Add concrete metrics to experience examples", "Focus deeper on algorithmic trade-offs"]
}`
      : `You are "DreamSync Ultimate Interviewer" — a world-class professional technical interviewer evaluating candidates for a ${category} position.
Be professional, observant, and encouraging. Ask exactly one logical question at a time. Maintain context based on previous answers.
Start the interaction by introducing yourself briefly and asking the candidate the very first question.`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await callAI(aiMessages as any, {
      temperature: score_request ? 0.3 : 0.7,
      maxTokens: score_request ? 1000 : 600,
      jsonMode: score_request
    });

    let finalResult: any = response.content;
    if (score_request) {
      try {
        finalResult = parseJSON(response.content);
      } catch (e) {
        console.error('[INTERVIEW_API_ERROR] JSON parsing failed:', e);
        // Fallback structure
        finalResult = {
          score: 75,
          strengths: ['Good effort', 'Cooperative approach', 'Domain familiarity'],
          areas: ['Try to structure answers with STAR', 'Be more specific in examples', 'Speak with higher technical depth']
        };
      }
    }
    
    return NextResponse.json({ result: finalResult });
  } catch (error) {
    console.error('[INTERVIEW_API_ERROR]', error);
    return NextResponse.json({ error: 'Interview Engine Failure' }, { status: 500 });
  }
}
