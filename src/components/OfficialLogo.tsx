'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface OfficialLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function OfficialLogo({ className = '', size = 'md' }: OfficialLogoProps) {
  const sizes = {
    sm: { font: 'text-sm', icon: 'w-4 h-4', padding: 'px-2 py-1', gap: 'gap-1.5', shadow: 'shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]' },
    md: { font: 'text-lg', icon: 'w-5 h-5', padding: 'px-4 py-2', gap: 'gap-2', shadow: 'shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]' },
    lg: { font: 'text-2xl', icon: 'w-8 h-8', padding: 'px-6 py-3', gap: 'gap-3', shadow: 'shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]' },
  };

  const s = sizes[size];

  return (
    <motion.div 
      whileHover={{ 
        rotateY: 15, 
        rotateX: -10, 
        scale: 1.05,
        translateZ: 20
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`flex items-center ${s.gap} bg-black text-white ${s.padding} border-4 border-black ${s.shadow} select-none transform-gpu preserve-3d cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{ 
          rotate: [0, 15, 0, -15, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut"
        }}
      >
        <Sparkles className={`${s.icon} text-yellow-300 fill-yellow-300`} />
      </motion.div>
      <span className={`font-black ${s.font} uppercase tracking-tighter italic`}>
        VISHWAJEET
      </span>
    </motion.div>
  );
}
