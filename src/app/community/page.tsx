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
    color: "bg-blue-600 font-white"
  },
  {
    id: 2,
    title: "Resume Workshop",
    desc: "A simple session where we help you build a professional resume from scratch.",
    date: "Sun, Oct 22, 2:00 PM",
    location: "Online (Zoom)",
    type: "Workshop",
    icon: Star,
    count: 89,
    color: "bg-yellow-400"
  },
  {
    id: 3,
    title: "Interview Help Call",
    desc: "Get tips for job interviews from our mentors who already work at big companies.",
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
    title: "Help Your Community",
    org: "NGO Partners",
    type: "Volunteering",
    tags: ["In-person", "Good Work"],
    deadline: "Ongoing",
    link: "#"
  },
  {
    id: 3,
    title: "Social Media Helper",
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
      
      <div className="mt-[88px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-20 space-y-24">
        
        {/* Header Architecture */}
        <header className="border-b-[10px] border-black pb-16 flex flex-col items-center text-center space-y-8">
            <div className="inline-block px-6 py-2 bg-black text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#2563EB] italic">CONNECT WITH STUDENTS</div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-black uppercase italic">
               STUDENT <span className="text-blue-600 not-italic decoration-8 decoration-yellow-400 underline underline-offset-8">CENTRAL</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 font-bold uppercase tracking-tight max-w-2xl mx-auto leading-tight italic">
               Find students to study with, discover new job chances, and build your future together.
            </p>
        </header>

        {/* Filters Architecture */}
        <section className="space-y-8 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
               <div className="bg-black text-white px-6 py-4 border-4 border-black flex items-center gap-3 shadow-[4px_4px_0px_0px_#2563EB] w-full sm:w-auto text-center justify-center">
                  <Filter className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">SHOW ONLY</span>
               </div>
               <div className="flex flex-wrap gap-2 justify-center">
                  {filters.map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-4 text-[10px] font-black uppercase border-4 border-black transition-all ${filter === f ? 'bg-black text-white shadow-[4px_4px_0px_0px_#2563EB]' : 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_black]'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
            </div>
        </section>

        {/* Weekly Activities Section */}
        <section className="space-y-16">
          <div className="text-center md:text-left border-l-[16px] border-yellow-400 pl-8">
            <h2 className="text-4xl md:text-6xl font-black italic text-black uppercase leading-none">WEEKLY CHATS</h2>
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest mt-2">Free events every week</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {activities.map((act) => (
              <motion.div 
                key={act.id} 
                whileHover={{ y: -8 }}
                className="bg-white border-8 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col group h-full hover:shadow-[12px_12px_0px_0px_#2563EB]"
              >
                <div className={`p-6 ${act.color} text-black border-4 border-black inline-block mb-10 shadow-[6px_6px_0px_0px_black] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all`}>
                  <act.icon className="w-10 h-10" />
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <h3 className="text-3xl font-black uppercase italic leading-none text-black">{act.title}</h3>
                  <p className="text-sm font-bold text-gray-500 leading-snug uppercase tracking-tight italic">{act.desc}</p>
                </div>
                <div className="mt-10 pt-10 border-t-8 border-gray-50 space-y-4">
                  <div className="flex items-center gap-4 text-xs font-black uppercase text-black">
                    <Calendar className="w-5 h-5 text-blue-600" /> {act.date}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black uppercase text-black">
                    <MapPin className="w-5 h-5 text-blue-600" /> {act.location}
                  </div>
                </div>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="text-[10px] font-black uppercase text-gray-400 italic">
                     {act.count} STUDENTS JOINING
                   </div>
                   <button className="w-full sm:w-auto px-8 py-4 bg-black text-white border-4 border-black font-black uppercase text-xs shadow-[6px_6px_0px_0px_#2563EB] hover:shadow-none transition-all italic">
                     JOIN NOW
                   </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Opportunities Awareness */}
        <section className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-[16px] border-blue-600 pl-8">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black italic text-black uppercase leading-none">GOOD JOBS FOR YOU</h2>
              <p className="text-gray-400 font-black text-xs uppercase tracking-widest mt-2">UPDATED EVERY DAY</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white border-8 border-black p-10 flex flex-col sm:flex-row gap-10 items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="bg-black text-white p-6 border-8 border-black shadow-[6px_6px_0px_0px_#2563EB] shrink-0">
                  {opp.type === 'Internship' ? <Star className="w-10 h-10" /> : opp.type === 'Volunteering' ? <Globe className="w-10 h-10" /> : <Briefcase className="w-10 h-10" />}
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                   <div className="flex items-center gap-3 justify-center sm:justify-start">
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 border-2 border-blue-600">{opp.type}</span>
                      <span className="text-[10px] font-black uppercase text-red-600 italic animate-pulse">{opp.deadline}</span>
                   </div>
                   <h4 className="text-2xl font-black uppercase italic text-black leading-none">{opp.title}</h4>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">At {opp.org}</p>
                   <div className="flex flex-wrap gap-3 pt-4 justify-center sm:justify-start">
                     {opp.tags.map(t => <span key={t} className="text-[10px] font-black uppercase tracking-widest text-black/50"># {t}</span>)}
                   </div>
                </div>
                <a href={opp.link} className="w-full sm:w-auto px-10 py-5 bg-white text-black border-4 border-black font-black uppercase text-xs shadow-[6px_6px_0px_0px_black] hover:bg-black hover:text-white transition-all text-center italic mt-4 sm:mt-0">
                   APPLY NOW
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Supportive Helper CTA */}
        <section className="pb-24">
           <div className="bg-black text-white p-12 md:p-24 border-[10px] border-black shadow-[20px_20px_0px_0px_#FACC15] text-center space-y-12">
                 <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
                   NEED HELP <br /> STARTING?
                 </h2>
                 <p className="text-xl md:text-3xl font-bold uppercase text-white/70 max-w-3xl mx-auto leading-tight italic">
                   Don't worry, we are here for you. Talk to our mentors for free support step-by-step.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                    <button className="w-full sm:w-auto px-16 py-8 bg-[#FACC15] text-black border-4 border-black font-black uppercase text-sm tracking-widest shadow-[10px_10px_0px_0px_white] hover:shadow-none transition-all italic">
                       CHAT WITH MENTOR
                    </button>
                    <button className="w-full sm:w-auto px-16 py-8 bg-white text-black border-4 border-black font-black uppercase text-sm tracking-widest shadow-[10px_10px_0px_0px_#2563EB] hover:shadow-none transition-all italic">
                       JOIN THE HUB
                    </button>
                 </div>
           </div>
        </section>

      </div>

    </div>
  );
}
