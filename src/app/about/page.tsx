'use client';

import { motion } from 'framer-motion';
import { Target, Heart, Zap, Globe, TrendingUp, Briefcase, FileText, HeartHandshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="flex flex-col bg-[#F3F4F6] selection:bg-[#FACC15]/40 min-h-screen">
      
      {/* Black Marquee Ticker (Consistency) */}
      <div className="marquee-neo mt-[88px]">
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 font-black text-xs uppercase tracking-[0.3em] items-center"
        >
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[#2563EB]" /> CORE MISSION: ACCESSIBILITY THROUGH AI</div>
          <div className="flex items-center gap-3"><Link href="/career-agent" className="flex items-center gap-3 hover:text-[#2563EB] transition-colors"><Briefcase className="w-5 h-5 text-[#FACC15]" /> ADVANCED CAREER ENGINEERING</Link></div>
          <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-emerald-400" /> 100% FREE FOR STUDENTS</div>
          <div className="flex items-center gap-3"><HeartHandshake className="w-5 h-5 text-rose-400" /> COMMUNITY-DRIVEN GROWTH</div>
          
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[#2563EB]" /> CORE MISSION: ACCESSIBILITY THROUGH AI</div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
        {/* Hero */}
        <section className="text-center space-y-10 group">
          <div className="inline-block px-8 py-2 border-4 border-black bg-white text-black font-black text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-[0.4em]">
             Our Platform
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase text-black">
            About <br /> <span className="italic"><span className="text-[#2563EB]">Dream</span>Sync</span>
          </h1>
          <p className="text-xl md:text-3xl text-gray-400 font-black max-w-3xl mx-auto leading-relaxed uppercase border-t-4 border-black pt-10">
            We are a community-driven initiative dedicated to leveling the playing field for Indian students entering the global workforce.
          </p>
        </section>

        {/* Mission Card (Audit Recap State) */}
        <section className="bg-white border-8 border-black p-12 md:p-20 neo-box relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FACC15]/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="shrink-0 p-8 bg-black text-white shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] group-hover:bg-[#2563EB] transition-colors">
              <Target className="w-20 h-20" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-black uppercase tracking-tight">Our Mission</h2>
              <p className="text-xl font-bold leading-relaxed text-gray-500 uppercase">
                To provide every student with AI-powered tools, clear professional roadmaps, and elite career intelligence needed to succeed—regardless of their background or network.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values Matrix */}
        <section className="space-y-20">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-black uppercase tracking-[0.4em] text-black">Core Structural Values</h2>
             <div className="h-2 flex-grow mx-8 bg-black/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Accessibility", desc: "Top-tier career guidance should be affordable and accessible to every student in the network.", icon: Globe, color: "bg-blue-100 text-blue-700" },
              { title: "AI-Driven", desc: "We leverage synthetic intelligence to provide personalized, high-precision career feedback.", icon: Zap, color: "bg-yellow-100 text-yellow-700" },
              { title: "Community First", desc: "Built by care-experienced individuals for the next generation of Indian professionals.", icon: Heart, color: "bg-pink-100 text-pink-700" },
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neo-box p-12 bg-white flex flex-col items-center text-center space-y-8 group hover:bg-black hover:text-white transition-all"
              >
                <div className={`p-6 border-4 border-black ${value.color} group-hover:bg-white group-hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors`}>
                  <value.icon className="w-10 h-10" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{value.title}</h3>
                <p className="font-bold text-gray-400 group-hover:text-gray-300 leading-relaxed uppercase text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Restored CTA Section (Audit Recap State) */}
        <section className="pb-40">
          <div className="neo-box p-20 bg-white text-center space-y-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#2563EB]" />
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-tight">Ready to sync your dreams?</h2>
             <p className="text-xl text-gray-400 font-bold max-w-2xl mx-auto uppercase">Initialize your professional trajectory with our intelligent career toolkit today.</p>
             <Link href="/dashboard" className="neo-btn-primary inline-flex px-16 py-6 text-xl items-center gap-4">
               Join the Platform Today <ArrowRight className="w-6 h-6" />
             </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
