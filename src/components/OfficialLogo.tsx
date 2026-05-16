'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface OfficialLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function OfficialLogo({ className = '', size = 'md' }: OfficialLogoProps) {
  const sizes = {
    sm: { width: 120, height: 35 },
    md: { width: 160, height: 45 },
    lg: { width: 220, height: 60 },
  };

  const s = sizes[size];

  return (
    <motion.div 
      whileHover={{ 
        scale: 1.05,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`select-none cursor-pointer flex items-center justify-center ${className}`}
    >
      <Image 
        src="/DreamSynclogo.png" 
        alt="DreamSync Logo" 
        width={s.width} 
        height={s.height} 
        priority
        className="object-contain"
      />
    </motion.div>
  );
}
