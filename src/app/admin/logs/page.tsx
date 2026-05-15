'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Activity, Shield, Clock, User, HardDrive, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-12">
      <div className="space-y-2">
         <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Audit <span className="text-blue-600">Buffer</span></h1>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historical record of all administrative operations.</p>
      </div>

      <div className="bg-slate-900 border-8 border-black shadow-[12px_12px_0px_0px_black] overflow-hidden">
        <div className="p-6 bg-black border-b-4 border-black flex items-center justify-between">
           <div className="flex items-center gap-3 text-white">
              <HardDrive className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Log Terminal</span>
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black text-green-400 animate-pulse">
              <Shield className="w-3 h-3" /> ENCRYPTION: ACTIVE
           </div>
        </div>

        <div className="divide-y-2 divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
           {loading ? (
             <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/20" /></div>
           ) : logs.length === 0 ? (
             <div className="p-20 text-center text-white/20 uppercase font-black">Buffer Empty. No actions recorded.</div>
           ) : logs.map((log, i) => (
             <motion.div 
               key={log.id}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors"
             >
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 border-2 border-white/20 flex items-center justify-center text-[#FACC15] shrink-0">
                      <Activity className="w-5 h-5" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-black text-white uppercase italic">{log.action}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase truncate max-w-md">{log.details}</p>
                   </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                         <User className="w-3 h-3" /> {log.adminName}
                      </span>
                      <span className="text-[9px] font-bold text-white/20 uppercase flex items-center gap-2">
                         <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                      </span>
                   </div>
                   <div className="hidden md:block w-2 bg-green-500 h-2 rounded-full shadow-[0_0_8px_#22C55E]" />
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
