import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Inject Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 2. CSRF / Origin Protection for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
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

  // 3. Admin Route Protection
  // Note: True admin check happens in context, but we can do a quick check here
  // if using session cookies (NextAuth). 
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token');
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
