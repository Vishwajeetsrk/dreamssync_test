'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Users, Linkedin, X, Info } from 'lucide-react';
import Link from 'next/link';

const team = [
  {
    name: "Anand Biniya",
    dept: "Project Leader",
    link: "https://www.linkedin.com/in/anandbin/",
    image: "/Anand.jpeg",
    bgColor: "#FFFFFF",
    intro: "He is the person leading this project. He wants to make sure every student finds their dream job easily."
  },
  {
    name: "Ayush Bajpai",
    dept: "Manager",
    link: "https://www.linkedin.com/in/ayush-bajpai25/",
    image: "/Ayush.jpeg",
    bgColor: "#FFFFFF",
    intro: "He manages the daily work at DreamSync. He is here to help you if you have any problems using the site."
  },
  {
    name: "Vishwajeet",
    dept: "Technology",
    link: "https://www.linkedin.com/in/vishwajeetsrk/",
    image: "/vishwajeet.jpeg",
    bgColor: "#FFFFFF",
    intro: "He builds the smart AI tools you use. He made sure this site is simple for everyone to use."
  },
  {
    name: "Chaitanya Khaleja",
    dept: "Community",
    link: "https://www.linkedin.com/in/chaitanya-khaleja-975502255/",
    image: "/Chaitanya.jpeg",
    bgColor: "#FFFFFF",
    intro: "He brings students together. He helps you find new friends and helpers on your journey."
  },
  {
    name: "Nisha Das",
    dept: "Guides",
    link: "https://www.linkedin.com/in/nisha-das-ab9bb5246/",
    image: "/Nisha.jpeg",
    bgColor: "#FFFFFF",
    intro: "She finds the best guides and papers for you. She makes sure you have everything you need to study."
  },
  {
    name: "Hrithik Kumar",
    dept: "Projects",
    link: "https://www.linkedin.com/in/kumar-hrithik/",
    image: "/Hrithik.jpg",
    bgColor: "#FFFFFF",
    intro: "He manages our special projects. He makes sure our tools are high quality and ready for you."
  },
];

export default function Team() {
  const [activeMember, setActiveMember] = useState<null | typeof team[0]>(null);

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-10 px-4 relative">

      {/* Introduction Modal */}
      <AnimatePresence>
        {activeMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white border-4 border-black p-6 md:p-8 max-w-[95%] md:max-w-xl w-full mx-auto relative shadow-[10px_10px_0px_0px_black] overflow-y-auto max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-3 right-3 bg-black text-white p-1.5 hover:bg-blue-600 border-2 border-black z-50 shadow-[3px_3px_0px_0px_white] active:shadow-none transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pt-4">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-black bg-white flex-shrink-0 shadow-[6px_6px_0px_0px_#2563EB] relative overflow-hidden">
                  <img src={activeMember.image} alt={activeMember.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="text-center sm:text-left flex-1 w-full space-y-4">
                  <div>
                    <div className="inline-block bg-yellow-400 text-black px-3 py-1 font-black uppercase text-[9px] tracking-widest border-2 border-black mb-1 shadow-[2px_2px_0px_0px_black]">
                      {activeMember.dept}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none text-black italic">
                    {activeMember.name}
                  </h2>
                  
                  <div className="bg-gray-100 border-l-[6px] border-black p-4 italic text-sm font-bold leading-tight text-black">
                    "{activeMember.intro}"
                  </div>

                  <div className="flex flex-col xs:flex-row gap-3 w-full">
                    <a
                      href={activeMember.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all"
                    >
                      <Linkedin className="w-4 h-4 fill-current" /> LinkedIn
                    </a>
                    <button
                      onClick={() => setActiveMember(null)}
                      className="flex-1 py-3 border-2 border-black bg-white text-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b-4 border-black pb-12 text-center space-y-6">
        <div className="inline-block bg-yellow-400 text-black border-2 border-black px-6 py-2 mb-2 shadow-[4px_4px_0px_0px_black]">
          <p className="font-black uppercase tracking-[0.3em] text-[10px]">THE TEAM</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 flex items-center justify-center gap-4 uppercase tracking-tighter text-black italic leading-none">
          OUR PEOPLE
        </h1>
        <p className="text-base md:text-xl text-gray-400 font-bold uppercase max-w-2xl mx-auto leading-tight italic tracking-tight">
          Meet the team building a better future for India.
        </p>
      </header>

      {/* Section */}
      <div className="space-y-10">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter border-l-8 border-blue-600 pl-4 text-black italic">CORE MEMBERS</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-2 border-black bg-white p-6 flex flex-col items-center text-center relative group cursor-pointer w-full shadow-[6px_6px_0px_0px_black] transition-all hover:shadow-[8px_8px_0px_0px_#2563EB]"
              onClick={() => setActiveMember(member)}
            >
              <div className="absolute -top-3 -right-3 bg-black text-white font-black text-[9px] uppercase tracking-widest px-3 py-1.5 border-2 border-black z-20 shadow-[2px_2px_0px_0px_yellow-400]">
                {member.dept}
              </div>

              <div className="w-28 h-28 md:w-36 md:h-36 border-2 border-black bg-white mt-2 mb-4 shadow-[4px_4px_0px_0px_black] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>

              <div className="flex flex-col flex-1 w-full gap-3">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none text-black italic">
                   {member.name}
                </h3>

                <div className="flex flex-col gap-1.5 mt-auto">
                    <div className="flex items-center justify-center px-4 py-2.5 bg-white text-black border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_black] hover:bg-black hover:text-white transition-all italic">
                      VIEW PROFILE
                    </div>
                    <p className="text-[8px] font-black text-gray-400 mt-1 uppercase italic">Read Story · 1 Min</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-20 bg-yellow-400 border-4 border-black p-10 md:p-14 shadow-[10px_10px_0px_0px_black] flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="space-y-4 text-center md:text-left">
           <h3 className="text-3xl md:text-5xl font-black uppercase italic leading-none text-black">WE'RE HERE TO HELP</h3>
           <p className="text-base md:text-lg font-bold uppercase text-black/70 max-w-xl leading-tight">Our team is here to help you find your path, step-by-step.</p>
        </div>
        <Link href="/contact" className="px-10 py-5 bg-black text-white border-2 border-black font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_white] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-center">
           TALK TO US
        </Link>
      </div>
    </div>
  );
}
