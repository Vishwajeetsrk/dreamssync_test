import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { verifySession } from '@/lib/auth-verifier';
import { globalRateLimit } from '@/lib/ratelimit';
import { callAI } from '@/lib/ai';

const BodySchema = z.object({
  text: z.string().min(2).max(10000)
});

const SYSTEM_PROMPT = `You are a professional LinkedIn Career Brand Consultant and Executive Resume Writer.
Your task is to take the student's raw career update draft and rewrite it to make it exceptionally professional, engaging, structured, and polished.

Instructions:
- Retain the core facts, location, names, and targets of the student's original post.
- Improve grammar, professional tone, and clarity.
- Structure it beautifully with clear spacing, paragraphs, and select bullet points.
- Incorporate highly professional career-oriented emojis at the beginning of bullet points (e.g., 💼, 🌏, ⭐️, ⚡) to increase visual interest.
- Add 3 relevant hashtags at the bottom (e.g., #OpenToWork, #CareerGrowth, #SoftwareDeveloper).
- Output ONLY the polished, formatted, and enhanced text content. 
- Do NOT include any markdown code fences, JSON, or greeting explanations before/after. Just return the polished text itself.`;

export async function POST(req: NextRequest) {
  // 1. Auth Guard
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // 2. Rate Limit
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await globalRateLimit.limit(`ai_enhance:${user.uid}:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests', message: 'Enhance limit hit. Try again shortly.' }, { status: 429 });
  }

  // 3. Parse Body
  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Text prompt parameter required.' }, { status: 400 });
    }

    const { text } = parsed.data;

    // 4. Call AI proxy
    const { content } = await callAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Please enhance this post draft:\n\n"${text}"` }
    ], {
      temperature: 0.7,
      maxTokens: 1000
    });

    return NextResponse.json({ success: true, enhancedText: content.trim() });
  } catch (err: any) {
    console.error('[AI Enhance POST] failed:', err);
    return NextResponse.json({ error: 'Failed to enhance text draft.' }, { status: 500 });
  }
}
