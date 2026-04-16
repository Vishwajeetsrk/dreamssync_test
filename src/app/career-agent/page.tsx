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
  "Fix Profile Photo",
  "Fix LinkedIn",
  "ATS Score Check",
  "2026 Roadmap"
];

// ── Flowchart ─────────────────────────────────────────────────────
function Flowchart({ nodes }: { nodes: RoadmapNode[] }) {
  if (!nodes || nodes.length === 0) return null;
  const colors = ['bg-[#2563EB]', 'bg-[#FACC15]', 'bg-black', 'bg-emerald-500', 'bg-rose-500'];

  return (
    <div className="bg-white border-4 border-black neo-box p-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
      <h3 className="font-black text-xl mb-6 flex items-center gap-3 uppercase italic">
        <MapPin className="w-6 h-6 text-[#2563EB]" /> Visual Progression
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
                <div className={`w-14 h-14 border-4 border-black flex items-center justify-center text-white font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${colors[i % colors.length]}`}>
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
    <div className="bg-white border-4 border-black p-6 neo-box space-y-4 hover:bg-[#FACC15]/5 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <h4 className="font-black text-xl leading-tight uppercase italic">{role.title}</h4>
        <span className="px-3 py-1 text-[10px] font-black border-2 border-black bg-white uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {role.demand}
        </span>
      </div>
      <div className="flex items-center gap-2 text-lg font-black text-[#2563EB] italic">
        <IndianRupee className="w-5 h-5" /> {role.salary}
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {role.skills.slice(0, 4).map(s => (
          <span key={s} className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-tighter">{s}</span>
        ))}
      </div>
      {role.companies?.length > 0 && (
        <div className="flex items-center gap-2 text-[10px] text-black/40 font-black border-t-2 border-black pt-4 uppercase">
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
        <div className="w-12 h-12 bg-[#2563EB] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="max-w-[85%] space-y-6">
        <div className={`p-8 border-4 border-black ${isUser ? 'bg-black text-white shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]' : 'bg-white shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]'}`}>
          <div className={`text-lg font-bold whitespace-pre-wrap leading-relaxed italic ${isUser ? 'text-white' : 'text-black'}`}>
            {isUser ? msg.content : (
              <div className="space-y-6">
                {(msg.data?.reply || msg.content).split('###').map((section, si) => {
                  if (si === 0 && section.trim()) return <p key={si}>{section.trim()}</p>;
                  if (!section.trim()) return null;

                  const [title, ...rest] = section.split('\n');
                  return (
                    <div key={si} className="space-y-4 pt-4 border-t-4 border-black/5">
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-[#2563EB] flex items-center gap-3">
                         <TrendingUp className="w-8 h-8" /> {title.trim()}
                      </h3>
                      <div className="text-base font-bold text-gray-700 leading-relaxed uppercase">
                         {rest.join('\n').split('\n').map((line, li) => {
                           if (line.trim().startsWith('-')) {
                             return <div key={li} className="flex gap-4 mb-2"><span className="text-[#2563EB]">🎯</span> {line.replace(/^-/, '').trim()}</div>;
                           }
                           return <p key={li} className="mb-4">{line.trim()}</p>;
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
              <div className="bg-[#FACC15] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-black mb-4">⚡ CRITICAL INTELLIGENCE</p>
                <ul className="space-y-3">
                  {msg.data.quickTips.map((tip, i) => (
                    <li key={i} className="text-sm text-black font-black flex gap-4 italic uppercase">
                       <Zap className="w-5 h-5 shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {msg.data.jobLinks?.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 flex items-center gap-3">
                  <Briefcase className="w-4 h-4" /> LIVE PORTALS
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {msg.data.jobLinks.map((j, i) => (
                    <a key={i} href={j.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border-4 border-black hover:bg-[#2563EB] hover:text-white transition-all neo-box group">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">{j.platform}</span>
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </div>
                       <h5 className="font-black text-base uppercase italic mb-2 leading-tight">{j.label}</h5>
                       {j.summary && <p className="text-[10px] font-bold opacity-60 uppercase">{j.summary}</p>}
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
    <div className="min-h-screen bg-[#F3F4F6] text-black selection:bg-[#FACC15]/40 font-bold uppercase overflow-x-hidden">
      
      <div className="mt-[88px]" />

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        
        {/* Header Architecture (Audit Recap State) */}
        <header className="border-b-8 border-black pb-16 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-black text-white shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
                  <Brain className="w-8 h-8" />
               </div>
               <span className="text-xs font-black uppercase tracking-[0.4em] text-black/40">AI Agent (Chatbot)</span>
            </div>
            <h1 className="text-6xl md:text-[80px] font-black tracking-tighter leading-none text-black">
               AI Guide For Career
            </h1>
            <p className="text-xl md:text-3xl text-black/40 font-black tracking-tighter uppercase mt-2">
               Active Career Sync
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end max-w-md">
            {['Salary Benchmarks', 'Role Suggestions', 'Visual Roadmap', 'India Market'].map(t => (
              <span key={t} className="px-4 py-2 bg-white border-4 border-black text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] tracking-widest italic">{t}</span>
            ))}
          </div>
        </header>

        {/* Main Interface Area */}
        <div className="bg-white border-8 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] space-y-12">
           {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 grayscale">
                <div className="w-16 h-16 bg-[#A855F7] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                   <Sparkles className="w-8 h-8 text-white" />
                </div>
                 <div className="space-y-4">
                    <h2 className="text-5xl font-black uppercase tracking-tighter italic">Strategist</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-xl mx-auto">Hi! I am your DreamSync AI Guide. How can I help you today? I can help you find tools, fix issues, or explore career paths.</p>
                 </div>
             </div>
           ) : (
             <div className="space-y-12 min-h-[400px]">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} />
                ))}
                {loading && (
                  <div className="flex gap-6">
                     <div className="w-12 h-12 bg-[#2563EB] border-4 border-black animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                     </div>
                     <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] flex items-center gap-4">
                        <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                        <p className="text-lg font-black italic uppercase animate-pulse">Syncing with 2026 Job Nodes...</p>
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
              <div className="flex items-center gap-3 text-black/40">
                 <MessageSquare className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">OR TRY ASKING</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} className="p-4 bg-white border-4 border-black text-[10px] font-black uppercase hover:bg-gray-100 transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
                  <button onClick={() => setMessages([])} className="p-4 border-4 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <RotateCcw className="w-6 h-6" />
                  </button>
                )}
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="p-6 bg-[#2563EB] text-white border-4 border-black hover:-translate-x-1 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:grayscale disabled:opacity-50"
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
