'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Briefcase, CheckCircle, FileText, HeartHandshake, Sparkles, Coffee, Map, TrendingUp, Building2, User, Globe, ShieldCheck, Zap, MapPin, ClipboardCheck, MonitorPlay, Network } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useMotionValue, useTransform, animate, useInView } from 'framer-motion';

const StatCounter = ({ value }: { value: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) {
      const num = parseInt(value);
      const suffix = value.replace(/[0-9]/g, '');
      const controls = animate(0, num, {
        duration: 2,
        onUpdate: (latest) => setDisplay(Math.floor(latest) + suffix)
      });
      return () => controls.stop();
    }
  }, [value, isInView]);

  return <span ref={ref}>{display}</span>;
};

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
    { title: 'Govt Docs & Free Resources', desc: 'Access free learning guides, videos, and important government forms for your career.', icon: BookOpen, href: "/documents" },
    { title: 'Mental Health AI', desc: 'Talk to Serenity—your friendly AI for stress, confidence, and feeling good.', icon: HeartHandshake, href: "/mental-health" },
  ];

  return (
    <div className="flex flex-col bg-slate-50 selection:bg-blue-600/20 min-h-screen">

      {/* 🚀 CLICKABLE MARQUEE TICKER (Exclusive to Home) */}
      <div className="marquee-neo mt-[88px] overflow-hidden border-b-4 border-black w-full">
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
            <p className="font-bold text-xs uppercase tracking-[0.3em] text-slate-500">Welcome Back, {userData?.name?.split(' ')[0] || 'User'}!</p>
            <div className="px-4 py-1 bg-teal-500 border-2 border-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#0F172A]">
              ⚡ EMPOWERING YOUR FUTURE
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-slate-900 uppercase">
            Empowering Youth,<br />
            <span className="text-blue-600">Shaping Futures.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed uppercase">
            Professional AI guidance, high-impact resumes, and verified roadmaps—built as a non-profit initiative for students across India.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 px-4">
          <Link href="/signup" className="w-full sm:w-auto bg-blue-600 text-white border-[3px] border-slate-900 px-12 py-5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_#0F172A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Join Our Platform →
          </Link>
          <Link href="/about" className="w-full sm:w-auto bg-white text-slate-900 border-[3px] border-slate-900 px-12 py-5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_#0F172A] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Learn Our Mission
          </Link>
        </div>
      </section>

      {/* 📊 IMPACT STATS SECTION */}
      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { val: '1+', label: 'Strategic Partners', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { val: '50+', label: 'Verified Resources', icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
            { val: '6+', label: 'Mentorship Slots', icon: MonitorPlay, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { val: '3+', label: 'Student Enrolled', icon: Network, color: 'text-slate-600', bg: 'bg-slate-100' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="bg-white border-4 border-black p-6 md:p-10 neo-box flex flex-col items-center text-center gap-6 hover:translate-y-[-8px] transition-all relative group overflow-hidden"
            >
              {/* Visual Background Decoration */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform`} />

              <div className={`p-5 ${stat.bg} border-4 border-black group-hover:rotate-[15deg] transition-transform relative z-10 overflow-hidden`}>
                <motion.div
                  animate={
                    i === 0 ? { y: [0, -8, 0] } :
                      i === 1 ? { scale: [1, 1.2, 1] } :
                        i === 2 ? { scaleY: [1, 0.8, 1] } :
                          { scale: [1, 1.1, 1], rotate: [0, 10, 0] }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut"
                  }}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} stroke-[3px]`} />
                </motion.div>
              </div>

              <div className="space-y-2 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic">
                  <StatCounter value={stat.val} />
                </h2>
                <p className="text-[10px] md:text-sm font-black uppercase tracking-widest text-gray-500 leading-tight">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🧪 EVERYTHING YOU NEED SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-20">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter underline decoration-[10px] decoration-teal-500 underline-offset-[12px]">Our Core Opportunities</h2>
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
