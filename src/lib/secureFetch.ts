import { auth } from './firebase';
import { getIdToken } from 'firebase/auth';

/**
 * DreamSync Client-Side Secure Fetch Utility
 * Intercepts network calls and automatically attaches the current user's Firebase
 * Identity Token as a Bearer authentication header.
 */
export async function secureFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Initialize modern headers utility to safely append values
  const headers = new Headers(init?.headers || {});

  // Automatically retrieve dynamic Firebase JWT token if user is authenticated
  if (auth.currentUser) {
    try {
      const idToken = await getIdToken(auth.currentUser, false);
      headers.set('Authorization', `Bearer ${idToken}`);
    } catch (error) {
      console.error('[secureFetch] Failed to inject Firebase ID Token:', error);
    }
  }

  // Execute final decorated request
  return fetch(input, {
    ...init,
    headers,
  });
}
