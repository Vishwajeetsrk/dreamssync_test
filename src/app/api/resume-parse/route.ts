import { NextResponse, NextRequest } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai';

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const data = await pdfParse(buffer);
    return (data.text as string) || '';
  } catch (e: any) {
    throw new Error(`PDF parsing failed: ${e.message}`);
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (e: any) {
    throw new Error(`Word parsing failed: ${e.message}`);
  }
}

const PARSE_SYSTEM_PROMPT = `You are an expert Resume Parser. 
Extract structured data from the provided resume text and map it into the following JSON schema. 
Be extremely accurate. If a section is missing, provide an empty array/string/null.

SCHEMA:
{
  "personalInfo": {
    "fullName": "string",
    "role": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string"
  },
  "summary": "string",
  "skills": [
    { "category": "string", "items": "string" }
  ],
  "experience": [
    { "company": "string", "role": "string", "location": "string", "date": "string", "bullets": ["string"] }
  ],
  "education": [
    { "school": "string", "degree": "string", "location": "string", "date": "string" }
  ],
  "projects": [
    { "name": "string", "link": "string", "description": "string" }
  ],
  "achievements": ["string"],
  "languages": ["string"],
  "certifications": [
    { "name": "string", "issuer": "string", "date": "string", "link": "string" }
  ],
  "extra": "string"
}

RETURN ONLY THE JSON OBJECT.`;

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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText = '';
    if (file.name.endsWith('.pdf')) {
      resumeText = await extractPdfText(buffer);
    } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      resumeText = await extractDocxText(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
    }

    const { content } = await callAI([
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      { role: 'user', content: `Extract data from this resume text:\n\n${resumeText.slice(0, 10000)}` }
    ], { jsonMode: true, temperature: 0.1 });

    const parsedData = parseJSON<object>(content);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('[resume-parse] Error:', error);
    return NextResponse.json({ error: 'Failed to parse resume content.' }, { status: 500 });
  }
}
