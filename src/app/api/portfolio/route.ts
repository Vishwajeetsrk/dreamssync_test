import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { validateCareerInput } from '@/lib/aiGuard';
import { callAI, parseJSON } from '@/lib/ai';

// Deleted redundant Redis instantiation to use standard ratelimit.ts export instead

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

const sysPrompt = `You are a world-class, award-winning creative technologist and senior frontend developer specializing in interactive WebGL portfolios like those featured on Behance (design portfolios) and Wall of Portfolios (specifically inspired by the works of Karthik M and Utkarsh Raj).

DESIGN INSPIRATION SITES TO EMULATE:
- Karthik M (Asymmetric layouts, smooth cinematic feels)
- Utkarsh Raj (Bold interactive animations, modern layout structures)
- Modern Layouts (Fluid responsiveness, generous margins, luxury aesthetic)
- Behance (Cinematic, visual-heavy, highly stylized presentation)
- Dark Themes (Cinematic dark #050505 background with glowing mesh neon accents)
- Minimalist Layouts (Elegant typography, high contrast, no clutter)
- Creative Interactive Portfolios (GSAP scroll reveals, custom cursor, Three.js canvasses)

CRITICAL DESIGN & BRANDING MANDATES:
1. ABSOLUTELY NO DREAMSYNC LOGOS: Do not include any DreamSync branding, icons, text, or metadata anywhere in the HTML, CSS, or JS. The top navigation header MUST display the candidate's full name as an elegant typography-driven logotype.
2. COPYRIGHT FOOTER: The footer MUST contain the exact text: "© 2026 Vishwajeet".
3. OFFICIAL SKILLS LOGOS: In the skills section, every technical skill card MUST contain its REAL, OFFICIAL LOGO SVG via reliable CDNs (like https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg, react/react-original.svg, etc.) or expertly crafted, beautiful inline SVG vectors. DO NOT use generic boxes or placeholders! Make them look premium.
4. 3D WEBGL SCENE: Implement a 3D canvas background behind the hero (#canvas-3d) using Three.js. Create an interactive orbital particle field, smooth rotating torus knot, or fluid web that subtly tracks and follows the user's mouse cursor for a premium parallax depth effect.
5. BUTTERY SMOOTH MOTION: Inject GSAP CDN and initialize staggered, kinetic entrance animations for headers, names, and elements. Add smooth hover-effects with neon glassmorphic glowing borders on hoverable cards.
6. PREMIUM COLOR PALETTE: Implement rich dark/neon aesthetics. Use a combination of colors (e.g. glowing Electric Blue, Cyber Violet, Neon Magenta). Use glassmorphic 'glass-dark' classes with backdrop-filter: blur(12px) and subtle box-shadow glows.
7. FULLY FUNCTIONAL EXPORT & SHARE: Include interactive, functional buttons at the top or bottom to "EXPORT PDF", "DOWNLOAD RESUME", or "SHARE". Use html2canvas or vanilla JS print functions (\`window.print()\`) tied to the EXPORT PDF button to ensure they actually work cleanly.
8. CHECK ALL BUTTONS: Ensure all internal links (like #about, #experience, #projects) are correctly mapped, and external social links are elegant font-awesome icons with target="_blank".

OUTPUT STRUCTURE:
Produce the generated portfolio codebase inside exactly THREE separate markdown code blocks:
\`\`\`html
<!-- HTML -->
\`\`\`
\`\`\`css
/* CSS */
\`\`\`
\`\`\`javascript
// JS
\`\`\`
DO NOT WRAP IN JSON. Provide raw, production-grade code blocks.`;

const userPrompt = (theme: string, data: any) => `
Generate a LUXURY, HIGH-END 3D PERSONAL PORTFOLIO.
NAME: ${data.fullName}
ROLE: ${data.targetRole}
THEME: ${theme}
SUMMARY: ${data.summary}
SKILLS: ${data.skills}
EXPERIENCE: ${data.experience}
PROJECTS: ${data.projects}

HARD REQUIREMENTS:
1. NO DREAMSYNC branding anywhere.
2. Use OFFICIAL SKILL LOGOS: Display Github (github-original.svg), React, Node, etc. as beautiful vector SVGs inside the cards.
3. Include "© 2026 Vishwajeet" in the footer.
4. Make it 3D: The javascript MUST contain active Three.js code initializing a PerspectiveCamera, WebGLRenderer, and interactive orbital Particle Cloud or animated 3D Geometry tracking mouse movement (e.g., requestAnimationFrame loop updating object.rotation.x/y based on clientX/clientY).
5. Rich combination of colors and high-end glassmorphic gradients.
6. Integrated functioning EXPORT features (PDF, HTML) and robust interactive buttons for sharing.
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

    // 5. Call AI with multi-provider fallback (Disabled JSON Mode to avoid heavy token-escaping costs)
    try {
      const { content, provider } = await callAI([
        { role: 'system', content: sysPrompt + buildThemePrompt(theme) },
        { role: 'user', content: userPrompt(theme, data) }
      ], { 
        jsonMode: false, 
        maxTokens: 8000, 
        temperature: 0.7 
      });

      const rawContent = content.trim();
      let html = '';
      let css = '';
      let js = '';

      // Step A: Attempt robust Markdown Block extraction first
      const htmlMatch = /```html\s*([\s\S]*?)```/i.exec(rawContent);
      const cssMatch = /```css\s*([\s\S]*?)```/i.exec(rawContent);
      const jsMatch = /```(?:javascript|js)\s*([\s\S]*?)```/i.exec(rawContent);

      if (htmlMatch || cssMatch || jsMatch) {
        html = htmlMatch?.[1]?.trim() || '';
        css = cssMatch?.[1]?.trim() || '';
        js = jsMatch?.[1]?.trim() || '';
        console.log(`[Portfolio API] Extracted code via Markdown Blocks.`);
      }

      // Step B: Fallback to standard JSON object extraction
      if (!html) {
        try {
          const parsed = parseJSON(rawContent) as any;
          html = parsed.html || '';
          css = parsed.css || '';
          js = parsed.js || '';
          console.log(`[Portfolio API] Extracted code via parseJSON.`);
        } catch (e) {
          // Try to find boundary points for partial object recovery
          const start = rawContent.indexOf('{');
          const end = rawContent.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            try {
              const jsonPortion = rawContent.substring(start, end + 1);
              const parsed = parseJSON(jsonPortion) as any;
              html = parsed.html || '';
              css = parsed.css || '';
              js = parsed.js || '';
              console.log(`[Portfolio API] Extracted code via bracket-substring parseJSON.`);
            } catch (e2) {
              console.warn('[Portfolio API] JSON boundary extraction failed.');
            }
          }
        }
      }

      // Step C: If still no HTML extracted but the document starts raw, use the whole block
      if (!html && (rawContent.includes('<html') || rawContent.includes('<!DOCTYPE') || rawContent.includes('<body'))) {
         html = rawContent;
         console.log(`[Portfolio API] Assigned full rawContent to HTML.`);
      }

      if (!html) {
        console.error(`[Portfolio API] Extraction failure. Raw content length: ${rawContent.length}`);
        return NextResponse.json({ error: 'AI did not return portfolio HTML. Please try again.' }, { status: 500 });
      }

      return NextResponse.json({ html, css, js, _provider: provider });

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
