'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Cpu,
  Database,
  Gauge,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const actions = [
  { name: 'User Management', desc: 'Audit profiles, update roles, and resolve account access.', icon: Users, href: '/admin/users', accent: '#C8F15A' },
  { name: 'Job Board Control', desc: 'Approve postings, feature roles, and manage placement quality.', icon: Briefcase, href: '/admin/jobs', accent: '#7CFFB2' },
  { name: 'Community Ops', desc: 'Moderate reports, schedule sessions, and publish broadcasts.', icon: MessageSquare, href: '/admin/community', accent: '#FACC15' },
  { name: 'Resource Vault', desc: 'Curate templates, government links, and student playbooks.', icon: Database, href: '/admin/resources', accent: '#A78BFA' },
];

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [usersCount, setUsersCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [logsCount, setLogsCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsersCount(snap.size);
    }, (err) => console.error('[AdminStats] Users fetch fail:', err));

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snap) => {
      setJobsCount(snap.size);
    }, (err) => console.error('[AdminStats] Jobs fetch fail:', err));

    const unsubPosts = onSnapshot(collection(db, 'community_posts'), (snap) => {
      setPostsCount(snap.size);
    }, (err) => console.error('[AdminStats] Posts fetch fail:', err));

    const logsQuery = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(5));
    const unsubLogs = onSnapshot(logsQuery, (snap) => {
      setLogsCount(snap.size);
      setRecentLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error('[AdminStats] Audit logs fetch fail:', err);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubJobs();
      unsubPosts();
      unsubLogs();
    };
  }, []);

  const stats = [
    { label: 'Active users', value: usersCount, detail: 'Identity graph', icon: Users, trend: '+12.5%', accent: '#C8F15A' },
    { label: 'Placements', value: jobsCount, detail: 'Career inventory', icon: Briefcase, trend: '+5.1%', accent: '#7CFFB2' },
    { label: 'Community posts', value: postsCount, detail: 'Live feed', icon: MessageSquare, trend: '+18.4%', accent: '#FACC15' },
    { label: 'Audit events', value: logsCount, detail: 'Last 50 synced', icon: ShieldCheck, trend: 'Secure', accent: '#A78BFA' },
  ];

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.8fr)]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-hero-panel overflow-hidden p-6 sm:p-8"
        >
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#C8F15A]/20 bg-[#C8F15A]/10 px-3 py-2 text-xs font-medium text-[#C8F15A]">
                <Sparkles className="h-4 w-4" />
                AI-powered community and career ecosystem
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                Welcome back, {userData?.name?.split(' ')?.[0] || 'Admin'}.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Monitor users, placements, community health, AI systems, and operational queues from one premium command surface.
              </p>
            </div>
            <div className="grid min-w-[220px] grid-cols-2 gap-3">
              <HealthMetric label="System" value="Stable" tone="success" />
              <HealthMetric label="AI routing" value="Optimal" tone="accent" />
              <HealthMetric label="Rules" value="Active" tone="accent" />
              <HealthMetric label="Risk" value="Low" tone="success" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="admin-glass-panel p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">AI Insight</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Community intelligence</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#C8F15A]/20 bg-[#C8F15A]/10 text-[#C8F15A]">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Engagement, placements, and audit activity are syncing live. Prioritize moderation queues and fresh job approvals during peak student traffic.
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
            <motion.div initial={{ width: '18%' }} animate={{ width: '76%' }} transition={{ duration: 1.4 }} className="h-full rounded-full bg-[#C8F15A]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>Operational confidence</span>
            <span className="font-medium text-[#C8F15A]">76%</span>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="admin-metric-card group p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]" style={{ color: stat.accent }}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-500 group-hover:text-white">{stat.trend}</span>
            </div>
            <div className="mt-6">
              <p className="text-sm text-zinc-500">{stat.label}</p>
              {loading ? <Loader2 className="mt-3 h-6 w-6 animate-spin text-zinc-600" /> : <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">{stat.value}</p>}
              <p className="mt-2 text-xs text-zinc-600">{stat.detail}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">Quick actions</h3>
              <p className="mt-1 text-sm text-zinc-500">Jump into the workflows that move the platform.</p>
            </div>
            <Link href="/admin/analytics" className="admin-secondary-button hidden sm:inline-flex">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {actions.map((action, i) => (
              <Link key={action.name} href={action.href} className="group">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  className="admin-action-card h-full p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]" style={{ color: action.accent }}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-zinc-600 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#C8F15A]" />
                  </div>
                  <h4 className="mt-5 text-lg font-semibold text-white">{action.name}</h4>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{action.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Activity stream</h3>
              <p className="mt-1 text-xs text-zinc-500">Latest audit events</p>
            </div>
            <Activity className="h-5 w-5 text-[#7CFFB2]" />
          </div>
          <div className="max-h-[27rem] divide-y divide-white/8 overflow-y-auto">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
              </div>
            ) : recentLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-600">No operations logged yet.</div>
            ) : recentLogs.map((log) => (
              <div key={log.id} className="p-5 transition-colors hover:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#C8F15A] shadow-[0_0_12px_rgba(200,241,90,0.8)]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{log.action || 'Admin action'}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{log.details}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-600">
                      <span>{log.adminName || 'Admin'}</span>
                      <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <SystemPanel icon={Gauge} title="System health" value="99.98%" detail="Realtime Firestore listeners and admin rules are active." />
        <SystemPanel icon={Zap} title="AI throughput" value="85%" detail="Routing capacity available for student-facing intelligence." />
        <SystemPanel icon={ShieldCheck} title="Security posture" value="Hardened" detail="Admin role checks, audit logs, and rules are aligned." />
      </section>
    </div>
  );
}

function HealthMetric({ label, value, tone }: { label: string; value: string; tone: 'success' | 'accent' }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/25 p-3">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone === 'success' ? 'text-[#22C55E]' : 'text-[#C8F15A]'}`}>{value}</p>
    </div>
  );
}

function SystemPanel({ icon: Icon, title, value, detail }: { icon: any; title: string; value: string; detail: string }) {
  return (
    <div className="admin-glass-panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#C8F15A]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-500">{detail}</p>
    </div>
  );
}
