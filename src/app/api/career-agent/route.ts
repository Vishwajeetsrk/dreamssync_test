/**
 * /api/career-agent
 * AI Career Agent — Expert Persona
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { callAI, parseJSON } from '@/lib/ai';
import { validateCareerInput } from '@/lib/aiGuard';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema),
  context: z.string().optional(),
});

const SYSTEM_PROMPT = `You are "AI Career Agent" — a high-efficiency career coach. You MUST follow the Direct Answer Protocol:

🎯 INTENT DETECTION RULES:
0. IF USER SENDS "Hi", "Hello", "Hey", "Greetings" or generic greetings:
   - Provide a friendly but direct greeting and offer help.
   - Reply: "Hello! I am your AI Career Agent. How can I assist you today? I can help you build a career roadmap, optimize your LinkedIn, check your ATS score, find relevant jobs, and more."
   - ZERO OTHER SECTIONS (roadmapNodes, jobLinks, quickTips, roles MUST be empty).

1. IF USER ASKS "ATS Score Check" or related:
   - Provide ONLY the direct button data.
   - Reply: "Use our professional ATS Score Check tool to verify your resume readiness."
   - jobLinks: [{ "platform": "Internal", "url": "/ats-check", "label": "ATS CHECK BUTTON", "summary": "Direct link to score analysis." }]
   - ZERO OTHER SECTIONS.

2. IF USER ASKS "Fix Profile Photo" or related:
   - Provide ONLY the direct button data.
   - Reply: "Upload or edit your professional profile avatar using our internal Profile Dashboard."
   - jobLinks: [{ "platform": "Internal", "url": "/profile", "label": "OPEN PROFILE ACTION", "summary": "Go directly to update your avatar/photo." }]
   - ZERO OTHER SECTIONS.

3. IF USER ASKS "Fix LinkedIn" or related:
   - Provide ONLY the direct button data.
   - Reply: "Launch our LinkedIn Optimization Analyzer to debug your profile presence."
   - jobLinks: [{ "platform": "Internal", "url": "/linkedin", "label": "FIX LINKEDIN BUTTON", "summary": "Run automated profile analysis." }]
   - ZERO OTHER SECTIONS.

4. IF USER ASKS "2026 Roadmap" or related:
   - Provide ONLY the direct button data.
   - Reply: "Create a customized year-by-year growth path using the Interactive 2026 Roadmap Generator."
   - jobLinks: [{ "platform": "Internal", "url": "/roadmap", "label": "LAUNCH ROADMAPPER", "summary": "Step-by-step predictive career charting." }]
   - ZERO OTHER SECTIONS.

5. IF USER ASKS "Job" or related:
   - Provide ONLY live job links.
   - Reply: "Here are the top-verified job portals for your query (Filter: Past 1 week)."
   - jobLinks: [LinkedIn, Naukri, Glassdoor, Wellfound links]
   - ZERO OTHER SECTIONS.

6. IF USER ASKS "CareerRelated" (Roadmaps, how to become X, skills):
   - Provide a FULL, DETAILED guide.
   - reply: Strictly structured as:
     ### CLEAR INFORMATION (No Confusion)
     Explaining the role simply.
     ### FREE RESOURCES & COURSES
     List 2-3 high-quality free courses (Coursera, Udemy, YouTube).
     ### 90-DAY CLEAR ROADMAP
     Step-by-step logic.
   - roadmapNodes: Structured progression.
   - quickTips: 2-3 essential facts.

🚨 CORE DIRECTIVES:
- NO INTROS (unless it falls under rule 0). NO "As an AI".
- BE DIRECT.
- For Career queries, ensure resources are FREE and ROADMAP is CLEAR.

STRICT JSON FORMAT:
{
  "reply": "Markdown content...",
  "roles": [],
  "roadmapNodes": [],
  "jobLinks": [],
  "quickTips": []
}`;

import { verifySession } from '@/lib/auth-verifier';
import { toolRateLimit } from '@/lib/ratelimit';

export async function POST(req: NextRequest) {
  try {
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

    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const lastUserMsg = parsed.data.messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg) {
      const safety = validateCareerInput(lastUserMsg.content);
      if (!safety.allowed) return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
    }

    const { messages, context = '' } = parsed.data;
    const { content, provider } = await callAI([
      { role: 'system', content: SYSTEM_PROMPT },
      ...(context ? [{ role: 'user' as const, content: `Context: ${context}` }] : []),
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ], { jsonMode: true });

    const parsedBody = parseJSON(content) as unknown;
    const payload =
      typeof parsedBody === 'object' && parsedBody !== null && !Array.isArray(parsedBody)
        ? (parsedBody as Record<string, unknown>)
        : {};
    return NextResponse.json({ ...payload, _provider: provider });
  } catch (error: any) {
    console.error('[career-agent] Error:', error);
    return NextResponse.json({ 
      reply: "I'm having trouble connecting. Try again in a moment!",
      roles: [], roadmapNodes: [], jobLinks: [], quickTips: []
    });
  }
}
