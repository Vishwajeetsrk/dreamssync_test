'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Coffee, LogOut, ShieldCheck, User as UserIcon, Menu, X, Sparkles, Orbit, Zap, LayoutDashboard, Fingerprint, ArrowRight, Settings } from 'lucide-react';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black px-4 md:px-12 py-4 md:py-5">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="shrink-0 inline-block group">
           <Image 
             src="/DreamSynclogo.png" 
             alt="DreamSync Logo" 
             width={180} 
             height={45} 
             className="object-contain w-[140px] md:w-[180px]" 
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
          <Link href="/donate" className="text-xs font-black uppercase tracking-widest text-[#2563EB] hover:bg-[#2563EB] hover:text-white px-3 py-1 border-2 border-transparent hover:border-black transition-all">SUPPORT US</Link>
          <Link href="/contact" className="text-xs font-black uppercase tracking-widest text-black hover:text-[#2563EB] transition-colors">CONTACT</Link>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4">



          {!user ? (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-black px-4">LOGIN</Link>
              <Link href="/signup" className="bg-black text-white border-4 border-black px-6 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">SIGN UP</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden lg:flex border-4 border-black px-6 py-2 bg-white font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                DASHBOARD
              </Link>
               <div className="relative">
                 <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full border-4 border-black overflow-hidden flex items-center justify-center bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                 >
                   {userData?.avatar_url ? (
                     <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon className="w-5 h-5" />
                   )}
                 </button>

                 <AnimatePresence>
                   {isProfileOpen && (
                     <>
                        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsProfileOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-52 neo-box bg-white p-4 z-[100] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] origin-top-right md:right-0"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="border-b-2 border-black/10 pb-3">
                              <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">Account</p>
                              <p className="font-black text-[10px] uppercase truncate">{userData?.name || 'User'}</p>
                            </div>
                             <Link 
                               href="/profile" 
                               onClick={() => setIsProfileOpen(false)}
                               className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all"
                             >
                               <motion.div
                                 animate={{ rotate: 360 }}
                                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                 className="flex items-center justify-center"
                               >
                                 <Settings className="w-3 h-3" />
                               </motion.div> SETTINGS
                             </Link>
                            <button 
                              onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all group"
                            >
                              <motion.div
                                whileHover={{ x: 3 }}
                                transition={{ repeat: Infinity, duration: 0.5, repeatType: "reverse" }}
                              >
                                <LogOut className="w-4 h-4" />
                              </motion.div>
                              LOGOUT
                            </button>
                          </div>
                        </motion.div>
                     </>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          )}

          <div className="lg:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] relative w-12 h-12 flex items-center justify-center overflow-hidden active:translate-x-0.5 active:translate-y-0.5"
            >
              <div className="flex flex-col gap-1.5 items-center justify-center">
                <motion.span 
                  animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="w-6 h-1 bg-black block"
                />
                <motion.span 
                  animate={isMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                  className="w-6 h-1 bg-black block"
                />
                <motion.span 
                  animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="w-6 h-1 bg-black block"
                />
              </div>
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
            className="fixed inset-0 bg-white z-[100] lg:hidden flex flex-col p-6 pt-24 overflow-y-auto"
          >
            <div className="flex justify-end p-4 absolute top-4 right-4">
               <button onClick={() => setIsMenuOpen(false)} className="p-2 border-4 border-black bg-white">
                  <X className="w-6 h-6" />
               </button>
            </div>
            <div className="space-y-4">
              {featureLinks.map((link) => (
                 <Link
                   key={link.href}
                   href={link.href}
                   onClick={() => setIsMenuOpen(false)}
                   className="p-2 border-2 border-black font-black uppercase text-[10px] text-black hover:bg-[#2563EB] hover:text-white flex items-center justify-between transition-all"
                 >
                   {link.name} <ArrowRight className="w-3 h-3" />
                 </Link>
              ))}
              <div className="pt-4 space-y-4">
                 <Link
                   href="/donate"
                   onClick={() => setIsMenuOpen(false)}
                   className="block w-full py-3 bg-[#2563EB] border-2 border-black text-white text-center font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                 >
                   SUPPORT US
                 </Link>

                <div className="pt-8 space-y-4 border-t-4 border-black mt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account & Settings</p>
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-2 border-2 border-black font-black uppercase text-[10px] text-[#2563EB]">
                       <Settings className="w-3 h-3" /> Profile Settings
                    </Link>
                    <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 p-2 border-2 border-black font-black uppercase text-[10px] text-red-600">
                       <LogOut className="w-3 h-3" /> Logout
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
