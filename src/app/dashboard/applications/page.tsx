'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Plus, Trash2, MapPin, ExternalLink, 
  CheckCircle, Clock, AlertCircle, X, Loader2, 
  Building, Calendar, ListTodo, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function JobTracker() {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('Applied');

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'applications'), 
      where('userId', '==', user.uid)
    );
    type ApplicationDoc = { id: string; updatedAt?: number };
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ApplicationDoc[];
      setApps(data.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    try {
      await addDoc(collection(db, 'applications'), {
        userId: user!.uid,
        company,
        role,
        link,
        status,
        updatedAt: Date.now(),
        createdAt: Date.now()
      });
      setIsAdding(false);
      setCompany('');
      setRole('');
      setLink('');
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, 'applications', id), {
      status: newStatus,
      updatedAt: Date.now()
    });
  };

  const deleteApp = async (id: string) => {
    if (confirm('Erase this application from your history?')) {
      await deleteDoc(doc(db, 'applications', id));
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Offer': return 'bg-green-500 text-white border-black';
      case 'Rejected': return 'bg-red-500 text-white border-black';
      case 'Interviewing': return 'bg-blue-600 text-white border-black';
      default: return 'bg-yellow-400 text-black border-black';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 md:px-12 selection:bg-blue-600/20">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Architecture */}
        <header className="border-b-[10px] border-black pb-12 flex flex-col md:flex-row justify-between items-end gap-12">
            <div className="space-y-8">
              <div className="ds-badge bg-black text-white px-6 py-2 shadow-[4px_4px_0px_0px_var(--ds-blue)]">CORE_TOOL: APPLICATION_TRACKER</div>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none text-black uppercase italic">
                 JOB <br /><span className="text-blue-600 not-italic">TRACKER.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-bold uppercase tracking-tight max-w-2xl leading-tight">
                 Manage your job pipeline across the student grid. Track status, nodes, and response signals.
              </p>
            </div>
            
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="ds-btn ds-btn-primary h-20 px-10 flex items-center gap-4 text-xl group"
            >
               {isAdding ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
               {isAdding ? 'CLOSE_PANEL' : 'NEW_APPLICATION'}
            </button>
        </header>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ds-card p-10 md:p-16 bg-white ds-card-hover border-slate-100"
            >
               <form onSubmit={handleAddApp} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Company_ID</label>
                       <input autoFocus required value={company} onChange={e => setCompany(e.target.value)} placeholder="GOOGLE / MICROSOFT / STARTUP" className="ds-input w-full p-6 text-xl" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Role_Designation</label>
                       <input required value={role} onChange={e => setRole(e.target.value)} placeholder="FRONTEND / AI ENGINEER" className="ds-input w-full p-6 text-xl" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Job_Manifest_URL</label>
                       <input value={link} onChange={e => setLink(e.target.value)} placeholder="HTTPS://..." className="ds-input w-full p-6 text-xl" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Initial_Status</label>
                       <select value={status} onChange={e => setStatus(e.target.value)} className="ds-input w-full p-6 text-xl h-[76px] uppercase font-black italic">
                          <option>Applied</option>
                          <option>Interviewing</option>
                          <option>Offer</option>
                          <option>Rejected</option>
                       </select>
                    </div>
                    <button type="submit" className="ds-btn ds-btn-primary w-full py-6 text-xl italic mt-4">
                       COMMIT APPLICATION ⚡
                    </button>
                  </div>
               </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracker Core */}
        <div className="space-y-8">
           <div className="flex items-center gap-6">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">DATA PIPELINE</h2>
              <div className="h-1 flex-grow bg-black/5" />
           </div>

           {loading ? (
             <div className="py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
           ) : apps.length === 0 ? (
             <div className="ds-card p-20 border-dashed bg-white text-center space-y-6">
                 <Briefcase className="w-20 h-20 mx-auto text-slate-100" />
                 <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">Pipeline Empty. <br /> Start applying to build your history.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 gap-6">
                {apps.map((app) => (
                  <motion.div 
                    key={app.id}
                    layout
                    className="ds-card p-10 bg-white flex flex-col md:flex-row items-center gap-10 ds-card-hover border-slate-100"
                  >
                     <div className="w-20 h-20 bg-slate-50 border-4 border-black flex items-center justify-center shrink-0 shadow-[6px_6px_0px_0px_black]">
                        <Building className="w-10 h-10" />
                     </div>
                     
                     <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="space-y-1">
                           <h3 className="text-3xl font-black uppercase italic leading-none">{app.role}</h3>
                           <p className="text-xl font-bold text-blue-600 uppercase tracking-tight">{app.company}</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                           {app.link && (
                             <a href={app.link} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-black">
                                <ExternalLink className="w-3.5 h-3.5" /> Manifest_Link
                             </a>
                           )}
                           <span className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                              <Calendar className="w-3.5 h-3.5" /> {new Date(app.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                        <div className="flex gap-2">
                           {['Applied', 'Interviewing', 'Offer', 'Rejected'].map((s) => (
                             <button 
                                key={s}
                                onClick={() => updateStatus(app.id, s)}
                                className={`px-4 py-2 text-[9px] font-black uppercase border-2 border-black transition-all ${app.status === s ? getStatusColor(s) : 'bg-white text-slate-200 border-slate-100 hover:border-black hover:text-black'}`}
                             >
                                {s}
                             </button>
                           ))}
                        </div>
                        <button 
                          onClick={() => deleteApp(app.id)}
                          className="p-4 border-2 border-slate-100 text-slate-200 hover:border-red-600 hover:text-red-500 transition-all"
                        >
                           <Trash2 className="w-6 h-6" />
                        </button>
                     </div>
                  </motion.div>
                ))}
             </div>
           )}
        </div>

        {/* Footer Insight */}
        <div className="ds-card p-10 bg-black text-white border-none shadow-[16px_16px_0px_0px_var(--ds-blue)] flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="space-y-4 text-center md:text-left">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-blue-400">PIPELINE ANALYTICS</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 leading-relaxed">
                 Active Nodes: {apps.filter(a => a.status !== 'Rejected').length} // Conversion Rate: {apps.length > 0 ? ((apps.filter(a => a.status === 'Offer').length / apps.length) * 100).toFixed(1) : 0}%
              </p>
           </div>
           <Link href="/dashboard" className="ds-btn ds-btn-primary bg-white text-black hover:text-white px-10 h-16 flex items-center justify-center gap-3">
              BACK TO COMMAND CENTER <ChevronRight className="w-5 h-5" />
           </Link>
        </div>
      </div>
    </div>
  );
}
