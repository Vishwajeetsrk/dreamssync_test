import * as admin from 'firebase-admin';

// Lazy initialize Firebase Admin to prevent build-time crashes when environment variables are absent.
function initAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        '[Firebase Admin] Cannot initialize: Missing mandatory environment variables ' +
        '(FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY).'
      );
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        databaseURL: `https://${projectId}.firebaseio.com`
      });
      console.log('[Firebase Admin] Initialized successfully');
    } catch (error) {
      console.error('[Firebase Admin] Initialization runtime error:', error);
      throw error;
    }
  }
}

export function getAdminDb() {
  initAdmin();
  return admin.firestore();
}

export function getAdminAuth() {
  initAdmin();
  return admin.auth();
}

export function getAdminStorage() {
  initAdmin();
  return admin.storage();
}

export { admin };

