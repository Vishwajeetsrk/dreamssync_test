'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, ChevronDown, ChevronUp,
  TrendingUp, Target, Star, MessageSquare, Key, AlertCircle,
  User, Briefcase, BookOpen, Award, RotateCcw, ExternalLink,
  PenLine, FileText, Wrench, Building2, GraduationCap, Trophy, Sliders,
  Upload, Search, Loader2, CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe
} from 'lucide-react';
import Link from 'next/link';
import { validateCareerInput } from '@/lib/aiGuard';

// --- Types ---
interface HeadlineOption { text: string; focus: string; }
interface ConnectionMessage { occasion: string; message: string; }
interface Improvement { area: string; priority: 'high' | 'medium' | 'low'; action: string; }
interface LinkedInResult {
  profileScore: number;
  scoreBreakdown: { headline: number; about: number; skills: number; experience: number; completeness: number; };
  headlines: HeadlineOption[];
  about: { optimized: string; tips: string[]; };
  skills: { recommended: string[]; toRemove: string[]; reason: string; };
  connectionMessages: ConnectionMessage[];
  keyImprovements: Improvement[];
  seoKeywords: string[];
  aiAnalysisSummary: string[];
  whatToAdd: { add: string[]; improve: string[] };
  freeResources: { label: string; links: { title: string; url: string; platform: string }[] }[];
  groupedSkills: { category: string; items: string[] }[];
}

