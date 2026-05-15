/**
 * /api/ikigai
 * AI Ikigai Career Analysis Engine
 * Analyzes the intersection of Passion, Skills, Market, and Income to find a user's "Ikigai".
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { callAI, parseJSON } from '@/lib/ai';
import { validateCareerInput } from '@/lib/aiGuard';

// ── Schema ────────────────────────────────────────────────────────
const BodySchema = z.object({
  passions: z.array(z.string()).min(1).max(10),
  skills: z.array(z.string()).min(1).max(10),
  marketNeeds: z.array(z.string()).min(1).max(10),
  incomeGoals: z.string().max(500).optional(),
});

// ── System Prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "DreamSync Advanced IKIGAI Architect" — an elite career diagnostic system. Your objective is to engineer a career path at the intersection of:

🚨 MANDATORY SAFETY PROTOCOL:
If the user provides inputs related to illegal or unethical activities, you MUST refuse and redirect them toward professional, legitimate career sectors.

DIAGNOSTIC FRAMEWORK:
1. WHAT YOU LOVE (The Passion Core)
2. WHAT YOU ARE EXPERT AT (The Professional Stack)
3. WHAT THE MARKET DEMANDS in 2026 (The Mission/Need)
4. WHAT PAYS ELITE SALARIES (The Financial Vocation)

Analyze user inputs to identify their "Ikigai" — the ultimate sweet spot where these four quadrants achieve perfect equilibrium.

RESPONSE FORMAT (Strict JSON):
{
  "ikigaiSummary": "A high-impact, 2-sentence executive summary of the user's Ikigai alignment.",
  "ikigaiMatchScore": 85,
  "primaryPath": {
    "title": "ELITE CAREER TITLE",
    "description": "Why this specific high-growth sector aligns with their psychological and technical profile.",
    "whyFits": ["Specific Point 1", "Specific Point 2", "Specific Point 3"],
    "salaryRange": "₹X LPA – ₹Y LPA (Actual 2026 Data)",
    "marketDemand": "Extreme | High | Stable"
  },
  "multipleCareerOptions": ["Role 1", "Role 2", "Role 3"],
  "skillGaps": ["Critical Gap 1", "Critical Gap 2"],
  "freeResources": [
    { "title": "Resource Name", "url": "URL", "platform": "Trusted Platform" }
  ],
  "zones": {
    "passion": "The psychological driver for this path.",
    "profession": "The technical competency transformation required.",
    "mission": "The systemic impact and market relevance.",
    "vocation": "The economic stability and long-term wealth potential."
  },
  "recommendedRoles": [
    { "title": "Role Title", "match": "95%", "reason": "Market-driven reason" }
  ],
  "roadmap": [
    { "step": "Foundational Phase", "focus": "Critical Skills", "duration": "30-60 Days" }
  ],
  "strengths": ["Leverageable Strength 1"],
  "weaknesses": ["Vulnerability Area 1"],
  "nextActionSteps": ["Strategic Action 1", "Strategic Action 2"],
  "nextAction": "The single most impactful first step to take within 24 hours."
}`;

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

  // 2. Validate Body
  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues[0]?.message }, { status: 400 });
    }
    body = parsed.data;

    // 4. Safety Guard
    const combinedInput = [
      ...body.passions,
      ...body.skills,
      ...body.marketNeeds,
      body.incomeGoals || ''
    ].join(' ');
    
    const safety = validateCareerInput(combinedInput);
    if (!safety.allowed) {
      return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sanitized = { ...body };

  // 5. Build Prompt
  const userPrompt = `DISCOVER MY IKIGAI:
PASSIONS: ${sanitized.passions.join(', ')}
SKILLS: ${sanitized.skills.join(', ')}
WORLD NEEDS: ${sanitized.marketNeeds.join(', ')}
INCOME GOALS: ${sanitized.incomeGoals}

Analyze these and find my ideal Ikigai path for the 2026 Indian job market.`;

  // 5. Call AI
  try {
    const { content, provider } = await callAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true, maxTokens: 2000, temperature: 0.8 });

    const result = parseJSON<object>(content);
    return NextResponse.json({ ...result, _provider: provider });

  } catch (error: unknown) {
    console.error('[ikigai] AI error:', error);
    return NextResponse.json({ error: 'Failed to analyze Ikigai. Please try again.' }, { status: 500 });
  }
}
