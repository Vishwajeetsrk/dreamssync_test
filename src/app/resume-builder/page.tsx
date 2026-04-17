'use client';

import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, Download, Printer, User, Briefcase, 
  GraduationCap, Palette, Layout, Save, Sparkles, Send, FileText, Award,
  Fingerprint, Zap, Coffee, ArrowRight, CheckCircle2, AlertCircle, BarChart3, Info, Upload, ShieldCheck,
  Search, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink, BorderStyle } from 'docx';
import ResumePreview, { ResumeData } from '@/components/ResumePreview';
import { calculateATSScore, ATSAnalysis } from '@/lib/atsScore';

const DEFAULT_RESUME: ResumeData = {
  personalInfo: {
    fullName: "VASHNAVI CHAUHAN",
    role: "Frontend Developer",
    email: "vashnavichauhan1@gmail.com",
    phone: "+91 9174403667",
    location: "Bengaluru, India",
    linkedin: "vashnavichauhan18",
    github: "vashnavichauhan18",
    portfolio: "vashnavi.dev"
  },
  summary: "Self-taught Frontend Engineer with hands-on production experience in modern JavaScript frameworks. Proven track record in developing scalable frontend features and optimizing web performance for high-growth startups.",
  skills: [
    { category: "Languages & Frameworks", items: "Javascript, Typescript, Python, HTML, CSS" },
    { category: "Frontend Technologies", items: "Vue, React, React Native, Nuxt, Tailwind CSS, MUI" },
    { category: "State Management", items: "Redux Toolkit, Pinia, Vuex, Zustand" },
    { category: "Backend & Tools", items: "Node.js, Express.js, MongoDB, Flask, Docker, D3.js" }
  ],
  experience: [
    {
      company: "Rapid Rocket",
      role: "Frontend Developer (Freelance)",
      location: "Remote",
      date: "Sep 2025 – Present",
      bullets: [
        "Built scalable frontend features using React.js and Next.js, driving significant UX improvements across the platform.",
        "Improved web performance through advanced frontend optimization and efficient rendering strategies, resulting in faster load times.",
        "Collaborated with cross-functional teams to integrate new features and maintain high code quality standards."
      ]
    },
    {
      company: "Aiseberg - AiseDiscovery",
      role: "Senior Frontend Engineer",
      location: "Bengaluru, India",
      date: "Jan 2025 – Jul 2025",
      bullets: [
        "Developed a real-time chat interface in React TSX, significantly enhancing user engagement metrics.",
        "Optimized list virtualization with TanStack Virtual and Redux Toolkit, contributing to a 40–50% activation rate among demo users.",
        "Integrated D3 tree chart with custom SCSS styling, reducing UI development time by 30% for data visualization components."
      ]
    },
    {
      company: "PropVR 3D Squareyards",
      role: "Frontend Developer (SDE-1)",
      location: "Bengaluru, India",
      date: "Nov 2022 – Dec 2024",
      bullets: [
        "Collaborated with a 12-member team on the PropVR metaverse project, boosting project delivery efficiency by 20%.",
        "Led full-stack development of propvr.ai, achieving significant improvements in SEO rankings and user retention.",
        "Implemented robust security measures, enhancing overall application security posture by 50% through strict policy enforcement."
      ]
    }
  ],
  education: [
    {
      school: "Delhi University",
      degree: "B.A Hons Political Science",
      location: "New Delhi",
      date: "2019 – 2022"
    }
  ],
  projects: [
    {
      name: "Metaverse Real Estate",
      link: "propvr.ai",
      description: "Implemented high-performance 3D visualization for real estate properties using proprietary rendering engines."
    }
  ],
  achievements: [
    "RNR Certificate in Software Development",
    "Blog: Securing Web: A Deep Dive into Content Security Policy (CSP)",
    "Blog: Understanding Cookie Security: Best Practices for Developers"
  ],
  languages: ["English", "Hindi"],
  certifications: [],
  extra: "Passionate about web security and technical blogging."
};

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(DEFAULT_RESUME);
  const [template, setTemplate] = useState<'elite' | 'strategic' | 'modern'>('modern');
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [isParsing, setIsParsing] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const startAnalysis = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      const result = calculateATSScore(data);
      setAtsAnalysis(result);
      setScanStatus('complete');
    }, 2000);
  };

  // Debounced ATS Calculation
  React.useEffect(() => {
    if (scanStatus === 'complete') {
        const result = calculateATSScore(data);
        setAtsAnalysis(result);
    }
  }, [data]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${data.personalInfo.fullName.replace(/\s/g, '_')}_Resume`,
  });

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/resume-parse', {
        method: 'POST',
        body: formData,
      });
      const parsedData = await res.json();
      if (!res.ok) throw new Error(parsedData.error);
      
      const formattedData: ResumeData = {
        ...parsedData,
        projects: parsedData.projects || [],
        achievements: parsedData.achievements || [],
        languages: parsedData.languages || [],
        certifications: parsedData.certifications || [],
        extra: parsedData.extra || ""
      };
      
      setData(formattedData);
    } catch (err: any) {
      console.error(err);
      alert("Failed to parse resume: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const generateWordDoc = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: data.personalInfo.fullName.toUpperCase(), heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: data.personalInfo.role, alignment: AlignmentType.CENTER }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${data.personalInfo.phone} | ${data.personalInfo.email} | ${data.personalInfo.location}`)] }),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({ text: "PROFESSIONAL SUMMARY", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }),
          new Paragraph({ text: data.summary }),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({ text: "WORK EXPERIENCE", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }),
          ...data.experience.flatMap(exp => [
            new Paragraph({ children: [new TextRun({ text: exp.role, bold: true }), new TextRun({ text: ` | ${exp.company}`, bold: true }), new TextRun({ text: `\t${exp.date}`, bold: false })] }),
            ...exp.bullets.map(bullet => new Paragraph({ text: bullet, bullet: { level: 0 } }))
          ]),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({ text: "TECHNICAL SKILLS", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }),
          ...data.skills.map(skill => new Paragraph({ children: [new TextRun({ text: `${skill.category}: `, bold: true }), new TextRun(skill.items)] })),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({ text: "TECHNICAL PROJECTS", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }),
          ...(data.projects || []).flatMap(proj => [new Paragraph({ children: [new TextRun({ text: proj.name, bold: true }), new TextRun({ text: proj.link ? ` (${proj.link})` : "", color: "2563EB" })] }), new Paragraph({ text: proj.description })]),
          new Paragraph({ text: "", spacing: { before: 200 } }),
          new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }),
          ...data.education.map(edu => new Paragraph({ children: [new TextRun({ text: edu.school, bold: true }), new TextRun(` | ${edu.degree}\t${edu.date}`)] })),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${data.personalInfo.fullName.replace(/\s/g, '_')}_Resume.docx`);
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const updateSummary = (value: string) => {
    setData(prev => ({ ...prev, summary: value }));
  };

  const updateSkill = (index: number, field: 'category' | 'items', value: string) => {
    const newSkills = [...data.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setData(prev => ({ ...prev, skills: [...prev.skills, { category: "", items: "" }] }));
  };

  const removeSkill = (index: number) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExperience = [...data.experience];
    (newExperience[index] as any)[field] = value;
    setData(prev => ({ ...prev, experience: newExperience }));
  };

  const addExperience = () => {
    setData(prev => ({ ...prev, experience: [...prev.experience, { company: "", role: "", location: "", date: "", bullets: [""] }] }));
  };

  const removeExperience = (index: number) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const updateEdu = (index: number, field: string, value: string) => {
    const newEdu = [...data.education];
    (newEdu[index] as any)[field] = value;
    setData(prev => ({ ...prev, education: newEdu }));
  };

  const updateArrayField = (field: 'achievements' | 'languages', index: number, value: string) => {
    const newArr = [...(data[field] || [])];
    newArr[index] = value;
    setData(prev => ({ ...prev, [field]: newArr }));
  };

  const addArrayItem = (field: 'achievements' | 'languages') => {
    setData(prev => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  };

  const updateProjects = (index: number, field: string, value: string) => {
    const newProjects = [...(data.projects || [])];
    (newProjects[index] as any)[field] = value;
    setData(prev => ({ ...prev, projects: newProjects }));
  };

  const updateCert = (index: number, field: string, value: string) => {
    const newCerts = [...(data.certifications || [])];
    (newCerts[index] as any)[field] = value;
    setData(prev => ({ ...prev, certifications: newCerts }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F3F4F6] text-black selection:bg-[#FACC15]/40 overflow-x-hidden">
      
      {/* Sidebar - Neo-Brutalist Form Editor */}
      <aside className="w-full lg:w-[500px] bg-white border-b-8 lg:border-r-8 lg:border-b-0 border-black p-6 md:p-10 space-y-12 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.05)] lg:h-screen lg:overflow-y-auto">
        
        <header className="space-y-2 border-b-4 border-black pb-8">
           <div className="flex items-center gap-3 text-[#2563EB]">
              <FileText className="w-8 h-8" />
              <h1 className="text-3xl font-black uppercase tracking-tighter italic">Resume Builder</h1>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Professional Tier AI Generator</p>
        </header>


        {/* 🚀 ELITE TEMPLATE SELECTOR (TOP) */}
        <section className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black border-b-4 border-black pb-4 flex items-center justify-between">
            SELECT TEMPLATE <Sparkles className="w-4 h-4 text-[#FACC15] fill-current" />
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { 
                id: 'elite', 
                name: 'Elite Product Pro', 
                desc: 'Best for top tech companies.', 
                focus: 'Focus: Showing your scores and results.',
                color: 'hover:bg-purple-50',
                accent: 'bg-purple-600'
              },
              { 
                id: 'strategic', 
                name: 'Strategic Project Pro', 
                desc: 'Great for building your first big projects.', 
                focus: 'Focus: High clarity.',
                color: 'hover:bg-blue-50',
                accent: 'bg-[#2563EB]'
              },
              { 
                id: 'modern', 
                name: 'Modern Job Pro', 
                desc: 'Standard style for all careers.', 
                focus: 'Focus: Passing auto-screening systems.',
                color: 'hover:bg-emerald-50',
                accent: 'bg-emerald-600'
              }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as any)}
                className={`w-full text-left p-5 border-4 transition-all relative group ${
                  template === t.id 
                  ? 'border-black bg-white shadow-none translate-x-1 translate-y-1' 
                  : 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                } ${t.color}`}
              >
                {template === t.id && <div className={`absolute top-0 left-0 w-2 h-full ${t.accent}`} />}
                <div className="flex justify-between items-start mb-1">
                   <h3 className="text-xs font-black uppercase tracking-tighter">{t.name}</h3>
                   {template === t.id && <CheckCircle2 className="w-4 h-4 text-[#FACC15] fill-black" />}
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight mb-2">{t.desc}</p>
                <div className="pt-2 border-t border-dashed border-gray-100">
                   <p className="text-[9px] font-black text-[#2563EB] uppercase tracking-widest italic">{t.focus}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Action Protocol Panel */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="neo-box p-6 md:p-8 bg-gray-100 text-black space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
        >
           <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-3">
              <Zap className="w-4 h-4 fill-current animate-pulse" /> EXPORT & IMPORT PROTOCOL
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <button 
                onClick={handlePrint} 
                className="w-full bg-white text-black border-2 border-black py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#FACC15] hover:scale-[1.03] active:bg-[#2563EB] active:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                 <Printer className="w-5 h-5" /> PDF
              </button>
              <button 
                onClick={generateWordDoc} 
                className="w-full bg-white text-black border-2 border-black py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#FACC15] hover:scale-[1.03] active:bg-[#2563EB] active:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                 <FileText className="w-5 h-5" /> DOCX
              </button>
           </div>
           
           <div className="pt-2">
              <label className="w-full bg-white border-2 border-black hover:border-[#2563EB] py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FACC15] transition-all">
                 <Upload className="w-5 h-5 text-[#2563EB]" /> {isParsing ? 'PARSING...' : 'IMPORT RESUME PDF'}
                 <input type="file" hidden accept=".pdf" onChange={handleImportPdf} />
              </label>
           </div>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-12">
          
          {/* Section: Personal Info */}
          <section className="space-y-8">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
              <User className="w-6 h-6 text-[#2563EB]" /> PERSONAL DETAILS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Full Name</label>
                  <input value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} className="neo-input" placeholder="Vashnavi Chauhan" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Target Role</label>
                  <input value={data.personalInfo.role} onChange={(e) => updatePersonalInfo('role', e.target.value)} className="neo-input" placeholder="Frontend Developer" />
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Email Address</label>
                  <input type="email" value={data.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} className="neo-input" placeholder="vashnavichauhan1@gmail.com" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Phone Number</label>
                  <input value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} className="neo-input" placeholder="+91 9174403667" />
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">LinkedIn Profile</label>
                  <input value={data.personalInfo.linkedin} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} className="neo-input" placeholder="vashnavichauhan18" />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/40">GitHub</label>
                  <input value={data.personalInfo.github} onChange={(e) => updatePersonalInfo('github', e.target.value)} className="neo-input" placeholder="vashnavichauhan18" />
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Portfolio Website</label>
                <input value={data.personalInfo.portfolio || ''} onChange={(e) => updatePersonalInfo('portfolio', e.target.value)} className="neo-input" placeholder="vashnavi.dev" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Current Location</label>
                <input value={data.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} className="neo-input" placeholder="Bengaluru, India" />
              </div>
            </div>
          </section>

          {/* Section: Summary */}
          <section className="space-y-8">
            <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-4 border-b-4 border-black pb-4">
              <FileText className="w-6 h-6 text-[#2563EB]" /> PROFESSIONAL SUMMARY
            </h2>
            <textarea 
              value={data.summary}
              onChange={(e) => updateSummary(e.target.value)}
              className="neo-input min-h-[140px] leading-relaxed py-6 text-sm"
              placeholder="Self-taught Frontend Engineer with hands-on production experience..."
            />
          </section>

          {/* Section: Skills */}
          <section className="space-y-8">
            <div className="flex justify-between items-center border-b-4 border-black pb-4">
               <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-4 text-black">
                 <Zap className="w-6 h-6 text-[#2563EB]" /> SKILLS
               </h2>
               <button onClick={addSkill} className="p-2 bg-black text-white hover:bg-[#2563EB] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
               {data.skills.map((skill, idx) => (
                 <div key={idx} className="bg-white border-2 border-black p-4 space-y-3 relative group">
                    <input value={skill.category} onChange={(e) => updateSkill(idx, 'category', e.target.value)} placeholder="Category" className="neo-input text-[10px] font-black" />
                    <textarea value={skill.items} onChange={(e) => updateSkill(idx, 'items', e.target.value)} placeholder="Items (comma separated)" className="neo-input text-[10px] min-h-[60px]" />
                    <button onClick={() => removeSkill(idx)} className="absolute -top-2 -right-2 bg-white border-2 border-black p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                 </div>
               ))}
            </div>
          </section>

          {/* Section: Experience */}
          <section className="space-y-8">
            <div className="flex justify-between items-center border-b-4 border-black pb-4">
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-4 text-black">
                <Briefcase className="w-6 h-6 text-[#2563EB]" /> EXPERIENCE
              </h2>
              <button onClick={addExperience} className="p-2 bg-black text-white hover:bg-[#2563EB] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><Plus className="w-5 h-5" /></button>
            </div>
            {data.experience.map((exp, idx) => (
              <div key={idx} className="bg-white border-2 border-black p-6 relative group space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <input value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} placeholder="Role" className="neo-input text-[10px]" />
                   <input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} placeholder="Company" className="neo-input text-[10px]" />
                </div>
                <div className="space-y-3">
                   {exp.bullets.map((bullet, bIdx) => (
                     <div key={bIdx} className="flex gap-2">
                        <textarea value={bullet} onChange={(e) => {
                          const newBullets = [...exp.bullets];
                          newBullets[bIdx] = e.target.value;
                          updateExperience(idx, 'bullets', newBullets);
                        }} className="neo-input text-[10px] min-h-[50px] py-3" placeholder="Bullet point..." />
                     </div>
                   ))}
                   <button onClick={() => updateExperience(idx, 'bullets', [...exp.bullets, ""])} className="text-[10px] font-black text-[#2563EB] uppercase text-xs hover:underline">+ Add Point</button>
                </div>
                <button onClick={() => removeExperience(idx)} className="absolute -top-3 -right-3 bg-white border-2 border-black p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </section>

          {/* Section: Technical Projects */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-black">
                📂 TECHNICAL PROJECTS
              </h2>
              <button onClick={() => setData(prev => ({ ...prev, projects: [...(prev.projects || []), { name: "", link: "", description: "" }] }))} className="text-[#2563EB]"><Plus className="w-5 h-5" /></button>
            </div>
            {(data.projects || []).map((proj, idx) => (
              <div key={idx} className="bg-white border-2 border-black p-6 relative group space-y-4">
                 <input value={proj.name} onChange={(e) => updateProjects(idx, 'name', e.target.value)} placeholder="Project Name" className="neo-input text-[10px]" />
                 <textarea value={proj.description} onChange={(e) => updateProjects(idx, 'description', e.target.value)} placeholder="Description" className="neo-input text-[10px] min-h-[80px]" />
                 <button onClick={() => setData(prev => ({ ...prev, projects: prev.projects?.filter((_, i) => i !== idx) }))} className="absolute -top-3 -right-3 bg-white border-2 border-black p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </section>

        </div>
        
      </aside>

      {/* Main Preview Region */}
      <main className="flex-1 bg-gray-200 p-6 md:p-12 lg:p-20 flex justify-center relative overflow-y-auto lg:h-screen">
         <div className="w-full max-w-[850px] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] h-fit mb-20 md:mb-0">
            <ResumePreview data={data} template={template} ref={componentRef} />
         </div>
      </main>
    </div>
  );
}
