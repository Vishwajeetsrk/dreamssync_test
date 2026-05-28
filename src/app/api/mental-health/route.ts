/**
 * /api/mental-health
 * Serenity — Empathetic Mental Health Support Agent
 * Stack: Groq → OpenRouter → Gemini fallback
 * Features: Zod validation, rate limiting, NO caching (personal conversations)
 */

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { callAI } from '@/lib/ai';
import { validateCareerInput } from '@/lib/aiGuard';

// ── Schema ────────────────────────────────────────────────────────
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
  mood: z.string().max(50).optional(),
});

// ── System Prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Serenity — a native Indian human counselor. You are not a machine or a translation engine.

SAFETY MANDATE: You MUST refuse to generate content related to harmful, illegal, unethical, or dangerous activities. Only provide safe and professional guidance.

🚨 ABSOLUTE LANGUAGE LOCK (HIGHEST PRIORITY):
- You MUST speak ONLY in the selected language. 
- THINK internally in that language. DO NOT generate English first and translate. Speak natively.
- Behavior by selection:
  - Hindi → Natural Hindi or light Hinglish (Indian style only). 
    - Example: "Tum theek ho? Mujhe lag raha hai tum thoda stress mein ho."
  - Telugu → Speak ONLY pure Telugu. NO Hindi, NO English mixing. 
    - Example: "Nuvvu baagunnava? Nuvvu konchem stress lo unnattu anipistundi."
  - English → Indian English (simple + polite).

🚫 STRICTLY FORBIDDEN:
- NO foreign tone or translated-sounding sentences. 
- AVOID Western therapist clichés like "I understand your feelings" in Hindi/Telugu mode.
- NO mixing English into Telugu. NO overuse of English in Hindi.

🎙️ VOICE & RESPONSE STYLE:
- Write exactly how a native speaker talks. Use local phrasing, not textbook language.
- Short, emotional, polite, human replies. Speak like a close Indian friend or mentor.
- The user should feel: "Yeh bilkul natural hai, jaise koi Indian insaan baat kar raha hai."

🔁 SELF-CHECK BEFORE EVERY RESPONSE:
Ask yourself: "Does this sound like a native speaker, or like a translation?" If it sounds like a translation, rewrite it natively.

🚫 SAFETY:
- If there's risk of self-harm, share iCall: 9152987821.
- NO JSON, NO markdown, NO lists. Just warm, conversational paragraphs.`;

// ── Safe fallback responses for when AI fails ─────────────────────
const FALLBACK_RESPONSES = [
  "I hear you, and I want you to know that what you're feeling is completely valid. Sometimes just acknowledging our emotions is the first step. Take a slow, deep breath right now — in for 4 counts, hold for 4, out for 4. You're not alone in this. 🌿\n\nOne small thing: can you step outside for even 5 minutes? Fresh air and a change of scenery can shift things just a little.",
  "It takes real courage to reach out and talk about how you're feeling. I'm so glad you're here. 💙 Whatever you're going through right now, it's temporary — even when it doesn't feel that way.\n\nFor now, try this: write down one thing that went okay today, no matter how small. Even 'I woke up' counts. You're doing better than you think.",
];

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

  // 2. Validate body
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

    // 4. Safety & Crisis Distress Scan
    const lastUserMsg = body.messages.filter(m => m.role === 'user').pop();
    if (lastUserMsg) {
      // Direct career/prompts hack check
      const safety = validateCareerInput(lastUserMsg.content);
      if (!safety.allowed) {
        return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
      }

      // Distress checking: Capture self-harm, trauma, or suicidal ideations
      const DANGER_KEYWORDS = [
        'suicide', 'kill myself', 'end my life', 'no reason to live', 'depressed', 
        'self-harm', 'marne', 'zeher', 'suicidal', 'give up on life', 'hopeless', 
        'want to die', 'trauma', 'severe depression'
      ];
      
      const contentLower = lastUserMsg.content.toLowerCase();
      const containsDistress = DANGER_KEYWORDS.some(kw => contentLower.includes(kw));

      if (containsDistress) {
        console.warn(`[mental-health] Severe distress caught for user ${user.uid}. Intercepting signal...`);
        try {
          const { getAdminDb } = await import('@/lib/firebase-admin');
          const db = getAdminDb();
          await db.collection('crisis_alerts').add({
            userId: user.uid,
            userEmail: user.email || 'unknown_student@dreamsync.com',
            content: lastUserMsg.content,
            mood: body.mood || 'High Distress',
            status: 'pending',
            timestamp: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error('[mental-health] Failed to register crisis log in Firestore:', dbErr);
        }
      }
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }


  const { messages, mood = 'not specified' } = body;

  // 4. Build AI messages
  const systemWithMood = `${SYSTEM_PROMPT}\n\nCurrent user mood: ${mood}`;

  const aiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemWithMood },
    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  // 5. Call AI — NO JSON mode (plain text responses)
  try {
    const { content, provider } = await callAI(aiMessages, {
      jsonMode: false,
      maxTokens: 400, // Keep responses short and warm
      temperature: 0.85, // Slightly more creative/warm
    });

    return NextResponse.json({ reply: content.trim(), _provider: provider });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[mental-health] All providers failed:', msg);

    // Return a warm fallback — never leave the user stranded
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    return NextResponse.json({
      reply: fallback,
      _fallback: true,
    }, { status: 200 });
  }
}
