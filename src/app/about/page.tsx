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

const FlipCard = ({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[220px] w-full perspective-1000 cursor-pointer group"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-full w-full transition-all duration-500 preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_black] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[8px_8px_0px_0px_#2563EB] transition-all">
          <div className="p-3 bg-[#FACC15] border-2 border-black mb-4">
            <Icon className="w-8 h-8 text-black" strokeWidth={3} />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-center italic leading-none">{title}</h3>
          <p className="mt-4 text-[9px] font-black uppercase text-blue-600 italic">READ MORE</p>
        </div>

        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 bg-black text-white border-2 border-black shadow-[6px_6px_0px_0px_#2563EB]">
          <p className="text-[11px] font-bold text-center leading-snug uppercase italic">{desc}</p>
        </div>
      </motion.div>
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_black] overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left bg-white">
        <span className="text-base font-black uppercase tracking-tight text-black italic leading-none">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="p-1 border-2 border-black bg-blue-600 text-white">
          <ChevronDown className="w-4 h-4" strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t-2 border-black bg-gray-50">
            <div className="p-5 text-[11px] font-bold uppercase text-gray-400 italic leading-snug">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function About() {
  const faqs = [
    { q: "What is DreamSync?", a: "DreamSync is a free website for students to find jobs, build resumes, and connect with other students." },
    { q: "What is our goal?", a: "To help every student in India find their dream job by giving them free AI tools and a supportive family." },
    { q: "Why join?", a: "If you want a better resume, a clear career plan, and help from experts who care about your success." },
    { q: "Is it free?", a: "100% free for all students. We are a non-profit project made to help you succeed." },
    { q: "How to get help?", a: "Talk to our AI assistant or join our student groups on the Community page." }
  ];

  return (
    <div className="flex flex-col bg-white selection:bg-yellow-400/20 min-h-screen">
      
      <div className="marquee-neo mt-[72px] bg-black text-white py-3 overflow-hidden border-b-4 border-black">
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="flex whitespace-nowrap gap-12 font-black text-[9px] uppercase tracking-widest items-center">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> HELPING STUDENTS GROW</div>
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-yellow-400" /> GLOBAL JOBS · LOCAL TRAINING</div>
          <div className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-white" /> FRIENDLY COMMUNITY</div>
          <div className="flex items-center gap-2"><Target className="w-4 h-4 text-red-400" /> FIND YOUR WAY</div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 space-y-16 sm:space-y-20">
        
        <section className="text-center space-y-8">
          <div className="inline-block px-4 py-1.5 border-2 border-black bg-yellow-400 text-black font-black text-[9px] shadow-[3px_3px_0px_0px_black] uppercase italic">WHY WE ARE HERE</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none text-black uppercase italic">
            Building the <br />
            <span className="text-blue-600 not-italic decoration-4 decoration-[#FACC15] underline underline-offset-4">Future</span> of India.
          </h1>

          <div className="max-w-3xl mx-auto space-y-6 pt-10 border-t-4 border-black text-center">
            <p className="text-xl md:text-3xl text-black font-black leading-tight uppercase italic">Welcome to DreamSync.</p>
            <p className="text-base md:text-xl text-gray-400 font-bold uppercase tracking-tight italic leading-snug">
               We give you free AI tools to build your resume and find the best jobs near you.
            </p>
          </div>
        </section>

        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black italic leading-none">HOW WE HELP</h2>
            <p className="text-[9px] font-black uppercase text-gray-500 italic">SIMPLE TOOLS · BIG IMPACT</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <FlipCard title="Find Way" desc="Get a simple AI plan for your future career based on what you love." icon={Target} />
            <FlipCard title="Learn Skills" desc="Read study guides and watch videos to learn things jobs want." icon={Zap} />
            <FlipCard title="Meet Family" desc="Connect with thousands of students building their path." icon={Heart} />
            <FlipCard title="Job Ready" desc="Making your resume and website is now easy and free." icon={Briefcase} />
          </div>
        </section>

        <section className="bg-black border-[8px] border-black p-10 md:p-16 shadow-[16px_16px_0px_0px_#2563EB]">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
             {[
               { value: "5000+", label: "STUDENTS", icon: User, color: 'text-yellow-400' },
               { value: "50+", label: "PLANS", icon: MapPin, color: 'text-blue-400' },
               { value: "1000+", label: "RESUMES", icon: FileText, color: 'text-white' },
               { value: "10+", label: "TOOLS", icon: Zap, color: 'text-teal-400' }
             ].map((stat, i) => (
               <div key={i} className="space-y-4">
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter italic leading-none">
                    <StatCounter value={stat.value} />
                  </div>
                  <p className="text-[9px] font-black uppercase text-gray-500 italic">{stat.label}</p>
               </div>
             ))}
           </div>
        </section>

        <section className="space-y-12">
           <div className="text-center border-l-8 border-yellow-400 pl-6 md:text-left">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black leading-none">QUESTIONS</h2>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
           </div>
        </section>

        <section className="pb-16 pt-8">
           <div className="p-10 md:p-16 bg-white border-4 border-black text-center space-y-10 shadow-[10px_10px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
             <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-black">Ready to build your future?</h2>
             <p className="text-base md:text-xl text-gray-400 font-bold max-w-2xl mx-auto uppercase italic">Join our family today and start growing for free.</p>
             <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-black text-white border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 transition-all italic">Start Now →</Link>
                <Link href="/contact" className="w-full sm:w-auto px-10 py-5 bg-white text-black border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 transition-all italic">Get Help</Link>
             </div>
           </div>
        </section>
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
