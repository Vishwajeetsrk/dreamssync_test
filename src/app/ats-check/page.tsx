'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, Download, 
  ExternalLink, ChevronDown, ChevronUp, Briefcase, BarChart3, Globe, 
  Printer, FileDown, Zap, ShieldCheck, ArrowRight, TrendingUp, Search
} from 'lucide-react';
import Link from 'next/link';

interface CompanyResult {
  company: string;
  eligibility: 'Eligible' | 'Partially Eligible' | 'Not Eligible';
  score: number;
  reasons: string[];
  missing_skills: string[];
  suggestions: string[];
}

interface AnalysisResult {
  ats_score: number;
  keyword_match: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  improvement_suggestions: string[];
  company_eligibility: CompanyResult[];
  improved_resume_markdown: string;
  _provider?: string;
}

export default function AdvancedATS() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('FILE SIZE EXCEEDS SYSTEM BUFFER (MAX 5MB)');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const analyzeResume = async () => {
    if (!file || !jobRole) {
      setError('PROTOCOL REQUIRE RESUME UPLOAD AND TARGET ROLE.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobRole', jobRole);
    formData.append('jobDescription', jobDescription);
    formData.append('experienceLevel', experienceLevel);

    try {
      const res = await fetch('/api/ats-advanced', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'ANALYSIS PROTOCOL FAILED');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Eligible': return 'bg-green-500 text-white';
      case 'Partially Eligible': return 'bg-[#FACC15] text-black';
      case 'Not Eligible': return 'bg-red-600 text-white';
      default: return 'bg-black text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black selection:bg-[#FACC15]/40 font-bold uppercase">
      
      <div className="mt-[88px]" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Header Architecture */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b-8 border-black pb-16 mb-20">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-black text-white shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
                    <BarChart3 className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.4em] text-black/40">Professional ATS Engine</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-none text-black uppercase">
                 Smart <br /> <span className="text-[#2563EB] drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] italic">Analyzer</span>
              </h1>
           </div>
           <div className="hidden lg:block">
           </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Input Panel */}
          <div className="neo-box bg-white p-12 space-y-12">
            <h2 className="text-3xl font-black mb-10 flex items-center gap-4">
              <Search className="w-8 h-8 text-[#2563EB]" /> INPUT PROTOCOL
            </h2>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">1. UPLOAD RESUME NODE (PDF)</label>
                <div className="relative group">
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`p-12 border-4 border-dashed border-black ${file ? 'bg-green-50' : 'bg-[#F3F4F6]'} flex flex-col items-center justify-center transition-all shadow-[inset_0px_0px_20px_rgba(0,0,0,0.05)]`}>
                    <Upload className={`w-12 h-12 mb-4 ${file ? 'text-green-600' : 'text-black/20'}`} />
                    <p className="text-lg font-black text-center uppercase tracking-tight">
                      {file ? file.name : 'COMMIT FILE TO BUFFER'}
                    </p>
                    <p className="text-[10px] text-black/40 mt-2 font-black uppercase tracking-widest">TEXT-BASED PDF • 5MB LIMIT</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">2. TARGET JOB ROLE</label>
                <input type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g. SENIOR FRONTEND DEVELOPER" className="neo-input" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">3. EXPERIENCE LEVEL</label>
                  <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="neo-input">
                    <option>Fresher</option>
                    <option>1-3 Years</option>
                    <option>3-5 Years</option>
                    <option>5-10 Years</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={analyzeResume} disabled={loading || !file || !jobRole} className="neo-btn-primary w-full py-6 text-xl">
                    {loading ? <Loader2 className="animate-spin w-8 h-8" /> : 'Scan'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">4. JOB DESCRIPTION (OPTIONAL)</label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="PASTE JD BUFFER FOR PRECISION_MATCH" rows={6} className="neo-input min-h-[150px] py-6 leading-relaxed" />
              </div>
            </div>

            {error && (
              <div className="bg-red-600 text-white p-6 border-4 border-black flex gap-6 items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="w-8 h-8 shrink-0" />
                <p className="font-black italic uppercase tracking-tight">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Analysis Output */}
          <div className="space-y-12">
            {!result && !loading && (
              <div className="h-full neo-box bg-white/50 border-dashed p-20 flex flex-col items-center justify-center text-center opacity-20 grayscale">
                <BarChart3 className="w-24 h-24 mb-6" />
                <p className="text-4xl font-black uppercase tracking-tighter">Analysis Locked</p>
                <p className="text-sm font-black mt-4">Perform scan to evaluate candidate eligibility</p>
              </div>
            )}

            {loading && (
              <div className="neo-box bg-white p-20 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-10">
                   <Loader2 className="w-24 h-24 animate-spin text-[#2563EB] absolute inset-0" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-[#FACC15] fill-current animate-pulse" />
                   </div>
                </div>
                <h2 className="text-5xl font-black mb-4 uppercase italic">AI SCANNING...</h2>
                <div className="mt-12 w-full h-4 bg-[#F3F4F6] border-4 border-black overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="bg-[#2563EB] h-full w-1/2" />
                </div>
                <p className="mt-8 font-black text-black/40 text-xs tracking-[0.3em]">SYNCHRONIZING WITH GOOGLE, MICROSOFT, META RECRUITER API</p>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                {/* Score Panel */}
                <div className="bg-black text-white p-12 border-8 border-black shadow-[12px_12px_0px_0px_rgba(37,99,235,0.4)] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                      <ShieldCheck className="w-32 h-32" />
                   </div>
                   <div className="relative z-10 flex justify-between items-center">
                      <div className="space-y-4">
                         <h2 className="text-2xl font-black uppercase tracking-tighter">ATS PROTOCOL SCORE</h2>
                         <div className="flex gap-4">
                            <div className="bg-white/10 px-6 py-2 border border-white/20 text-xs font-black">MATCH: {result.keyword_match}%</div>
                            <div className="bg-white/10 px-6 py-2 border border-white/20 text-xs font-black">EXPERIENCE: {experienceLevel}</div>
                         </div>
                      </div>
                      <div className={`text-4xl sm:text-5xl md:text-7xl font-black px-6 py-4 border-8 border-white italic ${result.ats_score > 80 ? 'text-green-400' : 'text-[#FACC15]'}`}>
                         {result.ats_score}%
                      </div>
                   </div>
                </div>

                {/* Eligibility Matrix */}
                <div className="neo-box bg-white p-10 space-y-8">
                   <h2 className="text-3xl font-black flex items-center gap-4 border-b-6 border-black pb-6 mb-10 uppercase italic">
                      <Globe className="w-8 h-8 text-[#2563EB]" /> Eligibility Matrix
                   </h2>
                   <div className="space-y-6">
                      {result.company_eligibility.map((comp) => (
                        <div key={comp.company} className="border-4 border-black group overflow-hidden">
                           <button onClick={() => setExpandedCompany(expandedCompany === comp.company ? null : comp.company)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 bg-white transition-all">
                              <div className="flex items-center gap-6">
                                 <div className={`px-4 py-1 text-[10px] font-black uppercase border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] ${getStatusColor(comp.eligibility)}`}>
                                    {comp.eligibility}
                                 </div>
                                 <span className="text-2xl font-black tracking-tighter">{comp.company}</span>
                              </div>
                              {expandedCompany === comp.company ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
                           </button>
                           {expandedCompany === comp.company && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="p-10 bg-gray-50 border-t-4 border-black overflow-hidden space-y-8">
                                 <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                       <h4 className="text-xs font-black uppercase text-[#2563EB] tracking-widest border-b-2 border-black pb-2">Analysis Findings</h4>
                                       <ul className="space-y-4">
                                          {comp.reasons.map((r, i) => (
                                             <li key={i} className="flex gap-4 text-xs font-black leading-tight italic">
                                                <div className="w-2 h-2 mt-1 shrink-0 bg-green-500 rounded-full border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]" /> {r}
                                             </li>
                                          ))}
                                       </ul>
                                    </div>
                                    <div className="space-y-4">
                                       <h4 className="text-xs font-black uppercase text-red-600 tracking-widest border-b-2 border-black pb-2">Missing Capabilities</h4>
                                       <div className="flex flex-wrap gap-3">
                                          {comp.missing_skills.map((s, i) => (
                                             <span key={i} className="bg-red-600 text-white border-2 border-black px-4 py-1 text-[10px] font-black shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                                {s}
                                             </span>
                                          ))}
                                       </div>
                                       <div className="mt-10 p-6 bg-[#FACC15]/20 border-4 border-[#FACC15] border-dashed text-xs font-black italic">
                                          STRATEGY: {comp.suggestions[0]}
                                       </div>
                                    </div>
                                 </div>
                              </motion.div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
