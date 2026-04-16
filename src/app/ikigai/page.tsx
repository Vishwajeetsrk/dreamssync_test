'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Zap, Globe, DollarSign, ArrowRight, ArrowLeft, 
  Sparkles, Brain, Briefcase, TrendingUp, CheckCircle2,
  RefreshCcw, Download, Share2, Rocket, Star, Target
} from 'lucide-react';
import { IkigaiDiagram } from '@/components/IkigaiDiagram';
import { validateCareerInput } from '@/lib/aiGuard';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────
interface IkigaiResult {
  ikigaiSummary: string;
  ikigaiMatchScore: number;
  primaryPath: {
    title: string;
    description: string;
    whyFits: string[];
    salaryRange: string;
    marketDemand: string;
  };
  multipleCareerOptions: string[];
  skillGaps: string[];
  freeResources: Array<{ title: string; url: string; platform: string }>;
  nextActionSteps: string[];
  zones: {
    passion: string; profession: string; mission: string; vocation: string;
  };
  recommendedRoles: Array<{ title: string; match: string; reason: string }>;
  roadmap: Array<{ step: string; focus: string; duration: string }>;
  strengths: string[];
  weaknesses: string[];
  nextAction: string;
}

const steps = [
  { 
    id: 'passions', 
    title: '❤️ What You Love', 
    desc: 'List your passions, interests, and things that make you lose track of time.',
    icon: Heart,
    color: 'bg-rose-500',
    placeholder: 'e.g. Graphic design, writing, coding, public speaking, gaming'
  },
  { 
    id: 'skills', 
    title: '💪 What You Are Good At', 
    desc: 'List your technical skills, soft skills, and natural talents.',
    icon: Zap,
    color: 'bg-emerald-500',
    placeholder: 'e.g. React.js, leadership, problem solving, creative thinking'
  },
  { 
    id: 'marketNeeds', 
    title: '🌍 What The World Needs', 
    desc: 'Think about current problems, trends, and demands in the 2026 market.',
    icon: Globe,
    color: 'bg-indigo-500',
    placeholder: 'e.g. AI automation, digital privacy, mental health support, sustainable tech'
  },
  { 
    id: 'incomeGoals', 
    title: '💰 What You Can Be Paid For', 
    desc: 'Mention your salary expectations and career goals.',
    icon: DollarSign,
    color: 'bg-amber-500',
    placeholder: 'e.g. Remote role, 15-25 LPA, freelancing high-income roles'
  }
];

