'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { 
  Briefcase, 
  Plus, 
  Trash2, 
  MapPin, 
  DollarSign, 
  X, 
  Loader2, 
  ArrowUpRight,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Star,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobBoardControl() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Featured'>('All');
  
  // Create Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [type, setType] = useState<'Full-time' | 'Internship' | 'Contract'>('Full-time');
  const [link, setLink] = useState('');
  const [approved, setApproved] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editType, setEditType] = useState<'Full-time' | 'Internship' | 'Contract'>('Full-time');
  const [editLink, setEditLink] = useState('');
  const [editApproved, setEditApproved] = useState(true);
  const [editFeatured, setEditFeatured] = useState(false);

  const [opsLoading, setOpsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Real-time onSnapshot subscription for job lists
  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
      setLoading(false);
    }, (error) => {
      console.error("[AdminJobs] snap error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Direct Firestore: Add Job
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !location || !link) return;
    setOpsLoading(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        title, company, location,
        salary: salary || 'Competitive',
        type, link, approved, featured,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reportsCount: 0
      });
      setIsAdding(false);
      resetForm();
      triggerToast('success', 'JOB DISPATCHED SUCCESSFULLY! ⚡');
    } catch (err: any) {
      triggerToast('error', `ADD FAILED: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  // Direct Firestore: Update Job
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setOpsLoading(true);
    try {
      await updateDoc(doc(db, 'jobs', editingJob.id), {
        title: editTitle, company: editCompany, location: editLocation,
        salary: editSalary, type: editType, link: editLink,
        approved: editApproved, featured: editFeatured,
        updated_at: new Date().toISOString()
      });
      setEditingJob(null);
      triggerToast('success', 'JOB PROPERTIES MODIFIED. ⚡');
    } catch (err: any) {
      triggerToast('error', `UPDATE FAILED: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  // Direct Firestore: Delete Job
  const handleDelete = async (id: string) => {
    if (!confirm('ERASE THIS PLACEMENT PERMANENTLY?')) return;
    setOpsLoading(true);
    try {
      await deleteDoc(doc(db, 'jobs', id));
      triggerToast('success', 'PLACEMENT ERASED SUCCESSFULLY.');
    } catch (err: any) {
      triggerToast('error', `PURGE FAILED: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  // Direct Firestore: Toggle approval
  const toggleApproval = async (job: any) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), { approved: !job.approved, updated_at: new Date().toISOString() });
      triggerToast('success', `ROLE ${!job.approved ? 'APPROVED' : 'SUSPENDED'}.`);
    } catch {
      triggerToast('error', 'OPERATION FAILED.');
    }
  };

  // Direct Firestore: Toggle featured
  const toggleFeatured = async (job: any) => {
    try {
      await updateDoc(doc(db, 'jobs', job.id), { featured: !job.featured, updated_at: new Date().toISOString() });
      triggerToast('success', `ROLE ${!job.featured ? 'FEATURED' : 'UNFEATURED'}.`);
    } catch {
      triggerToast('error', 'OPERATION FAILED.');
    }
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setEditTitle(job.title || '');
    setEditCompany(job.company || '');
    setEditLocation(job.location || '');
    setEditSalary(job.salary || '');
    setEditType(job.type || 'Full-time');
    setEditLink(job.link || '');
    setEditApproved(job.approved !== false);
    setEditFeatured(job.featured === true);
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setLocation('');
    setSalary('');
    setLink('');
    setApproved(true);
    setFeatured(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const queryText = `${job.title || ''} ${job.company || ''} ${job.location || ''} ${job.type || ''}`.toLowerCase();
    const matchesSearch = queryText.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Approved' && job.approved !== false) ||
      (statusFilter === 'Pending' && job.approved === false) ||
      (statusFilter === 'Featured' && job.featured === true);

    return matchesSearch && matchesStatus;
  });

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
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {statusMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-8 border-black pb-8">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Job <span className="text-teal-500">Board</span> Control</h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deploy, verify, and moderate placements.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 border-4 border-black font-black uppercase italic text-xs shadow-[6px_6px_0px_0px_#14B8A6] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Close Panel' : 'Market New Role'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, company, location, or type"
            className="w-full border-4 border-black bg-white py-4 pl-11 pr-4 text-sm font-bold outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Filter className="h-4 w-4" /> Filter
          </span>
          {(['All', 'Approved', 'Pending', 'Featured'] as const).map(option => (
            <button
              key={option}
              onClick={() => setStatusFilter(option)}
              className={`rounded-none border-2 border-black px-4 py-3 text-[10px] font-black uppercase transition-all ${statusFilter === option ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE JOB FORM */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-8 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_black]"
          >
            <form onSubmit={handleAddJob} className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Position Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Junior Frontend Dev" className="w-full p-4 border-4 border-black font-bold focus:bg-slate-50 transition-all text-xs" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Organization Name</label>
                    <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Company Name" className="w-full p-4 border-4 border-black font-bold focus:bg-slate-50 transition-all text-xs" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Location</label>
                      <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote / City" className="w-full p-4 border-4 border-black font-bold text-xs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Type</label>
                      <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-4 border-4 border-black font-bold h-[54px] text-xs">
                        <option>Full-time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                      </select>
                    </div>
                 </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Compensation Space</label>
                    <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. ₹6-12 LPA" className="w-full p-4 border-4 border-black font-bold text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Application URL</label>
                    <input required value={link} onChange={e => setLink(e.target.value)} placeholder="https://careers.google.com/..." className="w-full p-4 border-4 border-black font-bold text-xs" />
                  </div>

                  {/* Switch Controls */}
                  <div className="flex gap-6">
                     <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase">
                        <input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} className="w-4 h-4 border-2 border-black accent-teal-600" />
                        Direct Approve
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase">
                        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 border-2 border-black accent-teal-600" />
                        Feature Flag
                     </label>
                  </div>

                  <button disabled={opsLoading} type="submit" className="w-full py-6 bg-[#14B8A6] text-white border-4 border-black font-black uppercase text-base italic shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                     {opsLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'BROADCAST PLACEMENT ⚡'}
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JOBS GRID */}
      <div className="grid lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
        ) : filteredJobs.length === 0 ? (
          <div className="col-span-full border-4 border-dashed border-slate-200 p-20 text-center"><p className="text-sm font-black text-slate-400 uppercase">Buffer Empty.</p></div>
        ) : filteredJobs.map(job => {
          const scamFlags = job.reportsCount || 0;

          return (
            <div 
              key={job.id} 
              className={`bg-white border-4 border-black p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_black] group hover:border-[#14B8A6] transition-all relative ${scamFlags > 0 ? 'bg-red-50/20 border-red-500' : ''}`}
            >
              <div>
                 {/* Top Controls: Status Indicators & Flags */}
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                       <span className={`px-2.5 py-0.5 border border-black text-[8px] font-black uppercase ${job.approved ? 'bg-green-400' : 'bg-slate-200'}`}>
                          {job.approved ? 'Approved' : 'Pending Review'}
                       </span>
                       {job.featured && (
                          <span className="px-2.5 py-0.5 border border-black bg-[#FACC15] text-[8px] font-black uppercase flex items-center gap-0.5">
                             <Star className="w-2.5 h-2.5 fill-current" /> Featured
                          </span>
                       )}
                    </div>

                    {scamFlags > 0 && (
                      <span className="px-2.5 py-0.5 bg-red-600 text-white border border-black text-[8px] font-black uppercase animate-bounce flex items-center gap-1">
                         <AlertTriangle className="w-2.5 h-2.5" /> {scamFlags} SCAM ALARMS
                      </span>
                    )}
                 </div>

                 {/* Position Details */}
                 <div className="flex gap-4 items-start">
                    <div className="p-3 bg-slate-900 text-[#FACC15] border-2 border-black shadow-[3px_3px_0px_0px_black] shrink-0">
                       <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl font-black uppercase italic leading-tight">{job.title}</h3>
                       <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{job.company}</p>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4 pt-4">
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase"><MapPin className="w-3.5 h-3.5 text-teal-600" /> {job.location}</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase"><DollarSign className="w-3.5 h-3.5 text-teal-600" /> {job.salary || 'Competitive'}</span>
                 </div>
              </div>

              {/* Manipulation Base */}
              <div className="flex flex-wrap items-center justify-between pt-6 border-t-2 border-slate-50 mt-6 gap-4">
                 {/* Quick toggles */}
                 <div className="flex gap-2">
                    <button 
                      onClick={() => toggleApproval(job)}
                      className={`px-3 py-1.5 border border-black text-[8px] font-black uppercase shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${job.approved ? 'bg-amber-100' : 'bg-green-400'}`}
                    >
                       {job.approved ? 'Reject' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => toggleFeatured(job)}
                      className="px-3 py-1.5 border border-black bg-white hover:bg-slate-50 text-[8px] font-black uppercase shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                       {job.featured ? 'Unfeature' : 'Feature'}
                    </button>
                 </div>

                 {/* Edit & Purge Operations */}
                 <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(job)}
                      className="p-2 border-2 border-black hover:bg-slate-50 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                       <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      className="p-2 bg-red-600 text-white border-2 border-black hover:bg-red-700 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT JOB MODAL */}
      <AnimatePresence>
        {editingJob && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white border-8 border-black max-w-xl w-full p-8 md:p-10 shadow-[16px_16px_0px_0px_black]"
             >
                <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
                   <h2 className="text-2xl font-black uppercase italic">Edit Placement Protocol</h2>
                   <button onClick={() => setEditingJob(null)} className="p-1 border border-black hover:bg-slate-100"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleUpdateJob} className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 space-y-2">
                      <label className="text-[9px] font-black uppercase text-teal-600">Position Title</label>
                      <input required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full p-3 border-2 border-black font-semibold text-xs" />
                   </div>
                   <div className="col-span-2 space-y-2">
                      <label className="text-[9px] font-black uppercase text-teal-600">Organization Name</label>
                      <input required value={editCompany} onChange={e => setEditCompany(e.target.value)} className="w-full p-3 border-2 border-black font-semibold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-teal-600">Location</label>
                      <input required value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full p-3 border-2 border-black font-semibold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-teal-600">Type</label>
                      <select value={editType} onChange={e => setEditType(e.target.value as any)} className="w-full p-3 border-2 border-black font-semibold h-[46px] text-xs">
                        <option>Full-time</option>
                        <option>Internship</option>
                        <option>Contract</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-teal-600">Salary Range</label>
                      <input value={editSalary} onChange={e => setEditSalary(e.target.value)} className="w-full p-3 border-2 border-black font-semibold text-xs" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-teal-600">Application URL</label>
                      <input required value={editLink} onChange={e => setEditLink(e.target.value)} className="w-full p-3 border-2 border-black font-semibold text-xs" />
                   </div>

                   <div className="col-span-2 flex gap-6 py-2">
                      <label className="flex items-center gap-2 cursor-pointer font-black text-[9px] uppercase">
                         <input type="checkbox" checked={editApproved} onChange={e => setEditApproved(e.target.checked)} className="w-4 h-4 border-2 border-black accent-teal-600" />
                         Approved Placement
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-black text-[9px] uppercase">
                         <input type="checkbox" checked={editFeatured} onChange={e => setEditFeatured(e.target.checked)} className="w-4 h-4 border-2 border-black accent-teal-600" />
                         Featured Flag
                      </label>
                   </div>

                   <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
                      <button type="button" onClick={() => setEditingJob(null)} className="py-3 border-2 border-black font-black uppercase text-[10px]">Abort</button>
                      <button disabled={opsLoading} type="submit" className="py-3 bg-[#14B8A6] text-white border-2 border-black font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-2">
                         {opsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'SAVE CHANGES ⚡'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
