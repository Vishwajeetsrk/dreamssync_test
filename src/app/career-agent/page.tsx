'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Sparkles, TrendingUp, MapPin,
  ExternalLink, Briefcase, ChevronRight, RotateCcw,
  IndianRupee, Building2, Zap, MessageSquare, BookOpen, Globe, Search, ArrowRight, Loader2
} from 'lucide-react';
import CareerPathCard from '@/components/CareerPathCard';
import { graphicDesignPath } from '@/data/careerPaths';
import { validateCareerInput } from '@/lib/aiGuard';

// ── Types ─────────────────────────────────────────────────────────
interface Role {
  title: string;
  salary: string;
  demand: 'High' | 'Medium' | 'Low';
  skills: string[];
  companies: string[];
  prerequisites?: string;
}

interface RoadmapNode {
  id: number;
  label: string;
  sublabel: string;
  next: number[];
  summary?: string;
}

interface JobLink {
  platform: string;
  url: string;
  label: string;
  summary?: string;
}

interface AgentResponse {
  reply: string;
  roles: Role[];
  roadmapNodes: RoadmapNode[];
  jobLinks: JobLink[];
  quickTips: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: AgentResponse;
}

// ── Suggested Prompts ─────────────────────────────────────────────
const suggestions = [
  "Strategic Roadmap 2026",
  "Industry Demand Audit",
  "Compensation Benchmarks",
  "Skill Gap Analysis"
];

