'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, Database, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Zap, Globe, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      let friendlyMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "You already have an account. Please click Sign In below.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "Password is too weak. Please use 6 or more characters.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a real email address.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (providerName: 'google' | 'github') => {
    setLoading(true);
    setError('');
    try {
      await signIn(providerName, { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (err: any) {
      setError(`Could not join with ${providerName}. Please try using your email.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-20 selection:bg-yellow-400/40">
      
      <div className="w-full max-w-lg space-y-12">
        <div className="flex flex-col items-center gap-6">
           <Link href="/">
             <Image src="/DreamSynclogo.png" alt="Logo" width={180} height={45} className="object-contain" priority />
           </Link>
           <div className="px-6 py-2 bg-black text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#2563EB] italic">START YOUR JOURNEY</div>
        </div>

        <div className="bg-white border-8 border-black p-8 sm:p-12 shadow-[16px_16px_0px_0px_black] space-y-10 group transition-all hover:shadow-[16px_16px_0px_0px_#2563EB]">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black uppercase italic leading-none">JOIN US</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest italic leading-none mt-2">Create your free account below</p>
          </div>

          {error && (
            <div className="p-6 bg-red-100 border-4 border-black text-red-600 text-xs font-black flex flex-col gap-4 shadow-[4px_4px_0px_0px_black] italic">
              <div className="flex items-center gap-4 uppercase leading-tight">
                <AlertCircle className="w-6 h-6 shrink-0" /> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] ml-1 uppercase text-blue-600 italic">Your Name</label>
              <input
                type="text"
                required
                className="w-full p-5 text-xl border-4 border-black font-black uppercase focus:outline-none focus:bg-gray-50 bg-white shadow-[4px_4px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="FIRST LAST"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] ml-1 uppercase text-blue-600 italic">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-5 text-xl border-4 border-black font-black uppercase focus:outline-none focus:bg-gray-50 bg-white shadow-[4px_4px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="NAME@EMAIL.COM"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black tracking-[0.2em] ml-1 uppercase text-blue-600 italic">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-5 text-xl border-4 border-black font-black focus:outline-none focus:bg-gray-50 bg-white shadow-[4px_4px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-blue-600"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-black text-white border-4 border-black font-black text-xl uppercase italic shadow-[8px_8px_0px_0px_#2563EB] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center justify-center gap-4 mt-8"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-white/30 border-t-white animate-spin" />
              ) : (
                <>JOIN FAMILY <ArrowRight className="w-8 h-8" /></>
              )}
            </button>
          </form>

          <div className="pt-10 border-t-4 border-black/5 space-y-10">
            <div className="relative flex justify-center">
              <span className="bg-white px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] relative z-10 italic">OR JOIN WITH</span>
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => handleSocialSignup('google')}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-5 border-4 border-black font-black text-xs uppercase bg-white shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('github')}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-5 border-4 border-black font-black text-xs uppercase bg-white shadow-[6px_6px_0px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                 GitHub
              </button>
            </div>

            <div className="text-center pt-4">
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-[#2563EB] hover:underline decoration-4 underline-offset-8">
                Already a member? Sign In →
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
             <div className="flex items-center gap-6 opacity-20">
                <ShieldCheck className="w-6 h-6 text-black" />
                <Globe className="w-6 h-6 text-black" />
             </div>
             <p className="text-[9px] font-black tracking-[0.5em] text-gray-300 uppercase italic">Your account is safe & private</p>
        </div>
      </div>
    </div>
  );
}
