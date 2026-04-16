import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { validateCareerInput } from '@/lib/aiGuard';
import { callAI } from '@/lib/ai';

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

function buildThemePrompt(theme: string): string {
  if (theme === 'neo-brutalism') return `
THEME: Neo-Brutalism. Use these EXACT styles:
- Background: #FFFBF5 (cream white)
- Primary accent: #FFE500 (yellow)
- Secondary accent: #FF4081 (pink)
- All interactive elements: border: 4px solid black, box-shadow: 4px 4px 0px black
- Headings: font-family: 'Space Grotesk', bold, black
- Cards: white bg, thick black borders, hard offset shadows
- Buttons: yellow bg, black border, "hover:translate-y-[-2px]" effect
- Section dividers: bold black lines
- Profile Photo: Square frame with 4px black border and hard yellow shadow
- Stats Section: Grid with bold numbers, primary yellow bg, black borders
- Icons: Use solid FontAwesome icons only
`;
  if (theme === 'glass-dark') return `
THEME: Modern Glass UI (Dark). Use these EXACT styles:
- Background: deep dark gradient from #0a0a1a to #1a0a2e (dark navy/purple)
- Cards: backdrop-filter: blur(20px), background: rgba(255,255,255,0.05), border: 1px solid rgba(255,255,255,0.1)
- Accent colors: #8B5CF6 (violet), #06B6D4 (cyan), gradient-to-r from-violet-600 to-cyan-400
- Text: white and light gray
- Buttons: gradient bg from violet to cyan, no border, rounded-full
- Skill badges: colored gradient pills with glow effect
- Animations: smooth fade-ins, floating elements
- Icons: use colored/gradient FontAwesome icons
- Profile Photo: Blurred glass circle with glowing cyan/violet ring
- Stats Section: Transparent glass cards with glowing borders
- Give everything a premium, Apple-level dark mode feel
`;
  if (theme === 'data-pro') return `
THEME: Data-Driven Innovator / Creative Technologist (Vishwa Pro). Use these EXACT styles:
- Background: Linear gradient (135deg, #667eea 0%, #764ba2 100%) for hero.
- Typography: 'Poppins' for headings, 'Inter' for body.
- Palette: Primary #1e40af, Secondary #10b981, Accent #f59e0b.
- Layout Features:
  1. Particle.js background on Hero.
  2. Multi-category skills grid with categorized icons.
  3. Timeline with 'dots' and vertical connection lines.
  4. Project cards with overlay hover links (External/GitHub icons).
  5. Statistics cards (e.g. "1000+ Records", "2+ Years").
  6. Dark/Light mode compatible (default to professional light/dark balance).
- Buttons: Rounded (0.5rem), high-contrast gradients, FontAwesome icons.
- Modern elements: Floating badges, interactive skill bars, and smooth AOS-style animations (fade-up).
- FontAwesome 6.4.0 integration for all icons.
`;
  // minimal-dev
  return `
THEME: Minimal Dev Portfolio. Use these EXACT styles:
- Background: pure white (#FFFFFF) and light gray (#F9FAFB) alternating sections
- Typography: 'Inter' font, ultra-clean, generous whitespace
- Accent: black (#000), with subtle gray borders (border-gray-200)
- Cards: white bg, light gray border, subtle box-shadow: 0 2px 8px rgba(0,0,0,0.08)
- Profile Photo: Floating circular frame with subtle drop shadow
- Stats Section: minimalist grid with "Count | Label" pairing
- Buttons: Black bg white text, pill shape (rounded-full), clean hover
- Section layout: centered, max-width: 900px, well-padded
- Skill chips: gray-100 bg, rounded-full, small text
- Clean, editorial typography: large bold headings, regular body copy
- Icons: Use regular/solid FontAwesome (e.g., fa-briefcase, fa-graduation-cap)
`;
}

export async function POST(req: NextRequest) {
  try {

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

    const themeStyles = buildThemePrompt(theme);

    const sysPrompt = `
      You are an elite full-stack web designer specializing in high-performance career portfolios.
      TASK: Generate a COMPLETE, SINGLE-FILE HTML portfolio based on the user's career data and the specified theme.
      
      RULES:
      1. RETURN JSON ONLY: { "html": "..." }
      2. The HTML MUST be a complete document (<!DOCTYPE html> through </html>).
      3. Use Tailwind CSS via CDN.
      4. Use FontAwesome 6.4.0 via CDN for icons.
      5. Include smooth AOS animations.
      6. Ensure the design is MOBILE-RESPONSIVE and PREMIUM.
      7. ${themeStyles}
    `;

    const userPrompt = `
      User Data: ${JSON.stringify(data)}
      Theme requested: ${theme}
      
      Instructions:
      - Create a stunning hero section with their name: ${data?.fullName || 'Professional'}.
      - List their skills: ${data?.skills || 'Expertise'}.
      - Present their experience and projects in a professional timeline/grid.
      - Ensure contact links (LinkedIn: ${data?.linkedin || '#'}, GitHub: ${data?.github || '#'}) are active.
    `;

    // 5. Call AI with multi-provider fallback
    try {
      const { content, provider } = await callAI([
        { role: 'system', content: sysPrompt },
        { role: 'user', content: userPrompt }
      ], { 
        jsonMode: true, 
        maxTokens: 8000, 
        temperature: 0.7 
      });

      const rawContent = content.trim();

      // Try clean JSON parse first
      let result: any = null;
      try {
        // Attempt 1: Standard JSON
        result = JSON.parse(rawContent);
      } catch {
        // Attempt 2: Extract from JSON "html" field via Regex (handles escapes)
        const jsonFieldMatch = rawContent.match(/"html"\s*:\s*"([\s\S]+?)"\s*[,}]/);
        if (jsonFieldMatch) {
           result = { html: jsonFieldMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\') };
        } 
        // Attempt 3: Extract from Markdown Fences (```html ... ```)
        else if (rawContent.includes('```html')) {
           const mdMatch = rawContent.match(/```html\s*([\s\S]+?)\s*```/);
           if (mdMatch) result = { html: mdMatch[1] };
        }
        // Attempt 4: Search for a pure <html> tag anywhere
        else if (rawContent.toLowerCase().includes('<html')) {
           const htmlMatch = rawContent.match(/<html[\s\S]*<\/html>/i);
           if (htmlMatch) result = { html: htmlMatch[0] };
        }
        // Attempt 5: Search for DOCTYPE
        else if (rawContent.toLowerCase().includes('<!doctype')) {
           const docMatch = rawContent.match(/<!doctype[\s\S]*<\/html>/i);
           if (docMatch) result = { html: docMatch[0] };
        }
      }

      if (!result?.html) {
        console.error('ALLL PARSING ATTEMPTS FAILED. Sample response:', rawContent.substring(0, 300));
        return NextResponse.json({ 
          error: 'AI returned malformed content. Please try again.',
          debug: process.env.NODE_ENV === 'development' ? rawContent.substring(0, 200) : undefined
        }, { status: 500 });
      }

      if (!result?.html) {
        return NextResponse.json({ error: 'AI did not return portfolio HTML. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({ ...result, _provider: provider });

    } catch (error: any) {
      console.error('Portfolio AI Exhaustion Details:', error.message || error);
      return NextResponse.json({ 
        error: 'AI is currently overloaded with requests in your region. Please try again in 30 seconds.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Portfolio gen error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
