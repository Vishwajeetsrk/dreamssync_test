'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  UserCheck, Plus, Trash2, Edit2, X, Loader2, RefreshCw,
  CheckCircle, AlertTriangle, Linkedin, Globe, Star, Award,
  Briefcase, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALIZATIONS = [
  'Software Engineering', 'Product Management', 'Data Science', 'Design (UI/UX)',
  'Marketing', 'Finance', 'Business Development', 'Career Coaching',
  'Civil Services (IAS/IPS)', 'Entrepreneurship', 'Machine Learning / AI', 'DevOps / Cloud'
];

export default function MentorManagement() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMentor, setEditingMentor] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [photo, setPhoto] = useState('');
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const [opsLoading, setOpsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'mentors'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db2 = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db2 - da;
      });
      setMentors(data);
      setLoading(false);
    }, (err) => {
      console.error('[MentorAdmin] snapshot error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const resetForm = () => {
    setName(''); setEmail(''); setCompany(''); setRole('');
    setSpecialization(SPECIALIZATIONS[0]); setBio('');
    setLinkedin(''); setPhoto(''); setFeatured(false); setActive(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !role) return;
    setOpsLoading(true);
    try {
      await addDoc(collection(db, 'mentors'), {
        name, email, company, role, specialization, bio,
        linkedin, photo, featured, active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sessionsCount: 0,
        rating: 0
      });
      setIsAdding(false);
      resetForm();
      triggerToast('success', `MENTOR "${name.toUpperCase()}" ONBOARDED SUCCESSFULLY! ⚡`);
    } catch (err: any) {
      triggerToast('error', `ADD FAILED: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;
    setOpsLoading(true);
    try {
      await updateDoc(doc(db, 'mentors', editingMentor.id), {
        name, email, company, role, specialization, bio,
        linkedin, photo, featured, active,
        updated_at: new Date().toISOString()
      });
      setEditingMentor(null);
      resetForm();
      triggerToast('success', 'MENTOR PROFILE UPDATED. ⚡');
    } catch (err: any) {
      triggerToast('error', `UPDATE FAILED: ${err.message}`);
    } finally {
      setOpsLoading(false);
    }
  };

  const handleDelete = async (id: string, mentorName: string) => {
    if (!confirm(`REMOVE MENTOR "${mentorName}" PERMANENTLY?`)) return;
    try {
      await deleteDoc(doc(db, 'mentors', id));
      triggerToast('success', 'MENTOR PROFILE REMOVED.');
    } catch (err: any) {
      triggerToast('error', `DELETE FAILED: ${err.message}`);
    }
  };

  const openEdit = (mentor: any) => {
    setEditingMentor(mentor);
    setName(mentor.name || '');
    setEmail(mentor.email || '');
    setCompany(mentor.company || '');
    setRole(mentor.role || '');
    setSpecialization(mentor.specialization || SPECIALIZATIONS[0]);
    setBio(mentor.bio || '');
    setLinkedin(mentor.linkedin || '');
    setPhoto(mentor.photo || '');
    setFeatured(mentor.featured || false);
    setActive(mentor.active !== false);
    setIsAdding(false);
  };

  const toggleActive = async (mentor: any) => {
    try {
      await updateDoc(doc(db, 'mentors', mentor.id), { active: !mentor.active, updated_at: new Date().toISOString() });
      triggerToast('success', `MENTOR ${!mentor.active ? 'ACTIVATED' : 'DEACTIVATED'}.`);
    } catch { triggerToast('error', 'OPERATION FAILED.'); }
  };

  const toggleFeatured = async (mentor: any) => {
    try {
      await updateDoc(doc(db, 'mentors', mentor.id), { featured: !mentor.featured, updated_at: new Date().toISOString() });
      triggerToast('success', `MENTOR ${!mentor.featured ? 'FEATURED' : 'UNFEATURED'}.`);
    } catch { triggerToast('error', 'OPERATION FAILED.'); }
  };

  const FormFields = () => (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Full Name *</label>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dr. Priya Sharma" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mentor@company.com" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Company / Organization *</label>
          <input required value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, IIT Delhi, TCS" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Role / Designation *</label>
          <input required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior Engineer, VP Product" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Specialization</label>
          <select value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full p-4 border-4 border-black font-bold h-[60px] bg-white">
            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Bio / About (short)</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio describing expertise..." rows={3} className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm resize-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">LinkedIn URL</label>
          <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Profile Photo URL</label>
          <input value={photo} onChange={e => setPhoto(e.target.value)} placeholder="https://image.link/photo.jpg" className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 text-sm" />
          {photo && <img src={photo} className="w-16 h-16 border-4 border-black object-cover rounded-full" />}
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-5 h-5 border-2 border-black accent-yellow-400" />
            <span className="text-[11px] font-black uppercase">Featured Mentor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-5 h-5 border-2 border-black accent-green-500" />
            <span className="text-[11px] font-black uppercase">Active</span>
          </label>
        </div>
        <button disabled={opsLoading} type="submit" className="w-full py-5 bg-black text-[#FACC15] border-4 border-black font-black uppercase text-lg italic shadow-[6px_6px_0px_0px_#2563EB] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
          {opsLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
          {editingMentor ? 'Update Mentor Profile ⚡' : 'Onboard Mentor ⚡'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Toast */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-[#FACC15] text-black' : 'bg-red-600 text-white'}`}
          >
            {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {statusMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            Mentor <span className="text-blue-600">Directory</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Onboard, edit and manage the DreamSync mentor network. ({mentors.length} active mentors)
          </p>
        </div>
        <button
          onClick={() => { setIsAdding(!isAdding); setEditingMentor(null); resetForm(); }}
          className="flex items-center gap-3 bg-black text-[#FACC15] px-8 py-4 border-4 border-black font-black uppercase italic text-xs shadow-[6px_6px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Close' : 'Add Mentor'}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="bg-white border-8 border-black p-8 md:p-10 shadow-[12px_12px_0px_0px_#2563EB]"
          >
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
              <UserCheck className="w-7 h-7 text-blue-600" /> Onboard New Mentor
            </h2>
            <form onSubmit={handleAdd}><FormFields /></form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMentor && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-8 border-black max-w-3xl w-full p-8 shadow-[16px_16px_0px_0px_#2563EB] overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                  <Edit2 className="w-6 h-6 text-blue-600" /> Edit: {editingMentor.name}
                </h2>
                <button onClick={() => { setEditingMentor(null); resetForm(); }} className="p-2 border-2 border-black hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdate}><FormFields /></form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mentors Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-300" /></div>
      ) : mentors.length === 0 ? (
        <div className="border-4 border-dashed border-slate-200 p-20 text-center bg-white">
          <UserCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="font-black uppercase text-slate-400">No mentors onboarded yet. Add your first mentor above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {mentors.map((mentor) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black] hover:shadow-[10px_10px_0px_0px_#2563EB] transition-all flex flex-col ${!mentor.active ? 'opacity-50' : ''}`}
            >
              {/* Photo + Name */}
              <div className="flex items-center gap-4 pb-5 border-b-2 border-slate-100 mb-5">
                <div className="w-14 h-14 rounded-full border-4 border-black overflow-hidden bg-slate-100 shrink-0">
                  {mentor.photo ? (
                    <img src={mentor.photo} alt={mentor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-black text-xl">
                      {mentor.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase italic truncate">{mentor.name}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">{mentor.role}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{mentor.company}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 bg-slate-100 border border-black text-[9px] font-black uppercase">{mentor.specialization}</span>
                {mentor.featured && <span className="px-2.5 py-1 bg-[#FACC15] border border-black text-[9px] font-black uppercase flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
                {!mentor.active && <span className="px-2.5 py-1 bg-red-100 border border-red-500 text-red-600 text-[9px] font-black uppercase">Inactive</span>}
              </div>

              {/* Bio */}
              {mentor.bio && <p className="text-[10px] font-bold text-slate-500 leading-relaxed line-clamp-2 mb-4">{mentor.bio}</p>}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-slate-100 mb-5">
                <div className="text-center">
                  <p className="text-xl font-black">{mentor.sessionsCount || 0}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black">{mentor.rating > 0 ? `${mentor.rating}/5` : '—'}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Rating</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-auto">
                {mentor.linkedin && (
                  <a href={mentor.linkedin} target="_blank" className="p-2.5 border-2 border-black hover:bg-blue-600 hover:text-white transition-colors shadow-[2px_2px_0px_0px_black] hover:shadow-none">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => toggleFeatured(mentor)} title={mentor.featured ? 'Unfeature' : 'Feature'} className={`p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none transition-all ${mentor.featured ? 'bg-yellow-400' : 'hover:bg-yellow-50'}`}>
                  <Star className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(mentor)} title={mentor.active ? 'Deactivate' : 'Activate'} className={`p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none transition-all flex-1 text-[9px] font-black uppercase ${mentor.active ? 'hover:bg-red-50 hover:text-red-600' : 'bg-green-400'}`}>
                  {mentor.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(mentor)} className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:bg-slate-50 transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(mentor.id, mentor.name)} className="p-2.5 bg-white border-2 border-black hover:bg-red-600 hover:text-white shadow-[2px_2px_0px_0px_black] hover:shadow-none transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
