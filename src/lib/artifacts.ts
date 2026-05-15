import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';

export type ArtifactType = 'resume' | 'roadmap' | 'ikigai' | 'portfolio' | 'ats_check' | 'linkedin' | 'mental_health';

export interface Artifact {
  id?: string;
  userId: string;
  type: ArtifactType;
  title: string;
  data: any;
  createdAt: any;
  metadata?: any;
}

/**
 * Saves a tool output to the user's artifacts collection in Firestore.
 */
export async function saveArtifact(userId: string, type: ArtifactType, title: string, data: any, metadata: any = {}) {
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'artifacts'), {
      type,
      title,
      data,
      metadata,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving artifact:', error);
    throw error;
  }
}

/**
 * Retrieves all artifacts for a specific user.
 */
export async function getUserArtifacts(userId: string) {
  try {
    const q = query(
      collection(db, 'users', userId, 'artifacts'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Artifact[];
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return [];
  }
}

/**
 * Deletes an artifact.
 */
export async function deleteArtifact(userId: string, artifactId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'artifacts', artifactId));
    return true;
  } catch (error) {
    console.error('Error deleting artifact:', error);
    throw error;
  }
}
