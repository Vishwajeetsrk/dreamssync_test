'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  MapPin, 
  DollarSign, 
  X, 
  Loader2, 
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobBoardControl() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [type, setType] = useState('Full-time');
  const [link, setLink] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'jobs'), {
        title,
        company,
        location,
        salary,
        type,
        link,
        created_at: new Date().toISOString(),
      });
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setLocation('');
    setSalary('');
    setLink('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this job listing?')) {
      await deleteDoc(doc(db, 'jobs', id));
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Job <span className="text-teal-500">Board</span> Control</h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deploy new opportunities to the student grid.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 border-4 border-black font-black uppercase italic text-xs shadow-[6px_6px_0px_0px_#14B8A6] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Close Panel' : 'Market New Role'}
        </button>
      </div>

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
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Junior Frontend Dev" className="w-full p-4 border-4 border-black font-bold focus:bg-slate-50 transition-all" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Organization Name</label>
                    <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="Company Name" className="w-full p-4 border-4 border-black font-bold focus:bg-slate-50 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Location</label>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote / City" className="w-full p-4 border-4 border-black font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Type</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full p-4 border-4 border-black font-bold h-[60px]">
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
                    <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. ₹6-12 LPA" className="w-full p-4 border-4 border-black font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Application URL</label>
                    <input required value={link} onChange={e => setLink(e.target.value)} placeholder="https://careers.google.com/..." className="w-full p-4 border-4 border-black font-bold" />
                  </div>
                  <button type="submit" className="w-full py-8 bg-[#14B8A6] text-white border-4 border-black font-black uppercase text-xl italic shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                     BROADCAST JOB ⚡
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full border-4 border-dashed border-slate-200 p-20 text-center"><p className="text-sm font-black text-slate-400 uppercase">Buffer Empty.</p></div>
        ) : jobs.map(job => (
          <div key={job.id} className="bg-white border-4 border-black p-8 flex flex-col sm:flex-row gap-8 shadow-[8px_8px_0px_0px_black] group hover:border-[#FACC15] transition-all relative">
            <div className="p-4 bg-slate-900 text-[#FACC15] border-2 border-black h-fit shadow-[4px_4px_0px_0px_black]">
               <Briefcase className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black uppercase italic">{job.title}</h3>
                    <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{job.company}</p>
                  </div>
                  <button onClick={() => handleDelete(job.id)} className="text-slate-200 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
               </div>
               <div className="flex flex-wrap gap-4 pt-2">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t-2 border-slate-50">
                  <span className="px-3 py-1 bg-slate-50 border-2 border-black text-[9px] font-black uppercase">{job.type}</span>
                  <a href={job.link} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 group-hover:underline">Visit <ArrowUpRight className="w-3 h-3" /></a>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
