'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Briefcase, CheckCircle, FileText, HeartHandshake, Sparkles, Coffee, Map, TrendingUp, Building2, User, Globe, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function Home() {
  const { user, userData } = useAuth();

  const features = [
    { title: 'Best Career Finder', desc: 'Find the heart of your career. Discover what you love and what pays well with AI coaching.', icon: Brain, href: "/ikigai" },
    { title: 'AI Job Guide', desc: 'Get step-by-step career path, local salary info, and real job links from India.', icon: Briefcase, href: "/career-agent" },
    { title: 'Easy Resume Builder', desc: 'Create professional resumes that help you get noticed by big companies and hiring managers.', icon: FileText, href: "/resume-builder" },
    { title: 'Resume Score Check', desc: 'Upload your resume and get an instant score. See exactly how to fix it for jobs.', icon: CheckCircle, href: "/ats-check" },
    { title: 'LinkedIn Helper', desc: 'Get ready-to-use headlines and profile summaries to make your LinkedIn look professional.', icon: Zap, href: "/linkedin" },
    { title: 'Auto Portfolio', desc: 'Create your own beautiful website showing your work in just a few clicks.', icon: Sparkles, href: "/portfolio" },
    { title: 'AI Roadmap', desc: 'Get a personalized 90-day plan to reach your dream job, step by step.', icon: Map, href: "/roadmap" },
    { title: 'Free Resources', desc: 'Access free learning guides, videos, and important government forms for your career.', icon: BookOpen, href: "/documents" },
    { title: 'Mental Health AI', desc: 'Talk to Serenity—your friendly AI for stress, confidence, and feeling good.', icon: HeartHandshake, href: "/mental-health" },
  ];

  return (
    <div className="flex flex-col bg-[#F3F4F6] selection:bg-[#FACC15]/40 min-h-screen">
      
      {/* 🚀 CLICKABLE MARQUEE TICKER (Exclusive to Home) */}
      <div className="marquee-neo mt-[88px] overflow-hidden border-b-4 border-black">
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 font-black text-xs uppercase tracking-[0.3em] items-center py-4"
        >
          <Link href="/career-agent" className="flex items-center gap-3 hover:text-[#2563EB] transition-colors">
            <TrendingUp className="w-5 h-5 text-[#2563EB]" /> AI CAREER AGENT LIVE WITH 2026 INSIGHTS
          </Link>
          <Link href="/ikigai" className="flex items-center gap-3 hover:text-[#7C3AED] transition-colors">
            <Brain className="w-5 h-5 text-[#FACC15] fill-current" /> PREMIUM "IKIGAI" CAREER FINDER NOW ACTIVE
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
            <FileText className="w-5 h-5 text-emerald-400" /> AI RESUME BUILDER: 100% FREE FOR STUDENTS
          </Link>
          
          {/* Duplicate loop */}
          <Link href="/career-agent" className="flex items-center gap-3 hover:text-[#2563EB] transition-colors">
            <TrendingUp className="w-5 h-5 text-[#2563EB]" /> AI CAREER AGENT LIVE WITH 2026 INSIGHTS
          </Link>
          <Link href="/ikigai" className="flex items-center gap-3 hover:text-[#7C3AED] transition-colors">
            <Brain className="w-5 h-5 text-[#FACC15] fill-current" /> PREMIUM "IKIGAI" CAREER FINDER NOW ACTIVE
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
            <FileText className="w-5 h-5 text-emerald-400" /> AI RESUME BUILDER: 100% FREE FOR STUDENTS
          </Link>
        </motion.div>
      </div>

      {/* 🔮 HERO SECTION */}
      <section className="relative text-center space-y-12 py-20 max-w-7xl mx-auto px-6">
        
        {/* User Greeting (if logged in) */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <p className="font-black text-xs uppercase tracking-[0.3em]">Welcome Back, {userData?.name?.split(' ')[0] || 'User'}!</p>
            <div className="px-4 py-1 bg-[#FACC15] border-2 border-black text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               ⚡ AI-Powered Career Growth
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-none text-black uppercase">
             Your Dream Career, <br /> 
             <span className="text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,1)] md:drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">Synced Perfectly.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
             Guidance, resumes, ATS checks, and custom roadmaps—all powered by AI. Designed explicitly for Indian students.
          </p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <Link href="/signup" className="bg-[#2563EB] text-white border-4 border-black px-12 py-5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
             Get Started For Free →
          </Link>
          <Link href="/about" className="bg-white text-black border-4 border-black px-12 py-5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
             See How It Works
          </Link>
        </div>
      </section>

      {/* 🧪 EVERYTHING YOU NEED SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-20">
         <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter underline decoration-8 decoration-[#FACC15] underline-offset-8">Everything You Need</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((tool, i) => (
              <Link href={tool.href} key={i}>
                <motion.div 
                  className="bg-white border-4 border-black p-8 h-full flex flex-col items-start gap-6 group hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden cursor-pointer"
                  whileHover={{ y: -4 }}
                  whileTap={{ 
                    scale: 0.98,
                    backgroundColor: ["#ffffff", "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#818cf8", "#c084fc", "#ffffff"],
                    transition: { duration: 0.8, times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1], repeat: 0 }
                  }}
                >
                   <div className="p-3 border-2 border-black bg-white group-hover:bg-[#FACC15] transition-colors">
                      <tool.icon className="w-6 h-6" strokeWidth={3} />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-xl font-black tracking-tight uppercase leading-tight">{tool.title}</h3>
                      <p className="text-gray-500 font-bold text-xs leading-relaxed uppercase">{tool.desc}</p>
                   </div>
                </motion.div>
              </Link>
            ))}
         </div>
      </section>

    </div>
  );
}
