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
    { title: 'Find Your Path', desc: 'Discover what you love and find jobs that pay well with our simple AI coach.', icon: Brain, href: "/ikigai" },
    { title: 'Career Assistant', desc: 'Get a step-by-step plan for your career with local salary info and real job links.', icon: Briefcase, href: "/career-agent" },
    { title: 'Make Your Resume', desc: 'Create a professional resume that helps you get noticed by big companies easily.', icon: FileText, href: "/resume-builder" },
    { title: 'Check Resume Score', desc: 'Upload your resume and see your score. We show you exactly how to make it better.', icon: CheckCircle, href: "/ats-check" },
    { title: 'LinkedIn Help', desc: 'Get ready-to-use headlines and summaries to make your profile look professional.', icon: Zap, href: "/linkedin" },
    { title: 'Make Your Website', desc: 'Create your own beautiful website showing your work in just a few clicks.', icon: Sparkles, href: "/portfolio" },
    { title: '90 Day Plan', desc: 'Get a personalized 90-day plan to reach your dream job, one step at a time.', icon: Map, href: "/roadmap" },
    { title: 'Guides & Papers', desc: 'Access free learning guides, videos, and important forms for your career.', icon: BookOpen, href: "/documents" },
    { title: 'Mental Health Friend', desc: 'Talk to Serenity—your friendly AI for stress, confidence, and feeling happy.', icon: HeartHandshake, href: "/mental-health" },
  ];

  return (
    <div className="flex flex-col bg-white selection:bg-blue-600/20 min-h-screen">

      <div className="marquee-neo mt-[88px] overflow-hidden border-b-8 border-black w-full bg-black text-white">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 font-black text-xs uppercase tracking-[0.3em] items-center py-5"
        >
          <Link href="/career-agent" className="flex items-center gap-3 hover:text-blue-400 transition-colors">
            <TrendingUp className="w-5 h-5 text-blue-400" /> CAREER ASSISTANT IS NOW LIVE
          </Link>
          <Link href="/ikigai" className="flex items-center gap-3 hover:text-yellow-400 transition-colors">
            <Brain className="w-5 h-5 text-yellow-400 fill-current" /> FIND THE PERFECT JOB FOR YOU
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-3 hover:text-green-400 transition-colors">
            <FileText className="w-5 h-5 text-green-400" /> FREE RESUME BUILDER FOR STUDENTS
          </Link>

          <Link href="/career-agent" className="flex items-center gap-3 hover:text-blue-400 transition-colors">
            <TrendingUp className="w-5 h-5 text-blue-400" /> CAREER ASSISTANT IS NOW LIVE
          </Link>
          <Link href="/ikigai" className="flex items-center gap-3 hover:text-yellow-400 transition-colors">
            <Brain className="w-5 h-5 text-yellow-400 fill-current" /> FIND THE PERFECT JOB FOR YOU
          </Link>
          <Link href="/resume-builder" className="flex items-center gap-3 hover:text-green-400 transition-colors">
            <FileText className="w-5 h-5 text-green-400" /> FREE RESUME BUILDER FOR STUDENTS
          </Link>
        </motion.div>
      </div>

      <section className="relative text-center space-y-12 py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-4"
          >
            <p className="font-bold text-[10px] uppercase tracking-[0.3em] text-gray-500 text-center">Welcome Back, {userData?.name?.split(' ')[0] || 'User'}!</p>
            <div className="px-5 py-2 bg-teal-500 border-4 border-black text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              ⚡ START YOUR JOURNEY
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] text-black uppercase italic">
            Build Your <br />
            <span className="text-blue-600 not-italic decoration-8 decoration-[#FACC15] underline underline-offset-8">Future Path.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 font-bold max-w-2xl mx-auto leading-relaxed uppercase tracking-tight">
            Free AI tools to build your resume, find your career, and plan your life—all in one simple place.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 px-4">
          <Link href="/signup" className="w-full sm:w-auto bg-blue-600 text-white border-4 border-black px-12 py-6 font-black text-sm uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            Start Now →
          </Link>
          <Link href="/about" className="w-full sm:w-auto bg-white text-black border-4 border-black px-12 py-6 font-black text-sm uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            Why Join Us?
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { val: '10+', label: 'Project Helpers', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { val: '50+', label: 'Study Guides', icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
            { val: '6+', label: 'Mentor Sessions', icon: MonitorPlay, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { val: '500+', label: 'Happy Students', icon: Network, color: 'text-black', bg: 'bg-gray-100' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white border-4 border-black p-10 flex flex-col items-center text-center gap-6 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all relative group overflow-hidden"
            >
              <div className={`p-5 ${stat.bg} border-4 border-black group-hover:rotate-[15deg] transition-transform relative z-10`}>
                <motion.div
                  animate={
                    i === 0 ? { y: [0, -8, 0] } :
                      i === 1 ? { scale: [1, 1.2, 1] } :
                        i === 2 ? { scaleY: [1, 0.8, 1] } :
                          { scale: [1, 1.1, 1], rotate: [0, 10, 0] }
                  }
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} stroke-[3px]`} />
                </motion.div>
              </div>

              <div className="space-y-2 relative z-10">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic text-black">
                  <StatCounter value={stat.val} />
                </h2>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 leading-tight">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-20">
        <div className="text-center group">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter italic border-b-8 border-black pb-4 inline-block mx-auto text-black">What We Offer</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((tool, i) => (
            <Link href={tool.href} key={i}>
              <motion.div
                className="bg-white border-4 border-black p-8 md:p-12 h-full flex flex-col items-center text-center gap-8 group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden cursor-pointer w-full"
                whileHover={{ y: -8 }}
              >
                <div className="p-5 border-4 border-black bg-white group-hover:bg-[#FACC15] transition-colors shadow-[6px_6px_0px_0px_black] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1">
                  <tool.icon className="w-10 h-10" strokeWidth={3} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black tracking-tight uppercase leading-none italic text-black">{tool.title}</h3>
                  <p className="text-gray-500 font-bold text-sm leading-relaxed uppercase tracking-tight">{tool.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
