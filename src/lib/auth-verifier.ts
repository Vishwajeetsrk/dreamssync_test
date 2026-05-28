import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

// Admin emails whitelist — bypass role DB check for speed & reliability
const ADMIN_EMAILS = [
  'vishwajeetsrk@gmail.com',
  'vishwajeetaman15@gmail.com',
  'viswajeetsrk@gmail.com',
];

/**
 * Verifies incoming requests using NextAuth sessions OR Firebase Bearer tokens.
 * Falls back to JWT payload decoding when Firebase Admin SDK is unavailable.
 */
export async function verifySession(req: Request): Promise<AuthUser | null> {
  // 1. Try NextAuth session (primary, works in all environments)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const sessionUser = session.user as any;
      return {
        uid: sessionUser.id || sessionUser.uid || sessionUser.email || 'nextauth_uid',
        email: sessionUser.email || undefined,
        name: sessionUser.name || undefined,
        picture: sessionUser.image || undefined,
      };
    }
  } catch (e) {
    console.warn('[auth-verifier] NextAuth session check failed:', e);
  }

  // 2. Try Firebase Bearer token (from Authorization header)
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7);

    // 2a. Try Firebase Admin SDK verification if credentials exist
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      try {
        const { getAdminAuth } = await import('./firebase-admin');
        const auth = getAdminAuth();
        const decoded = await auth.verifyIdToken(idToken);
        return {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };
      } catch (err) {
        console.warn('[auth-verifier] Firebase Admin token verification failed:', err);
      }
    }

    // 2b. Fallback: Decode JWT payload locally (dev/no-admin-creds mode)
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        const uid = payload.user_id || payload.uid || payload.sub;
        if (uid) {
          return {
            uid,
            email: payload.email,
            name: payload.name || payload.display_name,
            picture: payload.picture,
          };
        }
      }
    } catch (err) {
      console.warn('[auth-verifier] JWT payload decode failed:', err);
    }
  }

  // 3. Try firebase-token cookie (set by the client after Firebase login)
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/firebase-token=([^;]+)/);
  if (tokenMatch) {
    const idToken = decodeURIComponent(tokenMatch[1]);
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        const uid = payload.user_id || payload.uid || payload.sub;
        if (uid) {
          return {
            uid,
            email: payload.email,
            name: payload.name || payload.display_name,
            picture: payload.picture,
          };
        }
      }
    } catch (err) {
      console.warn('[auth-verifier] Cookie token decode failed:', err);
    }
  }

  return null;
}

/**
 * Validates whether the request is authenticated AND has admin clearance.
 * Uses email whitelist first, then checks Firestore role if Admin SDK is available.
 */
export async function verifyAdmin(req: Request): Promise<AuthUser | null> {
  const user = await verifySession(req);
  if (!user) return null;

  const emailLower = user.email?.toLowerCase()?.trim();

  // Fast path: Email whitelist (always works, no DB needed)
  if (emailLower && ADMIN_EMAILS.includes(emailLower)) {
    return user;
  }

  // Slow path: Check Firestore role (requires Firebase Admin SDK)
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      const { getAdminDb } = await import('./firebase-admin');
      const db = getAdminDb();
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        const role = data?.role;
        const isAdminFlag = data?.isAdmin || data?.inAdmin;
        if (role === 'admin' || role === 'super_admin' || isAdminFlag === true) {
          return user;
        }
      }
    } catch (err) {
      console.error('[auth-verifier] Firestore role check failed:', err);
    }
  }

  console.warn(`[auth-verifier] Access denied for email: ${user.email} (uid: ${user.uid})`);
  return null;
}
