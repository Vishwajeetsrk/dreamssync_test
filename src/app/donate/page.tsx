'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Star, Copy, Check, Coffee, Pizza, PartyPopper, Rocket, HeartHandshake, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const upiId = 'vishwajeetsrk-1@okhdfcbank';

const amounts = [
  { icon: Coffee, label: 'Small Gift', amount: '₹20', desc: 'Helps us pay for 5 AI checks' },
  { icon: Pizza, label: 'Big Help', amount: '₹50', desc: 'Helps us keep the site running' },
  { icon: PartyPopper, label: 'Supporter', amount: '₹100', desc: "Helps us make new plans" },
  { icon: Rocket, label: 'Hero Tier', amount: '₹250', desc: 'Become a main helper' },
];

export default function DonatePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto py-10 px-4 text-black min-h-screen font-black uppercase overflow-x-hidden">

      <div className="mt-20 sm:mt-24" />

      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-block px-4 py-1 bg-black text-white font-black text-[9px] shadow-[3px_3px_0px_0px_#2563EB] italic tracking-widest">WHY GIVE?</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-black italic leading-[0.9]">
          HELP <span className="text-blue-600 underline decoration-4 underline-offset-4 not-italic decoration-yellow-400">STUDENTS</span> GROW
        </h1>
        <p className="text-base md:text-xl text-gray-400 font-bold uppercase tracking-tight max-w-2xl mx-auto leading-tight italic">
          If DreamSync helped you, please consider a small gift to keep it free for everyone.
        </p>
      </section>

      {/* Mission Banner */}
      <section className="bg-black text-white border-[6px] border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_#2563EB]">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="shrink-0 p-5 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#FACC15]">
            <Heart className="w-12 h-12 text-red-500" strokeWidth={3} />
          </div>
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic leading-none text-white">OUR MISSION</h2>
            <p className="text-base md:text-lg font-bold leading-snug uppercase tracking-tight text-white/80 italic">
              We are built for students, by students. Gifts help us pay for the AI and servers that power your future.
            </p>
          </div>
        </div>
      </section>

      {/* QR + UPI */}
      <section className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] overflow-hidden">
        <div className="bg-blue-600 text-white p-6 text-center border-b-4 border-black">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">SCAN TO PAY</h2>
          <p className="text-yellow-300 font-black uppercase tracking-widest text-[9px] mt-2">GPay · PhonePe · Paytm · UPI</p>
        </div>

        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-48 h-48 border-4 border-black bg-white flex items-center justify-center p-3 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
              <img
                src="/qr-code.jpeg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DreamSync&cu=INR`)}`;
                }}
                alt={`QR Code`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[9px] font-black text-gray-300 flex items-center gap-2 justify-center uppercase tracking-widest italic">
              <Lock className="w-3 h-3" /> SECURE 100%
            </p>
          </div>

          <div className="flex-1 space-y-8 text-center md:text-left w-full">
            <div className="space-y-4">
              <p className="text-[9px] font-black text-blue-600 tracking-widest uppercase italic">COPY UPI ADDRESS</p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <code className="w-full text-xs sm:text-sm font-black bg-gray-50 text-black border-2 border-black p-4 shadow-[4px_4px_0px_0px_black] break-all leading-none italic">
                  {upiId}
                </code>
                <button
                  onClick={handleCopy}
                  className={`w-full sm:w-auto px-8 py-4 border-2 border-black font-black text-[10px] shadow-[4px_4px_0px_0px_#2563EB] active:shadow-none italic ${copied ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-black'}`}
                >
                  {copied ? 'DONE' : 'COPY'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-black/5">
                {[
                  'Open App', 'Scan QR', 'Click Pay'
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <span className="w-8 h-8 bg-black text-white font-black text-sm flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#2563EB]">{i + 1}</span>
                    <span className="text-[9px] font-black italic">{step}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Amounts */}
      <section className="space-y-10">
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-black inline-block uppercase italic tracking-tighter border-b-4 border-black pb-2">GIFT TIERS</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {amounts.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white border-4 border-black p-8 text-center relative w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_#2563EB] transition-all"
              onClick={() => handleCopy()}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-black text-yellow-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#2563EB]">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black mt-4 text-black italic leading-none">{item.amount}</div>
              <p className="font-black text-blue-600 mt-2 uppercase tracking-widest text-[9px] italic">{item.label}</p>
              <p className="text-gray-400 font-bold text-[8px] mt-4 uppercase tracking-tight leading-tight italic">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-6 bg-black text-white border-[8px] border-black shadow-[16px_16px_0px_0px_#FACC15] space-y-10 font-bold">
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">THANK YOU</h2>
        <p className="text-base md:text-xl text-white/50 font-bold uppercase tracking-tight max-w-xl mx-auto italic leading-tight">
          Every gift keeps our tools free for students across India. We appreciate your help!
        </p>
        <Link href="/dashboard" className="inline-block px-12 py-5 bg-white text-black font-black text-[11px] border-2 border-black shadow-[6px_6px_0px_0px_#2563EB] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest italic">
          Back to Dashboard →
        </Link>
      </section>

    </div>
  );
}
