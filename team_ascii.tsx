'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Users, Linkedin, X, Info } from 'lucide-react';

const team = [
  {
    name: "Anand Biniya",
    dept: "Leadership",
    link: "https://www.linkedin.com/in/anandbin/",
    image: "/Anand.jpeg",
    bgColor: "#FACC15", // Yellow
    intro: "Strategic visionary leading DreamSync's AI evolution. Dedicated to bridging the gap between talent and opportunity for 10M+ Indian students."
  },
  {
    name: "Ayush Bajpai",
    dept: "Operations",
    link: "https://www.linkedin.com/in/ayush-bajpai25/",
    image: "/Ayush.jpeg",
    bgColor: "#60A5FA", // Blue
    intro: "Execution powerhouse ensuring platform reliability. Specializes in optimizing organizational workflows and scaling intelligence clusters."
  },
  {
    name: "Vishwajeet",
    dept: "CE Training",
    link: "https://www.linkedin.com/in/vishwajeetsrk/",
    image: "/vishwajeet.jpeg",
    bgColor: "#FB923C", // Orange (changed from red for variety)
    intro: "Chief architect of the CE Training protocol. Developing high-fidelity learning pathways for complex technical ecosystems."
  },
  {
    name: "Chaitanya Khaleja",
    dept: "Programme",
    link: "https://www.linkedin.com/in/chaitanya-khaleja-975502255/",
    image: "/Chaitanya.jpeg",
    bgColor: "#4ADE80", // Green
    intro: "Community engagement specialist focused on empowerment. Building support nodes for care-experienced individuals across the platform."
  },
  {
    name: "Nisha Das",
    dept: "Resources",
    link: "https://www.linkedin.com/in/nisha-das-ab9bb5246/",
    image: "/Nisha.jpeg",
    bgColor: "#F472B6", // Pink
    intro: "Resource pipeline manager optimizing document verification and global guidance nodes for professional success."
  },
  {
    name: "Hrithik Kumar",
    dept: "Project Management",
    link: "https://www.linkedin.com/in/kumar-hrithik/",
    image: "/Hrithik.jpg",
    bgColor: "#A78BFA", // Violet
    intro: "Strategic project lead focused on scaling AI-driven career intelligence nodes across the DreamSync ecosystem."
  },
];

export default function Team() {
  const [activeMember, setActiveMember] = useState<null | typeof team[0]>(null);

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-12 px-4 relative">

      {/* Introduction Modal */}
      <AnimatePresence>
        {activeMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setActiveMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, rotate: -1, y: 20 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.9, rotate: 1, y: 20 }}
              className="bg-white border-8 border-black p-5 md:p-6 max-w-[92%] md:max-w-lg w-full mx-auto relative neo-box overflow-y-auto max-h-[85vh] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-2 right-2 md:top-3 md:right-3 bg-black text-white p-2 hover:bg-[#FACC15] hover:text-black transition-colors border-2 md:border-4 border-black z-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]"
              >
                <X className="w-6 h-6 md:w-5 md:h-5 fill-current" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start pt-4 md:pt-4">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 md:border-8 border-black bg-[#FACC15] flex-shrink-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                  <img src={activeMember.image} alt={activeMember.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="text-center md:text-left flex-1 w-full space-y-3">
                  <div>
                    <div className="inline-block bg-black text-white px-3 py-1 font-black uppercase text-[10px] md:text-[11px] tracking-widest border-2 border-black mb-1">
                      {activeMember.dept}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                    {activeMember.name}
                  </h2>
                  
                  <div className="bg-gray-100 border-l-4 md:border-l-8 border-black p-4 md:p-5 mb-5 md:mb-6 italic text-xs md:text-base font-black leading-tight">
                    "{activeMember.intro}"
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
                    <a
                      href={activeMember.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 md:py-3 bg-[#0A66C2] text-white border-2 md:border-4 border-black font-black uppercase text-[11px] md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all outline-none"
                    >
                      <Linkedin className="w-4 h-4 md:w-5 md:h-5 fill-current" /> LinkedIn
                    </a>
                    <button
                      onClick={() => setActiveMember(null)}
                      className="flex-1 py-3 md:py-3 border-2 md:border-4 border-black bg-white text-black font-black uppercase text-[11px] md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all outline-none"
                    >
                      Close Brief
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b-8 border-black pb-12 text-center">
        <div className="inline-block bg-[#FACC15] border-4 border-black px-6 py-2 mb-6 shadow-[4px_4px_00px_0px_rgba(0,0,0,1)]">
          <p className="font-black uppercase tracking-widest text-xs">Meet Your Career Mentors</p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 flex items-center justify-center gap-6 uppercase tracking-tighter text-black">
          <Users className="w-16 h-16 stroke-[3px]" /> Our Core Team
        </h1>
        <p className="text-xl md:text-2xl text-black font-bold uppercase max-w-4xl mx-auto leading-tight italic">
          A dedicated team of experts helping Indian students build successful careers and reach their dreams.
        </p>
      </header>

      {/* Unified Core Members Section - High Visibility Layout */}
      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 md:mb-16 border-l-[10px] md:border-l-[16px] border-black pl-4 md:pl-8">Core Members</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 items-stretch">
        {team.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            whileTap={{ scale: 0.96 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
            style={{ backgroundColor: member.bgColor }}
            className="border-2 md:border-4 border-black p-3 md:p-4 flex flex-col items-center text-center neo-box relative group cursor-pointer min-h-[260px] md:min-h-[280px] w-full"
            onClick={() => setActiveMember(member)}
          >
            {/* Right-Aligned Dept Badge */}
            <div className="absolute -top-3 -right-2 bg-black text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 border-black z-20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] whitespace-nowrap">
              {member.dept}
            </div>

            <div className="w-24 h-24 md:w-28 md:h-28 rounded-none border-2 border-black bg-white mt-4 mb-3 md:mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-shrink-0 relative group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover transition-all duration-500 grayscale-0 md:grayscale md:group-hover:grayscale-0"
              />
            </div>

            <div className="flex flex-col flex-1 w-full mt-2">
              <div className="mb-1 w-full">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-tighter leading-none break-words line-clamp-2 min-h-[1.5rem] flex items-center justify-center text-center">
                  {member.name}
                </h3>
              </div>

              <div className="mt-auto flex flex-col gap-1">
                <div className="flex items-center justify-center px-2 py-1.5 md:py-2 bg-white text-black border-2 border-black font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  INFO
                </div>

                <a
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 md:py-2 border-2 border-black font-black text-[9px] md:text-[10px] uppercase bg-[#0A66C2] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                >
                  <Linkedin className="w-3.5 h-3.5 fill-current" /> LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
