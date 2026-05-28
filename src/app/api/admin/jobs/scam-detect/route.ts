import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const SCAM_KEYWORDS = [
  'western union', 'money transfer', 'pay upfront', 'processing fee',
  'guaranteed income', 'work from home no experience', 'make thousands',
  'no qualification needed', 'click here now', 'limited spots',
  'act fast', 'too good to be true', 'bitcoin', 'cryptocurrency'
];

const SCAM_PATTERNS = [
  /(?:₹|\$)\s*\d{5,}/i, // Large amounts
  /(?:guaranteed|100%|absolutely)\s+(?:free|income|profit)/i,
  /(?:work|earn)\s+(?:from home|anywhere|easy)\s+(?:\$|₹)?\d+k?/i
];

async function analyzeWithGroq(jobDescription: string): Promise<{
  isScam: boolean;
  scamScore: number;
  redFlags: string[];
  reasoning: string;
}> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a job scam detection system. Analyze job postings for fraudulent indicators.

Respond ONLY with valid JSON:
{
  "isScam": true/false,
  "scamScore": 0.0-1.0,
  "redFlags": ["flag1", "flag2"],
  "reasoning": "brief reason"
}

Red flags:
- Requires upfront payment or fees
- Guaranteed unrealistic earnings
- No legitimate company information
- Poor grammar/spelling
- Asks for personal financial details
- Work-from-home only with no verification
- Spelling of job title or company unusual`
          },
          {
            role: 'user',
            content: `Analyze this job posting for scam indicators:\n\n${jobDescription}`
          }
        ],
        temperature: 0.2,
        max_tokens: 200,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No response');

    return JSON.parse(content);
  } catch (err) {
    console.error('[Scam Analysis] Groq error:', err);
    return analyzeWithKeywords(jobDescription);
  }
}

function analyzeWithKeywords(jobDescription: string): {
  isScam: boolean;
  scamScore: number;
  redFlags: string[];
  reasoning: string;
} {
  const lowerDesc = jobDescription.toLowerCase();
  const redFlags: string[] = [];
  let score = 0;

  // Keyword matching
  for (const keyword of SCAM_KEYWORDS) {
    if (lowerDesc.includes(keyword)) {
      redFlags.push(`Contains keyword: "${keyword}"`);
      score += 0.15;
    }
  }

  // Pattern matching
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(jobDescription)) {
      redFlags.push(`Matches suspicious pattern: ${pattern.source}`);
      score += 0.2;
    }
  }

  return {
    isScam: score > 0.4,
    scamScore: Math.min(1, score),
    redFlags: redFlags.slice(0, 3),
    reasoning: score > 0.4 ? 'Multiple scam indicators detected' : 'No scam indicators detected'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, title, description, company, recruiter } = await req.json();

    if (!description || !jobId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fullText = `${title || ''}\n${company || ''}\n${description}`;
    const analysis = await analyzeWithGroq(fullText);

    // Log analysis
    await addDoc(collection(db, 'job_scam_analyses'), {
      jobId,
      title: title || 'Untitled',
      company: company || 'Unknown',
      recruiter: recruiter || 'Unknown',
      isScam: analysis.isScam,
      scamScore: analysis.scamScore,
      redFlags: analysis.redFlags,
      reasoning: analysis.reasoning,
      analyzedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      jobId,
      isScam: analysis.isScam,
      scamScore: analysis.scamScore,
      redFlags: analysis.redFlags,
      reasoning: analysis.reasoning
    });
  } catch (err) {
    console.error('[Scam Detection] Error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
