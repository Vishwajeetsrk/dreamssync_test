import { NextRequest, NextResponse } from 'next/server';
import { globalRateLimit, authRateLimit, toolRateLimit } from './lib/ratelimit';

// Security Headers based on institutional standards
const SECURITY_HEADERS = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.firebaseapp.com https://*.googleapis.com https://www.gstatic.com https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://*.googleusercontent.com https://*.firebaseapp.com https://firebasestorage.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com; " +
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.resend.com https://www.gstatic.com;",
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 0. Protect /admin and /api/admin paths at Edge level
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const nextAuthToken = 
      request.cookies.get('next-auth.session-token') || 
      request.cookies.get('__Secure-next-auth.session-token');
      
    const firebaseSession = request.cookies.get('firebase-token');

    if (!nextAuthToken && !firebaseSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  const response = NextResponse.next();


  // 1. Inject Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 2. CSRF / Origin Protection for API routes
  if (pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // In production, strictly enforce origin match
    if (process.env.NODE_ENV === 'production' && origin && !origin.includes(host || '')) {
      return new NextResponse(
        JSON.stringify({ error: 'Security Violation: Unauthorized Origin' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // Next.js 16 Type Fix: access IP via casting or headers
  const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // 3. RATE LIMITING FOR ALL API ROUTES
  if (pathname.startsWith('/api/')) {
    // Specialized Tool Rate Limiting (Roadmap, ATS, LinkedIn, Career Agent, Mental Health)
    if (
      pathname.includes('/roadmap') || 
      pathname.includes('/ats-check') || 
      pathname.includes('/linkedin') ||
      pathname.includes('/career-agent') ||
      pathname.includes('/mental-health')
    ) {
      const { success, limit, remaining, reset } = await toolRateLimit.limit(`tool_${ip}`);
      if (!success) return rateLimitResponse(limit, remaining, reset, 'AI Tool rate limit exceeded.', response);
    } else {
      // Standard Global Rate Limit (Global API)
      const { success, limit, remaining, reset } = await globalRateLimit.limit(`global_${ip}`);
      if (!success) return rateLimitResponse(limit, remaining, reset, 'Global rate limit exceeded.', response);
    }
  }

  // 4. SPECIFIC RATE LIMITING FOR LOGIN/SIGNUP PAGES (Max 5 attempts / 15 min as requested)
  if (pathname === '/login' || pathname === '/signup') {
    const { success, limit, remaining, reset } = await authRateLimit.limit(`auth_page_${ip}`);
    if (!success) return rateLimitResponse(limit, remaining, reset, 'Login attempt limit exceeded. Please try again in 15 minutes.', response);
  }

  return response;
}

function rateLimitResponse(limit: number, remaining: number, reset: number, customMessage: string, baseResponse: NextResponse) {
  const resp = new NextResponse(
    JSON.stringify({ error: 'Too Many Requests', message: customMessage }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );

  // Re-apply security headers for the error response
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    resp.headers.set(key, value);
  });

  return resp;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
