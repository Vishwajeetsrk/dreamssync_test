import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';

const TOXICITY_KEYWORDS = {
  hate: ['hate', 'racist', 'slur', 'filth', 'disgust'],
  violence: ['kill', 'attack', 'bomb', 'stab', 'punch'],
  abuse: ['stupid', 'idiot', 'loser', 'trash', 'worthless'],
  spam: ['buy now', 'click here', 'limited offer', 'act fast', 'follow link'],
  explicit: ['nsfw', 'porn', 'sex', 'nude'],
};

async function classifyWithGroq(text: string): Promise<{
  isToxic: boolean;
  toxicityScore: number;
  category: string;
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
            content: `You are a content moderation system. Analyze text for toxicity.

Respond ONLY with valid JSON (no markdown):
{
  "isToxic": true/false,
  "toxicityScore": 0.0-1.0,
  "category": "hate|violence|abuse|spam|explicit|safe",
  "reasoning": "brief reason"
}

Categories:
- hate: racist, discriminatory, or hateful language
- violence: threats or glorification of violence
- abuse: personal attacks or insults
- spam: advertising or manipulative content
- explicit: adult or NSFW content
- safe: no toxicity detected`
          },
          {
            role: 'user',
            content: `Analyze this content:\n\n"${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API error: ${error.error?.message || 'Unknown'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error('No response from Groq');

    return JSON.parse(content);
  } catch (err) {
    console.error('[Toxicity Analysis] Groq error:', err);
    return classifyWithKeywords(text);
  }
}

function classifyWithKeywords(text: string): {
  isToxic: boolean;
  toxicityScore: number;
  category: string;
  reasoning: string;
} {
  const lowerText = text.toLowerCase();
  let score = 0;
  let category = 'safe';

  for (const [cat, keywords] of Object.entries(TOXICITY_KEYWORDS)) {
    const matches = keywords.filter(kw => lowerText.includes(kw)).length;
    if (matches > 0) {
      score = Math.min(1, matches * 0.3);
      category = cat;
      break;
    }
  }

  return {
    isToxic: score > 0.3,
    toxicityScore: score,
    category,
    reasoning: score > 0.3 ? `Detected ${category} content` : 'No toxicity detected'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text, contentId, contentType, authorId, authorName } = await req.json();

    if (!text || !contentId || !contentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const classification = await classifyWithGroq(text);

    // Only create moderation flag if toxic
    if (!classification.isToxic) {
      return NextResponse.json({ flagged: false, toxicityScore: classification.toxicityScore });
    }

    // Create moderation report
    const reportRef = await addDoc(collection(db, 'moderation_reports'), {
      contentId,
      contentType,
      authorId: authorId || 'anonymous',
      authorName: authorName || 'Anonymous',
      content: text,
      toxicityScore: classification.toxicityScore,
      category: classification.category,
      reasoning: classification.reasoning,
      status: 'pending', // pending, approved, rejected
      flaggedAt: Timestamp.now(),
      reviewedAt: null,
      reviewedBy: null,
      adminNotes: ''
    });

    return NextResponse.json({
      flagged: true,
      toxicityScore: classification.toxicityScore,
      category: classification.category,
      reportId: reportRef.id,
      message: 'Content flagged for moderation review'
    });
  } catch (err) {
    console.error('[Toxicity Analysis] Error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit_num = parseInt(searchParams.get('limit') || '50', 10);

    const q = query(
      collection(db, 'moderation_reports'),
      where('status', '==', status),
      orderBy('flaggedAt', 'desc'),
      limit(limit_num)
    );

    const snapshot = await getDocs(q);
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        flaggedAt: data.flaggedAt?.toDate?.().toISOString() || new Date().toISOString(),
        reviewedAt: data.reviewedAt?.toDate?.().toISOString() || null
      };
    });

    return NextResponse.json({
      success: true,
      total: reports.length,
      reports
    });
  } catch (err) {
    console.error('[Moderation Query] Error:', err);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
