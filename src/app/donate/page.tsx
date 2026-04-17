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

const whyItems = [
  { title: 'AI API Overhead', desc: 'Every detailed audit and strategy generated utilizes advanced AI credits. Your contribution ensures global access.', icon: Zap, color: 'bg-blue-50' },
  { title: 'Scalable Nodes', desc: 'High-availability infrastructure on Vercel and Supabase ensures 100% uptime for students worldwide.', icon: Shield, color: 'bg-teal-50' },
  { title: 'Advanced R&D', desc: 'Developing automated job procurement and industry-aligned skill mapping requires continuous research assets.', icon: Star, color: 'bg-slate-50' },
];

export default function DonatePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-16 max-w-5xl mx-auto py-8 text-white min-h-screen">

      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white italic">
          Empower <span className="text-blue-500 underline decoration-8 underline-offset-4 not-italic">Collective</span> Growth
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-bold uppercase tracking-tight max-w-3xl mx-auto">
          DreamSync remains accessible for all. If our platform facilitates your trajectory, consider a contribution to help us maintain this student-led infrastructure.
        </p>
      </section>

      {/* Mission Banner */}
      <section className="bg-white text-black border-4 border-white p-8 md:p-12 shadow-[12px_12px_0px_0px_#2563EB] transform rotate-1">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 p-6 bg-black border-4 border-white rounded-full">
            <Heart className="w-16 h-16 text-blue-500" />
          </div>
          <div>
            <h2 className="text-4xl font-black mb-4 uppercase italic">MISSION INTEGRITY</h2>
            <p className="text-lg font-bold leading-tight uppercase tracking-tight">
              We operate without commercial subscriptions or venture funding. DreamSync is sustained by collective student interest and strategic contributions that fund the AI intelligence powering your growth.
            </p>
          </div>
        </div>
      </section>

      {/* QR + UPI */}
      <section className="bg-black border-4 border-white neo-box overflow-hidden shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="bg-blue-600 text-white p-6 text-center border-b-4 border-white">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Unified Gateway</h2>
          <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mt-1">GPay · PhonePe · Paytm · BHIM · UPI</p>
        </div>

        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-52 h-52 border-4 border-white bg-white flex items-center justify-center p-2">
              <img
                src="/qr-code.jpeg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DreamSync&cu=INR`)}`;
                }}
                alt={`UPI QR Code`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] font-black text-gray-500 flex items-center gap-1 justify-center uppercase tracking-widest">
              <Lock className="w-3 h-3 text-blue-500" /> SECURE TRANSMISSION
            </p>
          </div>

          {/* UPI Details */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-3">Copy UPI Identifier</p>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <code className="text-xl font-black bg-white text-black border-4 border-white px-4 py-3 block">
                  {upiId}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-3 border-4 border-white font-black text-xs transition-all uppercase italic tracking-widest ${copied ? 'bg-blue-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                >
                  {copied ? <><Check className="w-4 h-4" /> COPIED</> : <><Copy className="w-4 h-4" /> COPY ID</>}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-black text-xs uppercase tracking-widest text-blue-500">How to contribute:</p>
              <ol className="space-y-3">
                {[
                  'Open your preferred UPI app', 
                  'Scan QR or enter UPI ID above', 
                  <span key="step3" className="flex items-center gap-1 uppercase">Complete transfer and sync knowledge <Sparkles className="w-4 h-4 text-blue-500" /></span>
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase italic">
                    <span className="w-8 h-8 bg-white text-black font-black text-xs flex items-center justify-center shrink-0 border-2 border-white">{i + 1}</span>
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
        <h2 className="text-3xl font-black text-center border-b-4 border-gray-800 pb-4 inline-block mx-auto flex justify-center uppercase italic tracking-tighter">
          Support Tiers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amounts.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, boxShadow: "8px 8px 0px 0px #2563EB" }}
              className="bg-black border-4 border-white p-8 text-center relative w-full transition-all group"
              onClick={() => handleCopy()}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white text-black border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black mt-4 text-white">{item.amount}</div>
              <p className="font-black text-blue-500 mt-1 uppercase tracking-widest text-[10px]">{item.label}</p>
              <p className="text-gray-500 font-black text-[9px] mt-2 uppercase tracking-tight leading-tight">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 space-y-8 bg-black border-t-8 border-gray-900">
        <div className="flex justify-center">
          <HeartHandshake className="w-20 h-20 text-blue-500" />
        </div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">COLLECTIVE GRATITUDE</h2>
        <p className="text-lg text-gray-400 font-bold uppercase tracking-tight max-w-2xl mx-auto px-4">
          Every contribution keeps our AI nodes active and helps students across Bharat access premium career intelligence for free.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-12 py-5 bg-white text-black font-black text-sm border-4 border-white shadow-[8px_8px_0px_0px_#2563EB] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-widest italic"
        >
          Back to Dashboard →
        </Link>
      </section>

    </div>
  );
}
