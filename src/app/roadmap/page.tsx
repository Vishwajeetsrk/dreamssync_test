'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Briefcase, ExternalLink, Book, Video, 
  GraduationCap, Box, CheckCircle, ArrowRight, ShieldCheck,
  Star, Download, Printer, Wrench, Zap, Globe, TrendingUp, Search, Loader2
} from 'lucide-react';
import { validateCareerInput } from '@/lib/aiGuard';

export default function Roadmap() {
  const [steps, setSteps] = useState<any[]>([]);
  const [totalTimeline, setTotalTimeline] = useState<string>('');
  const [globalPrerequisites, setGlobalPrerequisites] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ role: 'Frontend Developer', experience: 'Beginner', goal: '' });
  const [safetyError, setSafetyError] = useState<{ message: string, alternatives: string[] } | null>(null);

  const generateRoadmap = async () => {
    if (!query.role) return alert("ROLE REDACTED. FIELD MANDATORY.");
    
    const safety = validateCareerInput(query.role);
    if (!safety.allowed) {
      setSafetyError({ 
        message: safety.message, 
        alternatives: [
          "Software Developer", 
          "Data Scientist", 
          "UI/UX Designer", 
          "Product Manager", 
          "Cybersecurity Analyst (Ethical)"
        ] 
      });
      return;
    }

    setLoading(true);
    setSafetyError(null);

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 400 && data.error === 'Safety Violation') {
          setSafetyError({ 
            message: data.details, 
            alternatives: ["Software Developer", "Data Scientist", "UI/UX Designer"] 
          });
          return;
        }
        throw new Error(data.error || "GENERATION PROTOCOL FAILED");
      }
      
      setSteps(data.timeline || []);
      setTotalTimeline(data.totalTimeline || '');
      setGlobalPrerequisites(data.globalPrerequisites || null);
    } catch (err: any) {
      alert("CRITICAL ERROR: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => window.print();

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black selection:bg-[#FACC15]/40 font-bold uppercase overflow-x-hidden">
      
      <div className="mt-[88px]" />

      <div className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Header Architecture (Audit Recap State) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b-8 border-black pb-16 mb-20 no-print">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-black text-white shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
                    <Map className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.4em] text-black/40">Career Roadmap</span>
              </div>
              <h1 className="text-6xl md:text-[100px] font-black tracking-tighter leading-none text-black">
                  Path
              </h1>
           </div>
           
           <div className="neo-box bg-white p-10 space-y-8 min-w-[400px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-[#2563EB]">Target Career Node</label>
                 <input type="text" value={query.role} onChange={e => setQuery({...query, role: e.target.value})} className="neo-input text-lg" placeholder="e.g. DATA SCIENTIST" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-black/40">Experience</label>
                    <select value={query.experience} onChange={e => setQuery({...query, experience: e.target.value})} className="neo-input text-xs">
                       <option>Beginner</option>
                       <option>Intermediate</option>
                    </select>
                 </div>
                 <div className="flex items-end">
                    <button onClick={generateRoadmap} disabled={loading} className="neo-btn-primary w-full py-4 text-xs">
                       {loading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'PLOT PATH'}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Dynamic Content Buffer */}
        <AnimatePresence mode="wait">
          {steps.length === 0 && !loading && !safetyError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="text-center py-40 border-8 border-dashed border-black/10 flex flex-col items-center gap-8 grayscale">
               <Search className="w-24 h-24" />
               <p className="text-4xl font-black uppercase tracking-tighter italic">Enter Target Node to Architect Path</p>
            </motion.div>
          )}

          {safetyError && (
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="neo-box bg-red-100 border-red-600 p-16 max-w-3xl mx-auto shadow-[10px_10px_0px_0px_rgba(220,38,38,1)]">
              <div className="flex items-center gap-8 mb-10 border-b-4 border-red-600 pb-8">
                <ShieldCheck className="w-16 h-16 text-red-600" strokeWidth={3} />
                <h2 className="text-4xl font-black text-red-600 uppercase italic">Safety violation</h2>
              </div>
              <p className="text-xl font-bold text-red-900 mb-10 uppercase tracking-tight leading-tight">{safetyError.message}</p>
              
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60">Authorized Alternatives:</p>
                <div className="flex flex-wrap gap-4">
                  {safetyError.alternatives.map(alt => (
                    <button key={alt} onClick={() => { setQuery({...query, role: alt}); setSafetyError(null); }} className="px-6 py-3 bg-white border-4 border-black font-black text-xs uppercase hover:bg-[#FACC15] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-40 space-y-10">
               <div className="w-32 h-32 border-8 border-black border-t-[#2563EB] animate-spin shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]"></div>
               <p className="text-2xl font-black uppercase tracking-widest animate-pulse italic">Synthesizing Professional Timeline...</p>
            </motion.div>
          )}

          {steps.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
              
              {/* Journey Stats (Audit Recap State) */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="neo-box bg-[#FACC15] p-8 border-black flex items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   <div className="p-3 bg-black text-white">
                      <Zap className="w-8 h-8 fill-current" />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Estimated Protocol Duration</span>
                      <h2 className="text-3xl font-black uppercase italic">{totalTimeline}</h2>
                   </div>
                </div>
                <button onClick={handleDownload} className="neo-btn-secondary px-12 py-6 text-xl flex items-center gap-4 no-print shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                   <Download className="w-8 h-8" /> DOWNLOAD ARCHIVE (PDF)
                </button>
              </div>

              {/* Global Prerequisites (Audit Recap State) */}
              {globalPrerequisites && (
                <div className="neo-box bg-white p-16 border-black space-y-10 shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
                  <h2 className="text-3xl font-black flex items-center gap-6 border-b-6 border-black pb-6 uppercase italic">
                    <GraduationCap className="w-10 h-10 text-[#2563EB]" /> Core Prerequisites
                  </h2>
                  <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#2563EB]">Academic Baseline</h3>
                      <p className="text-xl font-bold leading-tight">{globalPrerequisites.education}</p>
                    </div>
                    <div className="space-y-6 text-nowrap">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#2563EB]">Technical Requirements</h3>
                      <div className="flex flex-wrap gap-4">
                        {globalPrerequisites.technicalSkills?.map((s: string) => (
                          <span key={s} className="px-6 py-2 bg-[#F3F4F6] border-4 border-black text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Architecture */}
              <div className="relative border-l-8 border-black ml-4 md:ml-12 pl-12 md:pl-20 space-y-32 py-20">
                {steps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative neo-box bg-white p-12 border-black group hover:shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] transition-all">
                    
                    {/* Timeline Node Infrastructure */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-[5.7rem] w-12 h-12 border-8 border-black bg-white z-10 group-hover:bg-[#FACC15] transition-colors" />
                    <div className="absolute top-1/2 -translate-y-1/2 -left-16 w-16 h-4 bg-black -z-10 group-hover:bg-[#FACC15]/20 transition-colors" />

                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                      <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                          <div className="flex items-center gap-6">
                            <div className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
                               {step.time}
                            </div>
                            {step.skillsToLearn && (
                              <div className="flex gap-2">
                                 {step.skillsToLearn.slice(0, 2).map((s: string) => <span key={s} className="text-[10px] font-black text-[#2563EB]"># {s}</span>)}
                              </div>
                            )}
                          </div>
                          <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{step.title}</h3>
                          <p className="text-xl font-bold text-black/60 leading-snug uppercase">{step.desc}</p>
                        </div>

                        {step.phasePrerequisites?.length > 0 && (
                          <div className="bg-[#F3F4F6] border-4 border-black p-8 italic shadow-inner">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#2563EB]">GATEWAY REQUIREMENTS</h4>
                            <ul className="grid md:grid-cols-2 gap-4">
                              {step.phasePrerequisites.map((p: string) => (
                                <li key={p} className="flex gap-4 text-xs font-black uppercase italic">
                                   <div className="w-2 h-2 mt-1 shrink-0 bg-black" /> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Resource Nodes */}
                      <div className="w-full lg:w-[450px] shrink-0 space-y-10">
                        {step.studyMaterials && step.studyMaterials.length > 0 && (
                          <div className="space-y-6">
                             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-black/30 flex items-center gap-4">
                               <Book className="w-5 h-5 text-black" /> LIBRARIES
                             </h4>
                             <div className="space-y-4">
                               {step.studyMaterials.map((link: any, idx: number) => (
                                 <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border-4 border-black hover:bg-[#FACC15] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none group">
                                   <div className="flex justify-between items-center mb-2">
                                     <h5 className="text-sm font-black uppercase italic">{link.label}</h5>
                                     <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                   </div>
                                   <p className="text-[10px] font-bold text-black/40 leading-relaxed uppercase">{link.summary}</p>
                                 </a>
                               ))}
                             </div>
                          </div>
                        )}

                        {step.videoLectures && step.videoLectures.length > 0 && (
                          <div className="space-y-6">
                             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-red-600 flex items-center gap-4">
                               <Video className="w-5 h-5" /> BROADCASTS
                             </h4>
                             <div className="space-y-4">
                               {step.videoLectures.map((link: any, idx: number) => (
                                 <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border-4 border-black hover:bg-red-50 transition-all shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)] hover:shadow-none group">
                                   <div className="flex justify-between items-center mb-2">
                                     <h5 className="text-sm font-black uppercase italic text-red-600">{link.label}</h5>
                                     <ExternalLink className="w-4 h-4 text-red-600" />
                                   </div>
                                 </a>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @media print {
          .no-print, header, .marquee-neo, .journey-box, .neo-btn-secondary { display: none !important; }
          body { background: white !important; }
          .neo-box { box-shadow: none !important; border: 2px solid black !important; }
          .min-h-screen { min-height: 0 !important; }
          .py-20 { padding: 40px 0 !important; }
          .border-l-8 { border-left-width: 4px !important; }
        }
      `}</style>
    </div>
  );
}
