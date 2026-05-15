import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { validateCareerInput } from '@/lib/aiGuard';
import { callAI, parseJSON } from '@/lib/ai';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const portfolioSchema = z.object({
  theme: z.enum(['minimal-dev', 'neo-brutalism', 'glass-dark', 'data-pro']).default('minimal-dev'),
  data: z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    targetRole: z.string().optional(),
    skills: z.string().optional(),
    education: z.string().optional(),
    languages: z.string().optional(),
    experience: z.string().optional(),
    projects: z.string().optional(),
    courses: z.string().optional(),
    achievements: z.string().optional(),
    hobbies: z.string().optional(),
    summary: z.string().optional(),
    profileImage: z.string().optional(),
  }).optional(),
});

const sysPrompt = `
You are a world-class award-winning creative technologist and senior frontend developer. 
Your goal is to generate an "Awwwards-worthy" high-fidelity personal portfolio.

CORE DIRECTIVES:
1. Return a JSON object: { "html": "...", "css": "...", "js": "..." }
2. TYPOGRAPHY: ALWAYS use Google Fonts. Link them in the <head>.
   - Neo-Brutalism: 'Space Grotesk' & 'Archivo Black'
   - Glass Dark/Data Pro: 'Inter' & 'Syne'
   - Minimal: 'Playfair Display' & 'Plus Jakarta Sans'
3. ANIMATIONS: ALWAYS include AOS (Animate on Scroll) library. 
   - Add <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css"> in <head>.
   - Add <script src="https://unpkg.com/aos@next/dist/aos.js"></script> before </body>.
   - Initialize AOS in script.js: AOS.init({ duration: 1000, once: true });
4. ASSETS: 
   - Profile Photo: "./assets/profile.jpg"
   - Resume Download: "./assets/resume.pdf"
5. ICONS: Use FontAwesome 6.4.0 (all themes).
6. RESPONSIVENESS: Ensure premium mobile experience with collateral navigation.
`;

const userPrompt = (theme: string, data: any) => `
Generate a MASTERPIECE portfolio for:
NAME: ${data.fullName}
ROLE: ${data.targetRole}
THEME: ${theme}
SUMMARY: ${data.summary}
SKILLS: ${data.skills}
EXPERIENCE: ${data.experience}
PROJECTS: ${data.projects}

REQUIREMENTS:
1. Use semantic HTML5 layout (header, main, section, footer).
2. Creative Hero Section: Large typography, interesting layouts.
3. Immersive Sections: Use data-aos animations (fade-up, zoom-in, flip-left) for ALL cards and headers.
4. Separate the code into "html", "css", and "js" keys.
`;

function buildThemePrompt(theme: string): string {
  if (theme === 'neo-brutalism') return `
THINK: Gumroad / Figma aesthetics.
- Background: #FFFBF5
- Accents: #FFE500 (Yellow), #8B5CF6 (Violet)
- Borders: 4px solid #000
- Shadows: 8px 8px 0px #000
- Hover: translate(-4px, -4px) with shadow increase.
- Layout: Asymmetric editorial grid.
`;
  if (theme === 'glass-dark') return `
THINK: Linear / Apple / Raycast aesthetics.
- Background: #050505 with mesh gradients in background.
- Elements: backdrop-filter: blur(12px), background: rgba(255,255,255,0.03).
- Border: 1px solid rgba(255,255,255,0.1).
- Glow: Subtle cyan/violet box-shadow glow on cards.
- Layout: Minimal, central-aligned, generous whitespace.
`;
  if (theme === 'data-pro') return `
THINK: Professional SaaS / Stripe aesthetics.
- Background: #FFFFFF
- Primary: #2563EB (Royal Blue)
- Sections: Alternating white and extreme light gray (#F8FAFC).
- Elements: Smooth 0.5rem border-radius, subtle 0 10px 15px rgba(0,0,0,0.05) shadows.
- Features: "Floating" elements with data-aos animations.
`;
  return `
THINK: Kinfolk / Medium / Minimalist aesthetics.
- Background: #FFFFFF / #000000
- Typography: Bold serif headings, monospace secondary text.
- Layout: Single column focus, massive margins.
- Accents: Zero color, just contrast.
`;
}

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

    const body = await req.json();
    const parsed = portfolioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { theme, data } = parsed.data;

    // 4. Safety Guard
    const combinedInput = `${data?.targetRole || ''} ${data?.summary || ''}`;
    const safety = validateCareerInput(combinedInput);
    if (!safety.allowed) {
      return NextResponse.json({ error: 'Safety Violation', details: safety.message }, { status: 400 });
    }

    // 5. Call AI with multi-provider fallback
    try {
      const { content, provider } = await callAI([
        { role: 'system', content: sysPrompt + buildThemePrompt(theme) },
        { role: 'user', content: userPrompt(theme, data) }
      ], { 
        jsonMode: true, 
        maxTokens: 8000, 
        temperature: 0.7 
      });

      const rawContent = content.trim();
      let result: any = null;

      try {
        // Use the global robust parser
        result = parseJSON(rawContent);
      } catch (e) {
        console.warn('[Portfolio API] JSON.parse failed, trying regex extraction...');
        
        // Strategy A: Find the first { and last }
        const start = rawContent.indexOf('{');
        const end = rawContent.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          try {
            const jsonPortion = rawContent.substring(start, end + 1);
            result = parseJSON(jsonPortion);
          } catch (e2) {
             console.error('[Portfolio API] Substring parsing failed as well.');
          }
        }
      }

      // If we still don't have a result-like object, try one last check for raw HTML
      if (!result?.html) {
         if (rawContent.includes('<html') || rawContent.includes('<!DOCTYPE')) {
            result = { html: rawContent, css: '', js: '' };
         }
      }

      if (!result?.html) {
        return NextResponse.json({ error: 'AI did not return portfolio HTML. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({ ...result, _provider: provider });

    } catch (error: any) {
      console.error('Portfolio AI error:', error);
      return NextResponse.json({ 
        error: 'AI is currently overloaded with requests in your region. Please try again in 30 seconds.' 
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('Portfolio gen error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
