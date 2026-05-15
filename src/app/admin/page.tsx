'use client';

import { motion } from 'framer-motion';
import { 
  Users, Briefcase, MessageSquare, ShieldCheck, 
  BarChart3, Zap, ArrowUpRight, TrendingUp, Settings,
  Database, Activity, Globe, Bell
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const stats = [
  { label: 'Total Users', value: '1,284', grow: '+12%', icon: Users, color: 'text-blue-600' },
  { label: 'Jobs Posted', value: '452', grow: '+5%', icon: Briefcase, color: 'text-teal-500' },
  { label: 'Community Posts', value: '89', grow: '+24%', icon: MessageSquare, color: 'text-purple-500' },
  { label: 'AI Operations', value: '15.4K', grow: '+40%', icon: Zap, color: 'text-[#FACC15]' },
];

const actions = [
  { name: 'User Management', desc: 'Audit user records, update roles, and manage permissions.', icon: Users, href: '/admin/users' },
  { name: 'Job Board Control', desc: 'Add new job postings, edit existing listings, or remove expired roles.', icon: Briefcase, href: '/admin/jobs' },
  { name: 'Community Moderator', desc: 'Moderate discussions, manage events, and broadcast announcements.', icon: MessageSquare, href: '/admin/community' },
  { name: 'Resource Vault', desc: 'Manage government resources, templates, and career guides.', icon: Database, href: '/admin/resources' },
];

export default function AdminDashboard() {
  const { userData } = useAuth();

  return (
    <div className="space-y-16">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b-8 border-black pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-600 text-white shadow-[3px_3px_0px_0px_black] pulse-shadow">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Restricted Admin Environment</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-none text-black uppercase italic">
            Control <br /> <span className="text-blue-600 not-italic">Center</span>
          </h1>
        </div>
        
        <div className="ds-card p-6 min-w-[300px] flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operator Alpha</p>
              <p className="text-lg font-black uppercase italic">{userData?.name || 'Administrator'}</p>
           </div>
           <Settings className="w-8 h-8 text-slate-200" />
        </div>
      </div>

      {/* Stats Buffer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="ds-card p-8 space-y-4 ds-card-hover"
          >
            <div className="flex justify-between items-center text-slate-400">
               <s.icon className={`w-6 h-6 ${s.color}`} />
               <span className="text-[10px] font-black uppercase tracking-widest text-teal-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {s.grow}
               </span>
            </div>
            <div className="space-y-1">
               <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">{s.label}</h3>
               <p className="text-4xl font-black italic">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-12">
         {/* Command Actions */}
         <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-4">
               <Zap className="w-8 h-8 text-[#FACC15] fill-current" /> Tactical Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
               {actions.map((a, i) => (
                 <Link key={i} href={a.href} className="group">
                   <div className="ds-card p-8 space-y-6 h-full ds-card-hover">
                     <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 border-2 border-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           <a.icon className="w-6 h-6" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-xl font-black uppercase italic">{a.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{a.desc}</p>
                     </div>
                   </div>
                 </Link>
               ))}
            </div>
         </div>

         {/* Monitoring Buffer */}
         <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase italic flex items-center gap-4">
               <Activity className="w-8 h-8 text-teal-500" /> Audit Log
            </h2>
            <div className="bg-slate-900 text-white border-8 border-black p-8 space-y-8 shadow-[12px_12px_0px_0px_black] min-h-[400px]">
               <div className="space-y-6">
                  {[
                    { event: 'User Registration', time: '2m ago', user: 'ajay_k' },
                    { event: 'New Job Posted', time: '15m ago', user: 'admin' },
                    { event: 'Resume Analysis', time: '24m ago', user: 'priya_m' },
                    { event: 'Community Flag', time: '1h ago', user: 'system' }
                  ].map((log, i) => (
                    <div key={i} className="flex flex-col gap-1 border-b border-white/10 pb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]">{log.event}</span>
                       <div className="flex justify-between items-center text-[9px] font-bold opacity-40 uppercase">
                          <span>By {log.user}</span>
                          <span>{log.time}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <Link href="/admin/logs" className="block">
                  <button className="w-full py-5 border-2 border-white/20 text-[10px] font-black uppercase hover:bg-white hover:text-slate-900 transition-all">
                     View Full Audit Buffer
                  </button>
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
