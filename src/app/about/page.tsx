'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import { 
  TrendingUp, Briefcase, FileText, HeartHandshake, 
  Target, Globe, Zap, Heart, ArrowRight, ChevronDown, CheckCircle,
  Building2, ShieldCheck, User,
  MapPin, ClipboardCheck, MonitorPlay, Network
} from 'lucide-react';
import Link from 'next/link';

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

  return <span ref={ref} className="tabular-nums">{display}</span>;
};

// --- COMPONENTS ---

const FlipCard = ({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[300px] w-full perspective-1000 cursor-pointer group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-full w-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white border-4 border-slate-900 neo-box group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] group-hover:shadow-[12px_12px_0px_0px_#2563EB] transition-all">
          <div className="p-4 bg-teal-500 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] mb-6 transition-transform group-hover:scale-110 text-white">
            <Icon className="w-10 h-10" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-center text-slate-900 italic">{title}</h3>
          <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-blue-600">AUDIT PROTOCOL →</p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-slate-900 text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_#2563EB]"
        >
          <div className="p-3 bg-white text-black border-2 border-white mb-6">
            <Icon className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-center leading-relaxed uppercase">
            {desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-4 border-slate-900 bg-white neo-box overflow-hidden shadow-[6px_6px_0px_0px_#F1F5F9]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-lg font-black uppercase tracking-tight text-slate-900">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="p-2 border-2 border-slate-900 bg-blue-600 text-white shadow-[2px_2px_0px_0px_#0F172A]"
        >
          <ChevronDown className="w-5 h-5" strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-4 border-black bg-white"
          >
            <div className="p-6 text-[11px] font-black leading-relaxed uppercase text-slate-400 tracking-wider">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE ---

export default function About() {
  const featureCards = [
    { 
      title: "Resource Audit", 
      desc: "Comprehensive facilitation of identity credentials, government directives, and professional documentation for vocational compliance.",
      icon: FileText
    },
    { 
      title: "Skill Acquisition", 
      desc: "Access a curated intelligence repository featuring streamlined directives, academic assets, and free-tier learning protocols.",
      icon: Zap
    },
    { 
      title: "Strategic Unity", 
      desc: "Foster high-impact professional affiliations within an independent network of vocational peers for career maximization.",
      icon: Heart
    },
    { 
      title: "Career Advancement", 
      desc: "Facilitate growth through authoritative sessions focused on vocational resilience, industry standards, and community success.",
      icon: HeartHandshake
    }
  ];


  const faqs = [
    {
      q: "What is DreamSync?",
      a: "DreamSync is a professional community for students and young builders to connect, share jobs, and grow their careers together."
    },
    {
      q: "What is our main goal?",
      a: "Our goal is simple: to help you build a great career by providing the right tools, roadmaps, and a supportive community."
    },
    {
      q: "Why should I join?",
      a: "Join us if you want free AI career tools, better resumes, and a network of people who support each other's growth."
    },
    {
      q: "Are there any requirements?",
      a: "No special requirements! Just bring a positive attitude, an open mind, and a willingness to help others."
    },
    {
      q: "How do our sessions help?",
      a: "We talk about real things: how to get a job, how to manage stress, and how to build the confidence you need to succeed."
    },
    {
      q: "Which language is used?",
      a: "We use English and Hindi to make sure everyone understands and can participate easily."
    }
  ];

  return (
    <div className="flex flex-col bg-[#F3F4F6] selection:bg-[#FACC15]/40 min-h-screen">
      
      {/* Black Marquee Ticker */}
      <div className="marquee-neo mt-[88px] bg-slate-900 text-white py-2">
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 font-black text-[10px] uppercase tracking-[0.4em] items-center"
        >
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-400" /> STRATEGIC MISSION: EMPOWERING INDEPENDENT YOUTH</div>
          <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-teal-400" /> GLOBAL STANDARDS: BANGALORE & KASHMIR</div>
          <div className="flex items-center gap-3"><HeartHandshake className="w-5 h-5 text-white" /> PROFESSIONAL UNITY CULTURE</div>
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-400" /> MISSION CRITICAL: VOCATIONAL ACCELERATION</div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 space-y-32">
        
        {/* SECTION 1 — HERO ABOUT TITLE */}
        <section className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-8 py-3 border-4 border-slate-900 bg-white text-slate-900 font-black text-[10px] shadow-[6px_6px_0px_0px_#2563EB] uppercase tracking-[0.4em]"
          >
             Strategic Foundation
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-center max-w-5xl mx-auto uppercase text-slate-900 italic">
            Facilitating Independent Growth through 
            <span className="inline-block mx-4 text-blue-600 not-italic decoration-8 decoration-slate-100 underline underline-offset-8">
              Strategic
            </span> 
            Unity.
          </h1>

          {/* SECTION 2 — INTRO TEXT */}
          <div className="max-w-3xl mx-auto space-y-8 pt-10 border-t-8 border-slate-100">
            <p className="text-xl md:text-3xl text-slate-900 font-black leading-relaxed uppercase italic">
              Welcome to 
              <span className="text-blue-600 ml-2 not-italic underline decoration-4 decoration-blue-100 underline-offset-4">Dream</span>Sync, 
              the central intelligence hub.
            </p>
            <p className="text-lg md:text-xl text-slate-400 font-bold leading-relaxed uppercase tracking-tight">
               Participate in an ecosystem designed to connect, audit, and empower the vocational trajectories of independent students.
            </p>
          </div>
        </section>

        {/* SECTION 3 — WHAT DREAMSYNC DOES */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 italic">
              Strategic <span className="text-blue-600 not-italic">Directives</span>.
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">
              EXPLORE OUR MISSION-CRITICAL RESOURCES
            </p>
          </div>

          {/* SECTION 4 — FEATURE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((card, i) => (
              <FlipCard 
                key={i}
                title={card.title}
                desc={card.desc}
                icon={card.icon}
              />
            ))}
          </div>
        </section>


        {/* SECTION 5 — RESTORED IMPACT STATS */}
        <section className="bg-slate-900 border-8 border-slate-900 p-6 sm:p-12 md:p-20 shadow-[12px_12px_0px_0px_#2563EB]">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
             {[
               { value: "1+", label: "Regional Hubs", icon: MapPin, color: 'text-teal-400', anim: { y: [0, -8, 0] } },
               { value: "50+", label: "Audit Assets", icon: ClipboardCheck, color: 'text-blue-400', anim: { scale: [1, 1.2, 1] } },
               { value: "6+", label: "Strategic Sessions", icon: MonitorPlay, color: 'text-white', anim: { scaleY: [1, 0.8, 1] } },
               { value: "30+", label: "Mission Members", icon: Network, color: 'text-teal-400', anim: { scale: [1, 1.1, 1], rotate: [0, 10, 0] } }
             ].map((stat, i) => (
               <div key={i} className="space-y-6 flex flex-col items-center">
                  <div className="p-4 bg-white/5 border-2 border-white/10 rounded-full overflow-hidden">
                     <motion.div
                       animate={stat.anim}
                       transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                     >
                        <stat.icon className={`w-8 h-8 ${stat.color}`} strokeWidth={3} />
                     </motion.div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-5xl md:text-7xl font-black text-white tracking-tighter italic">
                      <StatCounter value={stat.value} />
                    </div>
                    <div className="h-1 w-12 bg-white/10 mx-auto rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-tight">
                      {stat.label}
                    </p>
                  </div>
               </div>
             ))}
           </div>
        </section>

        {/* SECTION 6 — FAQ SECTION */}
        <section className="space-y-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-2 text-center md:text-left">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">Strategic Inquiries</h2>
                <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px]">ESSENTIAL FOUNDATION AUDITS</p>
             </div>
             <div className="h-2 flex-grow hidden md:block bg-slate-100" />
             <div className="p-4 bg-teal-500 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] text-white">
                <HeartHandshake className="w-8 h-8" />
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <FAQItem 
                key={i}
                question={faq.q}
                answer={faq.a}
              />
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="pb-40">
          <div className="neo-box p-8 sm:p-12 md:p-20 bg-white border-4 border-slate-900 text-center space-y-12 relative overflow-hidden group shadow-[12px_12px_0px_0px_#F1F5F9]">
             <div className="absolute top-0 left-0 w-full h-3 bg-blue-600" />
             <div className="absolute bottom-0 right-0 p-8 transform translate-x-12 translate-y-12 opacity-5 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                <Target className="w-64 h-64 text-slate-900" />
             </div>
             
             <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-tight relative z-10 text-slate-900 italic">
                Ready to empower <br /> your vocation?
             </h2>
             <p className="text-lg md:text-xl text-slate-400 font-bold max-w-2xl mx-auto uppercase relative z-10 tracking-tight">
                Join our supportive ecosystem and construct a legacy alongside independent individuals who truly understand your path.
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10">
                <Link href="/signup" className="px-12 py-6 bg-blue-600 text-white border-4 border-slate-900 font-black uppercase text-[12px] tracking-widest shadow-[6px_6px_0px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all italic">
                  Join Community Today <ArrowRight className="ml-2 w-6 h-6 inline" />
                </Link>
                <Link href="/contact" className="px-12 py-6 bg-white text-slate-900 border-4 border-slate-900 font-black uppercase text-[12px] tracking-widest shadow-[6px_6px_0px_0px_#0F172A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all italic">
                   Contact Directives
                </Link>
             </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
