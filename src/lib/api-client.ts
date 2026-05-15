import { auth } from './firebase';

/**
 * A custom fetch wrapper that automatically appends the current active
 * Firebase ID Token as a Bearer Authorization header to securely call backends.
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const currentHeaders = options.headers || {};
  const headers = new Headers(currentHeaders);

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Retrieve the latest token, force refresh if close to expiration
      const idToken = await currentUser.getIdToken(false);
      if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
      }
    }
  } catch (error) {
    console.warn('[secureFetch] Could not inject Firebase Auth token:', error);
  }

  // Default Content-Type to JSON for consistency if method is POST/PUT
  if ((options.method === 'POST' || options.method === 'PUT') && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