// ── Flowchart ─────────────────────────────────────────────────────
function Flowchart({ nodes }: { nodes: RoadmapNode[] }) {
  if (!nodes || nodes.length === 0) return null;
  const colors = ['bg-blue-600', 'bg-teal-500', 'bg-slate-900', 'bg-blue-700', 'bg-teal-600'];

  return (
    <div className="bg-white border-4 border-slate-900 neo-box p-8 shadow-[8px_8px_0px_0px_#F1F5F9]">
      <h3 className="font-black text-xl mb-6 flex items-center gap-3 uppercase italic text-slate-900">
        <MapPin className="w-6 h-6 text-blue-600" /> Strategic Progression
      </h3>
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-max">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-14 h-14 border-4 border-slate-900 flex items-center justify-center text-white font-black text-lg shadow-[4px_4px_0px_0px_#0F172A] ${colors[i % colors.length]}`}>
                   {i + 1}
                </div>
                <div className="mt-4 text-center max-w-[120px]">
                   <p className="text-xs font-black uppercase leading-tight italic">{node.label}</p>
                   <p className="text-[10px] font-bold text-black/40 mt-1 uppercase">{node.sublabel}</p>
                </div>
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="flex items-center mb-10 mx-2">
                   <div className="w-12 h-1 bg-black" />
                   <ChevronRight className="w-5 h-5 -ml-1 shrink-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Role Card ─────────────────────────────────────────────────────
function RoleCard({ role }: { role: Role }) {
  return (
    <div className="bg-white border-4 border-slate-900 p-6 neo-box space-y-4 hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_#F1F5F9]">
      <div className="flex items-start justify-between gap-4">
        <h4 className="font-black text-xl leading-tight uppercase italic text-slate-900">{role.title}</h4>
        <span className="px-3 py-1 text-[10px] font-black border-2 border-slate-900 bg-white uppercase tracking-widest shadow-[2px_2px_0px_0px_#0F172A]">
          {role.demand}
        </span>
      </div>
      <div className="flex items-center gap-2 text-lg font-black text-blue-600 italic">
        <IndianRupee className="w-5 h-5" /> {role.salary}
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {role.skills.slice(0, 4).map(s => (
          <span key={s} className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-tighter">{s}</span>
        ))}
      </div>
      {role.companies?.length > 0 && (
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black border-t-2 border-slate-100 pt-4 uppercase">
           <Building2 className="w-4 h-4" />
           {role.companies.slice(0, 3).join(' · ')}
        </div>
      )}
    </div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-6`}>
      {!isUser && (
        <div className="w-12 h-12 bg-blue-600 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="max-w-[85%] space-y-6">
        <div className={`p-4 sm:p-8 border-4 border-slate-900 ${isUser ? 'bg-slate-900 text-white shadow-[6px_6px_0px_0px_#2563EB]' : 'bg-white shadow-[6px_6px_0px_0px_#F1F5F9]'}`}>
          <div className={`text-lg font-bold whitespace-pre-wrap leading-relaxed italic ${isUser ? 'text-white' : 'text-black'}`}>
            {isUser ? msg.content : (
              <div className="space-y-6">
                {(msg.data?.reply || msg.content).split('###').map((section, si) => {
                  if (si === 0 && section.trim()) return <p key={si}>{section.trim()}</p>;
                  if (!section.trim()) return null;

                  // Clean up the title and the rest
                  const lines = section.trim().split('\n');
                  const rawTitle = lines[0].trim();
                  const cleanedTitle = rawTitle.replace(/\*\*/g, '').replace(/###/g, '');
                  const bodyLines = lines.slice(1);

                  return (
                    <div key={si} className="space-y-4 pt-8 border-t-8 border-slate-50 mt-8 first:mt-0 first:border-0 first:pt-0">
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-blue-600 flex items-center gap-4 group italic">
                         <div className="p-2 border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_#0F172A] group-hover:bg-teal-500 transition-colors">
                           <TrendingUp className="w-6 h-6" />
                         </div>
                         {cleanedTitle}
                      </h3>
                      <div className="text-sm md:text-base font-bold text-gray-700 leading-relaxed uppercase space-y-4">
                         {bodyLines.map((line, li) => {
                           const cleanLine = line.trim().replace(/\*\*/g, '');
                           if (!cleanLine) return <div key={li} className="h-2" />;
                           
                           if (line.trim().startsWith('-')) {
                             return (
                               <div key={li} className="flex gap-4 p-4 bg-gray-50 border-l-8 border-[#2563EB] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                                 <span>{cleanLine.replace(/^-/, '').trim()}</span>
                               </div>
                             );
                           }
                           return <p key={li}>{cleanLine}</p>;
                         })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!isUser && msg.data && (
          <div className="space-y-10">
            {msg.data.roadmapNodes?.length > 0 && <Flowchart nodes={msg.data.roadmapNodes} />}
            {msg.data.roles?.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 flex items-center gap-3">
                  <TrendingUp className="w-4 h-4" /> NODE SUGGESTIONS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {msg.data.roles.map((r, i) => <RoleCard key={i} role={r} />)}
                </div>
              </div>
            )}
            {msg.data.quickTips?.length > 0 && (
              <div className="bg-teal-500 border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_#0F172A]">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-4">⚡ STRATEGIC INTELLIGENCE</p>
                <ul className="space-y-3">
                  {msg.data.quickTips.map((tip, i) => (
                    <li key={i} className="text-sm text-white font-black flex gap-4 italic uppercase">
                       <Zap className="w-5 h-5 shrink-0 text-white" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {msg.data.jobLinks?.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                  <Briefcase className="w-4 h-4" /> CAREER PORTALS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {msg.data.jobLinks.map((j, i) => (
                    <a key={i} href={j.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border-4 border-slate-900 hover:bg-blue-600 hover:text-white transition-all neo-box group shadow-[4px_4px_0px_0px_#F1F5F9]">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">{j.platform}</span>
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </div>
                       <h5 className="font-black text-base uppercase italic mb-2 leading-tight">{j.label}</h5>
                       {j.summary && <p className="text-[9px] font-bold opacity-60 uppercase">{j.summary}</p>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function CareerAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const safety = validateCareerInput(userText);
    if (!safety.allowed) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: userText },
        { 
          role: 'assistant', 
          content: `⚠️ PROTOCOL VIOLATION: ${safety.message}\n\nPlease recalibrate query to professional and ethical career trajectories.` 
        }
      ]);
      setInput('');
      return;
    }

    const userMsg: Message = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.role === 'user' ? m.content : (m.data?.reply || m.content),
      }));

      const res = await fetch('/api/career-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data: AgentResponse = await res.json();
      if (!res.ok) throw new Error((data as any).error || 'Failed');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        data,
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ERROR: ${err.message || 'CRYPTO-FAILURE DETECTED. RETRY.'}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 font-bold uppercase overflow-x-hidden">
      
      <div className="mt-[88px]" />

      <div className="max-w-6xl mx-auto px-6 py-20 pb-60 space-y-12">
        
        {/* Header Architecture (Audit Recap State) */}
        <header className="border-b-8 border-slate-900 pb-16 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-900 text-white shadow-[3px_3px_0px_0px_#2563EB]">
                  <Brain className="w-8 h-8" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-left">Strategic AI Counselor</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-none text-slate-900 italic">
               Strategic <br /> Guide
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 font-semibold uppercase tracking-tight mt-2">
               Empowering student career trajectories.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end max-w-md">
            {['Strategic Growth', 'Vocation Audit', 'Step-by-Step Roadmaps'].map(t => (
              <span key={t} className="px-4 py-2 bg-white border-4 border-slate-900 text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_#2563EB] tracking-widest italic">{t}</span>
            ))}
          </div>
        </header>

        {/* Main Interface Area */}
        <div className="bg-white border-4 md:border-8 border-slate-900 p-4 sm:p-6 md:p-12 shadow-[12px_12px_0px_0px_#F1F5F9] space-y-12">
           {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                <div className="w-16 h-16 bg-blue-600 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-white" />
                </div>
                 <div className="space-y-4">
                    <h2 className="text-5xl font-black uppercase tracking-tighter italic text-slate-900">Strategist 1.0</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-xl mx-auto">Hi! I am your Strategic AI Guide. How can I facilitate your professional growth today? I can help you find tools, audit skills, or construct career roadmaps.</p>
                 </div>
             </div>
           ) : (
             <div className="space-y-12 min-h-[400px]">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}
                {loading && (
                  <div className="flex gap-6">
                     <div className="w-12 h-12 bg-blue-600 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                     </div>
                     <div className="bg-white border-4 border-slate-900 p-8 shadow-[6px_6px_0px_0px_#F1F5F9] flex items-center gap-4">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <p className="text-lg font-black italic uppercase animate-pulse text-slate-900">Syncing with Industry Nodes...</p>
                     </div>
                  </div>
                )}
                <div ref={bottomRef} />
             </div>
           )}
        </div>

        {/* Quick Suggestions & Featured (Image 9 style) */}
        <div className="space-y-12">
           <div className="flex items-center gap-3 text-black/40">
              <Search className="w-4 h-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">FEATURED CAREER PATH — EXPLORE OR ASK A QUESTION ABOVE</p>
           </div>

           <CareerPathCard path={graphicDesignPath} />

           <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-400">
                 <MessageSquare className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">STRATEGIC QUERIES</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} className="p-4 bg-white border-4 border-slate-900 text-[10px] font-black uppercase hover:bg-slate-50 transition-all text-left shadow-[4px_4px_0px_0px_#0F172A]">
                    {s}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Input Interface */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 no-print">
           <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] p-2 flex items-end gap-2 group focus-within:shadow-[10px_10px_0px_0px_rgba(250,204,21,1)] transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about careers, salaries, skills, companies..."
                rows={2}
                className="flex-1 p-6 text-xl font-black italic uppercase resize-none focus:outline-none bg-transparent placeholder:text-black/20"
                disabled={loading}
              />
              <div className="flex flex-col gap-2 p-2">
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])} className="p-4 border-4 border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_#F1F5F9]">
                    <RotateCcw className="w-6 h-6" />
                  </button>
                )}
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="p-6 bg-blue-600 text-white border-4 border-slate-900 hover:-translate-x-1 hover:-translate-y-1 transition-all shadow-[6px_6px_0px_0px_#0F172A] disabled:grayscale disabled:opacity-50"
                >
                  <Send className="w-8 h-8" />
                </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
