'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Users, Linkedin, X, Info } from 'lucide-react';

const team = [
  {
    name: "Anand Biniya",
    dept: "Lead",
    link: "https://www.linkedin.com/in/anandbin/",
    image: "/Anand.jpeg",
    bgColor: "#FFFFFF",
    intro: "A visionary leader dedicated to building tools that help students across India find their path and succeed in their careers."
  },
  {
    name: "Ayush Bajpai",
    dept: "Ops",
    link: "https://www.linkedin.com/in/ayush-bajpai25/",
    image: "/Ayush.jpeg",
    bgColor: "#FFFFFF",
    intro: "The operational engine behind DreamSync, ensuring everything runs smoothly and every student gets the support they need."
  },
  {
    name: "Vishwajeet",
    dept: "Tech",
    link: "https://www.linkedin.com/in/vishwajeetsrk/",
    image: "/vishwajeet.jpeg",
    bgColor: "#FFFFFF",
    intro: "Passionate about leveraging technology and AI to create meaningful career roadmaps for students in tech and beyond."
  },
  {
    name: "Chaitanya Khaleja",
    dept: "Community",
    link: "https://www.linkedin.com/in/chaitanya-khaleja-975502255/",
    image: "/Chaitanya.jpeg",
    bgColor: "#FFFFFF",
    intro: "Building a supportive space where students can connect, share opportunities, and grow together as a community."
  },
  {
    name: "Nisha Das",
    dept: "Curator",
    link: "https://www.linkedin.com/in/nisha-das-ab9bb5246/",
    image: "/Nisha.jpeg",
    bgColor: "#FFFFFF",
    intro: "Managing our vast repository of career resources, ensuring students have access to the best documentation and guides."
  },
  {
    name: "Hrithik Kumar",
    dept: "Projects",
    link: "https://www.linkedin.com/in/kumar-hrithik/",
    image: "/Hrithik.jpg",
    bgColor: "#FFFFFF",
    intro: "Leading impactful projects that bring AI career tools to life and make them accessible to students everywhere."
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
              className="bg-white border-[6px] border-black p-5 md:p-8 max-w-[92%] md:max-w-xl w-full mx-auto relative shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-2 right-2 md:top-3 md:right-3 bg-black text-white p-2 hover:bg-blue-600 transition-colors border-2 border-black z-50"
              >
                <X className="w-6 h-6 md:w-5 md:h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start pt-4 md:pt-4">
                <div className="w-32 h-32 md:w-44 md:h-44 border-4 md:border-8 border-black bg-white flex-shrink-0 shadow-[8px_8px_0px_0px_#2563EB] relative overflow-hidden">
                  <img src={activeMember.image} alt={activeMember.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="text-center md:text-left flex-1 w-full space-y-3">
                  <div>
                    <div className="inline-block bg-[#FACC15] text-black px-3 py-1 font-black uppercase text-[10px] md:text-[11px] tracking-widest border-2 border-black mb-1">
                      {activeMember.dept}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none text-black">
                    {activeMember.name}
                  </h2>
                  
                  <div className="bg-gray-100 border-l-[8px] border-black p-4 md:p-5 mb-5 md:mb-6 italic text-sm md:text-base font-bold leading-tight">
                    "{activeMember.intro}"
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
                    <a
                      href={activeMember.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-[#2563EB] text-white border-2 border-black font-black uppercase text-[10px] md:text-xs shadow-[4px_4px_0px_0px_#000000] hover:shadow-none transition-all"
                    >
                      <Linkedin className="w-4 h-4 md:w-5 md:h-5 fill-current" /> LinkedIn
                    </a>
                    <button
                      onClick={() => setActiveMember(null)}
                      className="flex-1 py-3 md:py-4 border-2 border-black bg-white text-black font-black uppercase text-[10px] md:text-xs shadow-[4px_4px_0px_0px_#000000] hover:shadow-none transition-all"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b-[8px] border-black pb-16 text-center space-y-6">
        <div className="inline-block bg-[#FACC15] text-black border-4 border-black px-6 py-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black uppercase tracking-[0.3em] text-[10px]">THE DREAM TEAM</p>
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 flex items-center justify-center gap-6 uppercase tracking-tighter text-black italic">
          <Users className="w-16 h-16 stroke-[10px]" /> OUR PEOPLE
        </h1>
        <p className="text-lg md:text-2xl text-gray-500 font-bold uppercase max-w-4xl mx-auto leading-tight italic tracking-tight">
          Meet the passionate individuals building the future of AI-powered career guidance for India.
        </p>
      </header>

      {/* Unified Core Members Section */}
      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 md:mb-16 border-l-[10px] md:border-l-[16px] border-blue-600 pl-4 md:pl-8 text-black italic">CORE MEMBERS</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-stretch px-2 md:px-0">
        {team.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            whileTap={{ scale: 0.96 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
            className="border-[3px] border-black bg-white p-4 flex flex-col items-center text-center relative group cursor-pointer min-h-[290px] w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-slate-50"
            onClick={() => setActiveMember(member)}
          >
            {/* Dept Badge */}
            <div className="absolute -top-3 -right-2 bg-black text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 border-black z-20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] whitespace-nowrap group-hover:bg-[#FACC15] group-hover:text-black">
              {member.dept}
            </div>

            <div className="w-24 h-24 md:w-32 md:h-32 rounded-none border-2 border-black bg-white mt-4 mb-3 md:mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-shrink-0 relative group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0"
              />
            </div>

            <div className="flex flex-col flex-1 w-full mt-2">
              <div className="mb-2 w-full">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-tighter leading-none break-all line-clamp-2 min-h-[1.5rem] flex items-center justify-center text-center text-black">
                  {member.name}
                </h3>
              </div>

              <div className="mt-auto flex flex-col gap-1">
                <div className="flex items-center justify-center px-2 py-3 bg-white text-black border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all leading-none italic">
                  VIEW PROFILE
                </div>

                <a
                  href={member.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full flex items-center justify-center gap-1.5 py-3 border-2 border-black font-black text-[10px] uppercase bg-[#2563EB] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all leading-none"
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