export default function IkigaiPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    passions: [] as string[],
    skills: [] as string[],
    marketNeeds: [] as string[],
    incomeGoals: ''
  });
  const [tempInput, setTempInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IkigaiResult | null>(null);
  const [error, setError] = useState('');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleAddItem = () => {
    if (!tempInput.trim()) return;
    const stepId = steps[currentStep].id as keyof typeof form;
    if (Array.isArray(form[stepId])) {
      setForm(f => ({ ...f, [stepId]: [...(f[stepId] as string[]), tempInput.trim()] }));
      setTempInput('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const stepId = steps[currentStep].id as keyof typeof form;
    setForm(f => ({ ...f, [stepId]: (f[stepId] as string[]).filter((_, i) => i !== index) }));
  };

  const handleNext = () => {
    if (isLastStep) {
      analyzeIkigai();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const analyzeIkigai = async () => {
    // 1. Safety Guard
    const combinedInput = `${form.passions.join(' ')} ${form.skills.join(' ')} ${form.marketNeeds.join(' ')} ${form.incomeGoals}`;
    const safety = validateCareerInput(combinedInput);
    if (!safety.allowed) {
      setError(safety.message);
      return;
    }

    setIsAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/ikigai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 && data.error === 'Safety Violation') {
          throw new Error(data.details);
        }
        throw new Error(data.error || 'Failed to analyze Ikigai');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentStepData = steps[currentStep];

  if (result) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        {/* Results Header */}
        <header className="text-center space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block p-3 bg-black text-white neo-box mb-4">
            <Sparkles className="w-8 h-8 mx-auto" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">Your Ikigai Career Path</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            The intersection of your heart, your skills, the world, and your future.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Visual Diagram */}
          <div className="space-y-8 sticky top-24">
            <div className="bg-white border-4 border-black p-8 neo-box">
              <IkigaiDiagram activeZone={hoveredZone as any} />
              <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                <div onMouseEnter={() => setHoveredZone('passion')} onMouseLeave={() => setHoveredZone(null)} className="p-3 border-2 border-black bg-rose-50 font-bold text-xs uppercase cursor-help shadow-[2px_2px_0px_0px_rgba(244,63,94,1)] text-rose-700">❤️ Passion Zone</div>
                <div onMouseEnter={() => setHoveredZone('profession')} onMouseLeave={() => setHoveredZone(null)} className="p-3 border-2 border-black bg-emerald-50 font-bold text-xs uppercase cursor-help shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] text-emerald-700">💪 Profession Zone</div>
                <div onMouseEnter={() => setHoveredZone('mission')} onMouseLeave={() => setHoveredZone(null)} className="p-3 border-2 border-black bg-indigo-50 font-bold text-xs uppercase cursor-help shadow-[2px_2px_0px_0px_rgba(79,70,229,1)] text-indigo-700">🌍 Mission Zone</div>
                <div onMouseEnter={() => setHoveredZone('vocation')} onMouseLeave={() => setHoveredZone(null)} className="p-3 border-2 border-black bg-amber-50 font-bold text-xs uppercase cursor-help shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] text-amber-700">💰 Vocation Zone</div>
              </div>
            </div>
          </div>

          {/* Details */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
            {/* Primary Path */}
            {/* 🎯 RECOMMENDED IKIGAI PATH */}
            <div className="bg-[#0F172A] text-white border-[3px] border-black p-8 neo-box shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-6">
                <div className="text-[#FACC15] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                  <Rocket className="w-4 h-4" /> RECOMMENDED IKIGAI PATH
                </div>
                <div className="bg-[#7C3AED] text-white px-3 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                   Ikigai Match: {result.ikigaiMatchScore}%
                </div>
              </div>

              <h2 className="text-[22px] font-black mb-4 text-[#22C55E] uppercase italic">{result.primaryPath.title}</h2>
              
              <div className="space-y-4 mb-8">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Why this fits you:</p>
                <ul className="space-y-2">
                   {result.primaryPath.whyFits?.map((point, i) => (
                     <li key={i} className="text-sm font-bold flex gap-2 text-gray-200">
                        <span className="text-[#22C55E]">✦</span> {point}
                     </li>
                   ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Market Demand</div>
                  <div className="text-xl font-black text-[#22C55E] flex items-center gap-2 uppercase">
                    {result.primaryPath.marketDemand} 📈
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Exp. Salary (India 2026)</div>
                  <div className="text-xl font-black text-[#FACC15]">{result.primaryPath.salaryRange}</div>
                </div>
              </div>
            </div>

            {/* Multiple Career Options & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white border-4 border-black p-6 neo-box">
                  <h3 className="text-lg font-black mb-4 uppercase flex items-center gap-2 italic">
                     <Star className="w-5 h-5 text-amber-500" /> Career Variants
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {result.multipleCareerOptions?.map((opt, i) => (
                       <span key={i} className="px-3 py-1.5 bg-gray-50 border-2 border-black text-[10px] font-black uppercase">{opt}</span>
                     ))}
                  </div>
               </div>
               <div className="bg-[#FEF2F2] border-4 border-black p-6 neo-box">
                  <h3 className="text-lg font-black mb-4 uppercase flex items-center gap-2 italic text-red-600">
                     <AlertCircle className="w-5 h-5" /> Skill Gaps
                  </h3>
                  <ul className="space-y-2">
                     {result.skillGaps?.map((gap, i) => (
                       <li key={i} className="text-[10px] font-black uppercase flex gap-2 text-red-800">
                          <span className="text-red-500">•</span> {gap}
                       </li>
                     ))}
                  </ul>
               </div>
            </div>


            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black p-6 neo-box">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 underline decoration-4 decoration-emerald-400">
                  <Star className="w-5 h-5 text-emerald-500" /> Core Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm font-bold flex items-start gap-2">
                      <span className="w-5 h-5 bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border-4 border-black p-6 neo-box">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 underline decoration-4 decoration-rose-400">
                  <Target className="w-5 h-5 text-rose-500" /> Improvement Areas
                </h3>
                <ul className="space-y-3">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm font-bold flex items-start gap-2">
                      <span className="w-5 h-5 bg-rose-100 flex items-center justify-center text-rose-700 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps / Roadmap */}
            {/* 💡 NEXT ACTION STEPS & RESOURCES */}
            <div className="bg-white border-4 border-black p-8 neo-box space-y-8">
               <div className="border-b-4 border-black pb-4">
                  <h3 className="text-2xl font-black uppercase italic flex items-center gap-3">
                     <TrendingUp className="w-7 h-7 text-[#7C3AED]" /> Next Action Steps
                  </h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     {result.nextActionSteps?.map((step, i) => (
                       <div key={i} className="flex gap-4 items-start">
                          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                          <p className="text-sm font-bold leading-tight">{step}</p>
                       </div>
                     ))}
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#2563EB]">Free Resources</p>
                     <div className="space-y-2">
                        {result.freeResources?.map((res, i) => (
                          <Link key={i} href={res.url} target="_blank" className="flex items-center justify-between p-3 bg-gray-100 border-2 border-black text-[10px] font-black uppercase hover:bg-white transition-all">
                             {res.title} <ExternalLink className="w-3 h-3" />
                          </Link>
                        ))}
                     </div>
                  </div>
               </div>
            </div>


            {/* Integration CTAs */}
            <div className="flex flex-col gap-4">
               <Link href="/resume-builder" className="w-full flex items-center justify-between p-5 bg-[#7C3AED] text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">
                 Build Resume for this Path <ArrowRight className="w-6 h-6 text-white" />
               </Link>
               <Link href="/roadmap" className="w-full flex items-center justify-between p-5 bg-black text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(124,58,237,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">
                 Generate Technical Roadmap <ArrowRight className="w-6 h-6 text-white" />
               </Link>
            </div>

            <button onClick={() => setResult(null)} className="w-full text-center py-4 font-black flex items-center justify-center gap-2 text-muted-foreground hover:text-black">
              <RefreshCcw className="w-4 h-4" /> Start Over
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* Landing / Intro Area */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8"
          >
            <div className="relative">
              <motion.div
                className="w-24 h-24 border-8 border-black border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black">Finding Your Ikigai...</h2>
              <p className="text-xl text-muted-foreground font-medium">Analysing your heart and the 2026 job market.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Steps Visualizer */}
            <div className="space-y-8">
              <header className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                   <motion.span 
                     animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="px-6 py-2 bg-[#FACC15] text-black font-black text-xs border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest"
                   >
                     💎 PREMIUM FEATURE
                   </motion.span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic">Find Your <span className="text-[#7C3AED]">Vibe</span></h1>
                <p className="text-xl text-muted-foreground font-medium uppercase tracking-tight">Find exactly what you love and get a step-by-step path to a happy life.</p>
              </header>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 border-2 border-black overflow-hidden mb-12">
                <motion.div
                  className="h-full bg-[#7C3AED]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>

              {/* Form Step */}
              <div className="bg-white border-4 border-black neo-box p-8 space-y-8">
                <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                  <div className={`p-4 ${currentStepData.color} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <currentStepData.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black leading-none text-[#2563EB]">{currentStepData.title}</h2>
                    <p className="text-gray-500 font-medium mt-2 uppercase text-[10px] tracking-widest">{currentStepData.desc}</p>
                  </div>
                </div>

                {/* Input Area */}
                {currentStepData.id === 'incomeGoals' ? (
                  <textarea
                    value={form.incomeGoals}
                    onChange={e => setForm(f => ({ ...f, incomeGoals: e.target.value }))}
                    className="w-full p-6 text-lg font-black border-4 border-black bg-white focus:outline-none focus:bg-gray-50 resize-none min-h-[200px] text-gray-900 placeholder:text-gray-400"
                    placeholder={currentStepData.placeholder}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={tempInput}
                        onChange={e => setTempInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                        placeholder={currentStepData.placeholder}
                        className="flex-1 p-5 text-lg font-black border-4 border-black bg-white focus:outline-none focus:bg-gray-50 text-gray-900 placeholder:text-gray-400"
                      />
                      <button onClick={handleAddItem} className="px-8 py-4 bg-[#7C3AED] text-white font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {(form[currentStepData.id as keyof typeof form] as string[]).map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                          {item}
                          <button onClick={() => handleRemoveItem(i)} className="text-gray-400 hover:text-rose-500">×</button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-between items-center pt-8 border-t-2 border-gray-100">
                  <button
                    onClick={() => setCurrentStep(s => s - 1)}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-3 font-black text-muted-foreground hover:text-black disabled:opacity-0"
                  >
                    <ArrowLeft className="w-5 h-5" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={
                      (currentStepData.id !== 'incomeGoals' && (form[currentStepData.id as keyof typeof form] as string[]).length === 0) ||
                      (currentStepData.id === 'incomeGoals' && !form.incomeGoals.trim())
                    }
                    className="flex items-center gap-3 px-12 py-5 bg-[#7C3AED] text-white font-black text-sm border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:bg-[#C4B5FD] disabled:text-[#1F2937] uppercase italic"
                  >
                    {isLastStep ? 'Analyze My Ikigai ✨' : 'Continue Execution →'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-700 font-bold flex items-center gap-3">
          <RefreshCcw className="w-5 h-5" /> {error}
          <button onClick={analyzeIkigai} className="underline ml-auto">Retry</button>
        </div>
      )}
    </div>
  );
}
