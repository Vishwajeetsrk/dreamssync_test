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
    { title: 'Find Your Path', desc: 'Find naturally what you love and what jobs pay well with AI.', icon: Brain, href: "/ikigai" },
    { title: 'Career Guide', desc: 'Get a simple path to your dream job with local salary info.', icon: Briefcase, href: "/career-agent" },
    { title: 'Make Resume', desc: 'Build a pro resume that gets you noticed fast.', icon: FileText, href: "/resume-builder" },
    { title: 'Check Score', desc: 'Upload your resume and see how to make it better instantly.', icon: CheckCircle, href: "/ats-check" },
    { title: 'LinkedIn Help', desc: 'Get pro headlines and summaries for your profile.', icon: Zap, href: "/linkedin" },
    { title: 'Build Website', desc: 'Make your own website to show your work in few clicks.', icon: Sparkles, href: "/portfolio" },
    { title: '90 Day Plan', desc: 'A step-by-step plan to reach your goal in 3 months.', icon: Map, href: "/roadmap" },
    { title: 'Free Guides', desc: 'Free guides and videos to help you study and grow.', icon: BookOpen, href: "/documents" },
    { title: 'Mental Health AI', desc: 'Talk to your AI friend about stress and confidence.', icon: HeartHandshake, href: "/mental-health" },
  ];

  return (
    <div className="flex flex-col bg-white selection:bg-blue-600/20 min-h-screen">

      <div className="marquee-neo mt-[72px] overflow-hidden border-b-4 border-black w-full bg-black text-white">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 font-black text-[10px] uppercase tracking-widest items-center py-3"
        >
          <Link href="/career-agent" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
            <TrendingUp className="w-4 h-4 text-blue-400" /> CAREER ASSISTANT LIVE
          </Link>
          <Link href="/ikigai" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Brain className="w-4 h-4 text-yellow-400 fill-current" /> FIND YOUR DREAM JOB
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-2 hover:text-green-400 transition-colors">
            <FileText className="w-4 h-4 text-green-400" /> FREE RESUME BUILDER
          </Link>
          {/* Duplicate loop */}
          <Link href="/career-agent" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
            <TrendingUp className="w-4 h-4 text-blue-400" /> CAREER ASSISTANT LIVE
          </Link>
          <Link href="/ikigai" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
            <Brain className="w-4 h-4 text-yellow-400 fill-current" /> FIND YOUR DREAM JOB
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-2 hover:text-green-400 transition-colors">
            <FileText className="w-4 h-4 text-green-400" /> FREE RESUME BUILDER
          </Link>
        </motion.div>
      </div>

      <section className="relative text-center space-y-8 py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 mb-2"
          >
            <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-gray-400">Welcome Back, {userData?.name?.split(' ')[0] || 'User'}!</p>
            <div className="px-4 py-1.5 bg-teal-500 border-2 border-black text-white text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_black]">
              ⚡ START YOUR JOURNEY
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-black uppercase italic">
            Build Your <br />
            <span className="text-blue-600 not-italic decoration-4 decoration-yellow-400 underline underline-offset-4">Future Path.</span>
          </h1>

          <p className="text-base md:text-lg text-gray-500 font-bold max-w-xl mx-auto leading-snug uppercase tracking-tight italic">
            Free AI tools for your resume, career, and life. Simple and 100% free for students.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 pt-4">
          <Link href="/signup" className="w-full sm:w-auto bg-blue-600 text-white border-2 border-black px-10 py-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all">
            Start Now →
          </Link>
          <Link href="/about" className="w-full sm:w-auto bg-white text-black border-2 border-black px-10 py-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all">
            Why Join?
          </Link>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { val: '10+', label: 'Projects', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { val: '50+', label: 'Guides', icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
            { val: '6+', label: 'Mentors', icon: MonitorPlay, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { val: '500+', label: 'Students', icon: Network, color: 'text-black', bg: 'bg-gray-100' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-black p-6 md:p-8 flex flex-col items-center text-center gap-4 hover:shadow-[6px_6px_0px_0px_black] transition-all relative group overflow-hidden shadow-[4px_4px_0px_0px_black]"
            >
              <div className={`p-3 ${stat.bg} border-2 border-black group-hover:rotate-12 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color} stroke-[2.5px]`} />
              </div>

              <div className="space-y-1">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic text-black leading-none">
                  <StatCounter value={stat.val} />
                </h2>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic border-b-4 border-black pb-2 inline-block mx-auto text-black">What We Offer</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((tool, i) => (
            <Link href={tool.href} key={i}>
              <motion.div
                className="bg-white border-2 border-black p-6 md:p-8 h-full flex flex-col items-center text-center gap-6 group hover:shadow-[8px_8px_0px_0px_black] transition-all relative overflow-hidden cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="p-3 border-2 border-black bg-white group-hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_black] group-hover:shadow-none group-hover:translate-x-0.5 group-hover:translate-y-0.5">
                  <tool.icon className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tight uppercase leading-none italic text-black">{tool.title}</h3>
                  <p className="text-gray-400 font-bold text-[10px] leading-snug uppercase tracking-tight">{tool.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
