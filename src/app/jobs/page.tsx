'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  increment
} from 'firebase/firestore';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  BookmarkCheck, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  Loader2,
  FileCheck,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobsBoard() {
  const { user, userData } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userResume, setUserResume] = useState<any>(null);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Modals & Application Flow
  const [applyingJob, setApplyingJob] = useState<any>(null);
  const [reportingJob, setReportingJob] = useState<any>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [reportReason, setReportReason] = useState('');
  
  // Status Buffers
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch Jobs Realtime
  useEffect(() => {
    // Only fetch approved jobs for standard users
    const q = query(
      collection(db, 'jobs'), 
      where('approved', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Fallback: If no approved jobs are in database yet, let's query all jobs
      if (data.length === 0) {
        const fallbackUnsubscribe = onSnapshot(collection(db, 'jobs'), (fallbackSnapshot) => {
          const fallbackData = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setJobs(fallbackData);
          setLoading(false);
        });
        return () => fallbackUnsubscribe();
      }
      setJobs(data);
      setLoading(false);
    }, (error) => {
      console.error("[JobsBoard] error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch User Resume to Calculate AI Match Score
  useEffect(() => {
    if (!user) return;
    const fetchResume = async () => {
      try {
        const q = query(collection(db, 'resumes'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setUserResume(snap.docs[0].data());
        }
      } catch (err) {
        console.error("Failed to load resume", err);
      }
    };
    fetchResume();
  }, [user]);

  // 3. Load Bookmarks & Applications
  useEffect(() => {
    if (!user) return;
    // Load bookmarks from localstorage for speed and zero-friction
    const savedBookmarks = localStorage.getItem(`bookmarks_${user.uid}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    // Load user applications
    const fetchApplications = async () => {
      try {
        const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        setAppliedJobIds(snap.docs.map(doc => doc.data().jobId));
      } catch (err) {
        console.error("Failed to fetch applications", err);
      }
    };
    fetchApplications();
  }, [user]);

  // Handle Bookmarks Toggle
  const toggleBookmark = (jobId: string) => {
    if (!user) return;
    let nextBookmarks = [...bookmarks];
    if (bookmarks.includes(jobId)) {
      nextBookmarks = nextBookmarks.filter(id => id !== jobId);
    } else {
      nextBookmarks.push(jobId);
    }
    setBookmarks(nextBookmarks);
    localStorage.setItem(`bookmarks_${user.uid}`, JSON.stringify(nextBookmarks));
  };

  // Submit Job Application
  const handleApply = async () => {
    if (!user || !applyingJob) return;
    try {
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        userName: userData?.name || user.email?.split('@')[0],
        userEmail: user.email,
        jobId: applyingJob.id,
        jobTitle: applyingJob.title,
        company: applyingJob.company,
        appliedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      setAppliedJobIds(prev => [...prev, applyingJob.id]);
      setApplyingJob(null);
      triggerToast('success', 'APPLICATION TRANSMITTED SUCCESSFULLY! ⚡');
    } catch (err) {
      triggerToast('error', 'APPLICATION PIPELINE FAILURE. RETRY LATER.');
    }
  };

  // File Scam Report
  const handleReport = async () => {
    if (!user || !reportingJob || !reportReason) return;
    try {
      // 1. Write Scam Report
      await addDoc(collection(db, 'reports'), {
        type: 'job',
        targetId: reportingJob.id,
        targetTitle: reportingJob.title,
        company: reportingJob.company,
        reportedBy: user.uid,
        reason: reportReason,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      
      // 2. Increment Scam Reports on Job Record
      const jobRef = doc(db, 'jobs', reportingJob.id);
      await updateDoc(jobRef, {
        reportsCount: increment(1)
      });

      setReportingJob(null);
      setReportReason('');
      triggerToast('success', 'ALARM SIGNAL SENT. MODERATION INITIATED.');
    } catch (err) {
      triggerToast('error', 'REPORT DISPATCH FAIL. CHECK NETWORK.');
    }
  };

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Compute AI Match Score based on Resume skills
  const calculateAIMatch = (jobTitle: string, jobLocation: string) => {
    if (!userResume) return { score: 75, badge: 'Standard Fit', hasResume: false };
    
    // Simplistic keyword density comparison
    const resumeText = JSON.stringify(userResume).toLowerCase();
    const cleanTitle = jobTitle.toLowerCase();
    
    let matchPoints = 65; // Base matching points

    // Skill Checks
    const techSkills = ['react', 'next.js', 'typescript', 'javascript', 'tailwind', 'node', 'python', 'java', 'aws', 'sql'];
    techSkills.forEach(skill => {
      if (resumeText.includes(skill) && cleanTitle.includes(skill)) matchPoints += 5;
    });

    if (resumeText.includes('developer') && cleanTitle.includes('developer')) matchPoints += 10;
    if (resumeText.includes('engineer') && cleanTitle.includes('engineer')) matchPoints += 10;
    if (jobLocation.toLowerCase().includes('remote') && resumeText.includes('remote')) matchPoints += 5;

    const score = Math.min(matchPoints, 99);
    
    let badge = 'Standard Fit';
    if (score >= 90) badge = 'Perfect Match 🔥';
    else if (score >= 80) badge = 'High Match ⚡';

    return { score, badge, hasResume: true };
  };

  // Apply filters and searches
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());
      
    const matchesType = filterType === 'All' || job.type === filterType;
    const matchesBookmark = !showBookmarkedOnly || bookmarks.includes(job.id);
    
    return matchesSearch && matchesType && matchesBookmark;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-40 pb-20 px-6 md:px-12 text-black">
      
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-green-400 text-black' : 'bg-red-500 text-white'}`}
          >
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {statusMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b-8 border-black pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-black text-[#FACC15] shadow-[4px_4px_0px_0px_#2563EB]">
                <Briefcase className="w-8 h-8" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-400">Tactical Careers Grid</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              JOBS <span className="text-blue-600 not-italic">BOARD</span>
            </h1>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] min-w-[240px]">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Placements</p>
             <p className="text-3xl font-black italic">{filteredJobs.length} NODES</p>
          </div>
        </div>

        {/* Controls Buffer */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Input */}
          <div className="relative flex-1">
             <input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="SEARCH ROLE / ORGANIZATION / METRO"
               className="w-full pl-14 pr-6 py-5 border-4 border-black font-black uppercase italic text-xs bg-white placeholder:text-slate-300 focus:outline-none focus:bg-slate-50 shadow-[4px_4px_0px_0px_black] transition-all"
             />
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 opacity-30" />
          </div>

          {/* Filter Tools */}
          <div className="flex flex-wrap gap-4">
             {['All', 'Full-time', 'Internship', 'Contract'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-6 py-5 border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_black] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_black] transition-all ${filterType === t ? 'bg-[#FACC15]' : 'bg-white'}`}
                >
                  {t}
                </button>
             ))}

             <button
               onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
               className={`p-5 border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center transition-all ${showBookmarkedOnly ? 'bg-red-400 text-white' : 'bg-white hover:bg-slate-50'}`}
             >
               <Bookmark className="w-5 h-5 fill-current" />
             </button>
          </div>
        </div>

        {/* Main Grid View */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {loading ? (
            <div className="col-span-full py-32 flex flex-col items-center gap-4">
               <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
               <p className="font-black uppercase tracking-widest text-slate-400">Synching Active Positions...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="col-span-full bg-white border-8 border-dashed border-slate-200 p-24 text-center">
               <p className="text-lg font-black uppercase text-slate-300">No Positions Matching Signal Detected.</p>
               <p className="text-xs uppercase font-bold text-slate-400 mt-2">Adjust search keywords or filter arrays.</p>
            </div>
          ) : filteredJobs.map((job) => {
            const isApplied = appliedJobIds.includes(job.id);
            const isBookmarked = bookmarks.includes(job.id);
            const aiMatch = calculateAIMatch(job.title, job.location);

            return (
              <motion.div 
                key={job.id}
                layout
                className={`bg-white border-4 border-black p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] hover:border-blue-600 transition-all group relative ${job.featured ? 'bg-yellow-50/20' : ''}`}
              >
                {/* Feature Tag & Bookmark */}
                <div className="flex justify-between items-start">
                   <div className="flex flex-wrap gap-2">
                     <span className="px-3 py-1 bg-slate-100 border-2 border-black text-[9px] font-black uppercase">
                       {job.type}
                     </span>
                     {job.featured && (
                       <span className="px-3 py-1 bg-[#FACC15] border-2 border-black text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_black]">
                         FEATURED 🔥
                       </span>
                     )}
                   </div>
                   <button 
                     onClick={() => toggleBookmark(job.id)}
                     className="text-slate-300 hover:text-red-500 transition-colors p-1"
                   >
                     {isBookmarked ? (
                       <BookmarkCheck className="w-6 h-6 text-red-500 fill-current" />
                     ) : (
                       <Bookmark className="w-6 h-6" />
                     )}
                   </button>
                </div>

                {/* Job Info */}
                <div className="space-y-4 my-6">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black uppercase italic leading-none group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                        {job.company}
                      </p>
                   </div>
                   
                   <div className="flex flex-wrap gap-6 pt-2">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                        <MapPin className="w-4 h-4 text-blue-600" /> {job.location}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                        <DollarSign className="w-4 h-4 text-blue-600" /> {job.salary || 'Competitive'}
                      </span>
                   </div>
                </div>

                {/* AI Match Glow Console */}
                <div className="bg-slate-50 border-2 border-black p-4 flex items-center justify-between shadow-[3px_3px_0px_0px_black] mb-6">
                   <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-[#2563EB] text-white border border-black shadow-[1px_1px_0px_0px_black]">
                         <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI COMPATIBILITY MATCH</p>
                         <p className="text-xs font-black uppercase italic">{aiMatch.badge}</p>
                      </div>
                   </div>
                   
                   <div className="text-right">
                      <span className="text-2xl font-black italic text-[#2563EB]">{aiMatch.score}%</span>
                   </div>
                </div>

                {/* Application Actions */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100 mt-2">
                   <button 
                     onClick={() => setReportingJob(job)}
                     className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                   >
                     <AlertTriangle className="w-3.5 h-3.5" /> Flag Scam
                   </button>

                   <button
                     disabled={isApplied}
                     onClick={() => setApplyingJob(job)}
                     className={`px-6 py-3.5 border-4 border-black text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-2 ${isApplied ? 'bg-green-100 text-green-700' : 'bg-black text-white'}`}
                   >
                     {isApplied ? (
                       <>
                         <CheckCircle className="w-4 h-4" /> Applied
                       </>
                     ) : (
                       <>
                         Initiate Application <ArrowUpRight className="w-4 h-4" />
                       </>
                     )}
                   </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ───── MODAL: APPLY PROTOCOL ───── */}
      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-8 border-black max-w-lg w-full p-8 md:p-10 shadow-[16px_16px_0px_0px_black]"
            >
              <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase italic">Apply Protocol</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Routing application to {applyingJob.company}</p>
                 </div>
                 <button onClick={() => setApplyingJob(null)} className="p-1 hover:bg-slate-100 border-2 border-black">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="bg-slate-50 border-2 border-black p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-black text-[#FACC15] border border-black flex items-center justify-center">
                       <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="font-black text-base uppercase leading-none">{applyingJob.title}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{applyingJob.company}</p>
                    </div>
                 </div>

                 {/* Resume Selection */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">Attached Credentials</label>
                    {userResume ? (
                      <div className="border-2 border-black p-4 bg-green-50 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <FileCheck className="w-5 h-5 text-green-600" />
                            <span className="text-xs font-black uppercase">Direct Resume Synced ({userResume.personalInfo?.role || 'Resume Data'})</span>
                         </div>
                         <CheckCircle className="w-5 h-5 text-green-600 fill-current" />
                      </div>
                    ) : (
                      <div className="border-2 border-black border-dashed p-4 bg-amber-50 flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase">No Resume Data Found</p>
                            <p className="text-[8px] font-bold text-amber-700 uppercase">A simulated general resume packet will be dispatched.</p>
                         </div>
                         <HelpCircle className="w-5 h-5 text-amber-600" />
                      </div>
                    )}
                 </div>

                 <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                   By submitting this protocol, your profile card, primary email registration ({user?.email}), and attached career metrics are pushed directly to the recruiter's ledger.
                 </p>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
                    <button 
                      onClick={() => setApplyingJob(null)}
                      className="py-4 border-4 border-black font-black uppercase text-xs hover:bg-slate-50 transition-all"
                    >
                      ABORT PROTOCOL
                    </button>
                    <button 
                      onClick={handleApply}
                      className="py-4 bg-[#FACC15] border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                      TRANSMIT NOW 🚀
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── MODAL: REPORT SCAM ───── */}
      <AnimatePresence>
        {reportingJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-8 border-black max-w-md w-full p-8 shadow-[16px_16px_0px_0px_black]"
            >
              <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
                 <h2 className="text-xl font-black uppercase italic flex items-center gap-2 text-red-600">
                   <AlertTriangle className="w-6 h-6 text-red-600" /> Report Scam
                 </h2>
                 <button onClick={() => setReportingJob(null)} className="p-1 border border-black hover:bg-slate-100">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-6">
                 <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
                   Help protect the student central grid. Provide the reason this job listing should be audited by operators.
                 </p>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Violation Reason</label>
                    <textarea 
                      required
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      placeholder="e.g. Asks for payment during application, links are broken/malicious, fake company details."
                      rows={4}
                      className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setReportingJob(null)}
                      className="py-3 border-2 border-black font-black uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReport}
                      className="py-3 bg-red-600 text-white border-2 border-black font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                      File Report 🚨
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
