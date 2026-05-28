'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
  collection, 
  onSnapshot, 
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import { 
  Video, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Users,
  X,
  MessageSquare,
  ShieldCheck,
  Flag,
  UserX,
  Check,
  RefreshCw,
  Send,
  Image as ImageIcon,
  Globe,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCommunity() {
  const { user, userData } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'moderation' | 'events' | 'broadcast'>('moderation');
  
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  
  // Events CMS Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [link, setLink] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Broadcast Post State
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastPhoto, setBroadcastPhoto] = useState('');
  const [broadcastVideo, setBroadcastVideo] = useState('');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [broadcastPosting, setBroadcastPosting] = useState(false);
  const [showBroadcastPhoto, setShowBroadcastPhoto] = useState(false);
  const [showBroadcastVideo, setShowBroadcastVideo] = useState(false);
  const [showBroadcastLink, setShowBroadcastLink] = useState(false);

  const [opsLoading, setOpsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch Google Meet Events (client-side sort to avoid composite index)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'meetings'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db2 = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db2 - da;
      });
      setMeetings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Flagged Reports Realtime (client-side sort to avoid compound index)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs
        .map(doc => {
          const raw: any = { id: doc.id, ...doc.data() };
          return {
            ...raw,
            type: raw.type || (raw.postId ? 'community_post' : raw.jobId ? 'job' : 'report'),
            targetId: raw.targetId || raw.postId || raw.jobId || '',
            reportedBy: raw.reportedBy || raw.reporterId || '',
            createdAt: raw.createdAt || raw.created_at || new Date().toISOString()
          };
        })
        .filter((r: any) => r.status === 'pending');
      data.sort((a: any, b: any) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db2 - da;
      });
      setReports(data);
      setReportsLoading(false);
    }, (error) => {
      console.warn("[AdminCommunity] reports fetch failed:", error);
      setReportsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Direct Firestore: Add Event (CMS). Firestore rules allow only admins/moderators to write.
  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !link || !date) return;
    setOpsLoading(true);

    try {
      await addDoc(collection(db, 'meetings'), {
        title,
        desc,
        link,
        date,
        time,
        created_at: new Date().toISOString(),
        status: 'upcoming'
      });

      setIsAddingEvent(false);
      resetEventForm();
      triggerToast('success', 'GOOGLE MEET SESSION SCHEDULED! ⚡');
    } catch (err) {
      triggerToast('error', 'EVENT DEPLOYMENT ERROR.');
    } finally {
      setOpsLoading(false);
    }
  };

  // Secure API: Delete Event (CMS)
  const handleDeleteMeeting = async (id: string) => {
    if (!confirm('ERASE THIS MEET SESSION PERMANENTLY?')) return;
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'meetings', id));
      triggerToast('success', 'SESSION PRUNED.');
    } catch (err) {
      triggerToast('error', 'PRUNING PROTOCOL FAILED.');
    }
  };

  // Direct Firestore: Conceal/Hide Flagged Content
  const handleHideContent = async (report: any) => {
    setOpsLoading(true);
    try {
      if (!report.targetId) throw new Error('Missing target post reference.');

      await updateDoc(doc(db, 'community_posts', report.targetId), {
        hidden: true,
        updatedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'reports', report.id), {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });

      triggerToast('success', 'TRANSMISSION SHADOW CONCEALED. RESOLVED. ⚡');
    } catch (err: any) {
      triggerToast('error', `ACTION FAIL: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  // Direct Firestore: Dismiss Alarm
  const handleDismissReport = async (reportId: string) => {
    setOpsLoading(true);
    try {
      const report = reports.find(rep => rep.id === reportId);

      await updateDoc(doc(db, 'reports', reportId), {
        status: 'dismissed',
        resolvedAt: new Date().toISOString()
      });

      if (report?.targetId && report.type === 'community_post') {
        await updateDoc(doc(db, 'community_posts', report.targetId), { reportsCount: 0 });
      }
      if (report?.targetId && report.type === 'job') {
        await updateDoc(doc(db, 'jobs', report.targetId), { reportsCount: 0 });
      }

      triggerToast('success', 'FALSE ALARM DISMISSED. RESOLVED.');
    } catch (err: any) {
      triggerToast('error', `DISMISS FAIL: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  // Direct Firestore: Shadow Ban / Suspend user
  const handleShadowBanUser = async (userId: string) => {
    if (!userId || !confirm('LOCK ACCESS FOR THIS ACCOUNT?')) return;
    setOpsLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'suspended',
        role: 'suspended',
        updated_at: new Date().toISOString()
      });

      triggerToast('success', `USER ACCESS PERMISSIONS UPDATED.`);
    } catch (err: any) {
      triggerToast('error', `BAN FAILED: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  const resetEventForm = () => {
    setTitle('');
    setDesc('');
    setLink('');
    setDate('');
    setTime('');
  };

  // Broadcast: Post to Community Feed as Admin
  const handleBroadcastPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim() || !user) return;
    setBroadcastPosting(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        content: broadcastContent.trim(),
        photoUrl: broadcastPhoto.trim() || null,
        videoUrl: broadcastVideo.trim() || null,
        eduLink: broadcastLink.trim() || null,
        authorId: user.uid,
        authorName: userData?.name || user.displayName || 'DreamSync Admin',
        authorRole: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportsCount: 0,
        hidden: false,
        repostsCount: 0,
        reactions: { like: 0, fire: 0, rocket: 0 },
        isAdminBroadcast: true
      });
      setBroadcastContent('');
      setBroadcastPhoto('');
      setBroadcastVideo('');
      setBroadcastLink('');
      setShowBroadcastPhoto(false);
      setShowBroadcastVideo(false);
      setShowBroadcastLink(false);
      triggerToast('success', 'BROADCAST DEPLOYED TO COMMUNITY FEED! ⚡');
    } catch (err: any) {
      triggerToast('error', `BROADCAST FAILED: ${err.message}`);
    } finally {
      setBroadcastPosting(false);
    }
  };

  return (
    <div className="space-y-12">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-[#FACC15] text-black' : 'bg-red-600 text-white'}`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {statusMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Community <span className="text-purple-600">Moderation</span></h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audit cohort transmissions and schedule student meets.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-4 border-black p-1 bg-white shadow-[4px_4px_0px_0px_black]">
           <button 
             onClick={() => setActiveTab('moderation')}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'moderation' ? 'bg-black text-[#FACC15]' : 'bg-white text-slate-600 hover:text-black'}`}
           >
              <Flag className="w-3.5 h-3.5" /> Moderation ({reports.length})
           </button>
           <button 
             onClick={() => setActiveTab('events')}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'events' ? 'bg-black text-[#FACC15]' : 'bg-white text-slate-600 hover:text-black'}`}
           >
              <Video className="w-3.5 h-3.5" /> Events
           </button>
           <button 
             onClick={() => setActiveTab('broadcast')}
             className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'broadcast' ? 'bg-[#FACC15] text-black border-2 border-black' : 'bg-white text-slate-600 hover:text-black'}`}
           >
              <Send className="w-3.5 h-3.5" /> Broadcast Post
           </button>
        </div>
      </div>

      {/* ──── TAB 1: MODERATION DESK ──── */}
      {activeTab === 'moderation' && (
        <div className="space-y-8">
           <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
              <Flag className="w-6 h-6 text-red-500 fill-current" /> Active Flags Queue
           </h2>

           {reportsLoading ? (
             <div className="py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
           ) : reports.length === 0 ? (
             <div className="border-4 border-dashed border-slate-200 p-20 text-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="font-black uppercase text-slate-400">All queues resolved. Central grid is secure.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {reports.map((rep) => (
                 <div key={rep.id} className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] border-red-500 flex flex-col justify-between">
                    <div>
                       {/* Header Bar */}
                       <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-100">
                          <span className="px-2.5 py-1 border border-black bg-red-100 text-red-700 text-[8px] font-black uppercase tracking-widest">
                             {rep.type === 'job' ? 'Flagged Scam Job' : 'Flagged Abuse Post'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                             {new Date(rep.createdAt).toLocaleString()}
                          </span>
                       </div>

                       {/* Details Grid */}
                       <div className="space-y-4">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-slate-400">Flagged Violation</p>
                             <p className="text-sm font-black italic bg-red-50/50 p-4 border border-black text-[#1F2937] leading-relaxed">
                                "{rep.reason}"
                             </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-[9px] font-bold uppercase text-slate-400">
                             <div>
                                <p className="font-black text-black">Target Reference ID</p>
                                <p className="truncate text-blue-600 font-semibold">{rep.targetId}</p>
                             </div>
                             <div>
                                <p className="font-black text-black">Reported By User ID</p>
                                <p className="truncate">{rep.reportedBy}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t-2 border-slate-100 mt-6">
                       {/* Dismiss report */}
                       <button 
                         onClick={() => handleDismissReport(rep.id)}
                         className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#2563EB] hover:underline"
                       >
                          <Check className="w-3.5 h-3.5" /> Dismiss Alarm
                       </button>

                       {/* Active actions */}
                       <div className="flex gap-2">
                          {rep.type === 'community_post' && (
                             <button
                               onClick={() => handleHideContent(rep)}
                               className="px-4 py-2 border border-black bg-black text-[#FACC15] text-[8px] font-black uppercase shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                             >
                               Conceal Post
                             </button>
                          )}
                          {(rep.reportedUserId || rep.targetAuthorId || rep.authorId) && (
                            <button
                              onClick={() => handleShadowBanUser(rep.reportedUserId || rep.targetAuthorId || rep.authorId)}
                              className="p-2 border border-black hover:bg-slate-50 text-[8px] font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                               <UserX className="w-3.5 h-3.5 text-red-600" /> Lock User
                            </button>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}

      {/* ──── TAB 2: EVENT SCHEDULER ──── */}
      {activeTab === 'events' && (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                 <Video className="w-6 h-6 text-purple-600" /> Session Schedule Array
              </h2>
              <button 
                onClick={() => setIsAddingEvent(!isAddingEvent)}
                className="px-6 py-3 border-4 border-black bg-black text-white text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_#A855F7]"
              >
                 {isAddingEvent ? 'Close Form' : 'Schedule Session'}
              </button>
           </div>

           {/* ADD EVENT FORM */}
           <AnimatePresence>
             {isAddingEvent && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white border-8 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_black]"
               >
                 <form onSubmit={handleAddMeeting} className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Event Title</label>
                         <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekly Career Roadmap Q&A" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">One-Line Bio</label>
                         <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description for students" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Meeting Link (Google Meet / Zoom)</label>
                         <input required value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs" />
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Date</label>
                           <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Time</label>
                           <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs" />
                         </div>
                       </div>
                       
                       <div className="h-full flex items-end">
                         <button disabled={opsLoading} type="submit" className="w-full py-8 bg-[#FACC15] text-black border-4 border-black font-black uppercase text-xl italic shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                            {opsLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : 'Deploy Event to Users ⚡'}
                         </button>
                       </div>
                    </div>
                 </form>
               </motion.div>
             )}
           </AnimatePresence>

           {/* SESSIONS GRID */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
             {loading ? (
               <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
             ) : meetings.length === 0 ? (
               <div className="col-span-full bg-white border-4 border-dashed border-slate-200 p-20 text-center"><p className="text-sm font-black text-slate-400 uppercase">No active sessions scheduled.</p></div>
             ) : meetings.map((meet) => (
               <div key={meet.id} className="bg-white border-4 border-black p-8 flex flex-col md:flex-row gap-8 shadow-[8px_8px_0px_0px_black] group hover:shadow-[12px_12px_0px_0px_#2563EB] transition-all">
                 <div className="w-16 h-16 bg-blue-50 border-2 border-black flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Video className="w-8 h-8" />
                 </div>
                 
                 <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                         <h3 className="text-xl font-black uppercase italic">{meet.title}</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{meet.desc || 'No description provided'}</p>
                       </div>
                       <button onClick={() => handleDeleteMeeting(meet.id)} className="text-slate-200 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-50">
                       <div className="flex items-center gap-3 text-[10px] font-black uppercase"><Calendar className="w-4 h-4 text-blue-600" /> {meet.date}</div>
                       <div className="flex items-center gap-3 text-[10px] font-black uppercase"><Clock className="w-4 h-4 text-blue-600" /> {meet.time}</div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                       <span className={`px-3 py-1 text-[9px] font-black uppercase border-2 border-black ${meet.status === 'upcoming' ? 'bg-green-400' : 'bg-slate-200'}`}>{meet.status}</span>
                       <a href={meet.link} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:underline">Test Link <ExternalLink className="w-3 h-3" /></a>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* ──── TAB 3: BROADCAST POST ──── */}
      {activeTab === 'broadcast' && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Send className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-2xl font-black uppercase italic">Broadcast to Community</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Posts will appear in the student feed for ALL users, marked as Admin broadcast.</p>
            </div>
          </div>

          <form onSubmit={handleBroadcastPost} className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_#FACC15] space-y-6">
            {/* Author bar */}
            <div className="flex items-center gap-4 pb-6 border-b-2 border-slate-100">
              <div className="w-12 h-12 rounded-full bg-black border-4 border-[#FACC15] flex items-center justify-center shadow-[3px_3px_0px_0px_#FACC15]">
                <span className="text-[#FACC15] font-black text-sm">A</span>
              </div>
              <div>
                <p className="font-black uppercase text-sm">{userData?.name || 'DreamSync Admin'}</p>
                <span className="bg-black text-[#FACC15] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">⚡ SUPER ADMIN · BROADCAST</span>
              </div>
            </div>

            {/* Content textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">Broadcast Message</label>
              <textarea
                required
                value={broadcastContent}
                onChange={e => setBroadcastContent(e.target.value)}
                placeholder="Share an update, announcement, resource, or motivation with all DreamSync students..."
                rows={6}
                className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:border-[#FACC15] transition-all text-sm resize-none bg-slate-50"
              />
              <p className="text-[9px] text-slate-400 font-bold uppercase">{broadcastContent.length} / 2000 characters</p>
            </div>

            {/* Attachment Toggles */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowBroadcastPhoto(!showBroadcastPhoto)}
                className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black text-[10px] font-black uppercase transition-all ${showBroadcastPhoto ? 'bg-[#FACC15] shadow-none translate-x-0.5 translate-y-0.5' : 'bg-white shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}`}
              >
                <ImageIcon className="w-4 h-4" /> Photo URL
              </button>
              <button
                type="button"
                onClick={() => setShowBroadcastVideo(!showBroadcastVideo)}
                className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black text-[10px] font-black uppercase transition-all ${showBroadcastVideo ? 'bg-[#FACC15] shadow-none translate-x-0.5 translate-y-0.5' : 'bg-white shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}`}
              >
                <Video className="w-4 h-4" /> Video URL
              </button>
              <button
                type="button"
                onClick={() => setShowBroadcastLink(!showBroadcastLink)}
                className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black text-[10px] font-black uppercase transition-all ${showBroadcastLink ? 'bg-[#FACC15] shadow-none translate-x-0.5 translate-y-0.5' : 'bg-white shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}`}
              >
                <Globe className="w-4 h-4" /> Resource Link
              </button>
            </div>

            {/* Attachment Inputs */}
            <AnimatePresence>
              {showBroadcastPhoto && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                  <label className="text-[9px] font-black uppercase text-slate-400">Photo URL</label>
                  <input value={broadcastPhoto} onChange={e => setBroadcastPhoto(e.target.value)} placeholder="https://image.link/photo.jpg" className="w-full p-3 border-2 border-black bg-slate-50 text-xs font-semibold focus:outline-none" />
                  {broadcastPhoto && <img src={broadcastPhoto} className="max-h-48 border-2 border-black object-cover" />}
                </motion.div>
              )}
              {showBroadcastVideo && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                  <label className="text-[9px] font-black uppercase text-slate-400">Video URL (YouTube / MP4)</label>
                  <input value={broadcastVideo} onChange={e => setBroadcastVideo(e.target.value)} placeholder="https://youtube.com/... or https://video.mp4" className="w-full p-3 border-2 border-black bg-slate-50 text-xs font-semibold focus:outline-none" />
                </motion.div>
              )}
              {showBroadcastLink && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                  <label className="text-[9px] font-black uppercase text-slate-400">Resource / Article Link</label>
                  <input value={broadcastLink} onChange={e => setBroadcastLink(e.target.value)} placeholder="https://resource.link/article" className="w-full p-3 border-2 border-black bg-slate-50 text-xs font-semibold focus:outline-none" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div className="pt-4 border-t-2 border-slate-100">
              <button
                type="submit"
                disabled={broadcastPosting || !broadcastContent.trim()}
                className="w-full py-5 bg-black text-[#FACC15] border-4 border-black font-black uppercase text-lg italic shadow-[6px_6px_0px_0px_#FACC15] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {broadcastPosting ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> Deploying...</>
                ) : (
                  <><Send className="w-5 h-5" /> Deploy Broadcast to All Students ⚡</>
                )}
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="bg-slate-50 border-4 border-slate-200 p-6 space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">📢 Broadcast Guidelines</p>
            <ul className="space-y-2 text-[10px] font-bold text-slate-400 uppercase">
              <li>• Posts appear instantly in the student community feed</li>
              <li>• Your post will be marked with the ⚡ Mentor badge</li>
              <li>• Use for announcements, resources, motivation, or Q&A sessions</li>
              <li>• You can delete any broadcast from the community page later</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
