/**
 * /api/ats
 * ATS Resume Checker — PDF upload + AI analysis
 * Stack: Groq → OpenRouter → Gemini fallback
 * Features: Rate limiting, PDF text extraction, Redis caching by PDF hash
 * NOTE: Uses Node.js runtime (not edge) — pdf-parse requires Node
 */

import { NextResponse, NextRequest } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai';
import { createHash } from 'crypto';
import { validateCareerInput } from '@/lib/aiGuard';

// ── PDF Extraction ────────────────────────────────────────────────
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const data = await pdfParse(buffer);
    return (data.text as string) || '';
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`PDF parsing failed: ${msg}`);
  }
}

// ── System Prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a world-class Elite ATS (Applicant Tracking System) Auditor for the FAANG and Indian tech ecosystem (Google, Microsoft, Amazon, Meta, Zomato, Swiggy).

SAFETY MANDATE: You MUST refuse to generate content related to harmful, illegal, unethical, or dangerous activities. Only provide safe and professional career guidance.

Analyze the resume and return ONLY a JSON object with this exact schema — no markdown, no extra text:
{
  "ats_score": <number 0-100>,
  "keyword_match": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "missing_keywords": ["<missing keyword 1>", "<missing keyword 2>"],
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>"],
  "company_eligibility": [
    {
      "company": "Google",
      "eligibility": "Eligible" | "Partially Eligible" | "Not Eligible",
      "score": <number 0-100>,
      "reasons": ["<reason 1>"],
      "missing_skills": ["<missing 1>"],
      "suggestions": ["<how to improve for this company>"]
    },
    {
      "company": "Microsoft",
      "eligibility": "Eligible" | "Partially Eligible" | "Not Eligible",
      "score": <number 0-100>,
      "reasons": ["<reason 1>"],
      "missing_skills": ["<missing 1>"],
      "suggestions": ["<how to improve for this company>"]
    },
    {
      "company": "Amazon",
      "eligibility": "Eligible" | "Partially Eligible" | "Not Eligible",
      "score": <number 0-100>,
      "reasons": ["<reason 1>"],
      "missing_skills": ["<missing 1>"],
      "suggestions": ["<how to improve for this company>"]
    }
  ],
  "improved_resume_markdown": "<Write a 2026-format, markdown-styled optimized resume content and suggestions here>"
}

Grading Context: 
- Google focuses on: Scalability, DS/Algo, System Architecture.
- Microsoft focuses on: Cloud (Azure), Enterprise software, Clean code.
- Amazon focuses on: Leadership principles, Customer obsession, Hard numbers/Metrics.
- Indian Startups: Speed, React/Node, Product impact.

Ensure all suggestions are actionable and high-impact.`;

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
  
  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Could not parse form data. Send as multipart/form-data.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const jobRole = formData.get('jobRole') as string || 'Not specified';
  const jobDescription = formData.get('jobDescription') as string || 'Not specified';
  const experienceLevel = formData.get('experienceLevel') as string || 'Fresher';

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded. Please select a PDF.' }, { status: 400 });
  }

  // Validate file type
  const isValidType =
    file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
  if (!isValidType) {
    return NextResponse.json(
      { error: `Invalid file type "${file.type}". Only PDF files are accepted.` },
      { status: 400 }
    );
  }

  // Validate file size — max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
  }

  // 3. Read buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 4. Extract text
  let resumeText: string;
  try {
    resumeText = await extractPdfText(buffer);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Could not read PDF: ${msg}` },
      { status: 422 }
    );
  }

  if (!resumeText || resumeText.trim().length < 50) {
    return NextResponse.json(
      { error: 'Could not extract text from this PDF. Please ensure it is not a scanned image (use a text-based PDF).' },
      { status: 422 }
    );
  }

  // 5. Safety Guard - Validate User Inputs (Job Role & Description)
  const roleSafety = validateCareerInput(jobRole);
  const descSafety = validateCareerInput(jobDescription);
  
  if (!roleSafety.allowed || !descSafety.allowed) {
    return NextResponse.json({ 
      error: 'Safety Violation', 
      details: roleSafety.message || descSafety.message 
    }, { status: 400 });
  }

  // Optional: A lighter check on resumeText to prevent massive abuse, 
  // but we mostly trust the role check + AI prompt safety.

  // 6. Call AI
  const truncatedText = resumeText.slice(0, 6000); // Stay within token limits

  const aiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `Analyze this resume for the role of "${jobRole}". 
Experience Level: ${experienceLevel}.
Additional Context (JD): ${jobDescription}.

RESUME CONTENT:
${truncatedText}`,
    },
  ];

  try {
    const { content, provider } = await callAI(aiMessages, {
      jsonMode: true,
      maxTokens: 2500,
      temperature: 0.1, // Low temp for factual analysis
    });

    const result = parseJSON<object>(content);

    return NextResponse.json({ ...result, _provider: provider });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI error';
    console.error('[ats-advanced] All providers failed:', msg);
    return NextResponse.json(
      { error: 'Advanced analysis unavailable. Please try again soon.' },
      { status: 503 }
    );
  }
}