// --- Copy Button ---
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] ${copied ? 'bg-teal-500 border-slate-900 text-white' : 'bg-white border-slate-900 text-slate-900 hover:bg-slate-50'}`}>
      {copied ? <><Check className="w-3.5 h-3.5" /> COPIED</> : <><Copy className="w-3.5 h-3.5" /> COPY DATA</>}
    </button>
  );
}

// --- Score Ring ---
function ScoreRing({ score, label, max = 100 }: { score: number; label: string; max?: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? '#14b8a6' : pct >= 40 ? '#2563eb' : '#64748b';
  const r = 28; const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="square" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-slate-900">{score}<span className="text-[8px] opacity-40">/{max}</span></span>
        </div>
      </div>
      <span className="text-[8px] font-black text-slate-400 text-center uppercase tracking-widest leading-none">{label}</span>
    </div>
  );
}

// --- Collapsible Section ---
function Section({ title, icon: Icon, badge, children, defaultOpen = false }: { title: string; icon: any; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border-4 border-slate-900 neo-box overflow-hidden shadow-[8px_8px_0px_0px_#F1F5F9]">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 border-2 border-slate-900 text-white shadow-[4px_4px_0px_0px_#0F172A]"><Icon className="w-4 h-4" /></div>
          <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">{title}</h3>
          {badge && <span className="px-3 py-1 bg-teal-500 border-2 border-slate-900 text-white text-[9px] font-black uppercase tracking-widest flex items-center">{badge}</span>}
        </div>
        {open ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-5 pt-0 border-t-2 border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Component ---
export default function LinkedInOptimizer() {
  const [form, setForm] = useState({
    targetRole: '',
    currentRole: '',
    currentHeadline: '',
    currentAbout: '',
    skills: '',
    experience: '',
    education: '',
    achievements: '',
    tone: 'professional' as 'professional' | 'creative' | 'technical' | 'friendly',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<LinkedInResult | null>(null);
  const [error, setError] = useState('');
  const [selectedHeadline, setSelectedHeadline] = useState(0);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/resume-parse', { method: 'POST', body: formData });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setForm({
        targetRole: d.personalInfo?.role || '',
        currentRole: d.experience?.[0]?.role || '',
        currentHeadline: `${d.personalInfo?.role} | ${d.skills?.map((s:any) => s.items).slice(0,3).join(' | ')}`,
        currentAbout: d.summary || '',
        skills: d.skills?.map((s:any) => s.items).join(', ') || '',
        experience: d.experience?.map((e:any) => `${e.role} @ ${e.company} - ${e.bullets[0]}`).join('\n') || '',
        education: d.education?.[0]?.school || '',
        achievements: d.achievements?.join(', ') || '',
        tone: 'professional'
      });
    } catch (err: any) {
      setError("Parsing failed: " + err.message);
    } finally { setIsParsing(false); }
  };

  const handleGenerate = async () => {
    if (!form.targetRole.trim()) { setError('Please enter your target role.'); return; }
    
    // 1. Safety Guard
    const safetyInput = `${form.targetRole} ${form.currentAbout}`;
    const safety = validateCareerInput(safetyInput);
    if (!safety.allowed) {
      setError(safety.message);
      return;
    }

    setIsGenerating(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-slate-900 bg-white text-sm font-black uppercase tracking-tight focus:outline-none focus:bg-slate-50 transition-all placeholder:text-slate-200 placeholder:italic";
  const textareaCls = inputCls + " resize-none";
  const labelCls = "block text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2";

  const priorityColor = (p: string) => p === 'high' ? 'bg-red-50 text-red-900 border-slate-900 shadow-[4px_4px_0px_0px_#ef4444]' : p === 'medium' ? 'bg-blue-50 text-blue-900 border-slate-900 shadow-[4px_4px_0px_0px_#2563EB]' : 'bg-slate-50 text-slate-600 border-slate-900 shadow-[4px_4px_0px_0px_#94a3b8]';

  const totalScore = result?.profileScore ?? 0;
  const scoreColor = totalScore >= 70 ? 'text-teal-600' : totalScore >= 40 ? 'text-blue-600' : 'text-slate-600';
  const scoreBg = totalScore >= 70 ? 'bg-teal-50 border-teal-200' : totalScore >= 40 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200';

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header */}
      <header className="border-b-4 border-slate-900 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-600 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A]">
            <svg className="w-8 h-8 text-white fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-slate-900 uppercase">LinkedIn Optimization</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Elevating your professional digital synergy</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Profile Score', 'Strategic Headlines', 'Engagement About', 'Industry Skills', 'Networking Templates', 'SEO Synergy'].map(feat => (
            <span key={feat} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-200 rounded-full uppercase tracking-tighter">{feat}</span>
          ))}
        </div>
      </header>

      {/* INPUT FORM */}
      <div className="bg-white border-4 border-slate-900 neo-box p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 border-2 border-slate-900"><User className="w-4 h-4 text-white" /></div>
             <div>
               <h2 className="text-2xl font-black uppercase text-slate-900">Profile Synergy</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect your history for AI optimization.</p>
             </div>
          </div>
          <div className="flex-1 flex gap-3 w-full md:w-auto">
             <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 text-white font-black uppercase text-[10px] border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0F172A] cursor-pointer hover:shadow-none transition-all">
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isParsing ? "PARSING..." : "UPLOAD RESUME"}
                <input type="file" hidden accept=".pdf" onChange={handleImportResume} />
             </label>
             <button onClick={() => setForm({ ...form, targetRole: '' })} className="flex-1 py-3 bg-white text-slate-900 font-black uppercase text-[10px] border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0F172A] hover:shadow-none transition-all">
                MANUAL ENTRY
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Required */}
          <div>
            <label className={labelCls}><Target className="w-3.5 h-3.5 inline mr-1" /> Target Role <span className="text-red-500">*</span></label>
            <input value={form.targetRole} onChange={set('targetRole')} className={inputCls} placeholder="e.g. Full Stack Developer, Data Scientist" />
          </div>
          <div>
            <label className={labelCls}><Briefcase className="w-3.5 h-3.5 inline mr-1" /> Current Role / Title</label>
            <input value={form.currentRole} onChange={set('currentRole')} className={inputCls} placeholder="e.g. Software Engineer at TCS" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}><PenLine className="w-3.5 h-3.5 inline mr-1" /> Current LinkedIn Headline</label>
            <input value={form.currentHeadline} onChange={set('currentHeadline')} className={inputCls} placeholder="e.g. CS Student | Java | Python | Looking for Opportunities" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}><FileText className="w-3.5 h-3.5 inline mr-1" /> Current LinkedIn About Section</label>
            <textarea value={form.currentAbout} onChange={set('currentAbout')} className={textareaCls} rows={4} placeholder="Paste your current About/Summary section here. Leave blank if you don't have one yet." />
          </div>
          <div className="col-span-2">
            <label className={labelCls}><Wrench className="w-3.5 h-3.5 inline mr-1" /> Your Skills (comma separated)</label>
            <input value={form.skills} onChange={set('skills')} className={inputCls} placeholder="React, Node.js, Python, SQL, AWS, Docker..." />
          </div>
          <div className="col-span-2">
            <label className={labelCls}><Building2 className="w-3.5 h-3.5 inline mr-1" /> Work Experience / Internships</label>
            <textarea value={form.experience} onChange={set('experience')} className={textareaCls} rows={3} placeholder="SDE Intern at Google (6 months) - Worked on backend APIs using Go and reduced latency by 30%..." />
          </div>
          <div>
            <label className={labelCls}><GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Education</label>
            <input value={form.education} onChange={set('education')} className={inputCls} placeholder="B.Tech CSE, VIT University (2020-2024)" />
          </div>
          <div>
            <label className={labelCls}><Trophy className="w-3.5 h-3.5 inline mr-1" /> Achievements</label>
            <input value={form.achievements} onChange={set('achievements')} className={inputCls} placeholder="Hackathon winner, Open source contributor..." />
          </div>
          <div className="col-span-2">
            <label className={labelCls}><Sliders className="w-3.5 h-3.5 inline mr-1" /> Synergy Tone / Directive</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['professional', 'technical', 'creative', 'friendly'] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tone: t }))}
                  className={`p-4 border-2 font-black text-[10px] uppercase tracking-widest transition-all italic ${form.tone === t ? 'border-slate-900 bg-blue-600 text-white shadow-[4px_4px_0px_0px_#0F172A]' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-900'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-red-800 font-medium text-sm">{error}</p>
          </div>
        )}

        <button onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-4 bg-slate-900 text-white font-black text-lg border-4 border-black shadow-[5px_5px_0px_0px_#2563EB] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#2563EB] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
          {isGenerating ? (
            <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> SYNCHRONIZING PROFILE...</>
          ) : (
            <><Sparkles className="w-5 h-5 text-teal-400" /> OPTIMIZE SYNERGY</>
          )}
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* AI Analysis Summary */}
          <div className="bg-slate-900 text-white border-4 border-slate-900 p-8 md:p-12 neo-box shadow-[12px_12px_0px_0px_#2563EB]">
             <div className="flex items-center gap-4 mb-10">
                <Zap className="w-8 h-8 text-teal-400 fill-teal-400 ring-4 ring-teal-400/20 rounded-full" />
                <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Strategic Identity Audit</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   {result.aiAnalysisSummary?.map((s, i) => (
                     <p key={i} className="flex gap-4 text-[11px] font-black text-slate-100 uppercase tracking-widest leading-relaxed">
                        <ArrowRight className="w-5 h-5 text-teal-400 shrink-0" /> <span className="pt-0.5">{s}</span>
                     </p>
                   ))}
                </div>
                <div className="bg-white text-slate-900 p-8 border-4 border-slate-900 rotate-1 shadow-[8px_8px_0px_0px_#2563EB]">
                   <h4 className="font-black text-xs uppercase mb-6 underline decoration-4 decoration-teal-500 underline-offset-8">INTEGRATION DIRECTIVES</h4>
                   <ul className="space-y-4">
                      {result.whatToAdd?.add.map((a, i) => <li key={i} className="text-[10px] font-black uppercase flex gap-4 text-blue-600"><span className="text-teal-500">▶</span> {a}</li>)}
                      {result.whatToAdd?.improve.map((im, i) => <li key={i} className="text-[10px] font-black opacity-40 uppercase flex gap-4"><span className="text-slate-300">📈</span> {im}</li>)}
                   </ul>
                </div>
             </div>
          </div>

          {/* Score Banner */}
          <div className={`border-4 border-slate-900 p-8 neo-box flex flex-col md:flex-row items-center gap-8 ${scoreBg} shadow-[12px_12px_0px_0px_#F1F5F9]`}>
            <div className="text-center bg-white p-6 border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0F172A]">
              <div className={`text-8xl font-black tracking-tighter italic ${scoreColor}`}>{result.profileScore}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">IDENTITY RATING</div>
              <div className="mt-3 text-[10px] font-black uppercase italic tracking-widest bg-slate-900 text-white px-2 py-1">{totalScore >= 70 ? 'ADVANCED' : totalScore >= 40 ? 'STRATEGIC' : 'FOUNDATIONAL'}</div>
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Vocalized Identity Metric</h2>
              <p className="text-slate-400 text-sm font-black uppercase tracking-tight">Audit completed across 5 mission-critical dimensions. Higher rating correlates with recruiter signal detection.</p>
              <div className="flex flex-wrap gap-6 justify-start">
                {Object.entries(result.scoreBreakdown).map(([k, v]) => (
                  <ScoreRing key={k} score={v} label={k} max={20} />
                ))}
              </div>
            </div>
            <button onClick={() => { setResult(null); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all self-start italic">
              <RotateCcw className="w-4 h-4" /> Identity Audit
            </button>
          </div>

          {/* Key Improvements */}
          {result.keyImprovements?.length > 0 && (
            <Section title="Synergy Action Plan" icon={Target} badge={`${result.keyImprovements.filter(i => i.priority === 'high').length} CRITICAL`} defaultOpen>
              <div className="space-y-6 pt-8">
                {result.keyImprovements.map((item, i) => (
                  <div key={i} className={`flex items-start gap-4 p-6 border-4 flex-col sm:flex-row ${priorityColor(item.priority)}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_#0F172A] shrink-0">{item.priority}</span>
                    <div className="space-y-2">
                      <p className="font-black text-sm uppercase italic tracking-tight">{item.area}</p>
                      <p className="text-[11px] font-black uppercase opacity-60 leading-none">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Headlines */}
          <Section title="Strategic Headlines" icon={Star} badge="3 ITERATIONS" defaultOpen>
            <div className="space-y-6 pt-8">
              {result.headlines?.map((h, i) => (
                <div key={i} onClick={() => setSelectedHeadline(i)}
                  className={`p-6 border-4 cursor-pointer transition-all neo-box ${selectedHeadline === i ? 'border-slate-900 bg-blue-600 text-white shadow-[8px_8px_0px_0px_#0F172A]' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-900 shadow-[4px_4px_0px_0px_#F1F5F9]'}`}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`w-8 h-8 flex items-center justify-center text-[10px] font-black border-2 ${selectedHeadline === i ? 'bg-white border-slate-900 text-blue-600 shadow-[2px_2px_0px_0px_#0F172A]' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>{i + 1}</span>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedHeadline === i ? 'text-white' : 'text-slate-300'}`}>{h.focus}</span>
                      </div>
                      <p className="font-black text-lg sm:text-xl tracking-tighter uppercase italic leading-none">{h.text}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${selectedHeadline === i ? 'text-blue-100' : 'text-slate-300'}`}>{h.text.length} / 220 CHARACTER METRIC</p>
                    </div>
                    <div className="shrink-0">
                      <CopyButton text={h.text} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* About Section */}
          <Section title="Optimized About Section" icon={User} defaultOpen>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed bg-gray-50 border-2 border-gray-200 p-5 rounded-lg text-gray-800">{result.about?.optimized}</pre>
                <div className="absolute top-3 right-3">
                  <CopyButton text={result.about?.optimized || ''} />
                </div>
              </div>
              {result.about?.tips?.length > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                  <p className="font-bold text-blue-900 mb-2 text-sm">💡 Pro Tips for your About section:</p>
                  <ul className="space-y-1">
                    {result.about.tips.map((tip, i) => <li key={i} className="text-sm text-blue-800 flex gap-2"><span>•</span>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {/* Skills Cluster Optimization */}
          <Section title="Intelligence-Driven Skills" icon={TrendingUp}>
            <div className="space-y-6 pt-4">
              <p className="text-sm text-gray-600 font-medium">{result.skills?.reason}</p>
              
              {result.groupedSkills && result.groupedSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.groupedSkills.map((group, idx) => (
                    <div key={idx} className="bg-gray-50 border-2 border-black p-4 space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#0A66C2]">{group.category}</p>
                       <div className="flex flex-wrap gap-2">
                          {group.items.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-black text-[10px] font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">{item}</span>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm mb-2 text-green-700">✅ Recommended Core Addition</p>
                  <div className="flex flex-wrap gap-2">
                    {result.skills?.recommended?.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border-2 border-green-300 rounded-full text-sm font-bold text-green-800">
                        {s} <CopyButton text={s} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.skills?.toRemove?.filter(Boolean).length > 0 && (
                <div className="pt-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest mb-2 text-red-600 opacity-60">Low-Impact Skills (Consider Removing)</p>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.toRemove.filter(Boolean).map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 border border-red-200 rounded text-[10px] font-medium text-red-400 line-through italic">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* SEO Keywords */}
          <Section title="LinkedIn SEO Keywords" icon={Key}>
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-3 font-medium">Use these keywords naturally in your headline, about, and experience sections to appear in more recruiter searches.</p>
              <div className="flex flex-wrap gap-2">
                {result.seoKeywords?.map((k, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 border-2 border-purple-200 text-purple-800 font-bold text-sm rounded">
                    #{k} <CopyButton text={k} />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Connection Messages */}
          <Section title="Networking Directives" icon={MessageSquare}>
            <div className="space-y-6 pt-8">
              {result.connectionMessages?.map((msg, i) => (
                <div key={i} className="border-4 border-slate-900 p-8 neo-box bg-slate-50 shadow-[8px_8px_0px_0px_#F1F5F9] group">
                   <div className="flex items-center justify-between mb-6">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-white border-2 border-slate-900 px-3 py-1 shadow-[3px_3px_0px_0px_#0F172A]">{msg.occasion}</span>
                     <CopyButton text={msg.message} />
                   </div>
                   <p className="text-sm font-black text-slate-900 uppercase italic leading-relaxed tracking-tight group-hover:text-blue-600 transition-colors">"{msg.message}"</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Skill Forge & Resources */}
          <Section title="Skill Forge & Resources" icon={Award} badge="Free Learning">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
               {result.freeResources?.map((res, i) => (
                 <div key={i} className="bg-[#FACC15]/10 border-4 border-black p-5 space-y-4">
                    <p className="font-black text-sm uppercase tracking-wider border-b-2 border-black pb-2">{res.label}</p>
                    <div className="space-y-2">
                       {res.links.map((l, li) => (
                         <Link key={li} href={l.url} target="_blank" className="flex items-center justify-between p-3 bg-white border-2 border-black text-xs font-black hover:translate-x-1 transition-all">
                            {l.title} <span className="opacity-40">{l.platform}</span>
                         </Link>
                       ))}
                    </div>
                 </div>
               ))}
               <div className="bg-blue-600 text-white p-6 border-4 border-black flex flex-col justify-center items-center text-center gap-3">
                  <Globe className="w-10 h-10" />
                  <p className="text-lg font-black uppercase tracking-tighter">One-Click Apply Ready</p>
                  <p className="text-[10px] font-bold opacity-80 uppercase">Optimization standard based on 2026 hiring trends verified.</p>
               </div>
            </div>
          </Section>
        </motion.div>
      )}
    </div>
  );
}
