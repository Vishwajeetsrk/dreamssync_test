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
    title: "Weekly Chat",
    desc: "Talk with other students about your future and AI tools. No tech skill needed!",
    date: "Every Sat, 11:00 AM",
    location: "Online (Discord)",
    type: "Free",
    icon: Zap,
    count: 124,
    color: "bg-blue-600 text-white"
  },
  {
    id: 2,
    title: "Resume Workshop",
    desc: "A simple session where we help you build a pro resume from scratch.",
    date: "Sun, Oct 22, 2:00 PM",
    location: "Online (Zoom)",
    type: "Workshop",
    icon: Star,
    count: 89,
    color: "bg-yellow-400"
  },
  {
    id: 3,
    title: "Interview Help",
    desc: "Get tips for job interviews from our mentors at big companies.",
    date: "Wed, Oct 25, 6:00 PM",
    location: "Online",
    type: "Free",
    icon: Users,
    count: 245,
    color: "bg-teal-500"
  }
];

const opportunities = [
  {
    id: 1,
    title: "Junior Developer",
    org: "TechIndia Solutions",
    type: "Internship",
    tags: ["Remote", "Paid", "For Students"],
    deadline: "2 days left",
    link: "#"
  },
  {
    id: 2,
    title: "Help Community",
    org: "NGO Partners",
    type: "Volunteering",
    tags: ["In-person", "Good Work"],
    deadline: "Ongoing",
    link: "#"
  },
  {
    id: 3,
    title: "Social Helper",
    org: "StartupHub India",
    type: "Monthly Job",
    tags: ["Part-time"],
    deadline: "1 week left",
    link: "#"
  }
];

export default function Community() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'This Week', 'Online', 'Free'];

  return (
    <div className="min-h-screen bg-white selection:bg-yellow-200 overflow-x-hidden p-0 m-0">
      
      <div className="mt-20 sm:mt-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 space-y-20">
        
        {/* Header Section */}
        <header className="border-b-[6px] border-black pb-12 text-center space-y-6">
            <div className="inline-block px-4 py-1.5 bg-black text-white font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#2563EB] italic">STUDENT HUB</div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none text-black uppercase italic">
               STUDENT <span className="text-blue-600 not-italic decoration-4 decoration-yellow-400 underline underline-offset-4">CENTRAL</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 font-bold uppercase tracking-tight max-w-xl mx-auto italic leading-tight">
               Find students to study with and discover new job chances together.
            </p>
        </header>

        {/* Filters */}
        <section className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
               <div className="bg-black text-white px-5 py-3 border-2 border-black flex items-center gap-2 shadow-[3px_3px_0px_0px_#2563EB] w-full sm:w-auto justify-center">
                  <Filter className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase italic">SHOW ONLY</span>
               </div>
               <div className="flex flex-wrap gap-2 justify-center">
                  {filters.map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-3 text-[10px] font-black uppercase border-2 border-black transition-all ${filter === f ? 'bg-black text-white shadow-[3px_3px_0px_0px_#2563EB]' : 'bg-white text-black hover:bg-gray-50 shadow-[3px_3px_0px_0px_black]'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
            </div>
        </section>

        {/* Activities */}
        <section className="space-y-10">
          <div className="text-center md:text-left border-l-8 border-yellow-400 pl-6">
            <h2 className="text-3xl md:text-5xl font-black italic text-black uppercase leading-none tracking-tighter">WEEKLY CHATS</h2>
            <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mt-1">FREE EVENTS EVERY WEEK</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((act) => (
              <motion.div 
                key={act.id} 
                whileHover={{ y: -4 }}
                className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col group h-full hover:shadow-[8px_8px_0px_0px_#2563EB] transition-all"
              >
                <div className={`p-4 ${act.color} text-black border-2 border-black inline-block mb-8 shadow-[4px_4px_0px_0px_black] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all`}>
                  <act.icon className="w-8 h-8" />
                </div>
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="text-2xl font-black uppercase italic leading-none">{act.title}</h3>
                  <p className="text-[11px] font-bold text-gray-400 leading-snug uppercase tracking-tight italic">{act.desc}</p>
                </div>
                <div className="mt-8 pt-8 border-t-2 border-black/5 space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase text-black italic">
                    <Calendar className="w-4 h-4 text-blue-600" /> {act.date}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase text-black italic">
                    <MapPin className="w-4 h-4 text-blue-600" /> {act.location}
                  </div>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                   <div className="text-[9px] font-black uppercase text-gray-400 italic font-bold">
                     {act.count} STUDENTS JOINING
                   </div>
                   <button className="w-full sm:w-auto px-6 py-3 bg-black text-white border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_#2563EB] hover:shadow-none transition-all italic">
                     JOIN NOW
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Jobs */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-8 border-blue-600 pl-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black italic text-black uppercase leading-none tracking-tighter">JOBS FOR YOU</h2>
              <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mt-1 italic">UPDATED EVERY DAY</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white border-4 border-black p-8 flex flex-col sm:flex-row gap-8 items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="bg-black text-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_#2563EB] shrink-0">
                  {opp.type === 'Internship' ? <Star className="w-8 h-8" /> : opp.type === 'Volunteering' ? <Globe className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                   <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 border-2 border-blue-600">{opp.type}</span>
                      <span className="text-[9px] font-black uppercase text-red-600 italic">{opp.deadline}</span>
                   </div>
                   <h4 className="text-xl font-black uppercase italic text-black leading-none">{opp.title}</h4>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic leading-none">At {opp.org}</p>
                </div>
                <a href={opp.link} className="w-full sm:w-auto px-8 py-4 bg-white text-black border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:bg-black hover:text-white transition-all text-center italic">
                   APPLY NOW
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 pt-8">
           <div className="bg-black text-white p-10 md:p-16 border-[8px] border-black shadow-[16px_16px_0px_0px_#FACC15] text-center space-y-8">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                   NEED HELP <br /> STARTING?
                 </h2>
                 <p className="text-base md:text-xl font-bold uppercase text-white/50 max-w-xl mx-auto italic leading-tight">
                   Talk to our mentors for free support step-by-step.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button className="w-full sm:w-auto px-12 py-5 bg-[#FACC15] text-black border-2 border-black font-black uppercase text-[11px] tracking-widest shadow-[6px_6px_0px_0px_white] transition-all italic">
                       TALK TO MENTOR
                    </button>
                    <button className="w-full sm:w-auto px-12 py-5 bg-white text-black border-2 border-black font-black uppercase text-[11px] tracking-widest shadow-[6px_6px_0px_0px_#2563EB] transition-all italic">
                       JOIN HUB
                    </button>
                 </div>
           </div>
        </section>

      </div>

    </div>
  );
}
