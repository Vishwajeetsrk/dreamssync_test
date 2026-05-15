'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Send, Target, Award, Brain, Loader2, RefreshCw, ChevronRight, 
  Briefcase, Users, Heart, Sparkles, MessageSquare, ShieldCheck, 
  Zap, ArrowRight, User as UserIcon, Bot, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const categories = [
  { id: 'vocational', name: 'VOCATIONAL SKILLS', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'corporate', name: 'CORPORATE ENTRY', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'behavioral', name: 'SOFT SKILLS', icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-50' },
];

export default function MockInterview() {
  const { t } = useLanguage();
  const [step, setStep] = useState<'setup' | 'chat' | 'result'>('setup');
  const [category, setCategory] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const startInterview = async (cat: string) => {
    setCategory(cat);
    setStep('chat');
    setLoading(true);
    // Simulate first question
    setTimeout(() => {
      setMessages([{ role: 'assistant', content: `Hello! Let's start the ${cat} interview. Tell me about your background and why you are interested in this role.` }]);
      setLoading(false);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input || loading) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      setMessages([...newMsgs, { role: 'assistant', content: "That's a strong start. How do you handle difficult situations or conflicts in a professional environment?" }]);
      setLoading(false);
    }, 2000);
  };

  const finishInterview = async () => {
    setLoading(true);
    setTimeout(() => {
      setFeedback({ 
        score: 88, 
        strengths: ['Confident tone', 'Excellent domain knowledge', 'Good eye contact (simulated)'], 
        areas: ['Try to keep answers more concise', 'Use more industry keywords'] 
      });
      setStep('result');
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-8 selection:bg-yellow-400">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Architecture */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-[10px] border-black pb-12">
            <div className="space-y-4">
                <div className="neo-badge">SIMULATION PROTOCOL v2.1</div>
                <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter">
                   MOCK <br /> <span className="text-blue-600">INTERVIEW.</span>
                </h1>
                <p className="text-xl font-bold uppercase italic text-gray-500 max-w-xl">
                   Safe, high-fidelity interview simulations designed to bridge the corporate entry gap.
                </p>
            </div>
            <Brain className="w-20 h-20 text-yellow-400 fill-current hidden lg:block" />
        </header>

        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {categories.map((c) => (
                 <button 
                  key={c.id} 
                  onClick={() => startInterview(c.name)}
                  className="neo-card p-10 flex flex-col gap-8 text-left group hover:bg-black hover:text-white transition-all"
                 >
                    <div className={`w-20 h-20 border-4 border-black ${c.bg} flex items-center justify-center ${c.color} shadow-[4px_4px_0px_0px_black] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1`}>
                       <c.icon className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black italic uppercase leading-none">{c.name}</h3>
                       <p className="text-xs font-black uppercase italic tracking-tighter text-gray-400 group-hover:text-gray-200">MASTER THE PROTOCOLS OF PROFESSIONAL DIALOGUE.</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic italic transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                       INITIALIZE <ArrowRight className="w-4 h-4" />
                    </div>
                 </button>
               ))}
            </motion.div>
          )}

          {step === 'chat' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-12 overflow-hidden h-[calc(100vh-20rem)]">
               {/* Metadata Sidebar */}
               <div className="hidden lg:flex flex-col gap-6">
                  <div className="neo-card bg-yellow-400 space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest italic leading-none">Status</p>
                     <h4 className="text-2xl font-black uppercase italic leading-none">LIVE SESSION</h4>
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase italic">RECORDING NODES</span>
                     </div>
                  </div>
                  <div className="neo-card bg-black text-white space-y-4 flex-1">
                     <h4 className="text-xl font-black italic uppercase text-blue-400">Interview Tips</h4>
                     <ul className="space-y-6">
                        {[
                          "Speak clearly and with conviction.",
                          "Structure answers using the STAR method.",
                          "Highlight your unique resilience.",
                        ].map((tip, i) => (
                          <li key={i} className="flex gap-4 text-xs font-black uppercase italic tabular-nums">
                            <span className="text-gray-600 italic">{i+1}.</span> {tip}
                          </li>
                        ))}
                     </ul>
                  </div>
               </div>

               {/* Interaction Node */}
               <div className="lg:col-span-3 neo-card p-0 flex flex-col bg-slate-50 relative overflow-hidden h-full">
                  <div className="bg-black text-white p-6 flex justify-between items-center border-b-8 border-black">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 border-2 border-white flex items-center justify-center">
                           <Bot className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase">{category} PROTOCOL</h3>
                     </div>
                     <button onClick={finishInterview} className="neo-btn bg-red-500 text-white px-6 py-2 text-xs">TERMINATE</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                     {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[80%] p-6 neo-border shadow-[6px_6px_0px_0px_black] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}>
                              <p className="text-[10px] font-black italic uppercase leading-none mb-4 opacity-40">{m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}</p>
                              <p className="text-base font-bold uppercase italic leading-relaxed">{m.content}</p>
                           </div>
                        </div>
                     ))}
                     {loading && (
                        <div className="flex justify-start">
                           <div className="neo-card bg-white p-4 animate-pulse italic font-black uppercase text-xs">AI GENERATING QUESTION...</div>
                        </div>
                     )}
                  </div>

                  <div className="p-8 border-t-8 border-black bg-white">
                     <div className="flex gap-6">
                        <input 
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="TRANSMIT YOUR RESPONSE..."
                          className="neo-input flex-1 !p-6"
                        />
                        <button onClick={sendMessage} className="neo-btn neo-btn-primary w-24 h-20 flex items-center justify-center">
                           <Send className="w-8 h-8" />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {step === 'result' && feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="neo-card bg-black text-white p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-[16px_16px_0px_0px_#2563EB]">
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">TOTAL SCORE</p>
                     <div className="text-9xl font-black italic tracking-tighter tabular-nums">{feedback.score}</div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                     <div className="neo-card bg-green-50 space-y-8">
                        <h3 className="text-3xl font-black italic uppercase flex items-center gap-4">
                           <Award className="w-10 h-10 text-green-600" /> Strengths Detected
                        </h3>
                        <ul className="space-y-4">
                           {feedback.strengths.map((s: string, i: number) => (
                             <li key={i} className="flex gap-4 items-start font-black uppercase italic text-sm">
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" /> {s}
                             </li>
                           ))}
                        </ul>
                     </div>

                     <div className="neo-card bg-blue-50 space-y-8">
                        <h3 className="text-3xl font-black italic uppercase flex items-center gap-4">
                           <Zap className="w-10 h-10 text-blue-600" /> Growth Nodes
                        </h3>
                        <ul className="space-y-4">
                           {feedback.areas.map((a: string, i: number) => (
                             <li key={i} className="flex gap-4 items-start font-black uppercase italic text-sm">
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] shrink-0">{i+1}</div> {a}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>

               <button onClick={() => setStep('setup')} className="neo-btn neo-btn-primary w-full h-24 text-2xl flex items-center justify-center gap-4 group">
                  <RefreshCw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" /> INITIALIZE NEW SESSION
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
