'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, ShieldCheck, Loader2, Zap } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let friendlyMessage = "Failed to send reset email. Please verify if the email is correct.";
      if (err.code === 'auth/user-not-found') {
        friendlyMessage = "No account found with this email address.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = "Too many requests. Please try again in 5 minutes.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6 font-bold">
        <div className="w-full max-w-md bg-white border-4 border-black p-10 neo-box space-y-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-[#FACC15] flex items-center justify-center border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight italic">Link Sent!</h1>
              <p className="text-gray-500 font-black mt-4 uppercase text-xs tracking-widest leading-relaxed">
                We've dispatched a recovery protocol to <br/>
                <span className="text-[#2563EB] block mt-1 break-all bg-blue-50 p-2 border-2 border-black border-dashed">{email}</span>
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 border-2 border-black border-dashed flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-green-600" />
               <p className="text-[10px] font-black uppercase text-left">Verify your spam folder. Link expires in 60 minutes for security.</p>
            </div>

            <Link 
              href="/login" 
              className="w-full py-4 bg-black text-white font-black text-lg border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> BACK TO LOGIN
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-6 font-bold">
      <div className="w-full max-w-md bg-white border-4 border-black p-10 neo-box space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#2563EB] flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight italic">Forgot Password?</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Enter email to receive recovery link</p>
        </div>

        {error && (
          <div className="bg-red-100 border-4 border-black p-4 text-red-900 font-black text-[10px] flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500 ml-1">Secure Channel (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#2563EB] transition-colors" />
              <input
                type="email"
                required
                className="w-full bg-gray-50 border-4 border-black p-4 pl-12 focus:outline-none focus:bg-white focus:ring-8 focus:ring-[#2563EB]/10 transition-all font-black text-sm uppercase"
                placeholder="NAME@DOMAIN.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#FACC15] text-black font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
            {loading ? 'INITIATING...' : 'SEND RECOVERY LINK'} 
          </button>
        </form>

        <div className="pt-8 text-center border-t-4 border-black border-dashed">
          <Link href="/login" className="text-gray-400 font-black hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Go Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
