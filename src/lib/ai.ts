import { redis } from './ratelimit';
import crypto from 'crypto';

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AIOptions = {
  jsonMode?: boolean;
  maxTokens?: number;
  temperature?: number;
  /** Timeout in ms per provider attempt. Default: 45000 (45s) */
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
    opts.timeoutMs ?? 45_000
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

  // Multi-model rotation for OpenRouter resilience
  const models = [
    'openai/gpt-4o-mini',
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'anthropic/claude-3-haiku',
    'google/gemini-flash-1.5-8b',
    'meta-llama/llama-3.1-8b-instruct:free'
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
        opts.timeoutMs ?? 45_000
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
    opts.timeoutMs ?? 45_000 // Gemini can be slightly slower
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
  // 1. Generate Cache Key (based on messages and opts)
  const cacheKey = `ds:ai:cache:${crypto
    .createHash('md5')
    .update(JSON.stringify({ messages, opts }))
    .digest('hex')}`;

  // 2. Try Cache First (if redis is available)
  try {
    const cached = await redis.get<ProviderResult>(cacheKey);
    if (cached) {
      // Return cached result (verified non-null by SDK type if configured)
      return { ...cached, provider: `${cached.provider} (cached)` };
    }
  } catch (err) {
    console.warn('[AI] Cache lookup error:', err);
  }

  const errors: string[] = [];

  // Logic for providers below...
  const executeCall = async (): Promise<ProviderResult> => {
    // 1. Groq — fastest, most generous free tier
    try {
      return await callGroq(messages, opts);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Groq: ${msg}`);
      console.warn('[AI] Groq failed →', msg.slice(0, 120));
    }

    // 2. OpenRouter
    try {
      return await callOpenRouter(messages, opts);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`OpenRouter: ${msg}`);
      console.warn('[AI] OpenRouter failed →', msg.slice(0, 120));
    }

    // 3. Gemini — last resort
    try {
      return await callGemini(messages, opts);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Gemini: ${msg}`);
      console.warn('[AI] Gemini failed →', msg.slice(0, 120));
    }

    throw new Error(`All AI providers failed:\n${errors.join('\n')}`);
  };

  const result = await executeCall();

  // 3. Save to Cache (Async, don't block response) - TTL: 24h
  try {
    redis.set(cacheKey, result, { ex: 60 * 60 * 24 }).catch(e => console.error('[AI] Cache write error:', e));
  } catch (err) {
    /* ignore cache save errors */
  }

  return result;
}

/**
 * Safely parse JSON from an AI response.
 * Strips markdown fences that some models add.
 */
export function parseJSON<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned) as T;
}
