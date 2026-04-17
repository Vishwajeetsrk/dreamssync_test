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
    intro: "He is the person leading this project. He wants to make sure every student in India finds their dream job easily."
  },
  {
    name: "Ayush Bajpai",
    dept: "Manager",
    link: "https://www.linkedin.com/in/ayush-bajpai25/",
    image: "/Ayush.jpeg",
    bgColor: "#FFFFFF",
    intro: "He manages the daily work at DreamSync. He is here to help you if you have any problems using the platform."
  },
  {
    name: "Vishwajeet",
    dept: "Technology",
    link: "https://www.linkedin.com/in/vishwajeetsrk/",
    image: "/vishwajeet.jpeg",
    bgColor: "#FFFFFF",
    intro: "He builds the smart AI tools you use. He made sure this website is easy and simple for everyone to use."
  },
  {
    name: "Chaitanya Khaleja",
    dept: "Community",
    link: "https://www.linkedin.com/in/chaitanya-khaleja-975502255/",
    image: "/Chaitanya.jpeg",
    bgColor: "#FFFFFF",
    intro: "He brings students together. He helps you find new friends and helpers on your career journey."
  },
  {
    name: "Nisha Das",
    dept: "Content Guide",
    link: "https://www.linkedin.com/in/nisha-das-ab9bb5246/",
    image: "/Nisha.jpeg",
    bgColor: "#FFFFFF",
    intro: "She finds the best guides and papers for you. She makes sure you have everything you need to study well."
  },
  {
    name: "Hrithik Kumar",
    dept: "Project Manager",
    link: "https://www.linkedin.com/in/kumar-hrithik/",
    image: "/Hrithik.jpg",
    bgColor: "#FFFFFF",
    intro: "He manages our special projects. He makes sure our career tools are high quality and ready for you to use."
  },
];

export default function Team() {
  const [activeMember, setActiveMember] = useState<null | typeof team[0]>(null);

  return (
    <div className="space-y-16 max-w-7xl mx-auto py-12 px-4 relative">

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
              className="bg-white border-[8px] border-black p-6 md:p-10 max-w-[95%] md:max-w-2xl w-full mx-auto relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveMember(null)}
                className="absolute top-4 right-4 bg-black text-white p-2 hover:bg-blue-600 transition-colors border-4 border-black z-50 shadow-[4px_4px_0px_0px_white] active:shadow-none transition-all"
              >
                <X className="w-8 h-8 md:w-6 md:h-6" />
              </button>

              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start pt-6">
                <div className="w-40 h-40 md:w-56 md:h-56 border-8 border-black bg-white flex-shrink-0 shadow-[10px_10px_0px_0px_#2563EB] relative overflow-hidden">
                  <img src={activeMember.image} alt={activeMember.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="text-center md:text-left flex-1 w-full space-y-6">
                  <div>
                    <div className="inline-block bg-[#FACC15] text-black px-4 py-2 font-black uppercase text-xs tracking-widest border-4 border-black mb-2 shadow-[4px_4px_0px_0px_black]">
                      {activeMember.dept}
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-black italic">
                    {activeMember.name}
                  </h2>
                  
                  <div className="bg-gray-100 border-l-[12px] border-black p-6 md:p-8 mb-6 italic text-lg font-bold leading-tight text-black">
                    "{activeMember.intro}"
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <a
                      href={activeMember.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#2563EB] text-white border-4 border-black font-black uppercase text-xs shadow-[6px_6px_0px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      <Linkedin className="w-5 h-5 fill-current" /> LinkedIn
                    </a>
                    <button
                      onClick={() => setActiveMember(null)}
                      className="flex-1 py-4 border-4 border-black bg-white text-black font-black uppercase text-xs shadow-[6px_6px_0px_0px_#000000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
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

      <header className="border-b-[10px] border-black pb-20 text-center space-y-8">
        <div className="inline-block bg-[#FACC15] text-black border-4 border-black px-8 py-4 mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black uppercase tracking-[0.4em] text-xs">THE DREAM TEAM</p>
        </div>
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black mb-6 flex items-center justify-center gap-8 uppercase tracking-tighter text-black italic leading-none">
          OUR PEOPLE
        </h1>
        <p className="text-xl md:text-3xl text-gray-400 font-bold uppercase max-w-4xl mx-auto leading-tight italic tracking-tight">
          Meet the team building a better future for students in India.
        </p>
      </header>

      {/* Unified Core Members Section */}
      <div className="space-y-12">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter border-l-[16px] border-blue-600 pl-6 text-black italic">CORE MEMBERS</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="border-4 border-black bg-white p-8 flex flex-col items-center text-center relative group cursor-pointer w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[12px_12px_0px_0px_#2563EB] hover:-translate-y-2"
              onClick={() => setActiveMember(member)}
            >
              {/* Dept Badge */}
              <div className="absolute -top-4 -right-4 bg-black text-white font-black text-xs uppercase tracking-widest px-4 py-2 border-4 border-black z-20 shadow-[4px_4px_0px_0px_#FACC15] whitespace-nowrap">
                {member.dept}
              </div>

              <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-black bg-white mt-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>

              <div className="flex flex-col flex-1 w-full gap-4">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none text-black italic">
                  {member.name}
                </h3>

                <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-center px-4 py-4 bg-white text-black border-4 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all italic">
                      VIEW FULL PROFILE
                    </div>
                    <p className="text-[10px] font-black text-gray-400 mt-1 uppercase italic">Read {member.name.split(' ')[0]}'s Story · 1 Min</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-32 bg-yellow-400 border-[10px] border-black p-12 md:p-24 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-12 group">
        <div className="space-y-8 text-center md:text-left">
           <h3 className="text-5xl md:text-7xl font-black uppercase italic leading-none text-black">WE'RE HERE TO HELP</h3>
           <p className="text-xl md:text-2xl font-bold uppercase text-black/70 max-w-2xl leading-tight">Building a career is hard. Our team is dedicated to making it easier for you, step-by-step. Feel free to connect with any of us!</p>
        </div>
        <Link href="/contact" className="px-16 py-8 bg-black text-white border-4 border-black font-black uppercase text-sm tracking-widest shadow-[10px_10px_0px_0px_white] group-hover:shadow-none group-hover:translate-x-2 group-hover:translate-y-2 transition-all text-center">
           TALK TO US
        </Link>
      </div>
    </div>
  );
}
