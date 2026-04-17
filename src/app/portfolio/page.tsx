'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, Trash2, Download, ChevronRight, ChevronLeft,
  Sparkles, Monitor, Eye, Code2, Check, ArrowRight, Palette,
  User, Briefcase, BookOpen, FolderKanban, Award,
  Upload, Loader2, Linkedin, Github, ExternalLink
} from 'lucide-react';
import { validateCareerInput } from '@/lib/aiGuard';

// ---------- TYPES ----------
interface Project { topic: string; points: string; website: string; }
interface Course { topic: string; points: string; link: string; }
interface WorkExp { title: string; company: string; points: string; startDate: string; endDate: string; isInternship: boolean; }

// ---------- THEME CONFIG ----------
const THEMES = [
  {
    id: 'minimal-dev',
    name: 'Minimal Dev',
    desc: 'Clean • Editorial • Professional',
    preview: { bg: '#FFFFFF', accent: '#000000', text: '#111111', card: '#F9FAFB' },
    gradient: 'from-gray-100 to-white',
    border: 'border-gray-200',
  },
  {
    id: 'neo-brutalism',
    name: 'Neo-Brutalism',
    desc: 'Bold • Expressive • Unforgettable',
    preview: { bg: '#FFFBF5', accent: '#FFE500', text: '#111111', card: '#FFE500' },
    gradient: 'from-yellow-50 to-pink-50',
    border: 'border-black',
  },
  {
    id: 'glass-dark',
    name: 'Glass Dark',
    desc: 'Premium • Immersive • Futuristic',
    preview: { bg: '#0D0D1A', accent: '#8B5CF6', text: '#FFFFFF', card: '#1A1A2E' },
    gradient: 'from-violet-950 to-slate-900',
    border: 'border-violet-500/30',
  },
  {
    id: 'data-pro',
    name: 'Data Pro',
    desc: 'Innovation • Analytics • Creative',
    preview: { bg: '#667eea', accent: '#FACC15', text: '#FFFFFF', card: '#FFFFFF20' },
    gradient: 'from-[#667eea] to-[#764ba2]',
    border: 'border-white/20',
  },
];

const STEPS = [
  { id: 1, label: 'Your Info', icon: User },
  { id: 2, label: 'Theme', icon: Palette },
  { id: 3, label: 'Portfolio Details', icon: FolderKanban },
  { id: 4, label: 'Generate', icon: Sparkles },
];

