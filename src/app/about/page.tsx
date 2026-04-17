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
      className="relative h-[280px] w-full perspective-1000 cursor-pointer group"
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
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] group-hover:shadow-[12px_12px_0px_0px_#2563EB] transition-all">
          <div className="p-4 bg-[#FACC15] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 transition-transform group-hover:scale-110 text-black">
            <Icon className="w-10 h-10" strokeWidth={3} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-center text-black italic leading-none">{title}</h3>
          <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-600 italic">READ MORE →</p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_#2563EB]"
        >
          <div className="p-3 bg-white text-black border-2 border-white mb-6">
            <Icon className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-center leading-relaxed uppercase italic">
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
    <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-black uppercase tracking-tight text-black italic">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="p-2 border-4 border-black bg-[#2563EB] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
            <div className="p-6 text-sm font-bold leading-relaxed uppercase text-gray-400 tracking-tight italic">
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
  const faqs = [
    {
      q: "What is DreamSync?",
      a: "DreamSync is a free website for students to find jobs, build resumes, and connect with other students for career growth."
    },
    {
      q: "What is our goal?",
      a: "Our goal is simple: to help every student in India find their dream job by giving them free AI tools and a supportive family."
    },
    {
      q: "Why should I join?",
      a: "Join us if you want a better resume, a clear career plan, and help from experts who care about your future."
    },
    {
      q: "Is it really free?",
      a: "Yes! 100% free for all students. We are a non-profit project made to help you succeed."
    },
    {
      q: "How do I get help?",
      a: "You can talk to our AI assistant or join our student groups on the Community page for real human help."
    }
  ];

  return (
    <div className="flex flex-col bg-white selection:bg-yellow-400/40 min-h-screen">
      
      {/* Black Marquee Ticker */}
      <div className="marquee-neo mt-[88px] bg-black text-white py-4 overflow-hidden border-b-8 border-black">
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap gap-20 font-black text-xs uppercase tracking-[0.4em] items-center"
        >
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-400" /> HELPING INDIAN STUDENTS GROW</div>
          <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-yellow-400" /> GLOBAL JOBS · LOCAL TRAINING</div>
          <div className="flex items-center gap-3"><HeartHandshake className="w-5 h-5 text-white" /> FRIENDLY STUDENT COMMUNITY</div>
          <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-blue-400" /> PLAN YOUR FUTURE · FIND YOUR WAY</div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-24 space-y-24 sm:space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-10 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-8 py-3 border-4 border-black bg-[#FACC15] text-black font-black text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase tracking-[0.4em] italic mx-auto"
          >
             WHY WE ARE HERE
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-center max-w-6xl mx-auto uppercase text-black italic">
            Building the <br /> 
            <span className="text-blue-600 not-italic decoration-8 decoration-[#FACC15] underline underline-offset-8">Future</span> of India.
          </h1>

          <div className="max-w-4xl mx-auto space-y-8 pt-12 border-t-[10px] border-black text-center">
            <p className="text-2xl md:text-4xl text-black font-black leading-tight uppercase italic">
              Welcome to 
              <span className="text-blue-600 ml-3 underline decoration-4 decoration-blue-100 underline-offset-4">Dream</span>Sync, 
              your simple career partner.
            </p>
            <p className="text-lg md:text-2xl text-gray-400 font-bold leading-relaxed uppercase tracking-tight italic">
               We give you free AI tools to build your resume and find the best jobs near you.
            </p>
          </div>
        </section>

        {/* CORE SUPPORT SECTION */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-black italic leading-none">
              HOW WE <span className="text-blue-600 not-italic decoration-8 decoration-yellow-400 underline underline-offset-8">HELP</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-4">SIMPLE TOOLS · BIG IMPACT</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <FlipCard 
              title="Find Your Way" 
              desc="Get a simple AI plan for your future career based on what you love to do."
              icon={Target}
            />
            <FlipCard 
              title="Learn New Skills" 
              desc="Read the best study guides and watch videos to learn things that jobs want."
              icon={Zap}
            />
            <FlipCard 
              title="Meet Students" 
              desc="Connect with thousands of other students who are also building their path."
              icon={Heart}
            />
            <FlipCard 
              title="Job Ready" 
              desc="Making your resume and website is now easy and free for everyone."
              icon={Briefcase}
            />
          </div>
        </section>

        {/* IMPACT STATS */}
        <section className="bg-black border-[10px] border-black p-12 md:p-24 shadow-[20px_20px_0px_0px_#2563EB]">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 text-center">
             {[
               { value: "5000+", label: "Happy Students", icon: User, color: 'text-yellow-400', anim: { y: [0, -8, 0] } },
               { value: "50+", label: "Career Plans", icon: MapPin, color: 'text-blue-400', anim: { scale: [1, 1.2, 1] } },
               { value: "1000+", label: "Resumes Made", icon: FileText, color: 'text-white', anim: { scaleY: [1, 0.8, 1] } },
               { value: "10+", label: "Free Tools", icon: Zap, color: 'text-teal-400', anim: { scale: [1, 1.1, 1], rotate: [0, 10, 0] } }
             ].map((stat, i) => (
               <div key={i} className="space-y-8 flex flex-col items-center">
                  <div className="p-5 bg-white shrink-0 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
                     <motion.div
                       animate={stat.anim}
                       transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                     >
                        <stat.icon className="w-10 h-10 text-black" strokeWidth={3} />
                     </motion.div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-6xl md:text-8xl font-black text-white tracking-tighter italic leading-none">
                      <StatCounter value={stat.value} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 leading-tight italic">
                      {stat.label}
                    </p>
                  </div>
               </div>
             ))}
           </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-20">
          <div className="text-center border-l-[16px] border-yellow-400 pl-8 md:text-left">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-black leading-none">QUESTIONS</h2>
            <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px] mt-2">WE HAVE ANSWERS FOR YOU</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
        <section className="pb-24">
          <div className="p-10 md:p-24 bg-white border-8 border-black text-center space-y-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-black italic">
                Ready to build <br /> your future?
             </h2>
             <p className="text-lg md:text-2xl text-gray-400 font-bold max-w-3xl mx-auto uppercase tracking-tight italic leading-snug">
                Join our family today and start building your career for free with the help of AI.
             </p>
             
             <div className="flex flex-col sm:flex-row justify-center items-center gap-10">
                <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                  <Link href="/signup" className="w-full sm:w-auto px-16 py-8 bg-black text-white border-4 border-black font-black uppercase text-sm tracking-widest shadow-[8px_8px_0px_0px_#2563EB] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center italic">
                    Start Now <ArrowRight className="ml-3 w-6 h-6 inline" />
                  </Link>
                  <p className="text-[10px] font-black text-gray-400 italic">Takes 30 seconds · 100% Free</p>
                </div>
                <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
                  <Link href="/contact" className="w-full sm:w-auto px-16 py-8 bg-white text-black border-4 border-black font-black uppercase text-sm tracking-widest shadow-[8px_8px_0px_0px_black] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center italic">
                     Get Help
                  </Link>
                  <p className="text-[10px] font-black text-gray-400 italic">We are here to support you</p>
                </div>
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
