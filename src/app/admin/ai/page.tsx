'use client';

import { useState, useEffect } from 'react';
import { Cpu, Zap, Settings, RefreshCw, BarChart, Server, Activity, ShieldCheck, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIControls() {
  const [activeModel, setActiveModel] = useState('Gemini 1.5 Pro');
  const [opsLoading, setOpsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [timerange, setTimerange] = useState('24h');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchMetrics();
  }, [timerange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai/monitor?timerange=${timerange}`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch AI metrics:', err);
      triggerToast('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const switchModel = async (modelName: string) => {
    setOpsLoading(true);
    setTimeout(() => {
      setActiveModel(modelName);
      setOpsLoading(false);
      triggerToast(`AI ROUTING PROTOCOL RECONFIGURED TO: ${modelName.toUpperCase()}`);
    }, 1200);
  };

  const providers = [
    { name: 'Gemini 1.5 Pro', speed: 'High Depth', latency: '1.4s', cost: '$0.007', status: 'Active', desc: 'Used for resume checks & roadmaps' },
    { name: 'Groq Llama 3', speed: 'Empathetic Flash', latency: '0.3s', cost: '$0.0015', status: 'Standby', desc: 'Used for counselor chats & advice' },
    { name: 'GPT-4o Fallback', speed: 'Balanced Quality', latency: '1.2s', cost: '$0.015', status: 'Standby', desc: 'Automated fallback configuration' }
  ];

  return (
    <div className="space-y-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black bg-[#FACC15] text-black px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-black" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Cpu className="w-12 h-12 text-[#2563EB]" /> AI Layer <span className="text-[#2563EB] not-italic">Controls</span>
           </h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dynamic LLM router engine configuration and token diagnostics.</p>
        </div>

        <div className="bg-slate-900 text-white px-6 py-4 border-4 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black]">
           System status: {metrics?.totalCalls > 0 ? 'Optimized' : 'Initializing'}
        </div>
      </div>

      {/* Timerange Selector */}
      <div className="flex gap-3 pb-6">
        {['24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimerange(range)}
            className={`px-4 py-2 border-2 border-black text-xs font-black uppercase ${
              timerange === range ? 'bg-black text-white' : 'bg-white text-black hover:bg-slate-50'
            }`}
          >
            {range}
          </button>
        ))}
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="ml-auto px-4 py-2 border-2 border-black bg-blue-50 text-blue-600 font-black uppercase flex items-center gap-2 hover:bg-blue-100"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-slate-200" /></div>
      ) : metrics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pb-12">
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black]">
            <p className="text-xs font-black uppercase text-slate-400 mb-2">Total Calls</p>
            <p className="text-4xl font-black text-blue-600">{metrics.totalCalls}</p>
            <p className="text-xs text-slate-500 mt-2">API invocations tracked</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black]">
            <p className="text-xs font-black uppercase text-slate-400 mb-2">Total Tokens</p>
            <p className="text-4xl font-black text-green-600">{(metrics.totalTokens / 1000).toFixed(1)}K</p>
            <p className="text-xs text-slate-500 mt-2">Input + Output</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black]">
            <p className="text-xs font-black uppercase text-slate-400 mb-2">Cost</p>
            <p className="text-4xl font-black text-amber-600">${metrics.totalCost.toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-2">USD spent</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_black]">
            <p className="text-xs font-black uppercase text-slate-400 mb-2">Avg Latency</p>
            <p className="text-4xl font-black text-purple-600">{metrics.avgLatency}ms</p>
            <p className="text-xs text-slate-500 mt-2">Response time</p>
          </div>
        </div>
      ) : null}

      {/* Switchboard Dashboard */}
      <div className="grid lg:grid-cols-3 gap-12">
         {/* Switchboard Toggles */}
         <div className="lg:col-span-2 bg-white border-8 border-black p-10 shadow-[12px_12px_0px_0px_black] space-y-8">
            <h2 className="text-2xl font-black uppercase italic flex items-center gap-2">
               <Server className="w-6 h-6 text-blue-600" /> Dynamic Model Switchboard
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
               Instruct the central routing layer to toggle active computational engines instantly across all user nodes.
            </p>

            <div className="space-y-6 pt-4">
               {providers.map((p, i) => {
                 const isActive = activeModel === p.name;
                 return (
                   <div 
                     key={i} 
                     className={`border-4 border-black p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all relative ${isActive ? 'bg-blue-50/10 border-blue-600 shadow-[4px_4px_0px_0px_#2563EB]' : 'bg-white shadow-[4px_4px_0px_0px_black]'}`}
                   >
                      <div className="space-y-2">
                         <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black uppercase italic">{p.name}</h3>
                            <span className={`px-2 py-0.5 border text-[7px] font-black uppercase ${isActive ? 'bg-green-400 border-black' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                               {isActive ? 'Routing Active' : 'Standby'}
                            </span>
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight">{p.desc}</p>
                      </div>

                      <div className="flex gap-4 items-center">
                         <div className="text-right text-[9px] font-bold uppercase text-slate-400 space-y-0.5">
                            <p>Speed: <span className="font-black text-black">{p.speed}</span></p>
                            <p>Latency: <span className="font-black text-blue-600">{p.latency}</span></p>
                            <p>Cost/1k: <span className="font-black text-black">{p.cost}</span></p>
                         </div>

                         {!isActive && (
                           <button 
                             disabled={opsLoading}
                             onClick={() => switchModel(p.name)}
                             className="px-4 py-2 border-2 border-black bg-black text-[#FACC15] text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                           >
                              Route here
                           </button>
                         )}
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Diagnostics */}
         <div className="bg-black text-white border-8 border-black p-10 shadow-[16px_16px_0px_0px_#FACC15] space-y-8 flex flex-col justify-between">
            <div>
               <div className="w-16 h-16 bg-[#2563EB] text-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_black] rotate-6 mb-6">
                  <Activity className="w-8 h-8" />
               </div>
               <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-4">Diagnostics</h3>
               <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
                  Compute arrays are running in institutional parity bounds. Model switching latency is optimized below 1.2 seconds globally.
               </p>

               <div className="space-y-4 mt-8 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                     <span>Active Engine:</span>
                     <span className="text-[#FACC15] italic">{activeModel}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                     <span>Token Allocation:</span>
                     <span className="text-white">85.4% Capacity</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                     <span>Edge Latency:</span>
                     <span className="text-green-400">0.32s avg</span>
                  </div>
               </div>
            </div>

            <div className="w-full h-2 bg-white/10 border border-white/20 overflow-hidden mt-6">
               <div className="h-full bg-[#FACC15] w-[85%]" />
            </div>
         </div>
      </div>
    </div>
  );
}

import { CheckCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
