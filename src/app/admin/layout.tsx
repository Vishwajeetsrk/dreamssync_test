'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Loader2, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Database, 
  BarChart3, 
  Activity, 
  Menu, 
  X, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Community', href: '/admin/community', icon: MessageSquare },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Resources', href: '/admin/resources', icon: Database },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/logs', icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      const timer = setTimeout(() => {
        if (!isAdmin) router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-12">
         <div className="border-4 border-black bg-white p-10 flex flex-col items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <span className="font-black uppercase tracking-widest text-black">Authenticating Admin Protocol...</span>
         </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-12">
         <div className="max-w-md w-full border-4 border-black bg-white p-12 space-y-8 shadow-[12px_12px_0px_0px_rgba(220,38,38,1)] text-center">
            <div className="w-20 h-20 bg-red-600 text-white flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_black]">
               <ShieldAlert className="w-12 h-12" />
            </div>
            <div className="space-y-4">
               <h1 className="text-3xl font-black uppercase italic text-red-600">Access Restricted</h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                  Required: Admin Level Authorization. Your attempts are being logged in the audit buffer.
               </p>
            </div>
            <button 
               onClick={() => router.push('/dashboard')}
               className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
               Return to Safe Zone
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Sidebar Interface */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-4 border-black flex flex-col shadow-[8px_0px_0px_0px_rgba(0,0,0,0.05)]"
          >
            <div className="p-8 border-b-4 border-black bg-blue-600 text-white flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <ShieldAlert className="w-8 h-8" />
                 <span className="font-black uppercase italic tracking-tighter text-xl">DSYNC ADMIN</span>
               </div>
               <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-black/20">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 pl-4">Management Base</p>
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <div className={`
                    flex items-center justify-between p-4 group transition-all duration-200
                    ${pathname === item.href 
                      ? 'bg-black text-white shadow-[4px_4px_0px_0px_#2563EB]' 
                      : 'hover:bg-slate-50 text-slate-600 hover:text-black hover:translate-x-1'}
                  `}>
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                    </div>
                    {pathname === item.href && <ChevronRight className="w-4 h-4" />}
                  </div>
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t-4 border-black bg-slate-50 space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-black">
                     {userData?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-[10px] font-black uppercase truncate">{userData?.name || 'Administrator'}</p>
                     <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{userData?.email}</p>
                  </div>
               </div>
               <button 
                 onClick={() => router.push('/dashboard')}
                 className="w-full py-3 bg-white border-2 border-black flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_black] hover:shadow-none"
               >
                 <LogOut className="w-4 h-4" /> Exit Panel
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Command Display */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <div className="p-6 lg:p-12 min-h-screen relative">
          {!isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="fixed top-24 left-6 z-40 p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
