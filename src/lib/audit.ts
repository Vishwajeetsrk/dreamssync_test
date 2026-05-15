import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function logAdminAction(adminName: string, action: string, details: string) {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      adminName,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log admin action', err);
  }
}
