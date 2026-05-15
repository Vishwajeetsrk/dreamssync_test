'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  FileText, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Download, 
  Globe, 
  Loader2, 
  X,
  Tag,
  UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResourceManagement() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('link'); // 'link' or 'pdf'
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Govt Schemes');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'resources'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalUrl = url;

      if (type === 'pdf' && file) {
        const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'resources'), {
        title,
        type,
        url: finalUrl,
        category,
        created_at: new Date().toISOString()
      });

      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Erase this resource?')) {
      await deleteDoc(doc(db, 'resources', id));
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">System <span className="text-purple-600">Resources</span></h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage templates, guides, and strategic documents.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-3 bg-black text-white px-8 py-4 border-4 border-black font-black uppercase italic text-xs shadow-[6px_6px_0px_0px_#A855F7] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? 'Close Panel' : 'Inject Resource'}
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
            <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Resource Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. ATS Resume Template 2026" className="w-full p-4 border-4 border-black font-bold focus:bg-slate-50 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Content Type</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full p-4 border-4 border-black font-bold h-[60px]">
                        <option value="link">External Link</option>
                        <option value="pdf">PDF Document</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-4 border-4 border-black font-bold h-[60px]">
                        <option>Govt Schemes</option>
                        <option>Career Guides</option>
                        <option>Resume Templates</option>
                        <option>Legal Docs</option>
                      </select>
                    </div>
                 </div>
               </div>

               <div className="space-y-6">
                  {type === 'link' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Target URL</label>
                      <input required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full p-4 border-4 border-black font-bold" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">Upload PDF</label>
                      <label className="w-full h-[60px] border-4 border-black border-dashed flex items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-all font-bold text-xs uppercase">
                         <UploadCloud className="w-5 h-5 text-purple-600" />
                         {file ? file.name : 'Select PDF File'}
                         <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  )}
                  <button disabled={uploading} type="submit" className="w-full py-8 bg-[#A855F7] text-white border-4 border-black font-black uppercase text-xl italic shadow-[8px_8px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                     {uploading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : 'INDEX RESOURCE ⚡'}
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
        ) : resources.length === 0 ? (
          <div className="col-span-full border-4 border-dashed border-slate-200 p-20 text-center"><p className="text-sm font-black text-slate-400 uppercase">Vault Empty.</p></div>
        ) : resources.map(res => (
          <div key={res.id} className="bg-white border-4 border-black p-6 space-y-4 shadow-[6px_6px_0px_0px_black] group hover:shadow-[10px_10px_0px_0px_#A855F7] transition-all">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-slate-50 border-2 border-black group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  {res.type === 'pdf' ? <FileText className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
               </div>
               <button onClick={() => handleDelete(res.id)} className="text-slate-200 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
               <h3 className="font-black uppercase italic leading-tight">{res.title}</h3>
               <div className="flex flex-col gap-2">
                 <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Tag className="w-3 h-3" /> {res.category}</span>
                 <a href={res.url} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:underline">
                   {res.type === 'pdf' ? <Download className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                   Access {res.type}
                 </a>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
