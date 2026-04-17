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
    { name: 'Roadmap', href: '/roadmap' },
    { name: 'Career Assistant', href: '/career-agent' },
    { name: 'Make Resume', href: '/resume-builder' },
    { name: 'Check Score', href: '/ats-check' },
    { name: 'Find Path', href: '/ikigai' },
    { name: 'Make Website', href: '/portfolio' },
    { name: 'LinkedIn Help', href: '/linkedin' },
    { name: 'Mental Health AI', href: '/mental-health' },
    { name: 'Guides', href: '/documents' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black px-4 md:px-12 py-4">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="shrink-0 flex items-center gap-3">
           <Image 
             src="/DreamSynclogo.png" 
             alt="DreamSync" 
             width={150} 
             height={40} 
             className="object-contain w-[120px] md:w-[150px]" 
             priority 
           />
        </Link>

        {/* Center Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="relative group">
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black hover:text-blue-600 transition-colors">
              FEATURES <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white border-4 border-black p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="grid gap-1">
                  {featureLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black hover:text-white"
                    >
                      {item.name}
                    </Link>
                  ))}
               </div>
            </div>
          </div>
          <Link href="/about" className="text-xs font-black uppercase tracking-widest text-black hover:text-blue-600 transition-colors">ABOUT US</Link>
          <Link href="/team" className="text-xs font-black uppercase tracking-widest text-black hover:text-blue-600 transition-colors">TEAM</Link>
          <Link href="/community" className="text-xs font-black uppercase tracking-widest text-black hover:text-blue-600 transition-colors">COMMUNITY</Link>
          <Link href="/donate" className="text-xs font-black uppercase tracking-widest bg-[#FACC15] text-black px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">DONATE</Link>
          <Link href="/contact" className="text-xs font-black uppercase tracking-widest text-black hover:text-blue-600 transition-colors">CONTACT</Link>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs font-black uppercase tracking-widest text-black px-4">LOGIN</Link>
              <Link href="/signup" className="hidden sm:block bg-black text-white px-6 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#2563EB]">JOIN NOW</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden lg:flex border-4 border-black px-6 py-2 bg-white font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase">
                DASHBOARD
              </Link>
               <div className="relative">
                  <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 border-4 border-black overflow-hidden flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
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
                          className="absolute right-0 mt-4 w-52 bg-white border-4 border-black p-4 z-[100] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] origin-top-right md:right-0"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="border-b-2 border-black/10 pb-3">
                              <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">Account</p>
                              <p className="font-black text-xs truncate">{userData?.name || 'User'}</p>
                            </div>
                             <Link 
                               href="/profile" 
                               onClick={() => setIsProfileOpen(false)}
                               className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#2563EB] border-2 border-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all"
                             >
                               <Settings className="w-3 h-3" /> SETTINGS
                             </Link>
                            <button 
                              onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all"
                            >
                              <LogOut className="w-4 h-4" /> LOGOUT
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
              className="p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative w-12 h-12 flex items-center justify-center overflow-hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Neo Mobile Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[100] lg:hidden flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10">
               <Image src="/DreamSynclogo.png" alt="Logo" width={120} height={30} className="object-contain" />
               <button onClick={() => setIsMenuOpen(false)} className="p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <X className="w-8 h-8" />
               </button>
            </div>
            
            <div className="space-y-3 mb-12">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Features</p>
              {featureLinks.map((link) => (
                 <Link
                   key={link.href}
                   href={link.href}
                   onClick={() => setIsMenuOpen(false)}
                   className="p-4 border-4 border-black font-black uppercase text-xs text-black bg-white hover:bg-slate-50 flex items-center justify-between transition-all"
                 >
                   {link.name} <ArrowRight className="w-4 h-4" />
                 </Link>
              ))}
            </div>

            <div className="space-y-6">
                <Link
                  href="/donate"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-5 bg-[#2563EB] border-4 border-black text-white text-center font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  SUPPORT US
                </Link>

                <div className="grid grid-cols-2 gap-4 pt-8 border-t-8 border-black">
                   <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-black border-2 border-black p-4 text-center bg-white shadow-[2px_2px_0px_0px_black] active:shadow-none transition-all">ABOUT US</Link>
                   <Link href="/team" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-black border-2 border-black p-4 text-center bg-white shadow-[2px_2px_0px_0px_black] active:shadow-none transition-all">TEAM</Link>
                   <Link href="/community" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-black border-2 border-black p-4 text-center bg-white shadow-[2px_2px_0px_0px_black] active:shadow-none transition-all">COMMUNITY</Link>
                   <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-black border-2 border-black p-4 text-center bg-white shadow-[2px_2px_0px_0px_black] active:shadow-none transition-all">CONTACT</Link>
                   <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 col-span-2 text-center py-5 border-4 border-black bg-white shadow-[4px_4px_0px_0px_black] mt-2 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">GO TO DASHBOARD</Link>
                </div>

                {user && (
                  <div className="pt-8 space-y-4 border-t-4 border-black/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</p>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-xs font-black uppercase text-black border-2 border-black p-3 bg-white">
                         <Settings className="w-4 h-4" /> Profile Settings
                      </Link>
                      <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 text-xs font-black uppercase text-red-600 border-2 border-red-600 p-3 bg-white">
                         <LogOut className="w-4 h-4" /> Logout
                      </button>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
