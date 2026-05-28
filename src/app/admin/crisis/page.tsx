'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  AlertOctagon,
  Activity,
  User,
  Clock,
  CheckCircle,
  ShieldAlert,
  Mail,
  PhoneCall,
  Trash2,
  Loader2,
  AlertCircle,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CrisisMonitor() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opsLoading, setOpsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'crisis_alerts'), orderBy('timestamp', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.warn("[CrisisMonitor] Query failed, using raw snapshot...");
      const fallbackUnsubscribe = onSnapshot(collection(db, 'crisis_alerts'), (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlerts(data);
        setLoading(false);
      });
      return () => fallbackUnsubscribe();
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const resolveAlert = async (id: string) => {
    setOpsLoading(true);
    try {
      const alertRef = doc(db, 'crisis_alerts', id);
      await updateDoc(alertRef, { status: 'resolved', resolvedAt: new Date().toISOString() });
      triggerToast('CRISIS ALARM RESOLVED. DISPATCH COMPLETED.');
    } catch {
      triggerToast('ACTION FAILED.');
    } finally {
      setOpsLoading(false);
    }
  };

  const purgeAlert = async (id: string) => {
    if (!confirm('ERASE CRISIS LOG PERMANENTLY?')) return;
    setOpsLoading(true);
    try {
      await deleteDoc(doc(db, 'crisis_alerts', id));
      triggerToast('LOG ENTRY ERASED.');
    } catch {
      triggerToast('ACTION FAILED.');
    } finally {
      setOpsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Flashing Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black bg-[#FACC15] text-black px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-8 border-black pb-8">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-red-600 flex items-center gap-3">
              <AlertOctagon className="w-12 h-12 text-red-600 animate-pulse" /> Crisis <span className="text-black not-italic">Center</span>
           </h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Realtime counselor alert buffer for self-harm and trauma signals.</p>
        </div>

        <div className="bg-red-600 text-white px-6 py-4 border-4 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black] flex items-center gap-2 animate-pulse">
           <ShieldAlert className="w-4 h-4" /> COUNSELOR DISPATCH ACTIVE
        </div>
      </div>

      {/* Active Alerts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
        ) : alerts.length === 0 ? (
          <div className="col-span-full bg-white border-4 border-dashed border-slate-200 p-20 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
             <p className="font-black uppercase text-slate-400">All channels clear. No crisis signals detected.</p>
          </div>
        ) : alerts.map((alert) => {
          const isResolved = alert.status === 'resolved';

          return (
            <div 
              key={alert.id} 
              className={`bg-white border-4 border-black p-8 flex flex-col justify-between shadow-[8px_8px_0px_0px_black] relative ${isResolved ? 'opacity-60 border-slate-300' : 'border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]'}`}
            >
               <div>
                  {/* Status Banner */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-100">
                     <span className={`px-2.5 py-1 border border-black text-[8px] font-black uppercase tracking-widest ${isResolved ? 'bg-slate-100 text-slate-500' : 'bg-red-600 text-white animate-pulse'}`}>
                        {isResolved ? 'RESOLVED' : 'HIGH PRIORITY RED ALERT 🚨'}
                     </span>
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {new Date(alert.timestamp).toLocaleString()}
                     </span>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase text-slate-400">Captured Message</p>
                        <p className="text-sm font-black italic bg-slate-50 p-4 border border-black text-[#1F2937] leading-relaxed max-h-24 overflow-y-auto">
                           "{alert.message || alert.content || 'Message not available'}"
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 text-[9px] font-bold uppercase text-slate-400">
                        <div>
                           <p className="font-black text-black">User</p>
                           <p className="truncate text-blue-600 font-semibold">{alert.userName}</p>
                        </div>
                        <div>
                           <p className="font-black text-black">Severity</p>
                           <p className={`font-black ${
                             alert.severity === 'critical' ? 'text-red-600' :
                             alert.severity === 'high' ? 'text-orange-600' :
                             alert.severity === 'medium' ? 'text-yellow-600' :
                             'text-blue-600'
                           }`}>{alert.severity?.toUpperCase() || 'MEDIUM'}</p>
                        </div>
                        <div className="col-span-2">
                           <p className="font-black text-black">Email</p>
                           <p className="truncate text-blue-600 font-semibold text-xs">{alert.userEmail}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Dispatch Options */}
               <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t-2 border-slate-100 mt-6">
                  {/* resolve chimes */}
                  <div className="flex gap-2">
                     {!isResolved ? (
                        <button 
                          onClick={() => resolveAlert(alert.id)}
                          className="px-4 py-2 border border-black bg-black text-[#FACC15] text-[8px] font-black uppercase shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                           Resolve Alarm
                        </button>
                     ) : (
                        <span className="text-[8px] font-black text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 fill-current" /> Clean Resolved</span>
                     )}
                  </div>

                  {/* Counselor Contact */}
                  <div className="flex gap-2 flex-wrap">
                     <a
                        href={`mailto:${alert.userEmail}?subject=DreamSync Support - We Care About You&body=Hello ${alert.userName},\n\nWe noticed you may need support. Please know you are not alone.\n\n📞 Crisis Resources:\n- National Suicide Prevention Lifeline: 988\n- Crisis Text Line: Text HOME to 741741\n- iCall (India): 9152987821\n- AASRA (India): 9820466726\n\nWe're here to help.`}
                        className="px-3 py-2 border border-black hover:bg-slate-50 text-[8px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white"
                     >
                        <Send className="w-3.5 h-3.5" /> Contact User
                     </a>
                     {!isResolved && (
                        <button
                          onClick={() => purgeAlert(alert.id)}
                          disabled={opsLoading}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-500 transition-colors text-[8px] font-black uppercase disabled:opacity-50"
                        >
                           <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                        </button>
                     )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