// ---------- COMPONENT ----------
export default function PortfolioGenerator() {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('minimal-dev');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [genError, setGenError] = useState('');
  const [genProgress, setGenProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activePreview, setActivePreview] = useState(false);

  // Basic Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [summary, setSummary] = useState('');
  const [achievements, setAchievements] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Dynamic arrays
  const [projects, setProjects] = useState<Project[]>([{ topic: '', points: '', website: '' }]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [workExp, setWorkExp] = useState<WorkExp[]>([]);

  // Helpers
  const addProject = () => setProjects(p => [...p, { topic: 'New Project', points: '', website: '' }]);
  const removeProject = (i: number) => setProjects(p => p.filter((_, idx) => idx !== i));
  const updateProject = (i: number, f: keyof Project, v: string) => setProjects(p => p.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const addCourse = () => setCourses(c => [...c, { topic: '', points: '', link: '' }]);
  const removeCourse = (i: number) => setCourses(c => c.filter((_, idx) => idx !== i));
  const updateCourse = (i: number, f: keyof Course, v: string) => setCourses(c => c.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const addWork = () => setWorkExp(w => [...w, { title: '', company: '', points: '', startDate: '', endDate: '', isInternship: false }]);
  const removeWork = (i: number) => setWorkExp(w => w.filter((_, idx) => idx !== i));
  const updateWork = (i: number, f: keyof WorkExp, v: string | boolean) => setWorkExp(w => w.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePortfolio = async () => {
    // 1. Safety Guard
    const safetyInput = `${targetRole} ${summary}`;
    const safety = validateCareerInput(safetyInput);
    if (!safety.allowed) {
      setGenError(safety.message);
      return;
    }

    setIsGenerating(true);
    setGenError('');
    try {
      const projectsStr = projects.filter(p => p.topic).map(p =>
        `${p.topic}: ${p.points}${p.website ? ` | Link: ${p.website}` : ''}`).join('\n');
      const coursesStr = courses.filter(c => c.topic).map(c =>
        `${c.topic}: ${c.points}${c.link ? ` | Certificate: ${c.link}` : ''}`).join('\n');
      const expStr = workExp.filter(w => w.title).map(w =>
        `${w.isInternship ? '[Internship]' : '[Work]'} ${w.title} @ ${w.company} (${w.startDate}–${w.endDate || 'Present'}): ${w.points}`).join('\n');

      const progressInterval = setInterval(() => {
        setGenProgress(p => p < 90 ? p + 2 : p);
      }, 500);

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: selectedTheme,
          data: {
            fullName, email, phone, targetRole, skills, education,
            languages, linkedin, github, summary, achievements, hobbies,
            projects: projectsStr,
            courses: coursesStr,
            experience: expStr,
            profileImage,
          },
        }),
      });
      clearInterval(progressInterval);
      setGenProgress(100);
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Generation failed');
      setGeneratedHtml(resData.html);
      setStep(4);
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

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
      setFullName(d.personalInfo?.fullName || '');
      setTargetRole(d.personalInfo?.role || '');
      setEmail(d.personalInfo?.email || '');
      setPhone(d.personalInfo?.phone || '');
      setLinkedin(d.personalInfo?.linkedin || '');
      setGithub(d.personalInfo?.github || '');
      setSummary(d.summary || '');
      setEducation(d.education?.[0]?.school + ' — ' + d.education?.[0]?.degree || '');
      setSkills(d.skills?.map((s:any) => s.items).join(', ') || '');
      setWorkExp(d.experience?.map((e:any) => ({
        title: e.role, company: e.company, points: e.bullets.join('\n'),
        startDate: e.date?.split('–')[0]?.trim() || '',
        endDate: e.date?.split('–')[1]?.trim() || '',
        isInternship: e.role.toLowerCase().includes('intern')
      })) || []);
      setProjects(d.projects?.map((p:any) => ({ topic: p.name, points: p.description, website: p.link || '' })) || []);
      setStep(2);
    } catch (err: any) {
      setGenError("Parsing failed: " + err.message);
    } finally { setIsParsing(false); }
  };

  const aiEnhanceContent = async () => {
    setIsEnhancing(true);
    // Mimic AI enhancement locally for bio and projects
    const enhancedSummary = `Accomplished ${targetRole} with expertise in building scalable, high-performance applications. Specialized in ${skills?.split(',').slice(0,3).join(', ') || 'innovative solutions'} to drive user engagement and engineering excellence.`;
    setSummary(enhancedSummary);
    setProjects(p => p.map(px => ({ ...px, points: px.points.includes('Improved') ? px.points : `Spearheaded development of ${px.topic}, achieving 40% improvement in load efficiency using ${skills?.split(',')[0] || 'modern tech'}. ${px.points}` })));
    setTimeout(() => setIsEnhancing(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fullName || 'portfolio'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = "w-full px-3 py-2.5 border-2 border-black/20 bg-white rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";
  const textareaCls = inputCls + " resize-none";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  // ---- GENERATED STATE ----
  if (generatedHtml && step === 4) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
        {/* Success Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 border-4 border-black p-8 neo-box text-white">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black">Portfolio Generated! 🎉</h2>
              </div>
              <p className="text-green-100 font-medium">Your premium portfolio is ready. Download and host it anywhere — Vercel, Netlify, or GitHub Pages.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-3 bg-white text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm">
                <Download className="w-4 h-4" /> Download HTML
              </button>
              <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-5 py-3 bg-black text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:translate-y-1 transition-all text-sm">
                <Eye className="w-4 h-4" /> {showPreview ? 'Hide' : 'Live'} Preview
              </button>
              <button onClick={() => { setGeneratedHtml(''); setStep(1); }} className="flex items-center gap-2 px-5 py-3 bg-white/20 text-white font-bold border-2 border-white/40 hover:bg-white/30 transition-all text-sm rounded-lg">
                ← Start Over
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-4 border-black neo-box overflow-hidden"
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              <div className="bg-gray-900 border-b-4 border-black p-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 flex-1 bg-gray-800 rounded px-3 py-1 text-xs font-mono text-gray-300 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  dreamsync://preview/{fullName.toLowerCase().replace(/\s+/g, '-') || 'portfolio'}.html
                </div>
                <button onClick={handleDownload} className="ml-2 flex items-center gap-1 text-xs font-bold px-3 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors">
                  <Download className="w-3 h-3" /> Save
                </button>
              </div>
              <iframe srcDoc={generatedHtml} className="w-full bg-white" style={{ height: '85vh' }} title="Portfolio Preview" sandbox="allow-scripts allow-popups" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to Deploy */}
        <div className="bg-white border-4 border-black p-6 neo-box">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Monitor className="w-5 h-5" /> Deploy Your Portfolio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Vercel', icon: '▲', steps: ['Download your .html file', 'Go to vercel.com/new', 'Drop the file or import from GitHub', 'Live in 30 seconds!'] },
              { name: 'Netlify', icon: '◆', steps: ['Download your .html file', 'Go to netlify.com', 'Drag & drop the file', 'Get free .netlify.app URL'] },
              { name: 'GitHub Pages', icon: '■', steps: ['Create a repo named username.github.io', 'Upload your .html as index.html', 'Enable Pages in Settings', 'Free custom domain!'] },
            ].map(host => (
              <div key={host.name} className="border-2 border-black p-4 bg-gray-50">
                <p className="font-black text-lg mb-3">{host.icon} {host.name}</p>
                <ol className="space-y-1">
                  {host.steps.map((s, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="font-bold text-primary shrink-0">{i+1}.</span>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- THEME PREVIEW BUILDER (Live) ----
  const currentPreviewData = {
    fullName, email, phone, targetRole, skills, education,
    languages, linkedin, github, summary, achievements, hobbies,
    projects, courses, workExp
  };

  return (
    <div className={`mx-auto space-y-8 transition-all px-4 sm:px-6 ${activePreview ? 'max-w-[100vw]' : 'max-w-4xl'}`}>
      {/* Header */}
      <header className="text-center border-b-4 border-black pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2563EB] text-white border-2 border-black text-sm font-bold mb-4">
          <Sparkles className="w-4 h-4" /> AI-Powered
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight">
          Portfolio <span className="bg-[#2563EB] text-white px-3">Generator</span>
        </h1>
        <p className="text-xl text-gray-600 font-medium">From your resume to a stunning website in under 60 seconds.</p>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-between relative px-2">
        <div className="absolute left-0 right-0 top-5 h-1 bg-black -z-10" />
        {STEPS.map((s, i) => {
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-4 border-black flex items-center justify-center font-black text-xs transition-all ${isDone ? 'bg-[#FACC15] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : isCurrent ? 'bg-[#2563EB] text-white scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-gray-400'}`}>
                {isDone ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] uppercase font-black tracking-widest hidden md:block ${isCurrent ? 'text-black' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className={`flex flex-col lg:flex-row gap-8 ${activePreview ? 'items-start' : 'justify-center'}`}>
      
        {/* LEFT COLUMN: FORM */}
        <div className={`transition-all duration-500 ${activePreview ? 'lg:w-1/2 w-full' : 'w-full'}`}>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* STEP 1: Personal Info & Resume Upload */}
          {step === 1 && (
            <div className="bg-white border-4 border-black neo-box p-8 space-y-8">
              
              {/* Resume Upload Module */}
              <div className="p-6 bg-[#FACC15] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-white border-2 border-black">
                       <Upload className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase italic">AI Auto-Generator</h3>
                       <p className="text-xs font-bold text-gray-700">Upload your resume and the AI will build your entire portfolio in seconds.</p>
                    </div>
                 </div>
                 <label className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white font-black uppercase text-sm cursor-pointer hover:bg-gray-900 transition-all border-2 border-black">
                    {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isParsing ? "Analyzing Experience..." : "Upload Resume (PDF)"}
                    <input type="file" hidden accept=".pdf" onChange={handleImportResume} />
                 </label>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b-2 border-black pt-4">
                <div className="p-2 bg-accent border-2 border-black"><User className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-2xl font-black">Personal Information</h2>
                  <p className="text-gray-500 text-sm">This becomes your portfolio's hero section and contact info.</p>
                </div>
              </div>

              {/* Profile Image Upload */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 border-2 border-black border-dashed">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                       {profileImage ? (
                         <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <User className="w-10 h-10" />
                         </div>
                       )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-2 bg-black text-white rounded-full cursor-pointer hover:scale-110 transition-all border-2 border-white shadow-lg">
                       <Plus className="w-4 h-4" />
                       <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </label>
                 </div>
                 <div className="flex-1 space-y-1">
                    <h4 className="font-black uppercase text-sm">Professional Headshot</h4>
                    <p className="text-xs text-gray-500">Add a photo to make your portfolio look official. Pro tip: Use a clean background!</p>
                    {profileImage && (
                      <button onClick={() => setProfileImage(null)} className="text-[10px] font-black uppercase text-red-500 hover:underline">Remove Photo</button>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="Arjun Sharma" />
                </div>
                <div>
                  <label className={labelCls}>Role / Headline <span className="text-red-500">*</span></label>
                  <input value={targetRole} onChange={e => setTargetRole(e.target.value)} className={inputCls} placeholder="Full Stack Developer" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="arjun@example.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className={labelCls}>LinkedIn URL</label>
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)} className={inputCls} placeholder="linkedin.com/in/arjun" />
                </div>
                <div>
                  <label className={labelCls}>GitHub URL</label>
                  <input value={github} onChange={e => setGithub(e.target.value)} className={inputCls} placeholder="github.com/arjun" />
                </div>
                <div>
                  <label className={labelCls}>Core Skills <span className="text-red-500">*</span></label>
                  <input value={skills} onChange={e => setSkills(e.target.value)} className={inputCls} placeholder="React, Node.js, Python, MongoDB..." />
                </div>
                <div>
                  <label className={labelCls}>Languages Spoken</label>
                  <input value={languages} onChange={e => setLanguages(e.target.value)} className={inputCls} placeholder="English, Hindi, Marathi" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Education <span className="text-red-500">*</span></label>
                  <input value={education} onChange={e => setEducation(e.target.value)} className={inputCls} placeholder="B.Tech CSE — VIT University (2020–2024)" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Bio / Summary</label>
                  <textarea value={summary} onChange={e => setSummary(e.target.value)} className={textareaCls} rows={3} placeholder="I'm a passionate Full Stack Developer who loves building products that make an impact..." />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Theme */}
          {step === 2 && (
            <div className="bg-white border-4 border-black neo-box p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
                <div className="p-2 bg-accent border-2 border-black"><Palette className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-2xl font-black">Choose Your Theme</h2>
                  <p className="text-gray-500 text-sm">Select the visual style for your generated portfolio.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {THEMES.map(theme => (
                  <motion.div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer border-4 overflow-hidden transition-all duration-300 ${selectedTheme === theme.id ? `${theme.border} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ring-4 ring-[#2563EB]/20` : 'border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-50'}`}
                  >
                    {/* Compact Preview Window */}
                    <div className={`h-28 bg-gradient-to-br ${theme.gradient} p-4 flex flex-col justify-between overflow-hidden relative`} style={{ background: theme.preview.bg }}>
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <Globe className="w-12 h-12" />
                      </div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="w-6 h-1 rounded-full" style={{ background: theme.preview.accent }} />
                        <div className="flex gap-1">
                          {[1,2].map(i => <div key={i} className="w-3 h-1 rounded-full bg-gray-400/30" />)}
                        </div>
                      </div>
                      <div className="relative z-10">
                        <div className="w-16 h-2 rounded mb-1" style={{ background: theme.preview.text, opacity: 0.8 }} />
                        <div className="w-10 h-1 rounded mb-2" style={{ background: theme.preview.accent }} />
                        <div className="flex gap-1 mt-2">
                           <div className="w-3 h-3 rounded-full" style={{ border: `1px solid ${theme.preview.accent}` }} />
                           <div className="w-12 h-3 rounded-sm" style={{ background: theme.preview.card, border: `1px solid ${theme.preview.accent}` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-xs font-black uppercase tracking-tight">{theme.name}</h3>
                        {selectedTheme === theme.id && <Check className="w-4 h-4 text-[#2563EB]" />}
                      </div>
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{theme.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className={`p-5 border-4 border-black bg-gray-50 flex items-center justify-between gap-4`}>
                <div className="flex-1">
                  {selectedTheme === 'minimal-dev' && <p className="font-medium text-gray-700">📄 <strong>Minimal Dev</strong> — Clean editorial grid. Perfect for professional applications.</p>}
                  {selectedTheme === 'neo-brutalism' && <p className="font-medium text-gray-700">⚡ <strong>Neo-Brutalism</strong> — Bold borders and hard shadows. Inspired by Figma's system.</p>}
                  {selectedTheme === 'glass-dark' && <p className="font-medium text-gray-700">🌌 <strong>Glass Dark</strong> — Immersive dark UI with glassmorphism effects.</p>}
                  {selectedTheme === 'data-pro' && <p className="font-medium text-gray-700">📊 <strong>Data Pro</strong> — Professional analytics vibe. High-impact stats and modern gradients.</p>}
                </div>
                <button onClick={() => setActivePreview(!activePreview)} className="p-4 bg-black text-white font-black uppercase text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                   {activePreview ? 'Close Split View' : 'Live Split Preview'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Portfolio Details */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Work Experience */}
              <div className="bg-white border-4 border-black neo-box p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 border-2 border-black"><Briefcase className="w-4 h-4" /></div>
                    <div>
                      <h3 className="text-xl font-black">Work Experience / Internships</h3>
                      <p className="text-xs text-gray-500">Optional — appears as a timeline on your portfolio</p>
                    </div>
                  </div>
                  <button type="button" onClick={addWork} className="flex items-center gap-1.5 px-4 py-2 bg-black text-white font-bold border-2 border-black text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                {workExp.length === 0 && <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded">No experience added yet.</p>}
                {workExp.map((w, i) => (
                  <div key={i} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <input type="checkbox" checked={w.isInternship} onChange={e => updateWork(i, 'isInternship', e.target.checked)} className="w-4 h-4 accent-primary" />
                        Mark as Internship
                      </label>
                      <button onClick={() => removeWork(i)} className="p-1.5 bg-red-100 border border-red-300 text-red-600 rounded hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>{w.isInternship ? 'Internship' : 'Job'} Title</label><input value={w.title} onChange={e => updateWork(i, 'title', e.target.value)} className={inputCls} placeholder="Software Engineer" /></div>
                      <div><label className={labelCls}>Company</label><input value={w.company} onChange={e => updateWork(i, 'company', e.target.value)} className={inputCls} placeholder="Google" /></div>
                      <div><label className={labelCls}>Start Date</label><input value={w.startDate} onChange={e => updateWork(i, 'startDate', e.target.value)} className={inputCls} placeholder="Jun 2023" /></div>
                      <div><label className={labelCls}>End Date</label><input value={w.endDate} onChange={e => updateWork(i, 'endDate', e.target.value)} className={inputCls} placeholder="Dec 2023 (blank = Present)" /></div>
                      <div className="col-span-2"><label className={labelCls}>Key Achievements</label><textarea value={w.points} onChange={e => updateWork(i, 'points', e.target.value)} className={textareaCls} rows={2} placeholder="• Reduced API latency by 40%&#10;• Built dashboard used by 1000+ users" /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="bg-white border-4 border-black neo-box p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 border-2 border-black"><FolderKanban className="w-4 h-4" /></div>
                    <div>
                      <h3 className="text-xl font-black">Projects</h3>
                      <p className="text-xs text-gray-500">Optional — displayed as cards with links</p>
                    </div>
                  </div>
                  <button type="button" onClick={addProject} className="flex items-center gap-1.5 px-4 py-2 bg-black text-white font-bold border-2 border-black text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                {projects.map((p, i) => (
                  <div key={i} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex justify-end"><button onClick={() => removeProject(i)} className="p-1.5 bg-red-100 border border-red-300 text-red-600 rounded hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div><label className={labelCls}>Project Name</label><input value={p.topic} onChange={e => updateProject(i, 'topic', e.target.value)} className={inputCls} placeholder="DreamSync - AI Career Platform" /></div>
                    <div><label className={labelCls}>Description & Tech Stack</label><textarea value={p.points} onChange={e => updateProject(i, 'points', e.target.value)} className={textareaCls} rows={2} placeholder="AI-powered SaaS for resume building and ATS checking. Built with Next.js, TypeScript, Supabase." /></div>
                    <div><label className={labelCls}>GitHub / Live Link</label><input value={p.website} onChange={e => updateProject(i, 'website', e.target.value)} className={inputCls} placeholder="https://github.com/you/project" /></div>
                  </div>
                ))}
              </div>

              {/* Courses */}
              <div className="bg-white border-4 border-black neo-box p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 border-2 border-black"><BookOpen className="w-4 h-4" /></div>
                    <div>
                      <h3 className="text-xl font-black">Courses & Certificates</h3>
                      <p className="text-xs text-gray-500">Optional — with certificate links</p>
                    </div>
                  </div>
                  <button type="button" onClick={addCourse} className="flex items-center gap-1.5 px-4 py-2 bg-black text-white font-bold border-2 border-black text-sm hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                {courses.length === 0 && <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded">No courses added yet.</p>}
                {courses.map((c, i) => (
                  <div key={i} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex justify-end"><button onClick={() => removeCourse(i)} className="p-1.5 bg-red-100 border border-red-300 text-red-600 rounded hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button></div>
                    <div><label className={labelCls}>Course / Certificate Name</label><input value={c.topic} onChange={e => updateCourse(i, 'topic', e.target.value)} className={inputCls} placeholder="AWS Cloud Practitioner" /></div>
                    <div><label className={labelCls}>What you learned</label><textarea value={c.points} onChange={e => updateCourse(i, 'points', e.target.value)} className={textareaCls} rows={2} placeholder="Covered EC2, S3, Lambda, IAM and cloud architecture fundamentals." /></div>
                    <div><label className={labelCls}>Certificate Link</label><input value={c.link} onChange={e => updateCourse(i, 'link', e.target.value)} className={inputCls} placeholder="https://www.credly.com/badges/..." /></div>
                  </div>
                ))}
              </div>

              {/* Achievements & Hobbies */}
              <div className="bg-white border-4 border-black neo-box p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
                  <div className="p-2 bg-purple-100 border-2 border-black"><Award className="w-4 h-4" /></div>
                  <h3 className="text-xl font-black">Extras (Optional)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className={labelCls}>Achievements</label><textarea value={achievements} onChange={e => setAchievements(e.target.value)} className={textareaCls} rows={3} placeholder="• 1st Place - National Hackathon 2024&#10;• Open Source contributor (500+ stars)" /></div>
                  <div><label className={labelCls}>Hobbies / Interests</label><textarea value={hobbies} onChange={e => setHobbies(e.target.value)} className={textareaCls} rows={3} placeholder="Open source, Chess, Photography, Competitive Programming..." /></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Pre-Generate Review */}
          {step === 4 && !generatedHtml && (
            <div className="bg-white border-4 border-black neo-box p-8 space-y-6">
              {isGenerating ? (
                <div className="text-center space-y-6 py-8">
                  <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin transition-all duration-300" 
                        style={{ clipPath: `inset(0 0 ${100 - genProgress}% 0)` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Sparkles className="w-10 h-10 text-[#2563EB] animate-pulse" />
                      </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Generating Masterpiece...</h2>
                    <div className="flex flex-col items-center gap-1">
                       <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                          {genProgress < 30 && "⚡ Architecting design system..."}
                          {genProgress >= 30 && genProgress < 60 && "🎨 Injecting theme styles..."}
                          {genProgress >= 60 && genProgress < 90 && "📝 Populating with your data..."}
                          {genProgress >= 90 && "✨ Finalizing code polish..."}
                       </p>
                       <p className="text-[#2563EB] font-black">{genProgress}% Complete</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-accent border-4 border-black flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Ready to Generate!</h2>
                    <p className="text-gray-600 font-medium">Review your choices below, then click Generate.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Name', value: fullName || '—' },
                      { label: 'Role', value: targetRole || '—' },
                      { label: 'Theme', value: THEMES.find(t => t.id === selectedTheme)?.name || '—' },
                      { label: 'Projects', value: `${projects.filter(p => p.topic).length} added` },
                    ].map(item => (
                      <div key={item.label} className="border-2 border-gray-200 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase">{item.label}</p>
                        <p className="font-black text-sm mt-1 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {genError && (
                    <div className="p-4 bg-red-50 border-2 border-red-300 text-red-800 font-medium text-sm rounded-lg">
                      ❌ {genError}
                    </div>
                  )}

                  <button
                    onClick={generatePortfolio}
                    className="w-full py-5 bg-[#2563EB] text-white font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3"
                  >
                    <Code2 className="w-6 h-6" /> Generate Premium Portfolio
                  </button>
                  <p className="text-center text-sm text-gray-500 font-bold uppercase">Estimated Time: 25–45 seconds</p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 border-4 border-black font-bold bg-white hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          <div className="text-sm font-black text-black">STEP {step} OF {STEPS.length}</div>

          <button
            onClick={() => {
              if (step === 3) setStep(4);
              else setStep(s => Math.min(4, s + 1));
            }}
            className="flex items-center gap-2 px-6 py-3 border-4 border-black font-black bg-[#2563EB] text-white hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {step === 3 ? 'Review & Generate' : 'Next Step'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Back to edit when on step 4 without generated */}
      {step === 4 && !generatedHtml && (
        <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 border-4 border-black font-bold bg-white hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" /> Back to Edit
        </button>
      )}
    </div>

    {/* RIGHT COLUMN: PREVIEW PANEL (Split View) */}
    {activePreview && (
      <div className="lg:w-1/2 w-full lg:sticky lg:top-8 animate-in slide-in-from-right duration-500">
         <div className="border-4 border-black neo-box bg-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-white p-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest ml-4">Live Preview Simulator</span>
               </div>
               <span className="text-[10px] font-black bg-[#FACC15] text-black px-2 py-1">REAL-TIME SYNC</span>
            </div>
            
            <div className="p-8 space-y-12 max-h-[80vh] overflow-y-auto">
               {/* Hero Preview */}
               <div className="space-y-4">
                  <div className="flex items-center gap-6">
                     {profileImage && (
                        <div className="relative shrink-0">
                           <div className="absolute inset-0 bg-gradient-to-tr from-[#667eea] to-[#764ba2] rounded-full blur-md opacity-50" />
                           <img src={profileImage} alt="Avatar" className="relative w-24 h-24 rounded-full border-4 border-black object-cover z-20 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" />
                        </div>
                     )}
                     <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <h1 className="text-4xl font-black uppercase italic leading-none">{fullName || "YOUR NAME"}</h1>
                           <div className="flex gap-2">
                              {linkedin && <Linkedin className="w-5 h-5 text-[#2563EB]" />}
                              {github && <Github className="w-5 h-5 text-black" />}
                           </div>
                        </div>
                        <p className="text-xl font-bold text-[#2563EB] uppercase tracking-widest">{targetRole || "PROFESSIONAL ROLE"}</p>
                     </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed font-bold uppercase">{summary || "Your AI-generated bio will appear here after parsing or enhancing..."}</p>
               </div>

               {/* Skills Review */}
               <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black pb-1">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                     {skills?.split(',').map((s: string, i: number) => s.trim() && (
                       <span key={i} className="px-3 py-1 bg-gray-100 border-2 border-black text-[10px] font-black uppercase">{s.trim()}</span>
                     ))}
                  </div>
               </div>

               {/* Projects Review */}
               <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black pb-1">Featured Projects</p>
                  <div className="grid grid-cols-1 gap-4">
                     {projects.map((p, i) => p.topic && (
                       <div key={i} className="p-4 border-2 border-black bg-[#FACC15]/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="font-black text-sm uppercase">{p.topic}</p>
                          <p className="text-[10px] font-bold text-gray-600 mt-1 line-clamp-2">{p.points}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Footer Preview */}
               <div className="pt-8 text-center space-y-2 border-t border-black/10">
                  <p className="text-[10px] font-black uppercase opacity-20">Generated by DreamSync AI</p>
               </div>
            </div>
         </div>
      </div>
      )}
    </div>
  </div>
  );
}
