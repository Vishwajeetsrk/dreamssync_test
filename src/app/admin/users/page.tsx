'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users, Search, Shield,
  Trash2, Edit, Loader2,
  Lock, X, Save, Filter, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editPlan, setEditPlan] = useState('free');
  const [editStatus, setEditStatus] = useState('active');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editInAdmin, setEditInAdmin] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

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

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'user');
    setEditPlan(user.plan || 'free');
    setEditStatus(user.status || 'active');
    setEditIsAdmin(user.isAdmin === true);
    setEditInAdmin(user.inAdmin === true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);

    const updates = {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      plan: editPlan.trim() || 'free',
      status: editStatus.trim() || 'active',
      isAdmin: editIsAdmin,
      inAdmin: editInAdmin,
      updated_at: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', editingUser.id), updates);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));
      setEditingUser(null);
    } catch (err) {
      alert("USER UPDATE PROTOCOL FAILED.");
    } finally {
      setSavingUser(false);
    }
  };

  const exportUsers = () => {
    const headers = ['id', 'name', 'email', 'role', 'plan', 'status', 'created_at'];
    const rows = filteredUsers.map(user => headers.map(header => JSON.stringify(user[header] || '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dreamsync-users-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role || 'user') === roleFilter;
    return matchesSearch && matchesRole;
  });

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
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH UID / EMAIL"
                className="w-full pl-12 pr-6 py-4 border-4 border-black text-xs font-black uppercase italic focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
           </div>
           <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-30" />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full sm:w-44 border-4 border-black py-4 pl-11 pr-4 text-xs font-black uppercase"
              >
                <option value="all">All roles</option>
                <option value="user">User</option>
                <option value="student">Student</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
                <option value="suspended">Suspended</option>
              </select>
           </div>
           <button
             onClick={exportUsers}
             className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all"
             aria-label="Export user data"
           >
              <Download className="w-6 h-6" />
           </button>
           <button onClick={fetchUsers} className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all">
              <Loader2 className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UserStat label="Visible users" value={filteredUsers.length} />
        <UserStat label="Admins" value={users.filter(u => ['admin', 'super_admin'].includes(u.role)).length} />
        <UserStat label="Suspended" value={users.filter(u => u.role === 'suspended' || u.status === 'suspended').length} />
        <UserStat label="Total records" value={users.length} />
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
                  <button
                    onClick={() => openEditUser(user)}
                    className="p-3 bg-white border-2 border-black hover:bg-slate-50 shadow-[3px_3px_0px_0px_black] hover:shadow-none transition-all"
                  >
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

      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="bg-white border-8 border-black max-w-2xl w-full p-8 shadow-[16px_16px_0px_0px_black]"
            >
              <div className="flex items-start justify-between border-b-4 border-black pb-5 mb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase italic">Edit User Record</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editingUser.id}</p>
                </div>
                <button onClick={() => setEditingUser(null)} className="p-2 border-2 border-black hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveUser} className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 border-4 border-black font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Email</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full p-4 border-4 border-black font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Role</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full p-4 border-4 border-black font-bold bg-white h-[58px] text-sm">
                    <option value="user">user</option>
                    <option value="student">student</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                    <option value="suspended">suspended</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Plan</label>
                  <input value={editPlan} onChange={e => setEditPlan(e.target.value)} className="w-full p-4 border-4 border-black font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Status</label>
                  <input value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full p-4 border-4 border-black font-bold text-sm" />
                </div>
                <div className="space-y-3 border-4 border-black p-4">
                  <label className="flex items-center gap-3 text-[11px] font-black uppercase">
                    <input type="checkbox" checked={editIsAdmin} onChange={e => setEditIsAdmin(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                    isAdmin flag
                  </label>
                  <label className="flex items-center gap-3 text-[11px] font-black uppercase">
                    <input type="checkbox" checked={editInAdmin} onChange={e => setEditInAdmin(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                    inAdmin flag
                  </label>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-5 border-t-2 border-slate-100">
                  <button type="button" onClick={() => setEditingUser(null)} className="py-4 border-4 border-black font-black uppercase text-xs">
                    Cancel
                  </button>
                  <button disabled={savingUser} type="submit" className="py-4 bg-blue-600 text-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save User
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

function UserStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_black]">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black italic">{value}</p>
    </div>
  );
}
