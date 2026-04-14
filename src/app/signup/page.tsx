'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Database, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        created_at: new Date().toISOString(),
        onboarding_complete: false,
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError('');
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;

      // Check if user exists, if not create
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0],
          email: user.email,
          avatar_url: user.photoURL || '',
          created_at: new Date().toISOString(),
          onboarding_complete: false,
          provider: provider
        });
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error(`${provider} signup error:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6 selection:bg-[#FACC15]/40 font-bold">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="neo-box p-12 bg-white space-y-10">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-4 mb-4">
               <Link href="/" className="inline-block">
                 <Image src="/DreamSynclogo.png" alt="DreamSync Logo" width={160} height={40} className="object-contain" priority />
               </Link>
               <div className="inline-block p-4 bg-[#FACC15] text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="w-10 h-10" />
               </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-black">Create Account</h1>
            <p className="text-gray-400 text-xs tracking-[0.2em]">Join DreamSync</p>
          </div>

          {error && (
            <div className="p-5 bg-red-100 border-4 border-black text-red-600 text-xs font-black flex items-center gap-4 animate-shake shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-6 h-6 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6 text-black">
            <div className="space-y-3">
              <label className="text-xs font-black tracking-widest ml-1">FULL NAME</label>
              <input 
                type="text" 
                required 
                className="neo-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black tracking-widest ml-1">EMAIL ADDRESS</label>
              <input 
                type="email" 
                required 
                className="neo-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="NAME@EMAIL.COM"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black tracking-widest ml-1">PASSWORD</label>
              <input 
                type="password" 
                required 
                className="neo-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="neo-btn-primary w-full h-16 text-lg mt-4 flex items-center justify-center gap-4"
            >
              {loading ? (
                 <div className="w-8 h-8 border-4 border-white/30 border-t-white animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </form>

          <div className="pt-10 border-t-4 border-dashed border-black/10 space-y-8">
            <div className="text-center">
              <span className="bg-white px-4 text-xs font-black text-gray-400 uppercase tracking-widest relative -top-[52px]">Alternative Signups</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mt-8">
              <button 
                type="button"
                onClick={() => handleSocialSignup('google')}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-4 border-4 border-black font-black text-xs uppercase hover:bg-red-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Google
              </button>
              <button 
                type="button"
                onClick={() => handleSocialSignup('github')}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-4 border-4 border-black font-black text-xs uppercase hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> GitHub
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-[#2563EB] hover:underline">
                 Already have an account? Log in Here →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center items-center gap-4 opacity-30 grayscale">
           <ShieldCheck className="w-5 h-5" />
           <span className="text-[10px] font-black tracking-[0.6em] text-black/40 uppercase">Secure Sign Up Area</span>
           <Globe className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  );
}
