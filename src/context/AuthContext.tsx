'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';

import { useSession } from 'next-auth/react';

interface AuthContextType {
  user: any | null;
  userData: any | null;
  loading: boolean;
  provider: 'firebase' | 'next-auth' | null;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true,
  provider: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const sessionContext = useSession();
  const session = sessionContext?.data;
  const sessionStatus = sessionContext?.status || 'unauthenticated';
  
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<'firebase' | 'next-auth' | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    // Firebase Auth Monitor
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setProvider('firebase');
        
        const docRef = doc(db, 'users', currentUser.uid);
        unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({
              name: currentUser.displayName || currentUser.email?.split('@')[0],
              email: currentUser.email,
              avatar_url: currentUser.photoURL || '',
              plan: 'free'
            });
          }
          setLoading(false);
        });
      } else if (sessionStatus !== 'loading') {
        // If no Firebase user, check for NextAuth session
        if (session) {
          setProvider('next-auth');
          
          // Check if this NextAuth user already has a Firebase record
          const nextAuthEmail = session.user?.email;
          if (nextAuthEmail) {
            // We use the email as a key or lookup to find/create the user in Firestore
            // Note: Ideally you'd use a stable ID, but session.user.email is available
            const docRef = doc(db, 'users', (session.user as any).id || nextAuthEmail.replace(/\./g, '_'));
            
            getDoc(docRef).then(async (docSnap) => {
              if (docSnap.exists()) {
                setUserData(docSnap.data());
              } else {
                // Create the user record in Firestore if it doesn't exist
                const newUserData = {
                  name: session.user?.name,
                  email: session.user?.email,
                  avatar_url: session.user?.image,
                  plan: 'free',
                  created_at: new Date().toISOString(),
                  provider: 'next-auth'
                };
                await setDoc(docRef, newUserData);
                setUserData(newUserData);
              }
              setUser(session.user);
              setLoading(false);
            });
          } else {
            setUser(session.user);
            setUserData({
              name: session.user?.name,
              avatar_url: session.user?.image,
              plan: 'free'
            });
            setLoading(false);
          }
        } else {
          setUser(null);
          setUserData(null);
          setProvider(null);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [session, sessionStatus]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, provider }}>
      {children}
    </AuthContext.Provider>
  );
};
