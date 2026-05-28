import { NextRequest, NextResponse } from 'next/server';
import { db, adminDb } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self harm', 'cut myself',
  'worthless', 'hopeless', 'nobody cares', 'give up', 'hurt myself',
  'panic attack', 'can\'t breathe', 'chest pain', 'dying', 'terrified'
];

const SEVERITY_LEVELS = {
  critical: { keywords: ['suicide', 'kill myself', 'end my life'], threshold: 1 },
  high: { keywords: ['self harm', 'cut myself', 'hurt myself'], threshold: 1 },
  medium: { keywords: ['panic attack', 'anxious', 'scared', 'worried'], threshold: 2 },
  low: { keywords: ['sad', 'depressed', 'lonely'], threshold: 1 }
};

async function classifyWithGroq(text: string): Promise<{
  severity: 'low' | 'medium' | 'high' | 'critical' | 'safe';
  confidence: number;
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
            content: `You are a mental health crisis classification system. Analyze text for mental health risks.

Respond ONLY with valid JSON in this format (no markdown, no explanation):
{
  "severity": "safe|low|medium|high|critical",
  "confidence": 0.0-1.0,
  "reasoning": "brief reason",
  "keywords": ["detected", "keywords"],
  "resources": "relevant crisis hotline/resource"
}

Severity rules:
- critical: immediate suicide/self-harm intent
- high: self-harm planning or strong depressive ideation
- medium: anxiety, panic, suicidal thoughts without concrete plan
- low: general depression/sadness
- safe: no mental health crisis indicators`
          },
          {
            role: 'user',
            content: `Analyze this text for mental health crisis indicators:\n\n"${text}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) throw new Error('No response from Groq');

    const result = JSON.parse(content);
    return {
      severity: result.severity || 'safe',
      confidence: result.confidence || 0,
      reasoning: result.reasoning || 'Analysis complete'
    };
  } catch (err) {
    console.error('[Crisis Analysis] Groq error:', err);
    // Fallback to keyword matching
    return classifyWithKeywords(text);
  }
}

function classifyWithKeywords(text: string): {
  severity: 'low' | 'medium' | 'high' | 'critical' | 'safe';
  confidence: number;
  reasoning: string;
} {
  const lowerText = text.toLowerCase();
  let highestSeverity: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'safe';
  let confidence = 0;

  for (const [severity, config] of Object.entries(SEVERITY_LEVELS)) {
    const matches = config.keywords.filter(kw => lowerText.includes(kw)).length;
    if (matches >= config.threshold) {
      highestSeverity = severity as any;
      confidence = Math.min(0.95, matches * 0.3);
      break;
    }
  }

  return {
    severity: highestSeverity,
    confidence,
    reasoning: highestSeverity === 'safe' ? 'No crisis indicators detected' : `Detected ${highestSeverity} severity indicators`
  };
}

async function sendAdminAlert(alert: any) {
  try {
    const response = await fetch('/api/admin/crisis/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity: alert.severity,
        userId: alert.userId,
        userName: alert.userName,
        userEmail: alert.userEmail,
        message: alert.message,
        timestamp: alert.timestamp,
        id: alert.id
      })
    });

    if (!response.ok) {
      console.warn('[Crisis Alert] Email delivery failed but alert recorded');
    }
  } catch (err) {
    console.warn('[Crisis Alert] Email service error:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, userId, userName, userEmail, source } = await req.json();

    if (!text || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Classify text
    const classification = await classifyWithGroq(text);

    // Only create alert if not safe
    if (classification.severity === 'safe') {
      return NextResponse.json({ flagged: false, severity: 'safe' });
    }

    // Check for duplicate recent alerts from same user
    const recentAlertsQuery = query(
      collection(db, 'crisis_alerts'),
      where('userId', '==', userId),
      where('status', '==', 'open')
    );
    const recentAlerts = await getDocs(recentAlertsQuery);

    if (recentAlerts.size > 0) {
      // Update existing open alert instead of creating new one
      const existingAlert = recentAlerts.docs[0];
      await updateDoc(doc(db, 'crisis_alerts', existingAlert.id), {
        messages: [...(existingAlert.data().messages || []), text],
        lastUpdated: Timestamp.now(),
        severity: classification.severity // Update to highest severity
      });
      return NextResponse.json({ flagged: true, severity: classification.severity, action: 'updated' });
    }

    // Create new crisis alert
    const alertRef = await addDoc(collection(db, 'crisis_alerts'), {
      userId,
      userName: userName || 'Anonymous',
      userEmail: userEmail || 'unknown@email.com',
      severity: classification.severity,
      confidence: classification.confidence,
      message: text,
      messages: [text],
      source: source || 'community_post',
      status: 'open',
      timestamp: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      resolvedAt: null,
      adminNotes: '',
      resourcesSent: false
    });

    // Send admin email alert
    await sendAdminAlert({
      id: alertRef.id,
      userId,
      userName,
      userEmail,
      message: text,
      severity: classification.severity,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      flagged: true,
      severity: classification.severity,
      confidence: classification.confidence,
      alertId: alertRef.id,
      message: 'Crisis alert created and admins notified'
    });
  } catch (err) {
    console.error('[Crisis Analysis API] Error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
