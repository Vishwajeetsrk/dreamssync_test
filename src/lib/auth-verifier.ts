import { getServerSession } from 'next-auth';
import { getAdminAuth } from './firebase-admin';

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Verifies incoming requests using either standard NextAuth sessions
 * or Firebase client ID Tokens passed via Authorization Headers.
 * 
 * @param req The incoming Request object
 * @returns The authenticated user credentials or null if unauthorized
 */
export async function verifySession(req: Request): Promise<AuthUser | null> {
  try {
    // 1. Verify via NextAuth Session
    const nextAuthSession = await getServerSession();
    if (nextAuthSession?.user) {
      return {
        uid: (nextAuthSession.user as any).id || nextAuthSession.user.email || 'unknown_nextauth_uid',
        email: nextAuthSession.user.email || undefined,
        name: nextAuthSession.user.name || undefined,
        picture: nextAuthSession.user.image || undefined,
      };
    }
  } catch (e) {
    console.error('[auth-verifier] NextAuth session check failed:', e);
  }

  // 2. Verify via Firebase Client Token (Bearer Token)
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7);
    try {
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
    } catch (err) {
      console.warn('[auth-verifier] Firebase ID token cryptographic verification failed:', err);
      
      // Dev/Testing Fallback: Decode raw JWT payload directly if Firebase Admin lacks local credentials
      if (!process.env.FIREBASE_PRIVATE_KEY || process.env.NODE_ENV === 'development') {
        console.info('[auth-verifier] Falling back to local JWT payload parsing for development/testing.');
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            if (payload.user_id || payload.uid || payload.sub) {
              return {
                uid: payload.user_id || payload.uid || payload.sub,
                email: payload.email,
                name: payload.name || payload.display_name,
                picture: payload.picture,
              };
            }
          }
        } catch (fallbackErr) {
          console.error('[auth-verifier] Failed to parse local JWT fallback payload:', fallbackErr);
        }
      }
    }
  }

  return null;
}
