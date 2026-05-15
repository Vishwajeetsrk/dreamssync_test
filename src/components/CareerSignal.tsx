'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, ShieldCheck, TrendingUp } from 'lucide-react';

interface CareerSignalProps {
  strength?: number; // 0 to 100
}

export default function CareerSignal({ strength = 65 }: CareerSignalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [momentum, setMomentum] = useState(strength);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      // Handle Resize
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const amplitude = 40 + (momentum / 10);
      const frequency = 0.02;

      // Draw Grid Lines (Engineering Look)
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw Primary Signal Wave
      ctx.beginPath();
      ctx.lineWidth = 6;
      ctx.strokeStyle = momentum > 80 ? '#22C55E' : '#2563EB';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * frequency + offset) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Secondary Shadow Wave
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.setLineDash([10, 10]);
      for (let x = 0; x < width; x++) {
        const y = (centerY + 10) + Math.sin(x * (frequency * 0.8) + offset * 1.5) * (amplitude * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Animation Update
      offset += 0.05 + (momentum / 1000);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [momentum]);

  return (
    <div className="ds-card overflow-hidden bg-white relative group">
       {/* Background Terminal Header */}
       <div className="bg-black text-white px-6 py-3 border-b-4 border-black flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Momentum Signal: ACTIVE</span>
          </div>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
             <div className="w-2 h-2 rounded-full bg-yellow-400" />
             <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
       </div>

       <div className="flex flex-col lg:flex-row divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-black">
          {/* Visual Area */}
          <div className="flex-1 h-64 relative bg-slate-50 cursor-crosshair">
             <canvas ref={canvasRef} className="w-full h-full" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[120px] font-black text-black opacity-[0.03] uppercase italic select-none">DYNAMIC</div>
             </div>
          </div>

          {/* Tactical Stats Area */}
          <div className="lg:w-80 p-8 space-y-8 bg-white flex flex-col justify-center">
             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Velocity</p>
                   <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-6xl font-black italic">{momentum}%</span>
                   <span className="text-xs font-black text-green-500 uppercase">+4.2</span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="w-full h-4 bg-slate-100 border-2 border-black relative overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${momentum}%` }}
                     className="h-full bg-blue-600"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 border-2 border-black bg-slate-50 text-center">
                      <p className="text-[8px] font-black uppercase text-slate-400">Signal</p>
                      <p className="text-xs font-black uppercase tracking-tighter">Verified</p>
                   </div>
                   <div className="p-3 border-2 border-black bg-slate-50 text-center">
                      <p className="text-[8px] font-black uppercase text-slate-400">Node</p>
                      <p className="text-xs font-black uppercase tracking-tighter">Local-Alpha</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={() => setMomentum(prev => Math.min(prev + 5, 100))}
               className="ds-btn ds-btn-primary w-full py-4 text-[10px]"
             >
                Boost Signal ⚡
             </button>
          </div>
       </div>

       {/* Decorative Elements */}
       <div className="absolute bottom-4 left-6 flex items-center gap-4 opacity-20 pointer-events-none">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Secure Data Link Established // DreamSync Core</span>
       </div>
    </div>
  );
}
