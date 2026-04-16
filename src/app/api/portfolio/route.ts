import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { validateCareerInput } from '@/lib/aiGuard';

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

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
       return NextResponse.json({ error: 'OpenRouter API key missing' }, { status: 500 });
    }

    const themeGuide = buildThemePrompt(theme);

    const name = data?.fullName?.trim() || 'Your Name';
    const role = data?.targetRole?.trim() || 'Software Engineer';
    const profileImage = data?.profileImage || '';

    const sysPrompt = `You are an expert frontend developer. Generate a self-contained single-page HTML portfolio.
    
SAFETY MANDATE: You MUST refuse to generate content related to harmful, illegal, unethical, or dangerous activities. Only provide safe and professional career guidance.

Output ONLY this JSON: { "html": "<!DOCTYPE html>...</html>" }
No markdown. No explanation. Just the JSON object.
Use Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
Use Google Fonts via @import in <style>.`;

    const userPrompt = `Build a COMPLETE, responsive developer portfolio.\n${themeGuide}\n
SECTIONS REQUIRED: sticky navbar, hero (name+role+CTA), about, skills grid, projects cards, experience timeline, education, contact section with links, footer.\n
REAL DATA TO USE:\nName: ${name}\nRole: ${role}\nEmail: ${data?.email || ''}\nPhone: ${data?.phone || ''}\nLinkedIn: ${data?.linkedin || ''}\nGitHub: ${data?.github || ''}\nBio: ${data?.summary || 'Passionate ' + role + '.'}\nSkills: ${data?.skills || 'JavaScript, HTML, CSS'}\nProjects: ${data?.projects || 'See GitHub'}\nExperience: ${data?.experience || 'N/A'}\nEducation: ${data?.education || ''}\nCourses: ${data?.courses || ''}\nAchievements: ${data?.achievements || ''}\nLanguages: ${data?.languages || ''}\nHobbies: ${data?.hobbies || ''}\nProfile Photo (Data URI): ${profileImage || 'NONE'}\n
RULES: ${profileImage ? 'MANDATORY: Use the Profile Photo Data URI in the hero section.' : ''} No Lorem Ipsum. No placeholders. Use ONLY the data above. Add smooth scroll. Use FontAwesome 6.4.0. Make it look PREMIUM and HIGH-FIDELITY.
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dreamsync.app',
        'X-Title': 'DreamSync Portfolio Generator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      let errMsg = 'Failed to communicate with AI API.';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.error?.message || errMsg;
      } catch {}
      return NextResponse.json({ error: errMsg }, { status: 502 });
    }

    const aiRes = await response.json();
    const rawContent = aiRes.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 500 });
    }

    // Try clean JSON parse first
    let result: any = null;
    try {
      result = JSON.parse(rawContent);
    } catch {
      // Fallback: extract HTML between the first { "html": "..." } pattern
      const match = rawContent.match(/"html"\s*:\s*"([\s\S]+)"\s*\}/);
      if (match) {
        result = { html: match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\') };
      } else {
        // Second fallback: if it's raw HTML, wrap it
        if (rawContent.trim().startsWith('<!DOCTYPE') || rawContent.trim().startsWith('<html')) {
          result = { html: rawContent };
        } else {
          console.error('Cannot parse AI response:', rawContent.substring(0, 500));
          return NextResponse.json({ error: 'AI returned malformed content. Please try again.' }, { status: 500 });
        }
      }
    }

    if (!result?.html) {
      return NextResponse.json({ error: 'AI did not return portfolio HTML. Please try again.' }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Portfolio gen error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
