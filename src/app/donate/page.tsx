'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Star, Copy, Check, Coffee, Pizza, PartyPopper, Rocket, HeartHandshake, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const upiId = 'vishwajeetsrk-1@okhdfcbank';

const amounts = [
  { icon: Coffee, label: 'Small Gift', amount: '₹20', desc: 'Helps us pay for 5 AI checks' },
  { icon: Pizza, label: 'Big Help', amount: '₹50', desc: 'Helps us keep the site running' },
  { icon: PartyPopper, label: 'Supporter', amount: '₹100', desc: "Helps us make new career plans" },
  { icon: Rocket, label: 'Hero Tier', amount: '₹250', desc: 'Become a main project helper' },
];

export default function DonatePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-24 max-w-5xl mx-auto py-12 px-4 text-black min-h-screen font-black uppercase overflow-x-hidden">

      <div className="mt-20 sm:mt-32" />

      {/* Hero */}
      <section className="text-center space-y-8">
        <div className="inline-block px-6 py-2 bg-black text-white font-black text-[10px] shadow-[4px_4px_0px_0px_#2563EB] italic tracking-widest">WHY GIVE?</div>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-black italic leading-[0.9]">
          HELP <span className="text-blue-600 underline decoration-8 underline-offset-4 not-italic decoration-yellow-400">STUDENTS</span> GROW
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 font-bold uppercase tracking-tight max-w-3xl mx-auto leading-tight italic">
          DreamSync is 100% free. If our tools helped you find your path, please consider a small gift to keep it free for everyone.
        </p>
      </section>

      {/* Mission Banner */}
      <section className="bg-black text-white border-[10px] border-black p-10 md:p-20 shadow-[20px_20px_0px_0px_#2563EB]">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="shrink-0 p-8 bg-white border-8 border-black shadow-[6px_6px_0px_0px_#FACC15]">
            <Heart className="w-16 h-16 text-red-500" strokeWidth={3} />
          </div>
          <div className="text-center md:text-left space-y-6">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none text-white">WHY WE NEED HELP</h2>
            <p className="text-xl md:text-2xl font-bold leading-snug uppercase tracking-tight text-white/80 italic">
              We don't take money from big companies. We are built for students, by students. Selective gifts help us pay for the AI and servers that power your future.
            </p>
          </div>
        </div>
      </section>

      {/* QR + UPI */}
      <section className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_black] overflow-hidden">
        <div className="bg-blue-600 text-white p-8 text-center border-b-8 border-black">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">SCAN TO HELP</h2>
          <p className="text-yellow-300 font-black uppercase tracking-widest text-xs mt-3">GPay · PhonePe · Paytm · BHIM · UPI</p>
        </div>

        <div className="p-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-4">
            <div className="w-64 h-64 border-8 border-black bg-white flex items-center justify-center p-4 shadow-[10px_10px_0px_0px_rgba(37,99,235,1)]">
              <img
                src="/qr-code.jpeg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=4&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DreamSync&cu=INR`)}`;
                }}
                alt={`UPI QR Code`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] font-black text-gray-400 flex items-center gap-2 justify-center uppercase tracking-widest italic">
              <Lock className="w-4 h-4 text-blue-600" /> SECURE 100%
            </p>
          </div>

          {/* UPI Details */}
          <div className="flex-1 space-y-10 text-center md:text-left w-full">
            <div className="space-y-6">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none italic">COPY UPI ADDRESS</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <code className="w-full text-base sm:text-lg md:text-xl font-black bg-gray-50 text-black border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] break-all leading-none italic">
                  {upiId}
                </code>
                <button
                  onClick={handleCopy}
                  className={`w-full sm:w-auto px-10 py-6 border-4 border-black font-black text-sm transition-all shadow-[6px_6px_0px_0px_#2563EB] active:shadow-none active:translate-x-1 active:translate-y-1 italic ${copied ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-black'}`}
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t-8 border-gray-50">
              <p className="font-black text-xs uppercase tracking-widest text-black/50 italic">EASY STEPS:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  'Open UPI App', 
                  'Scan The Code', 
                  'Thank You!'
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-4 text-center group">
                    <span className="w-12 h-12 bg-black text-white font-black text-xl flex items-center justify-center shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_#2563EB] group-hover:shadow-none transition-all">{i + 1}</span>
                    <span className="text-xs font-black italic">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Amounts */}
      <section className="space-y-16">
        <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-black inline-block uppercase italic tracking-tighter border-b-8 border-black pb-3">
              GIFT TIERS
            </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {amounts.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white border-8 border-black p-10 text-center relative w-full transition-all group shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_0px_#2563EB]"
              onClick={() => handleCopy()}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-black text-yellow-400 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#2563EB]">
                <item.icon className="w-8 h-8" />
              </div>
              <div className="text-5xl font-black mt-6 text-black italic leading-none">{item.amount}</div>
              <p className="font-black text-blue-600 mt-3 uppercase tracking-widest text-xs italic">{item.label}</p>
              <p className="text-gray-400 font-bold text-[10px] mt-6 uppercase tracking-tight leading-tight italic">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6 sm:py-32 space-y-12 bg-black text-white border-[10px] border-black shadow-[24px_24px_0px_0px_#FACC15]">
        <div className="flex justify-center">
           <div className="p-10 bg-white shadow-[10px_10px_0px_0px_#2563EB] rotate-12">
             <HeartHandshake className="w-20 h-20 text-black" />
           </div>
        </div>
        <div className="space-y-6">
           <h2 className="text-5xl md:text-[90px] font-black uppercase italic tracking-tighter leading-none">THANK YOU</h2>
           <p className="text-xl md:text-3xl text-white/70 font-bold uppercase tracking-tight max-w-3xl mx-auto italic">
             Every gift keeps our tools free for students across India. We appreciate your support!
           </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-16 py-8 bg-white text-black font-black text-sm border-4 border-black shadow-[10px_10px_0px_0px_#2563EB] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all uppercase tracking-widest italic"
        >
          Back to Dashboard →
        </Link>
      </section>

    </div>
  );
}
