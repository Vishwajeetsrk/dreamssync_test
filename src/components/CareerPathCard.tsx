'use client';

import { motion, AnimatePresence } from 'framer-motion';

import { useState } from 'react';
import {
  ExternalLink, ChevronRight, Briefcase, Lightbulb,
  TrendingUp, Wrench, Globe, IndianRupee, Star, Zap,
  Palette, Laptop, Layers, CheckCircle2, type LucideIcon
} from 'lucide-react';
import type { CareerPath } from '@/data/careerPaths';

// ── Icon resolver (Lucide name → component) ───────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Palette, Laptop, Layers, Briefcase, TrendingUp, Wrench, Globe, Lightbulb, Zap,
};

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? CheckCircle2;
  return <Icon className={className} />;
}

// ── Demand Badge ──────────────────────────────────────────────────
function DemandBadge({ demand }: { demand: 'High' | 'Medium' | 'Low' }) {
  const styles = {
    High: 'bg-green-100 text-green-800 border-green-400',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    Low: 'bg-gray-100 text-gray-700 border-gray-400',
  };
  return (
    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${styles[demand]}`}>
      {demand} Demand
    </span>
  );
}

// ── Role Card ─────────────────────────────────────────────────────
function RoleCard({ role }: { role: CareerPath['roleGroups'][0]['roles'][0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${role.color} border-2 border-black p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-black text-base leading-tight">{role.title}</h4>
        <DemandBadge demand={role.demand} />
      </div>

      <div className="flex items-center gap-1 text-sm font-bold text-green-700">
        <IndianRupee className="w-3.5 h-3.5 shrink-0" />
        {role.salary}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1">
        {role.skills.map((s) => (
          <span key={s} className="px-2 py-0.5 bg-white border border-black text-[10px] font-bold uppercase tracking-wide">
            {s}
          </span>
        ))}
      </div>

      {/* Companies */}
      <div className="text-xs text-black font-black flex items-center gap-2 flex-wrap border-t border-black/10 pt-3">
        <Briefcase className="w-3.5 h-3.5 shrink-0" />
        {role.companies.slice(0, 3).join(' · ')}
        {role.companies.length > 3 && ` +${role.companies.length - 3} more`}
      </div>
    </motion.div>
  );
}

// ── Roadmap Flowchart ─────────────────────────────────────────────
function Roadmap({ nodes }: { nodes: CareerPath['roadmap'] }) {
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-[#FACC15]',
    'bg-green-500', 'bg-amber-500',
  ];

  return (
    <div className="overflow-x-auto pb-3">
      <div className="flex items-start min-w-max gap-0">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center">
            {/* Node */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center w-[130px]"
            >
              {/* Circle */}
              <div className={`w-10 h-10 rounded-full ${colors[i % colors.length]} border-4 border-black flex items-center justify-center text-white font-black text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0`}>
                {i + 1}
              </div>
              {/* Card */}
              <div className={`mt-2 ${i === 2 ? 'bg-[#FACC15]' : 'bg-white'} border-2 border-black p-2 text-center w-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                <p className="text-[11px] font-black leading-tight text-black">{node.title}</p>
                <p className="text-[10px] text-blue-600 font-black mt-0.5">{node.timeline}</p>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight font-bold uppercase">{node.desc}</p>
              </div>
            </motion.div>
            {/* Arrow */}
            {i < nodes.length - 1 && (
              <div className="flex items-start pt-4 mx-1 shrink-0">
                <div className="w-6 h-0.5 bg-black mt-[15px]" />
                <ChevronRight className="w-4 h-4 -ml-1 mt-[9px] shrink-0" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tools Grid ────────────────────────────────────────────────────
function ToolsGrid({ tools }: { tools: CareerPath['tools'] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((t) => (
        <div key={t.name} className="bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black text-black">{t.name}</p>
          <p className="text-[9px] text-gray-500 font-bold uppercase">{t.category}</p>
        </div>
      ))}
    </div>
  );
}

// ── Portfolio Platforms ───────────────────────────────────────────
function PortfolioSection({ platforms }: { platforms: CareerPath['portfolioPlatforms'] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {platforms.map((p) => (
        <a
          key={p.name}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black text-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_#2563EB] hover:bg-zinc-900 transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="font-black text-sm uppercase italic">{p.name}</p>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-[11px] text-white/70 uppercase leading-none">{p.desc}</p>
        </a>
      ))}
    </div>
  );
}

// ── Job Cards ─────────────────────────────────────────────────────
function JobCards({ jobs }: { jobs: CareerPath['jobs'] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {jobs.map((j) => (
        <a
          key={j.platform}
          href={j.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black text-white border-4 border-black p-4 flex flex-col gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_0px_#2563EB] transition-all group"
        >
          <p className="font-black text-xs uppercase tracking-wider text-[#2563EB] group-hover:text-white">{j.platform}</p>
          <p className="text-[10px] text-white font-bold uppercase italic leading-tight">{j.label}</p>
          <ExternalLink className="w-4 h-4 mt-auto self-end text-white/40 group-hover:text-white" />
        </a>
      ))}
    </div>
  );
}

// ── Section Toggle ────────────────────────────────────────────────
type Section = 'roles' | 'roadmap' | 'tools' | 'jobs';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'roles', label: 'Roles & Salary', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'roadmap', label: 'Roadmap', icon: <ChevronRight className="w-3.5 h-3.5" /> },
  { id: 'tools', label: 'Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: 'jobs', label: 'Find Jobs', icon: <Globe className="w-3.5 h-3.5" /> },
];

// ── Main Component ────────────────────────────────────────────────
export default function CareerPathCard({ path }: { path: CareerPath }) {
  const [activeSection, setActiveSection] = useState<Section>('roles');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-4 border-black neo-box overflow-hidden"
    >
      {/* Header */}
      <div className={`${path.headerColor} border-b-4 border-black p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-white" />
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Featured Career Path</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight">{path.title}</h3>
            <p className="text-white/85 text-sm font-medium mt-1 max-w-xl">{path.overview}</p>
          </div>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {path.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider border border-white/40 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b-4 border-black overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors border-r-2 border-black ${
              activeSection === s.id ? 'bg-[#2563EB] text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            {s.icon}{s.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* ── Roles ── */}
          {activeSection === 'roles' && (
            <motion.div key="roles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {path.roleGroups.map((group) => (
                <div key={group.category}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 text-xs font-black uppercase tracking-wider mb-3 ${group.categoryColor}`}>
                  <DynamicIcon name={group.icon} className="w-3.5 h-3.5" /> {group.category}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.roles.map((role) => <RoleCard key={role.title} role={role} />)}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Roadmap ── */}
          {activeSection === 'roadmap' && (
            <motion.div key="roadmap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-4 flex items-center gap-1.5 italic">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-600" /> Strategic Progression Protocol
                </p>
                <Roadmap nodes={path.roadmap} />
              </div>
              {/* Portfolio Platforms */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-black mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Where to host your portfolio
                </p>
                <PortfolioSection platforms={path.portfolioPlatforms} />
              </div>
            </motion.div>
          )}

          {/* ── Tools ── */}
          {activeSection === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Industry tools to learn
                </p>
                <ToolsGrid tools={path.tools} />
              </div>
              {/* Quick Tips */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Quick tips
                </p>
                <div className="space-y-2">
                  {path.tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-sm font-medium text-gray-700 flex gap-2 items-start"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
                      <span>{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Jobs ── */}
          {activeSection === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Live job search platforms
              </p>
              <JobCards jobs={path.jobs} />
              <div className="bg-amber-50 border-2 border-amber-400 p-3 text-sm font-medium text-amber-900 flex gap-2 items-start">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span><strong>Pro tip:</strong> Set a job alert on Naukri + LinkedIn for &quot;Graphic Designer&quot; and &quot;UI Designer&quot; — you&apos;ll get daily emails with new openings.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
