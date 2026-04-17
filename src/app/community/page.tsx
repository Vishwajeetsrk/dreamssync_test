'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Target, 
  Search, 
  Filter, 
  CheckCircle,
  ExternalLink,
  Zap,
  Star,
  Globe
} from 'lucide-react';

const activities = [
  {
    id: 1,
    title: "Weekly Tech Sync",
    desc: "Join fellow students to discuss the latest in AI and web development. No experience needed!",
    date: "Every Sat, 11:00 AM",
    location: "Online (Discord)",
    type: "Free",
    icon: Zap,
    count: 124,
    color: "bg-blue-600"
  },
  {
    id: 2,
    title: "Resume Masterclass",
    desc: "A hands-on workshop where we help you build an ATS-friendly resume from scratch.",
    date: "Sun, Oct 22, 2:00 PM",
    location: "Online",
    type: "Workshop",
    icon: Star,
    count: 89,
    color: "bg-yellow-400"
  },
  {
    id: 3,
    title: "Interview Prep Q&A",
    desc: "Ask anything about job interviews to our community mentors who work at top companies.",
    date: "Wed, Oct 25, 6:00 PM",
    location: "Near Bangalore / Online",
    type: "Free",
    icon: Users,
    count: 245,
    color: "bg-teal-500"
  }
];

const opportunities = [
  {
    id: 1,
    title: "Junior Web Developer",
    org: "TechIndia Solutions",
    type: "Internship",
    tags: ["Remote", "Paid", "Entry Level"],
    deadline: "2 days left",
    link: "#"
  },
  {
    id: 2,
    title: "Community Outreach",
    org: "NGO Partners",
    type: "Volunteering",
    tags: ["In-person", "Social Impact"],
    deadline: "Ongoing",
    link: "#"
  },
  {
    id: 3,
    title: "Social Media Manager",
    org: "StartupHub India",
    type: "Job",
    tags: ["Hybrid", "Full-time"],
    deadline: "1 week left",
    link: "#"
  }
];

export default function Community() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'This Week', 'Near Me', 'Online', 'Free'];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 font-bold uppercase overflow-x-hidden">
      
      <div className="mt-[44px]" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24">
        
        {/* Header Architecture */}
        <header className="border-b-8 border-black pb-16 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-black text-white shadow-[3px_3px_0px_0px_#2563EB]">
                  <Users className="w-8 h-8" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 text-left">The Unified Student Hub</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-none text-black italic">
               Community <br /> <span className="text-blue-600 not-italic decoration-8 decoration-yellow-400 underline underline-offset-8">Central</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-500 font-semibold uppercase tracking-tight mt-4 max-w-2xl">
               Connect with thousands of students, find activities, and grow your career together.
            </p>
          </div>
          
          <div className="bg-blue-600 text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_black] hidden lg:block">
            <h3 className="text-3xl font-black italic mb-2">5,432+</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Active Members This Month</p>
          </div>
        </header>

        {/* Filters Infrastructure */}
        <section className="space-y-8">
           <div className="flex flex-wrap items-center gap-4">
              <div className="bg-black text-white p-4 border-2 border-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                 <Filter className="w-5 h-5" />
                 <span className="text-xs font-black uppercase tracking-widest">Filter by</span>
              </div>
              <div className="flex flex-wrap gap-3">
                 {filters.map(f => (
                   <button 
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-6 py-4 text-[10px] font-black uppercase border-4 border-black transition-all ${filter === f ? 'bg-black text-white shadow-[4px_4px_0px_0px_#2563EB]' : 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
           </div>
        </section>

        {/* Weekly Activities Section */}
        <section className="space-y-12">
          <h2 className="text-4xl font-black flex items-center gap-6 border-l-[16px] border-yellow-400 pl-8 italic text-black">
            WEEKLY ACTIVITIES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {activities.map((act) => (
              <motion.div 
                key={act.id} 
                whileHover={{ y: -4 }}
                className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col group h-full"
              >
                <div className={`p-4 ${act.color} text-black border-4 border-black inline-block mb-8 shadow-[4px_4px_0px_0px_black] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all`}>
                  <act.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-black uppercase italic leading-none text-black break-words">{act.title}</h3>
                  <p className="text-sm font-bold text-gray-500 leading-snug uppercase tracking-tight">{act.desc}</p>
                </div>
                <div className="mt-8 pt-8 border-t-4 border-gray-100 space-y-4">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-black">
                    <Calendar className="w-4 h-4 text-blue-600" /> {act.date}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-black">
                    <MapPin className="w-4 h-4 text-blue-600" /> {act.location}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4">
                   <div className="text-[10px] font-black uppercase text-gray-400">
                     {act.count} STUDENTS JOINING
                   </div>
                   <button className="px-6 py-3 bg-black text-white border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_#2563EB] hover:shadow-none transition-all">
                     JOIN EVENT
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Opportunities Awareness */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="text-4xl font-black flex items-center gap-6 border-l-[16px] border-blue-600 pl-8 italic text-black">
              OPPORTUNITIES
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Updates every 24 hours</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white border-4 border-black p-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="bg-black text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_#2563EB]">
                  {opp.type === 'Internship' ? <Star className="w-8 h-8" /> : opp.type === 'Volunteering' ? <Globe className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
                </div>
                <div className="flex-1 space-y-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-600">{opp.type}</span>
                      <span className="text-[9px] font-black uppercase text-red-600">{opp.deadline}</span>
                   </div>
                   <h4 className="text-xl font-black uppercase italic text-black">{opp.title}</h4>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">At {opp.org}</p>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {opp.tags.map(t => <span key={t} className="text-[8px] font-black uppercase tracking-widest text-gray-400"># {t}</span>)}
                   </div>
                </div>
                <a href={opp.link} className="w-full sm:w-auto px-8 py-4 bg-white text-black border-4 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:bg-black hover:text-white transition-all text-center">
                   APPLY NOW
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Supportive Helper CTA */}
        <section className="pb-20">
           <div className="bg-black text-white p-12 md:p-20 border-8 border-black shadow-[12px_12px_0px_0px_#FACC15] relative overflow-hidden group">
              <div className="relative z-10 space-y-10">
                 <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                   Need some help <br /> getting started?
                 </h2>
                 <p className="text-xl font-bold uppercase text-white/70 max-w-2xl leading-relaxed">
                   Our mentors are here to guide you step-by-step. Join our Discord community or book a short intro call to start your journey.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <button className="px-12 py-5 bg-[#FACC15] text-black border-4 border-black font-black uppercase text-[12px] tracking-widest shadow-[6px_6px_0px_0px_white] hover:shadow-none transition-all">
                       CHAT WITH MENTOR
                    </button>
                    <button className="px-12 py-5 bg-white text-black border-4 border-black font-black uppercase text-[12px] tracking-widest shadow-[6px_6px_0px_0px_#2563EB] hover:shadow-none transition-all">
                       JOIN THE HUB
                    </button>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 pointer-events-none" />
           </div>
        </section>

      </div>

    </div>
  );
}
