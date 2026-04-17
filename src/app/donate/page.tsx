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
    <div className="space-y-16 max-w-5xl mx-auto py-8">

      {/* Hero — matches About page */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-slate-900 italic">
          Empower <span className="text-blue-600 underline decoration-8 underline-offset-4 not-italic">Strategic</span> Growth
        </h1>
        <p className="text-lg md:text-2xl text-slate-500 font-semibold uppercase tracking-tight max-w-3xl mx-auto">
          DreamSync remains accessible for all. If our platform facilitates your trajectory, consider a strategic contribution to help us maintain this student-led infrastructure.
        </p>
      </section>

      {/* Mission Banner — matches About mission block */}
      <section className="bg-slate-900 text-white border-4 border-slate-900 p-8 md:p-12 neo-box transform rotate-1 shadow-[12px_12px_0px_0px_#2563EB]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 p-6 bg-white border-4 border-slate-900 rounded-full shadow-[4px_4px_0px_0px_#F1F5F9]">
            <Heart className="w-16 h-16 text-blue-600" />
          </div>
          <div>
            <h2 className="text-4xl font-black mb-4 uppercase italic">MISSION INTEGRITY</h2>
            <p className="text-lg font-bold leading-tight uppercase tracking-tight">
              We operate without commercial subscriptions or venture funding. DreamSync is sustained by collective student interest and strategic contributions that fund the AI intelligence powering your growth.
            </p>
          </div>
        </div>
      </section>

      {/* QR + UPI — main donation card */}
      <section className="bg-white border-4 border-slate-900 neo-box overflow-hidden shadow-[12px_12px_0px_0px_#F1F5F9]">
        <div className="bg-blue-600 text-white p-6 text-center border-b-4 border-slate-900">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Strategic Interface</h2>
          <p className="text-blue-50 font-black uppercase tracking-widest text-[10px] mt-1">Unified UPI Gateway · GPay · PhonePe · Paytm · BHIM</p>
        </div>

        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div className="w-52 h-52 border-4 border-slate-900 bg-white flex items-center justify-center shadow-[6px_6px_0px_0px_#F1F5F9] p-2">
              <img
                src="/qr-code.jpeg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=DreamSync&cu=INR`)}`;
                }}
                alt={`UPI QR Code — ${upiId}`}
                className="w-full h-full object-contain"
                width={220}
                height={220}
              />
            </div>
            <p className="text-[10px] font-black text-slate-400 flex items-center gap-1 justify-center uppercase tracking-widest"><Lock className="w-3 h-3 text-blue-600" /> SECURE GATEWAY TRANSMISSION</p>
          </div>

          {/* UPI Details */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">Manual Identifier Transfer</p>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <code className="text-xl font-black bg-slate-50 border-4 border-slate-900 px-4 py-3 block text-slate-900">
                  {upiId}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-3 border-4 border-slate-900 font-black text-xs transition-all neo-box uppercase italic tracking-widest ${copied ? 'bg-teal-500 text-white' : 'bg-white hover:bg-slate-50'}`}
                >
                  {copied ? <><Check className="w-4 h-4" /> AUTHENTICATED</> : <><Copy className="w-4 h-4" /> COPY ID</>}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-black text-xs uppercase tracking-widest text-blue-600">Protocol Procedures:</p>
              <ol className="space-y-3">
                {[
                  'Open Authorized UPI Application', 
                  'Authenticate QR or Source Identifier', 
                  <span key="step3" className="flex items-center gap-1 uppercase">Finalize Strategic Contribution & Sync <Sparkles className="w-4 h-4 text-blue-600" /></span>
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase italic">
                    <span className="w-7 h-7 bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#2563EB]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Suggested Amounts — matches About core values grid */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black text-center border-b-[8px] border-slate-100 pb-4 inline-block mx-auto flex justify-center uppercase italic tracking-tighter">
          Contribution Tiers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {amounts.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "8px 8px 0px 0px #0F172A" }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-4 border-slate-900 p-8 text-center neo-box relative w-full transition-all group hover:bg-slate-50 shadow-[6px_6px_0px_0px_#F1F5F9]"
              onClick={() => handleCopy()}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-4 border-slate-900 flex items-center justify-center text-slate-900 shadow-[2px_2px_0px_0px_#0F172A] group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black mt-6 text-slate-900">{item.amount}</div>
              <p className="font-black text-blue-600 mt-1 uppercase tracking-widest text-[10px]">{item.label}</p>
              <p className="text-slate-400 font-black text-[9px] mt-1 uppercase tracking-tight leading-none">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Why Donate — matches About core values */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black text-center border-b-[8px] border-slate-100 pb-4 inline-block mx-auto flex justify-center uppercase italic tracking-tighter">
          Strategic Utility
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {whyItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-4 border-slate-900 p-8 text-center neo-box relative shadow-[8px_8px_0px_0px_#F1F5F9]"
            >
              <div className={`absolute -top-6 left-1/2 -translate-x-1/2 p-4 border-4 border-slate-900 rounded-full ${item.color} shadow-[2px_2px_0px_0px_#0F172A]`}>
                <item.icon className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-xl font-black mt-6 mb-2 uppercase italic text-slate-900">{item.title}</h3>
              <p className="text-slate-500 font-bold uppercase text-[11px] leading-tight">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA — matches About CTA */}
      <section className="text-center py-12 space-y-6">
        <div className="flex justify-center text-6xl">
          <HeartHandshake className="w-16 h-16 text-blue-600" />
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">STRATEGIC GRATITUDE</h2>
        <p className="text-base md:text-xl text-slate-500 font-semibold uppercase tracking-tight max-w-xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-1">
          <span>Even without contribution, your utilization of the platform facilitates community expansion.</span>
          <span className="flex items-center gap-2 mt-2 sm:mt-0 tracking-widest text-slate-900">MISSION DRIVEN <Heart className="w-5 h-5 text-red-500 fill-current" /> FOR THE YOUTH.</span>
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-12 py-5 bg-blue-600 text-white font-black text-[12px] border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-widest italic"
        >
          Resume Mission Hub →
        </Link>
      </section>

    </div>
  );
}
