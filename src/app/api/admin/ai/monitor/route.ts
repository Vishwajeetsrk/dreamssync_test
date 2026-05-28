import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface AICall {
  provider: 'groq' | 'gemini' | 'openrouter' | 'openai' | 'claude';
  model: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  costUSD: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  userId?: string;
  endpoint: string;
  timestamp: string;
}

const TOKEN_COSTS = {
  groq: { input: 0.00005, output: 0.00015 },
  gemini: { input: 0.000075, output: 0.0003 },
  openrouter: { input: 0.00014, output: 0.00042 },
  openai: { input: 0.003, output: 0.006 },
  claude: { input: 0.003, output: 0.015 }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AICall;

    if (!body.provider || !body.model) {
      return NextResponse.json({ error: 'Missing provider or model' }, { status: 400 });
    }

    // Calculate cost
    const costs = TOKEN_COSTS[body.provider as keyof typeof TOKEN_COSTS] || TOKEN_COSTS.openai;
    const cost = (body.tokensInput * costs.input) + (body.tokensOutput * costs.output);

    const aiCallDoc = {
      provider: body.provider,
      model: body.model,
      tokensInput: body.tokensInput || 0,
      tokensOutput: body.tokensOutput || 0,
      totalTokens: (body.tokensInput || 0) + (body.tokensOutput || 0),
      latencyMs: body.latencyMs || 0,
      costUSD: cost,
      status: body.status || 'success',
      errorMessage: body.errorMessage || null,
      userId: body.userId || 'anonymous',
      endpoint: body.endpoint,
      timestamp: Timestamp.now(),
      date: new Date().toISOString().split('T')[0] // For easy daily aggregation
    };

    const docRef = await addDoc(collection(db, 'ai_calls'), aiCallDoc);

    // Log to system monitoring
    console.log(`[AI Call] ${body.provider}/${body.model}: ${body.tokensInput}→${body.tokensOutput} tokens, ${body.latencyMs}ms, $${cost.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      cost: cost,
      message: 'AI call logged'
    });
  } catch (err) {
    console.error('[AI Logger] Error:', err);
    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timerange = searchParams.get('timerange') || '24h';
    const provider = searchParams.get('provider');

    // Calculate date cutoff
    const now = new Date();
    let cutoffDate = new Date();

    switch (timerange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '24h':
      default:
        cutoffDate.setHours(now.getHours() - 24);
    }

    let q = query(
      collection(db, 'ai_calls'),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('timestamp', 'desc'),
      limit(500)
    );

    if (provider) {
      q = query(
        collection(db, 'ai_calls'),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
        where('provider', '==', provider),
        orderBy('timestamp', 'desc'),
        limit(500)
      );
    }

    const snapshot = await getDocs(q);
    const calls = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.().toISOString() || new Date().toISOString()
      };
    });

    // Calculate aggregated metrics
    const metrics = {
      totalCalls: calls.length,
      totalTokens: calls.reduce((sum, c) => sum + (c.totalTokens || 0), 0),
      totalCost: calls.reduce((sum, c) => sum + (c.costUSD || 0), 0),
      avgLatency: calls.length > 0 ? Math.round(calls.reduce((sum, c) => sum + (c.latencyMs || 0), 0) / calls.length) : 0,
      errorRate: calls.length > 0 ? Math.round((calls.filter(c => c.status === 'error').length / calls.length) * 100) : 0,
      byProvider: {} as Record<string, any>,
      byStatus: { success: 0, error: 0, timeout: 0 }
    };

    // Group by provider
    calls.forEach(call => {
      if (!metrics.byProvider[call.provider]) {
        metrics.byProvider[call.provider] = { calls: 0, tokens: 0, cost: 0, avgLatency: 0 };
      }
      metrics.byProvider[call.provider].calls += 1;
      metrics.byProvider[call.provider].tokens += call.totalTokens || 0;
      metrics.byProvider[call.provider].cost += call.costUSD || 0;
      metrics.byProvider[call.provider].avgLatency += call.latencyMs || 0;
      metrics.byStatus[call.status as keyof typeof metrics.byStatus]++;
    });

    // Calculate average latency per provider
    Object.keys(metrics.byProvider).forEach(provider => {
      const providerCalls = calls.filter(c => c.provider === provider).length;
      if (providerCalls > 0) {
        metrics.byProvider[provider].avgLatency = Math.round(metrics.byProvider[provider].avgLatency / providerCalls);
      }
    });

    return NextResponse.json({
      success: true,
      metrics,
      calls: calls.slice(0, 100), // Return last 100 for detailed view
      timerange
    });
  } catch (err) {
    console.error('[AI Analytics] Error:', err);
    return NextResponse.json({ error: 'Analytics failed' }, { status: 500 });
  }
}
