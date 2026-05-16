import { redis, hasRedis } from './ratelimit';
import crypto from 'crypto';

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIOptions = {
  jsonMode?: boolean;
  maxTokens?: number;
  temperature?: number;
  /** Timeout in ms per provider attempt. Default: 25000 (25s) to avoid Vercel gateway timeouts. */
  timeoutMs?: number;
};

type ProviderResult = {
  content: string;
  provider: string;
};

// ─── Timeout Fetch Helper ─────────────────────────────────────────
/**
 * Wraps fetch() with an AbortController timeout.
 * Throws if the request takes longer than timeoutMs.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── GROQ (Primary — Fastest, Free) ──────────────────────────────
async function callGroq(
  messages: AIMessage[],
  opts: AIOptions
): Promise<ProviderResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not configured');

  const body: Record<string, unknown> = {
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  };

  if (opts.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    },
    opts.timeoutMs ?? 25_000
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty content');
  return { content, provider: 'groq' };
}

// ─── OPENROUTER (Fallback) ────────────────────────────────────────
async function callOpenRouter(
  messages: AIMessage[],
  opts: AIOptions
): Promise<ProviderResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not configured');

  // Primary resilient models for OpenRouter fallback
  const models = [
    'openai/gpt-4o-mini',
    'meta-llama/llama-3.3-70b-instruct',
    'google/gemini-flash-1.5-8b',
  ];

  let lastError = '';
  for (const model of models) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 2048,
        ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {})
      };

      const res = await fetchWithTimeout(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            'HTTP-Referer': 'https://dreamsync-ruddy.vercel.app',
            'X-Title': 'DreamSync AI',
          },
          body: JSON.stringify(body),
        },
        opts.timeoutMs ?? 15_000
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${model} ${res.status}: ${err.slice(0, 100)}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error(`${model} returned empty content`);
      return { content, provider: `openrouter:${model}` };
    } catch (e: any) {
      lastError = e.message;
      console.warn(`[AI] OpenRouter ${model} failed →`, lastError);
      continue; // try next model
    }
  }

  throw new Error(`OpenRouter exhaustive failure: ${lastError}`);
}

// ─── GEMINI (Backup — Free 1.5-flash) ────────────────────────────
async function callGemini(
  messages: AIMessage[],
  opts: AIOptions
): Promise<ProviderResult> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not configured');

  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? '';
  const userMessages = messages.filter((m) => m.role !== 'system');

  const contents = userMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 2048,
      ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
    ...(systemMsg
      ? { systemInstruction: { parts: [{ text: systemMsg }] } }
      : {}),
  };

  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    opts.timeoutMs ?? 15_000 // Gemini backup
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Gemini returned empty content');
  return { content, provider: 'gemini' };
}

// ─── MAIN: Fallback Chain with Edge Caching ───────────────────────
export async function callAI(
  messages: AIMessage[],
  opts: AIOptions = {}
): Promise<ProviderResult> {
  const startTime = Date.now();
  const MAX_BUDGET_MS = 50_000; // 50s total before giving up

  // 1. Generate Cache Key
  const cacheKey = `ds:ai:cache:${crypto
    .createHash('md5')
    .update(JSON.stringify({ messages, opts }))
    .digest('hex')}`;

  // 2. Try Cache First
  if (hasRedis) {
    try {
      const cached = await redis.get<ProviderResult>(cacheKey);
      if (cached) return { ...cached, provider: `${cached.provider} (cached)` };
    } catch (err) { /* ignore cache lookup errors */ }
  }

  const errors: string[] = [];

  const checkBudget = () => {
    if (Date.now() - startTime > MAX_BUDGET_MS) {
       throw new Error(`AI Timeout Budget Exceeded (${MAX_BUDGET_MS}ms)`);
    }
  };

  const getResult = async (): Promise<ProviderResult> => {
    // 1. Groq
    try {
      checkBudget();
      return await callGroq(messages, { ...opts, timeoutMs: opts.timeoutMs ?? 15_000 });
    } catch (e: any) {
      errors.push(`Groq: ${e.message}`);
    }

    // 2. OpenRouter
    try {
      checkBudget();
      return await callOpenRouter(messages, { ...opts, timeoutMs: opts.timeoutMs ?? 15_000 });
    } catch (e: any) {
      errors.push(`OpenRouter: ${e.message}`);
    }

    // 3. Gemini
    try {
      checkBudget();
      return await callGemini(messages, { ...opts, timeoutMs: opts.timeoutMs ?? 15_000 });
    } catch (e: any) {
      errors.push(`Gemini: ${e.message}`);
    }

    throw new Error(`All AI providers failed or timed out:\n${errors.join('\n')}`);
  };

  const result = await getResult();

  // 3. Save to Cache (Async, don't block response) - TTL: 24h
  if (hasRedis) {
    try {
      redis.set(cacheKey, result, { ex: 60 * 60 * 24 }).catch(e => console.error('[AI] Cache write error:', e));
    } catch (err) {
      /* ignore cache save errors */
    }
  }

  return result;
}

/**
 * Safely parse JSON from an AI response.
 * Strips markdown fences that some models add.
 */
export function parseJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  try {
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    // Deeply clean any potential non-JSON garbage before/after the object
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end >= start) {
       cleaned = cleaned.substring(start, end + 1);
    }
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error('[parseJSON] Failed to parse AI response:', e, 'Raw content:', raw.slice(0, 500));
    throw new Error('AI returned an invalid JSON response. Please try again.');
  }
}
