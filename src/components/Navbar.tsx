'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Coffee, LogOut, ShieldCheck, User as UserIcon, Menu, X, Sparkles, Orbit, Zap, LayoutDashboard, Fingerprint, ArrowRight, Settings, Instagram, Twitter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { user, userData } = useAuth();
  const { t } = useLanguage();
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Sign out from both Firebase and NextAuth
      await firebaseSignOut(auth);
      await nextAuthSignOut({ redirect: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect
      window.location.href = '/';
    }
  };

  const featureLinks = [
    { name: 'AI ROADMAP', href: '/roadmap' },
    { name: 'AI CAREER AGENT', href: '/career-agent' },
    { name: 'RESUME BUILDER', href: '/resume-builder' },
    { name: 'ATS CHECK', href: '/ats-check' },
    { name: 'IKIGAI FINDER', href: '/ikigai' },
    { name: 'PORTFOLIO GEN', href: '/portfolio' },
    { name: 'LINKEDIN OPTIMIZER', href: '/linkedin' },
    { name: 'MENTAL HEALTH AI', href: '/mental-health' },
    { name: 'ROADMAPS & DOCS', href: '/documents' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black px-6 md:px-12 py-5">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="shrink-0 inline-block group">
           <Image 
             src="/DreamSynclogo.png" 
             alt="DreamSync Logo" 
             width={180} 
             height={45} 
             className="object-contain" 
             priority 
           />
        </Link>

        {/* Center Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="relative group">
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black hover:text-[#2563EB] transition-colors">
              FEATURES <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 neo-box bg-white p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
               <div className="grid gap-1">
                  {featureLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#2563EB] hover:text-white border-2 border-transparent"
                    >
                      {item.name}
                    </Link>
                  ))}
               </div>
            </div>
          </div>
          <Link href="/about" className="text-xs font-black uppercase tracking-widest text-black hover:text-[#2563EB] transition-colors">ABOUT</Link>
          <Link href="/team" className="text-xs font-black uppercase tracking-widest text-black hover:text-[#2563EB] transition-colors">TEAM</Link>
          <Link href="/contact" className="text-xs font-black uppercase tracking-widest text-black hover:text-[#2563EB] transition-colors">CONTACT</Link>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-3 mr-4">
            <a 
              href="https://www.instagram.com/dream_sync_hub?igsh=MW50dHk3Znh5eTczcg==" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Follow us on Instagram"
              className="p-2 border-2 border-black hover:bg-yellow-300 transition-all hover:scale-110"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com/ADreamsync" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Follow us on X"
              className="p-2 border-2 border-black hover:bg-yellow-300 transition-all hover:scale-110"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          <Link 
            href="/donate" 
            className="hidden sm:flex items-center gap-2 bg-[#FACC15] border-4 border-black px-6 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Coffee className="w-4 h-4 fill-current" /> SUPPORT US
          </Link>

          {!user ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-black px-4">LOGIN</Link>
              <Link href="/signup" className="bg-black text-white border-4 border-black px-6 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">SIGN UP</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden md:flex border-4 border-black px-6 py-2 bg-white font-black text-xs uppercase uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                DASHBOARD
              </Link>
              <div className="relative group">
                <button className="w-10 h-10 rounded-full border-4 border-black overflow-hidden flex items-center justify-center bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  {userData?.avatar_url ? (
                    <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute right-0 mt-4 w-60 neo-box bg-white p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                  <div className="flex flex-col gap-4">
                    <div className="border-b-2 border-black/10 pb-4">
                      <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">User Profile</p>
                      <p className="font-black text-sm uppercase truncate">{userData?.name || 'User'}</p>
                    </div>
                    <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all">
                      <Settings className="w-4 h-4" /> PROFILE SETTINGS
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all">
                      <LogOut className="w-4 h-4" /> LOGOUT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Shell */}
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 border-4 border-black bg-white">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Neo Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-6 top-32 neo-box bg-white z-40 lg:hidden flex flex-col p-8"
          >
            <div className="space-y-4">
              {featureLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-5 border-4 border-black font-black uppercase text-sm text-black hover:bg-[#2563EB] hover:text-white flex items-center justify-between transition-all"
                >
                  {link.name} <ArrowRight className="w-5 h-5" />
                </Link>
              ))}
              <div className="pt-4 space-y-4">
                <Link
                  href="/donate"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-5 bg-[#FACC15] border-4 border-black text-black text-center font-black uppercase text-sm"
                >
                  DONATE HUB
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
