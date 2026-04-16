'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Briefcase, FileText, HeartHandshake, 
  Target, Globe, Zap, Heart, ArrowRight, ChevronDown, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';

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
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white border-4 border-black neo-box group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="p-4 bg-[#FACC15] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 transition-transform group-hover:scale-110">
            <Icon className="w-10 h-10" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-center">{title}</h3>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#2563EB]">Hover to reveal →</p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]"
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
    <div className="border-4 border-black bg-white neo-box overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-black uppercase tracking-tight">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="p-2 border-2 border-black bg-[#FACC15]"
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
            <div className="p-6 text-sm font-bold leading-relaxed uppercase text-gray-600">
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
      title: "Document Helper", 
      desc: "Get easy help in preparing and managing your important ID cards, government forms, and professional papers correctly.",
      icon: FileText
    },
    { 
      title: "Skill Guides", 
      desc: "Access a library of easy guides, video links, and free learning tools built to help you grow your skills.",
      icon: Zap
    },
    { 
      title: "Community Unity", 
      desc: "Join a friendly network of people growing up independently to chat, share advice, and build professional friendships.",
      icon: Heart
    },
    { 
      title: "Career Boosting", 
      desc: "Take part in live sessions to build your confidence and career, where everyone helps each other succeed.",
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
      <div className="marquee-neo mt-[88px]">
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 font-black text-xs uppercase tracking-[0.3em] items-center"
        >
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[#2563EB]" /> CORE MISSION: EMPOWERING CARE-EXPERIENCED INDIVIDUALS</div>
          <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-emerald-400" /> REGIONS: BANGALORE & KASHMIR</div>
          <div className="flex items-center gap-3"><HeartHandshake className="w-5 h-5 text-rose-400" /> POSITIVE COMMUNITY CULTURE</div>
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[#2563EB]" /> CORE MISSION: EMPOWERING CARE-EXPERIENCED INDIVIDUALS</div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 space-y-32">
        
        {/* SECTION 1 — HERO ABOUT TITLE */}
        <section className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-8 py-2 border-4 border-black bg-white text-black font-black text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-[0.4em]"
          >
             About DreamSync
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-center max-w-5xl mx-auto uppercase">
            The Platform for Care-Experienced People to 
            <span className="inline-block mx-4 text-[#2563EB] italic decoration-8 decoration-[#FACC15] underline underline-offset-8">
              Connect
            </span> 
            with other Care-Experienced individuals.
          </h1>

          {/* SECTION 2 — INTRO TEXT */}
          <div className="max-w-3xl mx-auto space-y-8 pt-10 border-t-4 border-black">
            <p className="text-xl md:text-3xl text-black font-black leading-relaxed uppercase">
              Welcome to 
              <span className="text-[#2563EB] ml-2">Dream</span>Sync, 
              a hub created for care-experienced individuals.
            </p>
            <p className="text-lg md:text-xl text-gray-500 font-bold leading-relaxed uppercase">
               Join us in this one-stop destination where you can connect, meet, greet, and empower others while being empowered yourself.
            </p>
          </div>
        </section>

        {/* SECTION 3 — WHAT DREAMSYNC DOES */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              What <span className="text-[#2563EB]">DreamSync</span> Does.
            </h2>
            <p className="text-lg font-black uppercase tracking-widest text-[#2563EB]">
              Explore Our Comprehensive Resources
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


        {/* SECTION 6 — FAQ SECTION */}
        <section className="space-y-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-2 text-center md:text-left">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Common Inquiries</h2>
                <p className="text-[#2563EB] font-black uppercase tracking-widest text-xs">Essential Foundation Knowledge</p>
             </div>
             <div className="h-2 flex-grow hidden md:block bg-black/5" />
             <div className="p-4 bg-[#FACC15] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
          <div className="neo-box p-12 md:p-20 bg-white text-center space-y-12 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-3 bg-[#2563EB]" />
             <div className="absolute bottom-0 right-0 p-8 transform translate-x-12 translate-y-12 opacity-5 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                <Target className="w-64 h-64 text-black" />
             </div>
             
             <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-tight relative z-10">
                Ready to empower <br /> your journey?
             </h2>
             <p className="text-lg md:text-xl text-gray-500 font-bold max-w-2xl mx-auto uppercase relative z-10">
                Join our supportive ecosystem and build a future alongside care-experienced individuals who truly understand your path.
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center items-center gap-6 relative z-10">
                <Link href="/signup" className="neo-btn-primary inline-flex px-12 py-5 text-lg items-center gap-4">
                  Join Community Today <ArrowRight className="w-6 h-6" />
                </Link>
                <Link href="/contact" className="neo-btn-secondary inline-flex px-12 py-5 text-lg items-center gap-4">
                  Contact Us
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
