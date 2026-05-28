'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  Command,
  Cpu,
  Database,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users, badge: 'Live' },
  { name: 'Community', href: '/admin/community', icon: MessageSquare },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Mentors', href: '/admin/mentors', icon: UserCheck },
  { name: 'Approvals', href: '/admin/verification', icon: UserCheck, badge: 'Queue' },
  { name: 'Crisis Center', href: '/admin/crisis', icon: AlertOctagon, alert: true },
  { name: 'AI Controls', href: '/admin/ai', icon: Cpu },
  { name: 'Resources', href: '/admin/resources', icon: Database },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/logs', icon: Activity },
];

const routeLabels: Record<string, string> = {
  '/admin': 'Command Center',
  '/admin/users': 'User Management',
  '/admin/community': 'Community Ops',
  '/admin/jobs': 'Job Board',
  '/admin/mentors': 'Mentor Network',
  '/admin/verification': 'Approvals',
  '/admin/crisis': 'Crisis Center',
  '/admin/ai': 'AI Controls',
  '/admin/resources': 'Resources',
  '/admin/analytics': 'Analytics',
  '/admin/logs': 'Audit Logs',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      const timer = setTimeout(() => {
        if (!isAdmin) router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, loading, router]);

  const currentPage = useMemo(() => routeLabels[pathname] || 'Admin Workspace', [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="admin-glass-panel w-full max-w-sm p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-lg border border-[#C8F15A]/30 bg-[#C8F15A]/10">
            <Loader2 className="h-7 w-7 animate-spin text-[#C8F15A]" />
          </div>
          <p className="text-sm font-semibold text-white">Authenticating admin workspace</p>
          <p className="mt-2 text-xs text-zinc-500">Validating access token and role permissions.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <div className="admin-glass-panel max-w-md p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Access restricted</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Admin-level authorization is required. You will be routed back to your dashboard.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="admin-primary-button mt-8 w-full justify-center"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  const sidebar = (
    <AdminSidebar
      pathname={pathname}
      compact={!isSidebarOpen}
      userData={userData}
      onCloseMobile={() => setMobileOpen(false)}
      onExit={() => router.push('/dashboard')}
    />
  );

  return (
    <div className="admin-premium min-h-screen bg-[#0A0A0A] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[-12rem] h-96 w-96 rounded-full bg-[#C8F15A]/10 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-0 h-[32rem] w-[32rem] rounded-full bg-[#7CFFB2]/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_32rem)]" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className={`hidden lg:block transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
          <div className="fixed inset-y-0 left-0 z-40">
            {sidebar}
          </div>
        </aside>

        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
              >
                {sidebar}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0A0A]/78 backdrop-blur-2xl">
            <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setMobileOpen(true)}
                className="admin-icon-button lg:hidden"
                aria-label="Open admin navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(v => !v)}
                className="admin-icon-button hidden lg:inline-flex"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>DreamSync</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="truncate text-zinc-300">{currentPage}</span>
                </div>
                <h1 className="mt-1 truncate text-lg font-semibold tracking-tight text-white sm:text-xl">{currentPage}</h1>
              </div>

              <div className="hidden min-w-[18rem] max-w-md flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] xl:flex">
                <Search className="h-4 w-4 text-zinc-500" />
                <span className="flex-1">Search users, jobs, posts, reports...</span>
                <span className="flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">
                  <Command className="h-3 w-3" /> K
                </span>
              </div>

              <button className="admin-icon-button" aria-label="Theme preference">
                <Moon className="h-5 w-5" />
              </button>
              <button className="admin-icon-button relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C8F15A] shadow-[0_0_14px_rgba(200,241,90,0.9)]" />
              </button>
              <button className="admin-primary-button hidden sm:inline-flex">
                <Sparkles className="h-4 w-4" />
                Quick action
              </button>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-lg border border-white/10 bg-[#111]/90 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] ${active ? 'bg-[#C8F15A] text-black' : 'text-zinc-500'}`}>
              <item.icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function AdminSidebar({
  pathname,
  compact,
  userData,
  onCloseMobile,
  onExit
}: {
  pathname: string;
  compact: boolean;
  userData: any;
  onCloseMobile: () => void;
  onExit: () => void;
}) {
  return (
    <div className={`flex h-full flex-col border-r border-white/10 bg-[#0D0D0D]/94 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl ${compact ? 'w-24' : 'w-72'}`}>
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
          <Image src="/DreamSynclogo.png" alt="DreamSync Logo" width={34} height={34} className="h-8 w-8 object-contain" />
        </div>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-white">DreamSync Admin</p>
            <p className="truncate text-xs text-zinc-500">AI career ecosystem</p>
          </div>
        )}
        <button onClick={onCloseMobile} className="admin-icon-button lg:hidden" aria-label="Close admin navigation">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!compact && (
        <div className="mx-2 mt-4 rounded-lg border border-[#C8F15A]/20 bg-[#C8F15A]/8 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-[#C8F15A]">DreamSync Workspace</p>
            <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.85)]" />
          </div>
          <p className="mt-1 text-xs text-zinc-500">Production console</p>
        </div>
      )}

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
        {!compact && <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Navigation</p>}
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onCloseMobile} title={compact ? item.name : undefined}>
              <motion.div
                whileHover={{ x: compact ? 0 : 3 }}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-white text-white shadow-[0_0_0_1px_rgba(200,241,90,0.22),0_16px_40px_rgba(0,0,0,0.24)]'
                    : item.alert
                      ? 'text-red-300 hover:bg-red-500/10'
                      : 'text-zinc-500 hover:bg-white/[0.04] hover:text-white'
                }`}
                style={active ? { background: 'linear-gradient(135deg, rgba(200,241,90,0.16), rgba(124,255,178,0.05))' } : undefined}
              >
                {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#C8F15A]" />}
                <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-[#C8F15A]' : item.alert ? 'text-red-300' : 'text-zinc-500 group-hover:text-[#7CFFB2]'}`} />
                {!compact && (
                  <>
                    <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                    {item.badge && <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500">{item.badge}</span>}
                    {item.alert && <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(255,77,79,0.8)]" />}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        {!compact && (
          <div className="mb-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Team</p>
            <div className="mt-3 flex -space-x-2">
              {['V', 'D', 'AI'].map((label) => (
                <span key={label} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0A0A0A] bg-[#191919] text-[10px] font-semibold text-zinc-300">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C8F15A] text-sm font-bold text-black">
            {(userData?.name || userData?.email || 'A').charAt(0).toUpperCase()}
          </div>
          {!compact && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{userData?.name || 'Administrator'}</p>
              <p className="truncate text-xs text-zinc-500">{userData?.email || 'admin@dreamsync'}</p>
            </div>
          )}
        </div>
        <button onClick={onExit} className={`mt-3 admin-secondary-button ${compact ? 'w-full justify-center px-0' : 'w-full justify-center'}`}>
          <LogOut className="h-4 w-4" />
          {!compact && 'Exit panel'}
        </button>
      </div>
    </div>
  );
}
