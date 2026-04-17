'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
        friendlyMessage = "Account already exists. Use Sign In.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "Password too weak (need 6+ chars).";
      } else {
        friendlyMessage = "Please check your email and name.";
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
      setError(`Fail with ${providerName}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12 selection:bg-yellow-400/40">
      
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
           <Link href="/">
             <Image src="/DreamSynclogo.png" alt="Logo" width={140} height={35} className="object-contain" priority />
           </Link>
           <div className="px-4 py-1 bg-black text-white font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#2563EB] italic">START YOUR JOURNEY</div>
        </div>

        <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] space-y-8 group transition-all hover:shadow-[8px_8px_0px_0px_#2563EB]">
          <div className="text-center space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-black uppercase italic leading-none">JOIN US</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic leading-none mt-2">Create your free account</p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border-2 border-black text-red-600 text-[10px] font-black italic shadow-[3px_3px_0px_0px_black]">
              <div className="flex items-center gap-2 uppercase leading-tight">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black tracking-[0.2em] ml-1 uppercase text-blue-600 italic">Your Name</label>
              <input
                type="text"
                required
                className="w-full p-4 text-lg border-2 border-black font-black uppercase focus:outline-none bg-white shadow-[3px_3px_0px_0px_black] focus:shadow-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="FIRST LAST"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black tracking-[0.2em] ml-1 uppercase text-blue-600 italic">Email Address</label>
              <input
                type="email"
                required
                className="w-full p-4 text-lg border-2 border-black font-black uppercase focus:outline-none bg-white shadow-[3px_3px_0px_0px_black] focus:shadow-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="NAME@EMAIL.COM"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black tracking-[0.2em] ml-1 uppercase text-blue-600 italic">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-4 text-lg border-2 border-black font-black focus:outline-none bg-white shadow-[3px_3px_0px_0px_black] focus:shadow-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-blue-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-black text-white border-2 border-black font-black text-lg uppercase italic shadow-[6px_6px_0px_0px_#2563EB] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>JOIN FAMILY <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </form>

          <div className="pt-8 border-t-2 border-black/5 space-y-8">
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] relative z-10 italic">OR JOIN WITH</span>
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignup('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-4 border-2 border-black font-black text-[10px] uppercase bg-white shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup('github')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-4 border-2 border-black font-black text-[10px] uppercase bg-white shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                 GitHub
              </button>
            </div>

            <div className="text-center pt-2">
              <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] hover:underline decoration-2 underline-offset-4">
                Already a member? Sign In →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
