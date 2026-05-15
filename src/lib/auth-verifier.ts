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
      console.warn('[auth-verifier] Firebase ID token verification failed:', err);
    }
  }

  return null;
}
