'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

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
  const { data: session, status: sessionStatus } = useSession();
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
          setUser(session.user);
          setProvider('next-auth');
          setUserData({
            name: session.user?.name,
            email: session.user?.email,
            avatar_url: session.user?.image,
            plan: 'free'
          });
          setLoading(false);
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
