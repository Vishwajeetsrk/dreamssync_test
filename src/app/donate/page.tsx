'use client';

import { motion } from 'framer-motion';
import { Heart, Zap, Shield, Star, Copy, Check, Coffee, Pizza, PartyPopper, Rocket, HeartHandshake, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const upiId = 'vishwajeetsrk-1@okhdfcbank';

const amounts = [
  { icon: Coffee, label: 'Standard Audit', amount: '₹20', desc: 'Sponsor 5 detailed AI audits' },
  { icon: Pizza, label: 'Platform Fuel', amount: '₹50', desc: 'Support cloud infrastructure costs' },
  { icon: PartyPopper, label: 'Path Finder', amount: '₹100', desc: "Empower roadmap generation" },
  { icon: Rocket, label: 'Legacy Tier', amount: '₹250', desc: 'Hall of fame contribution' },
];

export default function DonatePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto py-8 text-black min-h-screen font-black uppercase">

      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black italic">
          Empower <span className="text-blue-600 underline decoration-8 underline-offset-4 not-italic decoration-[#FACC15]">Collective</span> Growth
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-bold uppercase tracking-tight max-w-3xl mx-auto">
          DreamSync remains accessible for all. If our platform facilitates your trajectory, consider a contribution to help us maintain this student-led infrastructure.
        </p>
      </section>

      {/* Mission Banner */}
      <section className="bg-white text-black border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_#2563EB] transform md:rotate-1">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 p-6 bg-black border-4 border-black rounded-full shadow-[4px_4px_0px_0px_#FACC15]">
            <Heart className="w-16 h-16 text-blue-500" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-4xl font-black mb-4 uppercase italic leading-none">MISSION INTEGRITY</h2>
            <p className="text-lg font-bold leading-tight uppercase tracking-tight text-gray-600">
              We operate without commercial subscriptions or venture funding. DreamSync is sustained by collective student interest and strategic contributions that fund the AI intelligence powering your growth.
            </p>
          </div>
        </div>
      </section>

      {/* QR + UPI */}
      <section className="bg-white border-8 border-black overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-black text-white p-6 text-center border-b-8 border-black">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Unified Gateway</h2>
          <p className="text-[#FACC15] font-black uppercase tracking-widest text-[10px] mt-1">GPay · PhonePe · Paytm · BHIM · UPI</p>
        </div>

        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-52 h-52 border-4 border-black bg-white flex items-center justify-center p-2 shadow-[8px_8px_0px_0px_rgba(37,99,235,0.1)]">
              <img
                src="/qr-code.jpeg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DreamSync&cu=INR`)}`;
                }}
                alt={`UPI QR Code`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] font-black text-gray-500 flex items-center gap-1 justify-center uppercase tracking-widest leading-none">
              <Lock className="w-3 h-3 text-blue-500" /> SECURE TRANSMISSION
            </p>
          </div>

          {/* UPI Details */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-4">Copy UPI Identifier</p>
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                <code className="text-xl font-black bg-slate-50 text-black border-4 border-black px-6 py-4 block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {upiId}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-3 px-6 py-4 border-4 border-black font-black text-[10px] transition-all uppercase italic tracking-widest shadow-[4px_4px_0px_0px_#2563EB] active:shadow-none active:translate-x-1 active:translate-y-1 ${copied ? 'bg-blue-600 text-white' : 'bg-[#FACC15] text-black hover:bg-black hover:text-white transition-colors'}`}
                >
                  {copied ? <><Check className="w-4 h-4" /> COPIED</> : <><Copy className="w-4 h-4" /> COPY ID</>}
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t-4 border-gray-100">
              <p className="font-black text-xs uppercase tracking-widest text-blue-600">HOW TO CONTRIBUTE:</p>
              <ol className="space-y-4">
                {[
                  'Open your preferred UPI app', 
                  'Scan QR or enter UPI ID above', 
                  <span key="step3" className="flex items-center gap-1 uppercase">Complete transfer and sync knowledge <Sparkles className="w-4 h-4 text-blue-600" /></span>
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold uppercase italic border-2 border-transparent p-2">
                    <span className="w-10 h-10 bg-black text-white font-black text-xs flex items-center justify-center shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_#2563EB]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Amounts */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black text-center border-b-8 border-black pb-4 inline-block mx-auto flex justify-center uppercase italic tracking-tighter">
          SUPPORT TIERS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {amounts.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -4, shadow: "12px 12px 0px 0px #2563EB" }}
              className="bg-white border-8 border-black p-8 text-center relative w-full transition-all group shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]"
              onClick={() => handleCopy()}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-black text-[#FACC15] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#2563EB]">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-4xl font-black mt-4 text-black italic leading-none">{item.amount}</div>
              <p className="font-black text-blue-600 mt-2 uppercase tracking-widest text-[10px]">{item.label}</p>
              <p className="text-gray-400 font-black text-[9px] mt-4 uppercase tracking-tight leading-tight">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-24 space-y-12 bg-white border-8 border-black shadow-[16px_16px_0px_0px_#FACC15]">
        <div className="flex justify-center">
           <div className="p-8 bg-black text-[#FACC15] border-4 border-black rotate-12 shadow-[8px_8px_0px_0px_#2563EB]">
             <HeartHandshake className="w-16 h-16" />
           </div>
        </div>
        <div className="space-y-4">
           <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-black leading-none">COLLECTIVE GRATITUDE</h2>
           <p className="text-lg md:text-xl text-gray-500 font-bold uppercase tracking-tight max-w-2xl mx-auto px-4">
             Every contribution keeps our AI nodes active and helps students across Bharat access premium career intelligence for free.
           </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-16 py-6 bg-black text-white font-black text-[12px] border-4 border-black shadow-[10px_10px_0px_0px_#2563EB] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-widest italic"
        >
          Back to Dashboard →
        </Link>
      </section>

    </div>
  );
}
