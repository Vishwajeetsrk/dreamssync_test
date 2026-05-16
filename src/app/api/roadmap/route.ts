/**
 * /api/roadmap
 * High-Depth Roadmap Architect — phase-by-phase career planning
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { callAI, parseJSON } from '@/lib/ai';
import { validateCareerInput, validateCareerRole } from '@/lib/aiGuard';

// ── Schema ────────────────────────────────────────────────────────
const BodySchema = z.object({
  role: z.string().min(2, "Role is required").max(100),
  goal: z.string().max(500).optional(),
  experience: z.string().max(100).default('Beginner'),
});

// ── System Prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "DreamSync AI Roadmap Architect" — an elite career intelligence system. Your job is to generate structured, real-world, actionable career roadmaps specifically for the Indian market in a 2026 professional context.

🚨 MANDATORY SAFETY PROTOCOL:
If the user requests information about illegal or harmful activities, you MUST politely decline and provide a roadmap for a closely related legitimate career (e.g., Cyber Security instead of Fraud/Hacking).

🎯 ARCHITECTURAL STANDARDS:
- Target roles that are professional, legal, and have high-income potential.
- Realistic but accelerated timelines (3-12 months).
- 4 comprehensive phases: Foundation, Core Competency, Advanced Stack, and Market Ready.
- Prioritize ELITE FREE resources (Harvard CS50, DeepLearning.AI, roadmap.sh, MDN).

RETURN EXACT JSON STRUCTURE:
{
  "totalTimeline": "6-8 Months",
  "targetRole": "Professional Role Name",
  "globalPrerequisites": {
    "education": "Academic / Background requirements",
    "requiredKnowledge": ["Logical Thinking", "Internet Basics"],
    "technicalSkills": ["Prerequisite Skill 1"]
  },
  "timeline": [{
     "title": "PHASE 1: FOUNDATION",
     "time": "Weeks 1-4",
     "desc": "High-impact summary of core fundamentals",
     "phasePrerequisites": ["Required basics"],
     "skillsToLearn": ["Skill A", "Skill B"],
     "build": "Specific mini-project to validate learning",
     "studyMaterials": [{ "label": "Verified Lab", "url": "https://...", "summary": "Executive summary" }],
     "videoLectures": [{ "label": "Expert Instruction", "url": "https://...", "summary": "Video briefing" }],
     "preparationTools": [{ "label": "Industry Standard", "url": "https://...", "summary": "Tool description" }],
     "aiTools": [{ "label": "AI Accelerator", "url": "https://...", "summary": "Prompting strategy for this phase" }]
  }],
  "marketInsights": {
    "salaryIndia": "₹12-25 LPA",
    "salaryGlobal": "$80k-150k",
    "demandLevel": "Extreme / High"
  },
  "realJobRoles": [
    { "title": "Job Title", "companies": "Google, Groww, Zomato, Startups", "skills": "Required tech stack" }
  ],
  "criticalIntelligence": {
    "whatMatters": "The single most important technical signal for hiring",
    "mistakesToAvoid": "Pitfalls that result in automatic rejection",
    "hiringTips": "Insider strategy to secure an interview"
  }
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

  // 3. Validate
  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues[0]?.message }, { status: 400 });
    }
    body = parsed.data;

    // 4. Safety & Role Integrity Guard
    const roleValidation = validateCareerRole(body.role);
    if (!roleValidation.allowed) {
      return NextResponse.json({ error: 'Safety Violation', details: roleValidation.message }, { status: 400 });
    }

    const safety = validateCareerInput(body.role);
    if (!safety.allowed) {
      return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { role, goal = 'Job ready', experience } = body;


  // 6. Build AI messages
  const userPrompt = `Generate a high-grade career roadmap for: ${role}. 
Experience level: ${experience}. 
Target Goal: ${goal}.

REQUIREMENTS:
1. 4-6 phases max.
2. Every link MUST be REAL and ACTIVE.
3. For Data Science/AI roles, you MUST include the FreeCodeCamp link (https://www.youtube.com/watch?v=LHc6W2K7U8A).`;

  try {
    const { content, provider } = await callAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ], { jsonMode: true, maxTokens: 2500, temperature: 0.7 });

    const result = parseJSON<object>(content);
    return NextResponse.json({ ...result, _provider: provider });

  } catch (error: unknown) {
    console.error('[roadmap] All providers failed:', error);
    return NextResponse.json({ error: 'AI Roadmap Generator is temporarily unavailable. Please try again.' }, { status: 503 });
  }
}
