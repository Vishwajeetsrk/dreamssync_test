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
  orderBy
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
  AlertCircle,
  Users,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCommunity() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [link, setLink] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMeetings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !link || !date) return;

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
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error('Failed to add meeting', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setLink('');
    setDate('');
    setTime('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this meeting permanently?')) {
      await deleteDoc(doc(db, 'meetings', id));
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Community <span className="text-blue-600">Events</span></h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage Google Meet sessions and workshops.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 border-4 border-black font-black uppercase italic text-xs shadow-[6px_6px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Cancel' : 'Add New Session'}
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
            <form onSubmit={handleAddMeeting} className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Event Title</label>
                    <input 
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Weekly Career Roadmap Q&A"
                      className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all placeholder:text-slate-200"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">One-Line Bio</label>
                    <input 
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Short description for students"
                      className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all placeholder:text-slate-200"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Meeting Link (Google Meet / Zoom)</label>
                    <input 
                      required
                      value={link}
                      onChange={e => setLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all placeholder:text-slate-200"
                    />
                 </div>
               </div>

               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Date</label>
                      <input 
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Time</label>
                      <input 
                        type="time"
                        required
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="h-full flex items-end">
                    <button type="submit" className="w-full py-8 bg-[#FACC15] text-black border-4 border-black font-black uppercase text-xl italic shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                       Deploy Event to Users ⚡
                    </button>
                  </div>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-slate-200" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="col-span-full bg-white border-4 border-dashed border-slate-200 p-20 text-center">
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No active sessions scheduled.</p>
          </div>
        ) : meetings.map((meet) => (
          <motion.div 
            key={meet.id}
            layout
            className="bg-white border-4 border-black p-8 flex flex-col md:flex-row gap-8 shadow-[8px_8px_0px_0px_black] group hover:shadow-[12px_12px_0px_0px_#2563EB] transition-all"
          >
            <div className="w-16 h-16 bg-blue-50 border-2 border-black flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
               <Video className="w-8 h-8" />
            </div>
            
            <div className="flex-1 space-y-4">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase italic">{meet.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{meet.desc || 'No description provided'}</p>
                  </div>
                  <button onClick={() => handleDelete(meet.id)} className="text-slate-200 hover:text-red-600 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-50">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase">
                     <Calendar className="w-4 h-4 text-blue-600" /> {meet.date}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase">
                     <Clock className="w-4 h-4 text-blue-600" /> {meet.time}
                  </div>
               </div>

               <div className="pt-4 flex items-center justify-between">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase border-2 border-black ${meet.status === 'upcoming' ? 'bg-green-400' : 'bg-slate-200'}`}>
                    {meet.status}
                  </span>
                  <a href={meet.link} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:underline">
                    Test Link <ExternalLink className="w-3 h-3" />
                  </a>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
