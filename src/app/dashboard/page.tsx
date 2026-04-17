'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Briefcase, CheckCircle, FileText, HeartHandshake, Link2, Sparkles, LayoutDashboard, User, Zap, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const tools = [
  { name: 'STRATEGIC ALIGNMENT', href: '/ikigai', icon: Brain, color: 'bg-blue-600 text-white', desc: 'Discover your vocational purpose through industry-aligned auditing.', premium: true },
  { name: 'RESUME ARCHITECT', href: '/resume-builder', icon: FileText, color: 'bg-teal-500 text-white', desc: 'Construct a professional blueprint tailored for 2026 standards.' },
  { name: 'ATS AUDIT ENGINE', href: '/ats-check', icon: CheckCircle, color: 'bg-slate-900 text-white', desc: 'Scan existing documentation for technical and semantic optimization.' },
  { name: 'PORTFOLIO LEGACY', href: '/portfolio', icon: Sparkles, color: 'bg-blue-50 text-blue-700', desc: 'Establish a high-impact digital presence for career advancement.' },
  { name: 'PROGRESS ROADMAP', href: '/roadmap', icon: Briefcase, color: 'bg-teal-50 text-teal-700', desc: 'Construct a visual timeline of skill acquisition and certification.' },
  { name: 'RESOURCES HUB', href: '/documents', icon: BookOpen, color: 'bg-slate-50 text-slate-700', desc: 'Access comprehensive academic and government career directives.' },
  { name: 'PROFILE OPTIMIZER', href: '/linkedin', icon: Link2, color: 'bg-blue-50 text-blue-600', desc: 'Optimize professional visibility and industry reach via metadata.' },
  { name: 'AI COUNSELOR', href: '/career-agent', icon: Brain, color: 'bg-teal-50 text-teal-700', desc: 'Facilitate growth with real-time strategic guidance and opportunity leads.' },
  { name: 'MENTAL WELLNESS', href: '/mental-health', icon: HeartHandshake, color: 'bg-slate-900 text-white', desc: 'Ensure psychological resilience and focus via therapeutic AI support.' },
];

export default function Dashboard() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-12">
         <div className="neo-box bg-white p-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-8 border-slate-900 border-t-blue-600 animate-spin shadow-[4px_4px_0px_0px_#0F172A]"></div>
            <span className="font-black uppercase tracking-widest text-slate-900">Synchronizing Hub...</span>
         </div>
      </div>
    );
  }

  const userName = userData?.name?.replace(/[._-]/g, ' ').toUpperCase() || user.email?.split('@')[0].replace(/[._-]/g, ' ').toUpperCase() || "DREAMER";

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-12 text-slate-900 selection:bg-blue-600/20">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Dashboard Architecture (Audit Recap State) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b-8 border-black pb-12">
          <div className="space-y-6">
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 cursor-default"
            >
              <div className="p-3 bg-slate-900 text-white shadow-[4px_4px_0px_0px_#2563EB]">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Personal Progress Hub</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-slate-900 uppercase italic"
            >
              MISSION HUB <br /> <span className="text-blue-600 not-italic hover:tracking-tighter transition-all duration-500">{userName}</span>
            </motion.h1>
          </div>
          
          <div />
        </div>

        {/* Intelligence Matrix Grid */}
        <section className="space-y-16">
          <div className="flex items-center justify-between">
              <motion.h2 
                className="text-lg font-black uppercase tracking-[0.3em] text-slate-900 cursor-default"
              >
                CORE OPPORTUNITIES
              </motion.h2>
              <div className="h-2 flex-grow mx-8 bg-slate-200" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {tools.map((tool, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, shadow: "8px 8px 0px 0px #0F172A" }}
                transition={{ delay: i * 0.05 }}
                className="neo-box relative overflow-hidden group bg-white border-[3px] border-slate-900 transition-all duration-300 flex flex-col h-full shadow-[6px_6px_0px_0px_#0F172A]"
              >
                {/* Tool Header Bar (Restored from Image 4) */}
                <div className={`h-16 border-b-[3px] border-slate-900 ${tool.color} flex items-center px-6 gap-4`}>
                   <motion.div whileHover={{ rotate: 10 }}>
                      <tool.icon className="w-6 h-6 stroke-[3px]" />
                   </motion.div>
                   <div className="flex-grow" />
                    {tool.premium && (
                      <span className="text-[8px] font-black bg-teal-500 text-white px-3 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0F172A] uppercase tracking-widest">
                        STUDENT ELITE
                      </span>
                    )}
                </div>
                
                <div className="p-8 flex flex-col flex-grow space-y-4">
                   <h3 className="text-2xl font-black uppercase tracking-tight text-black">
                      {tool.name}
                   </h3>
                   <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase">
                      {tool.desc}
                   </p>
                   
                    <div className="mt-auto pt-8">
                      <Link href={tool.href} className="flex items-center justify-between w-full px-5 py-3 bg-white border-[3px] border-slate-900 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#0F172A] hover:bg-slate-50 hover:translate-x-[2px] hover:translate-y-[2px] transition-all group/btn">
                         ACCESS TOOL <ArrowRight className="w-5 h-5 text-blue-600 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
