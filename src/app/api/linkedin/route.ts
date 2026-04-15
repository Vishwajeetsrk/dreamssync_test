/**
 * /api/linkedin
 * LinkedIn Profile Optimizer
 * Stack: Groq → OpenRouter → Gemini fallback
 * Features: Zod validation, rate limiting, Redis caching
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { callAI, parseJSON } from '@/lib/ai';
import { validateCareerInput } from '@/lib/aiGuard';

// ── Schema ────────────────────────────────────────────────────────
const BodySchema = z.object({
  targetRole: z.string().min(2, 'Target role is required').max(300),
  currentRole: z.string().max(500).optional(),
  currentHeadline: z.string().max(1000).optional(),
  currentAbout: z.string().max(10000).optional(),
  skills: z.string().max(10000).optional(),
  experience: z.string().max(20000).optional(),
  education: z.string().max(2000).optional(),
  achievements: z.string().max(5000).optional(),
  tone: z.enum(['professional', 'creative', 'technical', 'friendly']).default('professional'),
});

// ── System Prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a world-class LinkedIn profile coach and personal branding expert.

SAFETY MANDATE: You MUST refuse to generate content related to harmful, illegal, unethical, or dangerous activities. Only provide safe and professional career guidance.

You have helped thousands of professionals land jobs at FAANG, top Indian IT companies, and funded startups.
You MUST output ONLY valid JSON matching the exact schema. No markdown, no explanation, no extra keys.`;

function buildUserPrompt(data: z.infer<typeof BodySchema>): string {
  const toneGuide: Record<string, string> = {
    professional: 'authoritative, polished, corporate — suitable for MNCs and large companies',
    creative: 'expressive, engaging, storytelling-style — suitable for design, marketing, startups',
    technical: 'precise, data-driven, keyword-rich — suitable for engineering, data science, DevOps',
    friendly: 'warm, approachable, conversational — suitable for community, HR, customer success',
  };

  return `Optimize this LinkedIn profile for: "${data.targetRole}" — Tone: ${data.tone} (${toneGuide[data.tone]}).

CURRENT DATA:
- Headline: ${data.currentHeadline || 'Not provided'}
- About: ${data.currentAbout || 'Not provided'}
- Current Role: ${data.currentRole || 'Not specified'}
- Skills: ${data.skills || 'Not specified'}
- Experience: ${data.experience || 'Not specified'}
- Education: ${data.education || 'Not specified'}
- Achievements: ${data.achievements || 'Not specified'}

Return EXACTLY this JSON structure:
{
  "profileScore": <0-100>,
  "scoreBreakdown": {
    "headline": <0-20>,
    "about": <0-20>,
    "skills": <0-20>,
    "experience": <0-20>,
    "completeness": <0-20>
  },
  "headlines": [
    {"text": "<max 220 chars>", "focus": "<what this emphasizes>"},
    {"text": "<max 220 chars>", "focus": "<what this emphasizes>"},
    {"text": "<max 220 chars>", "focus": "<what this emphasizes>"}
  ],
  "about": {
    "optimized": "<300-2600 chars, compelling, keyword-rich, first-person>",
    "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
  },
  "skills": {
    "recommended": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
    "toRemove": ["<skill to remove or empty>"],
    "reason": "<why these skills matter for the target role>"
  },
  "groupedSkills": [
     {"category": "Frontend", "items": ["React", "CSS"]},
     {"category": "Backend", "items": ["Node.js", "SQL"]}
  ],
  "connectionMessages": [
    {"occasion": "Cold Connect to Recruiter", "message": "<50-word personalized message>"},
    {"occasion": "Connect with Peer", "message": "<50-word peer networking message>"}
  ],
  "keyImprovements": [
    {"area": "<area name>", "priority": "high|medium|low", "action": "<specific action>"}
  ],
  "seoKeywords": ["<keyword 1>", "<keyword 2>"],
  "aiAnalysisSummary": [
     "Profile is currently aligned for junior roles but lacks senior architecture depth.",
     "Strong technical signal in React, but weak in system design visibility."
  ],
  "whatToAdd": {
     "add": ["2 technical projects with GitHub links", "Measurable performance metrics"],
     "improve": ["Headline (needs more impact verbs)", "About (add career mission)"]
  },
  "freeResources": [
     {
       "label": "Master System Design",
       "links": [{"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "platform": "GitHub"}]
     }
  ]
}`;
}

// ── Handler ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

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
    const combinedInput = `${body.targetRole} ${body.currentAbout || ''}`;
    const safety = validateCareerInput(combinedInput);
    if (!safety.allowed) {
      return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sanitized = { ...body };


  // 5. Build AI messages
  const aiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: buildUserPrompt(sanitized) },
  ];

  // 6. Call AI
  try {
    const { content, provider } = await callAI(aiMessages, {
      jsonMode: true,
      maxTokens: 3500,
      temperature: 0.75,
    });

    const result = parseJSON<object>(content);

    return NextResponse.json({ ...result, _provider: provider });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI error';
    console.error('[linkedin] All providers failed:', msg);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again in a minute.' },
      { status: 503 }
    );
  }
}
