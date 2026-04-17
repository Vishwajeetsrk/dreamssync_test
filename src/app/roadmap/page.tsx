'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Briefcase, ExternalLink, Book, Video, 
  GraduationCap, Box, CheckCircle, ArrowRight, ShieldCheck,
  Star, Download, Printer, Wrench, Zap, Globe, TrendingUp, Search, Loader2, FileText
} from 'lucide-react';
import { validateCareerInput } from '@/lib/aiGuard';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Link, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function Roadmap() {
  const [steps, setSteps] = useState<any[]>([]);
  const [totalTimeline, setTotalTimeline] = useState<string>('');
  const [globalPrerequisites, setGlobalPrerequisites] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [realJobRoles, setRealJobRoles] = useState<any[]>([]);
  const [criticalIntelligence, setCriticalIntelligence] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<string>('');
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
      setMarketInsights(data.marketInsights || null);
      setRealJobRoles(data.realJobRoles || []);
      setCriticalIntelligence(data.criticalIntelligence || null);
      setTargetRole(data.targetRole || '');
    } catch (err: any) {
      alert("CRITICAL ERROR: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => window.print();

  const handleDownloadDocx = async () => {
    if (steps.length === 0) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "DREAMSYNC CAREER ROADMAP", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `Target Role: ${targetRole || query.role}`, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Estimated Duration: ${totalTimeline}`, heading: HeadingLevel.HEADING_3 }),
          
          new Paragraph({ text: "CORE PREREQUISITES", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
          new Paragraph({ text: `Education: ${globalPrerequisites?.education || 'N/A'}` }),
          new Paragraph({ text: `Technical Skills: ${globalPrerequisites?.technicalSkills?.join(', ') || 'N/A'}` }),
          new Paragraph({ text: `Core Knowledge: ${globalPrerequisites?.requiredKnowledge?.join(', ') || 'N/A'}` }),

          ...steps.flatMap((step, i) => [
            new Paragraph({ text: `${step.title} (${step.time})`, heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
            new Paragraph({ text: step.desc }),
            new Paragraph({ text: "PROJECT MISSION:", heading: HeadingLevel.HEADING_4 }),
            new Paragraph({ text: step.build || 'N/A' }),
            new Paragraph({ text: "RESOURCES:", heading: HeadingLevel.HEADING_4 }),
            ...(step.studyMaterials || []).map((m: any) => new Paragraph({ text: `• ${m.label}: ${m.url}`, bullet: { level: 0 } })),
            ...(step.videoLectures || []).map((v: any) => new Paragraph({ text: `• [VIDEO] ${v.label}: ${v.url}`, bullet: { level: 0 } }))
          ]),

          new Paragraph({ text: "MARKET INSIGHTS", heading: HeadingLevel.HEADING_2, spacing: { before: 600 } }),
          new Paragraph({ text: `India Avg Salary: ${marketInsights?.salaryIndia}` }),
          new Paragraph({ text: `Global Ceiling: ${marketInsights?.salaryGlobal}` }),
          new Paragraph({ text: `Market Demand: ${marketInsights?.demandLevel}` }),
          
          new Paragraph({ text: "CRITICAL INTELLIGENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
          new Paragraph({ text: "What Actually Matters:", heading: HeadingLevel.HEADING_4 }),
          new Paragraph({ text: criticalIntelligence?.whatMatters || 'N/A' }),
          new Paragraph({ text: "Mistakes to Avoid:", heading: HeadingLevel.HEADING_4 }),
          new Paragraph({ text: criticalIntelligence?.mistakesToAvoid || 'N/A' }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `DreamSync_Roadmap_${(targetRole || query.role).replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-32 sm:pt-40 pb-20 px-4 md:px-12 text-black selection:bg-[#FACC15]/40 font-bold uppercase overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Architecture (Audit Recap State) */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b-8 border-black pb-16 mb-20 no-print">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-black text-white shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
                    <Map className="w-8 h-8" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-[0.4em] text-black/40">Career Roadmap</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-none text-black uppercase">
                  Career Roadmap
              </h1>
           </div>
           
           <div className="neo-box bg-white p-6 md:p-10 space-y-8 min-w-full md:min-w-[400px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase text-[#2563EB]">Target Career Goal</label>
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
                       {loading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'START'}
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
               <p className="text-4xl font-black uppercase tracking-tighter italic">Define Career Goal to Generate Your Roadmap</p>
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
                 <div className="flex flex-wrap gap-4 no-print shrink-0">
                    <button onClick={handleDownloadPDF} className="neo-btn-secondary px-8 py-4 text-xs flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
                       <Download className="w-5 h-5" /> EXPORT PDF
                    </button>
                    <button onClick={handleDownloadDocx} className="neo-btn-secondary px-8 py-4 text-xs flex items-center gap-3 bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                       <FileText className="w-5 h-5" /> EXPORT WORD
                    </button>
                 </div>
              </div>

              {/* Global Prerequisites (Audit Recap State) */}
              {globalPrerequisites && (
                <div className="neo-box p-6 sm:p-12 bg-white space-y-10 border-black border-b-6 shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
                  <h2 className="text-3xl font-black flex items-center gap-6 border-b-6 border-black pb-6 uppercase italic">
                    <GraduationCap className="w-10 h-10 text-[#2563EB]" /> Core Prerequisites
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#2563EB]">Academic Baseline</h3>
                      <p className="text-xl font-bold leading-tight">{globalPrerequisites.education}</p>
                    </div>
                    {globalPrerequisites.requiredKnowledge && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#2563EB]">Core Knowledge</h3>
                        <div className="flex flex-wrap gap-2">
                          {globalPrerequisites.requiredKnowledge.map((k: string) => (
                            <span key={k} className="text-xs font-bold uppercase tracking-tight text-black flex items-center gap-2">
                              <Box className="w-3 h-3" /> {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-6">
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
              <div className="relative border-l-4 md:border-l-8 border-black ml-2 md:ml-12 pl-6 md:pl-20 space-y-16 md:space-y-32 py-10 md:py-20">
                {steps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative neo-box bg-white p-6 md:p-12 border-black group hover:shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] transition-all">
                    
                    {/* Timeline Node Infrastructure */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-[1.75rem] md:-left-[5.7rem] w-8 h-8 md:w-12 md:h-12 border-4 md:border-8 border-black bg-white z-10 group-hover:bg-[#FACC15] transition-colors" />
                    <div className="absolute top-1/2 -translate-y-1/2 -left-8 md:-left-16 w-8 md:w-16 h-2 md:h-4 bg-black -z-10 group-hover:bg-[#FACC15]/20 transition-colors" />

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
                          <h3 className="text-4xl md:text-7xl font-black tracking-tight leading-none text-[#111827] uppercase italic leading-none">{step.title}</h3>
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

                        {step.build && (
                          <div className="bg-[#FACC15]/20 border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-black">PROJECT MISSION</h4>
                            <div className="flex items-start gap-4">
                              <div className="p-2 bg-black text-white"><CheckCircle className="w-5 h-5" /></div>
                              <p className="text-sm font-black uppercase italic tracking-tight">{step.build}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Resource Nodes */}
                      <div className="w-full lg:w-[450px] shrink-0 space-y-10">
                        {step.studyMaterials && step.studyMaterials.length > 0 && (
                          <div className="space-y-6">
                             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-black/30 flex items-center gap-4">
                               <Book className="w-5 h-5 text-black" /> Free Course
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
                               <Video className="w-5 h-5" /> Video
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

                        {step.preparationTools && step.preparationTools.length > 0 && (
                          <div className="space-y-6">
                             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#2563EB] flex items-center gap-4">
                               <Wrench className="w-5 h-5" /> Preparation Tools link
                             </h4>
                             <div className="space-y-4">
                               {step.preparationTools.map((link: any, idx: number) => (
                                 <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border-4 border-black hover:bg-blue-50 transition-all shadow-[4px_4px_0px_0px_rgba(37,99,235,0.2)] hover:shadow-none group">
                                   <div className="flex justify-between items-center mb-2">
                                     <h5 className="text-sm font-black uppercase italic text-[#2563EB]">{link.label}</h5>
                                     <ExternalLink className="w-4 h-4 text-[#2563EB]" />
                                   </div>
                                   {link.summary && <p className="text-[10px] font-bold text-black/40 leading-relaxed uppercase mt-2">{link.summary}</p>}
                                 </a>
                               ))}
                             </div>
                          </div>
                        )}

                        {step.aiTools && step.aiTools.length > 0 && (
                          <div className="space-y-6">
                             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-purple-600 flex items-center gap-4">
                               <Zap className="w-5 h-5" /> AI Tools
                             </h4>
                             <div className="space-y-4">
                               {step.aiTools.map((link: any, idx: number) => (
                                 <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border-4 border-black hover:bg-purple-50 transition-all shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] hover:shadow-none group">
                                   <div className="flex justify-between items-center mb-2">
                                     <h5 className="text-sm font-black uppercase italic text-purple-600">{link.label}</h5>
                                     <ExternalLink className="w-4 h-4 text-purple-600" />
                                   </div>
                                   {link.summary && <p className="text-[10px] font-bold text-black/40 leading-relaxed uppercase mt-2">{link.summary}</p>}
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

              {/* POST-JOURNEY INTELLIGENCE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20">
                 {/* Market Stats */}
                 {marketInsights && (
                   <div className="neo-box bg-[#F3F4F6] p-10 space-y-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
                      <h4 className="text-xl font-black uppercase italic border-b-4 border-black pb-4">Market Stats</h4>
                      <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-black text-black/40 uppercase">India Avg Salary</p>
                            <p className="text-2xl font-black">{marketInsights.salaryIndia}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-black/40 uppercase">Global Ceiling</p>
                            <p className="text-2xl font-black">{marketInsights.salaryGlobal}</p>
                         </div>
                         <div className={`px-4 py-2 border-2 border-black inline-block ${marketInsights.demandLevel === 'High' ? 'bg-green-400' : 'bg-yellow-400'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black">DEMAND: {marketInsights.demandLevel}</p>
                         </div>
                      </div>
                   </div>
                 )}

                 {/* Real Job Roles */}
                 <div className="md:col-span-2 neo-box bg-white p-10 space-y-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h4 className="text-xl font-black uppercase italic border-b-4 border-black pb-4">Industry Roles & Targets</h4>
                    <div className="grid sm:grid-cols-2 gap-8">
                       {realJobRoles.map((job, idx) => (
                         <div key={idx} className="space-y-3">
                            <h5 className="font-black text-lg uppercase">{job.title}</h5>
                            <p className="text-xs text-[#2563EB] font-black">@ {job.companies}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{job.skills}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Critical Intelligence */}
              {criticalIntelligence && (
                 <div className="neo-box bg-black text-white p-16 space-y-12 shadow-[12px_12px_0px_0px_rgba(250,204,21,1)]">
                    <div className="flex items-center gap-6 border-b-4 border-white/20 pb-8">
                       <ShieldCheck className="w-12 h-12 text-[#FACC15]" />
                       <h3 className="text-4xl font-black uppercase italic text-[#FACC15]">Critical Intelligence</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-16">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2563EB]">What Actually Matters</h4>
                          <p className="text-sm font-bold leading-relaxed">{criticalIntelligence.whatMatters}</p>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Mistakes To Avoid</h4>
                          <p className="text-sm font-bold leading-relaxed">{criticalIntelligence.mistakesToAvoid}</p>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Hiring Protocol</h4>
                          <p className="text-sm font-bold leading-relaxed">{criticalIntelligence.hiringTips}</p>
                       </div>
                    </div>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @media print {
          .no-print, header, .marquee-neo, .journey-box, .neo-btn-secondary, button { display: none !important; }
          body { background: white !important; color: black !important; }
          .neo-box { box-shadow: none !important; border: 1px solid black !important; background: white !important; }
          .min-h-screen { min-height: 0 !important; }
          .py-20 { padding: 40px 0 !important; }
          .border-l-8 { border-left-width: 2px !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          /* Filter out emojis or complex graphics for clean ATS-friendly look */
          svg:not(.w-5) { display: none !important; }
          .bg-black { background-color: #000 !important; color: #fff !important; }
          .bg-[#FACC15] { background-color: #eee !important; color: #000 !important; }
          .text-[#2563EB] { color: #000 !important; font-weight: bold !important; text-decoration: underline !important; }
        }
      `}</style>
    </div>
  );
}
