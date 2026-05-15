'use client';

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  Activity,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const mainStats = [
  { label: 'Network Users', value: '14,284', trend: '+12.5%', color: 'text-blue-600' },
  { label: 'Retention Rate', value: '86%', trend: '+4.2%', color: 'text-green-500' },
  { label: 'AI Compute', value: '45.2K', trend: '+28.0%', color: 'text-[#FACC15]' },
  { label: 'Jobs Seeded', value: '1,204', trend: '+5.1%', color: 'text-teal-500' },
];

const trafficData = [
  { segment: 'Organic Search', value: 45, color: 'bg-blue-600' },
  { segment: 'Direct Access', value: 30, color: 'bg-black' },
  { segment: 'Recruitment Referral', value: 15, color: 'bg-[#FACC15]' },
  { segment: 'Other Buffers', value: 10, color: 'bg-slate-200' },
];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b-8 border-black pb-12">
        <div className="space-y-4">
           <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Fleet <span className="text-blue-600">Analytics</span></h1>
           <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Real-time Performance Monitoring Array</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-black text-white px-6 py-4 border-4 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#2563EB]">Live: Node 01</div>
           <div className="bg-white text-black px-6 py-4 border-4 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black]">Cycle: Q2-2026</div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mainStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border-4 border-black p-8 space-y-4 shadow-[8px_8px_0px_0px_black] group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
             <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                <TrendingUp className={`w-5 h-5 ${stat.color}`} />
             </div>
             <div className="space-y-1">
                <p className="text-4xl font-black italic leading-none">{stat.value}</p>
                <p className={`text-[10px] font-black ${stat.color} tracking-tighter`}>{stat.trend} VS LAST CYCLE</p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid lg:grid-cols-3 gap-12">
         {/* Traffic Segmentation */}
         <div className="lg:col-span-2 bg-white border-8 border-black p-12 shadow-[12px_12px_0px_0px_black] space-y-12">
            <div className="flex justify-between items-center bg-slate-900 text-white p-6 -mx-12 -mt-12 mb-12 border-b-8 border-black">
               <h2 className="text-2xl font-black uppercase italic italic flex items-center gap-4">
                  <Target className="w-8 h-8 text-[#FACC15]" /> Audience Segmentation
               </h2>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60">
                  <Activity className="w-4 h-4 animate-pulse text-green-400" /> System: Stable
               </div>
            </div>

            <div className="space-y-10">
               {trafficData.map((t, i) => (
                 <div key={i} className="space-y-4">
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-black uppercase italic">{t.segment}</span>
                       <span className="text-xl font-black">{t.value}%</span>
                    </div>
                    <div className="h-6 w-full border-4 border-black bg-slate-50 relative overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${t.value}%` }}
                         transition={{ duration: 1, delay: i * 0.2 }}
                         className={`h-full ${t.color}`}
                       />
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-12 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-300">
               <span>Index: Alpha-Prime</span>
               <button className="flex items-center gap-2 text-black hover:text-blue-600 transition-colors">
                  Detailed Buffer <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Signal Intelligence */}
         <div className="bg-black text-white border-8 border-black p-12 shadow-[16px_16px_0px_0px_#FACC15] space-y-8 flex flex-col items-center text-center justify-center">
            <div className="w-24 h-24 bg-white text-black border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#2563EB] mb-8 rotate-3">
               <Zap className="w-12 h-12 fill-current" />
            </div>
            <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">AI Usage <br /> Peak</h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
               System compute usage has increased by 40% in current cycle. Resource allocation may need expansion.
            </p>
            <div className="w-full h-2 bg-white/10 border-2 border-white/20 mt-8 overflow-hidden">
               <motion.div 
                 initial={{ width: "20%" }} animate={{ width: "85%" }} transition={{ duration: 2 }}
                 className="h-full bg-[#FACC15]" 
               />
            </div>
            <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-widest">85% Capacity Utilized</span>
         </div>
      </div>
    </div>
  );
}
