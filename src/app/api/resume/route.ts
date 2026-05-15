/**
 * /api/resume
 * AI Resume Content Generator (summary + bullet points)
 * Stack: Groq → OpenRouter → Gemini fallback
 * Features: Zod validation, rate limiting, Redis caching
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { callAI, parseJSON } from '@/lib/ai';
import { validateCareerInput } from '@/lib/aiGuard';

// ── Schema ────────────────────────────────────────────────────────
const BodySchema = z.object({
  action: z.enum(['generate_summary', 'generate_bullets']),
  // Common fields
  fullName: z.string().max(100).optional(),
  targetRole: z.string().max(100).optional(),
  skills: z.string().max(500).optional(),
  education: z.string().max(500).optional(),
  experienceStatus: z.enum(['fresher', 'experience', 'internship', '']).optional(),
  // For summary
  projects: z.string().max(1000).optional(),
  achievements: z.string().max(500).optional(),
  // For bullets
  experience: z.string().max(2000).optional(),
  // Optional extras
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  linkedin: z.string().max(200).optional(),
  portfolio: z.string().max(200).optional(),
  github: z.string().max(200).optional(),
  languages: z.string().max(200).optional(),
  hobbies: z.string().max(200).optional(),
});

// ── Prompts ───────────────────────────────────────────────────────
function buildSummaryPrompt(data: z.infer<typeof BodySchema>): string {
  return `Write a powerful 3-4 sentence professional resume summary for this candidate.
Make it ATS-optimized, quantified where possible, and tailored for Indian job market.

CANDIDATE PROFILE:
- Name: ${data.fullName || 'Not provided'}
- Target Role: ${data.targetRole || 'Software Engineer'}
- Status: ${data.experienceStatus || 'fresher'}
- Skills: ${data.skills || 'Not specified'}
- Education: ${data.education || 'Not specified'}
- Projects: ${data.projects || 'Not specified'}
- Achievements: ${data.achievements || 'Not specified'}

Return JSON: { "summary": "<3-4 sentence professional summary>" }`;
}

function buildBulletsPrompt(data: z.infer<typeof BodySchema>): string {
  return `Rewrite these raw experience/internship notes into 3-5 powerful resume bullet points.
Use the STAR method (Situation, Task, Action, Result). Start each with a strong action verb.
Maximize ATS keywords for Indian job market. Quantify impact wherever possible.

CANDIDATE STATUS: ${data.experienceStatus || 'fresher'}
TARGET ROLE: ${data.targetRole || 'Software Engineer'}

RAW EXPERIENCE NOTES:
${data.experience || 'No experience provided'}

Return JSON: { "bullets": ["• Bullet 1", "• Bullet 2", "• Bullet 3"] }`;
}

const SYSTEM_PROMPT =
  'You are an expert technical resume writer for the Indian job market. ' +
  'SAFETY MANDATE: You MUST refuse to generate content related to harmful, illegal, unethical, or dangerous activities. Only provide safe and professional career guidance. ' +
  'You write ATS-optimized, impactful resume content. ' +
  'Always return strict JSON output matching the expected format. No markdown, no extra text.';

import { verifySession } from '@/lib/auth-verifier';
import { toolRateLimit } from '@/lib/ratelimit';

// ── Handler ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Verify Authentication
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ error: 'Auth Required' }, { status: 401 });
  }

  // 2. Rate Limit
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success } = await toolRateLimit.limit(`${user.uid}:${ip}`);
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // 2. Validate
  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues[0]?.message },
        { status: 400 }
      );
    }
    body = parsed.data;

    // 4. Safety Guard
    const combinedInput = `${body.targetRole} ${body.projects || ''} ${body.experience || ''}`;
    const safety = validateCareerInput(combinedInput);
    if (!safety.allowed) {
      return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }


  const sanitized = { ...body };


  // 5. Build prompt
  const userPrompt =
    sanitized.action === 'generate_summary'
      ? buildSummaryPrompt(sanitized)
      : buildBulletsPrompt(sanitized);

  const aiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: userPrompt },
  ];

  // 6. Call AI
  try {
    const { content, provider } = await callAI(aiMessages, {
      jsonMode: true,
      maxTokens: 600,
      temperature: 0.65,
    });

    const result = parseJSON<object>(content);

    return NextResponse.json({ ...result, _provider: provider });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI error';
    console.error('[resume] All providers failed:', msg);

    // Return safe defaults so the UI doesn't break
    if (body.action === 'generate_summary') {
      return NextResponse.json({
        summary:
          `Motivated ${body.experienceStatus || 'fresher'} with a strong foundation in ${body.skills || 'software development'}. ` +
          `Eager to contribute to innovative teams and deliver high-quality solutions. ` +
          `Passionate about continuous learning and professional growth in the tech industry.`,
        _fallback: true,
      });
    } else {
      return NextResponse.json({
        bullets: [
          '• Collaborated with cross-functional teams to deliver project milestones on schedule',
          '• Applied software development best practices to improve code quality and maintainability',
          '• Participated in code reviews and implemented feedback to enhance technical skills',
        ],
        _fallback: true,
      });
    }
  }
}
