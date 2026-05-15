'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Users, Search, Filter, Mail, Shield, 
  Trash2, Edit, ChevronRight, Loader2,
  Lock, Unlock, Star, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userId), { role: nextRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    } catch (err) {
      alert("UPDATE PROTOCOL FAILED.");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("ERASE USER RECORD PERMANENTLY?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert("DELETE PROTOCOL FAILED.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-4 md:px-12 max-w-7xl mx-auto space-y-12 mt-1.5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b-8 border-black pb-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic flex items-center gap-4">
             <Users className="w-12 h-12 text-blue-600" /> User Buffer
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Database Record Manipulation</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH UID / EMAIL"
                className="w-full pl-12 pr-6 py-4 border-4 border-black text-xs font-black uppercase italic focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
           </div>
           <button onClick={fetchUsers} className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all">
              <Loader2 className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      {/* User Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-4 border-black">
         <div className="col-span-4">Identification</div>
         <div className="col-span-2 text-center">Protocol Role</div>
         <div className="col-span-2 text-center">Subscription</div>
         <div className="col-span-2 text-center">Last Sync</div>
         <div className="col-span-2 text-right">Manipulation</div>
      </div>

      {/* User List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center uppercase font-black text-slate-400 italic animate-pulse">
             Accessing Encrypted Records...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center uppercase font-black text-slate-400 border-4 border-dashed border-slate-200">
             No Matching Signal Detected.
          </div>
        ) : (
          filteredUsers.map((user, i) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border-4 border-black p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-[6px_6px_0px_0px_black] hover:border-blue-600 transition-all group"
            >
               {/* Identity */}
               <div className="col-span-1 lg:col-span-4 flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-100 border-2 border-black flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                     {user.avatar_url ? (
                       <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                     ) : (
                       <Users className="w-6 h-6 opacity-20" />
                     )}
                  </div>
                  <div className="space-y-1">
                     <p className="font-black uppercase italic text-lg leading-none">{user.name || 'Anonymous'}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{user.email}</p>
                  </div>
               </div>

               {/* Role */}
               <div className="col-span-1 lg:col-span-2 flex justify-center">
                  <button 
                    onClick={() => toggleRole(user.id, user.role)}
                    className={`px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-slate-50'}`}
                  >
                     {user.role === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                     {user.role || 'user'}
                  </button>
               </div>

               {/* Plan */}
               <div className="col-span-1 lg:col-span-2 flex justify-center">
                  <span className="text-[10px] font-black uppercase bg-yellow-400 border-2 border-black px-4 py-1.5 shadow-[2px_2px_0px_0px_black]">
                     {user.plan || 'Free'} Signal
                  </span>
               </div>

               {/* Last Sync */}
               <div className="col-span-1 lg:col-span-2 flex justify-center text-[10px] font-bold uppercase text-slate-400 text-center">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Historical'}
               </div>

               {/* Actions */}
               <div className="col-span-1 lg:col-span-2 flex justify-end gap-3">
                  <button className="p-3 bg-white border-2 border-black hover:bg-slate-50 shadow-[3px_3px_0px_0px_black] hover:shadow-none transition-all">
                     <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-3 bg-red-600 text-white border-2 border-black hover:bg-red-700 shadow-[3px_3px_0px_0px_black] hover:shadow-none transition-all"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
