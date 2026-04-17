'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Brain, Briefcase, CheckCircle, FileText, HeartHandshake, Link2, Sparkles, LayoutDashboard, User, Zap, Globe, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const tools = [
  { name: 'IKIGAI FINDER', href: '/ikigai', icon: Brain, color: 'bg-blue-600 text-white', desc: 'Find your perfect career path based on your passions and skills.' },
  { name: 'RESUME BUILDER', href: '/resume-builder', icon: FileText, color: 'bg-yellow-400 text-black', desc: 'Build a professional, recruiter-ready resume in minutes.' },
  { name: 'ATS CHECK', href: '/ats-check', icon: CheckCircle, color: 'bg-black text-white', desc: 'Check your resume score against industry standards.' },
  { name: 'PORTFOLIO GEN', href: '/portfolio', icon: Sparkles, color: 'bg-blue-50 text-blue-600', desc: 'Create a stunning personal portfolio to showcase your work.' },
  { name: 'AI ROADMAP', href: '/roadmap', icon: Briefcase, color: 'bg-yellow-50 text-yellow-700', desc: 'Get a step-by-step AI roadmap for your career goals.' },
  { name: 'ROADMAPS & DOCS', href: '/documents', icon: BookOpen, color: 'bg-gray-50 text-gray-700', desc: 'Access essential resources and official documents for your career.' },
  { name: 'LINKEDIN OPTIMIZER', href: '/linkedin', icon: Link2, color: 'bg-blue-50 text-blue-600', desc: 'Optimize your LinkedIn profile to attract recruiters.' },
  { name: 'AI CAREER AGENT', href: '/career-agent', icon: Brain, color: 'bg-yellow-50 text-yellow-700', desc: 'Chat with your personal AI assistant for career advice.' },
  { name: 'MENTAL HEALTH AI', href: '/mental-health', icon: HeartHandshake, color: 'bg-black text-white', desc: 'Prioritize your well-being with our supportive AI companion.' },
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
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
         <div className="border-4 border-black bg-white p-10 flex flex-col items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 border-8 border-black border-t-blue-600 animate-spin"></div>
            <span className="font-black uppercase tracking-widest text-black">Loading Dashboard...</span>
         </div>
      </div>
    );
  }

  const userName = userData?.name?.replace(/[._-]/g, ' ').toUpperCase() || user.email?.split('@')[0].replace(/[._-]/g, ' ').toUpperCase() || "DREAMER";

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-12 text-black selection:bg-blue-600/20">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b-[8px] border-black pb-12">
          <div className="space-y-6">
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 cursor-default"
            >
              <div className="p-3 bg-black text-white shadow-[4px_4px_0px_0px_#2563EB]">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Dashboard Hub</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none text-black uppercase italic"
            >
              WELCOME BACK, <br /> <span className="text-blue-600 not-italic">{userName}</span>
            </motion.h1>
          </div>
        </div>

        {/* Intelligence Matrix Grid */}
        <section className="space-y-16">
          <div className="flex items-center justify-between">
              <motion.h2 
                className="text-lg font-black uppercase tracking-[0.3em] text-black cursor-default"
              >
                YOUR TOOLS
              </motion.h2>
              <div className="h-2 flex-grow mx-8 bg-gray-100" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {tools.map((tool, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                transition={{ delay: i * 0.05 }}
                className="relative overflow-hidden group bg-white border-4 border-black transition-all duration-300 flex flex-col h-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Tool Header Bar */}
                <div className={`h-16 border-b-4 border-black ${tool.color} flex items-center px-6 gap-4`}>
                   <tool.icon className="w-6 h-6 stroke-[3px]" />
                   <div className="flex-grow" />
                </div>
                
                <div className="p-8 flex flex-col flex-grow space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tight text-black italic">
                      {tool.name}
                   </h3>
                   <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase">
                      {tool.desc}
                   </p>
                   
                    <div className="mt-auto pt-8">
                      <Link href={tool.href} className="flex items-center justify-between w-full px-5 py-4 bg-white border-4 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group/btn">
                         LAUNCH TOOL <ArrowRight className="w-5 h-5 text-blue-600 group-hover/btn:translate-x-1 transition-transform" />
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
