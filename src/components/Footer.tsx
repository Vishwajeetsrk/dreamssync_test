'use client';

import Link from 'next/link';
import { Coffee, Globe, Shield, Zap, Sparkles, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-8 border-black pt-32 pb-20 px-6 md:px-12 text-black font-bold uppercase relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
        
        {/* Brand Identity */}
        <div className="space-y-8">
          <Link href="/" className="inline-block">
            <Image 
              src="/DreamSynclogo.png" 
              alt="DreamSync Logo" 
              width={160} 
              height={40} 
              className="object-contain" 
            />
          </Link>
          <p className="text-xs font-bold leading-relaxed text-gray-400 max-w-xs uppercase">
            AI-powered career guidance for Indian students. Find your path, build your resume, and grow your career.
          </p>
        </div>
        
        {/* Features column */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-black">Features</h4>
          <ul className="space-y-3 text-[10px] font-bold text-gray-500 uppercase">
            <li><Link href="/resume-builder" className="hover:text-black">Resume Builder</Link></li>
            <li><Link href="/ats-check" className="hover:text-black">ATS Check</Link></li>
            <li><Link href="/roadmap" className="hover:text-black">AI Roadmap</Link></li>
            <li><Link href="/portfolio" className="hover:text-black">Portfolio Gen</Link></li>
            <li><Link href="/linkedin" className="hover:text-black">LinkedIn Optimizer</Link></li>
          </ul>
        </div>
        
        {/* Company column */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-black">Company</h4>
          <ul className="space-y-3 text-[10px] font-bold text-gray-500 uppercase">
            <li><Link href="/about" className="hover:text-black">About Us</Link></li>
            <li><Link href="/team" className="hover:text-black">Team</Link></li>
            <li><Link href="/contact" className="hover:text-black">Contact</Link></li>
          </ul>
        </div>

        {/* Connect column */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-black">Connect</h4>
          <div className="flex flex-col gap-3">
            <a 
              href="https://www.instagram.com/dream_sync_hub?igsh=MW50dHk3Znh5eTczcg==" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Follow us on Instagram"
              className="bg-white border-2 border-black shadow-[4px_4px_0px_black] px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase hover:bg-[#E1306C] hover:text-white hover:scale-105 transition-all w-fit"
            >
              <InstagramIcon className="w-4 h-4" /> Instagram
            </a>

            <a 
              href="https://x.com/ADreamsync" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Follow us on X"
              className="bg-white border-2 border-black shadow-[4px_4px_0px_black] px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase hover:bg-black hover:text-white hover:scale-105 transition-all w-fit"
            >
              <XIcon className="w-4 h-4" /> X (Twitter)
            </a>

            <a 
              href="https://www.linkedin.com/company/dreamsync-community/" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Join our LinkedIn Community"
              className="bg-white border-2 border-black shadow-[4px_4px_0px_black] px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase hover:bg-[#0A66C2] hover:text-white hover:scale-105 transition-all w-fit"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
            
            <a 
              href="mailto:dreamsyncbangalore@gmail.com"
              title="Email Us"
              className="bg-white border-2 border-black shadow-[4px_4px_0px_black] px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase hover:bg-[#EA4335] hover:text-white hover:scale-105 transition-all w-fit"
            >
              <Mail className="w-4 h-4" /> Email Us
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Meta */}
      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t-2 border-black/5 flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
        <span>© {currentYear} Dream Sync. All rights reserved.</span>
        <div className="flex gap-8">
          <Link href="/privacy" className="hover:text-black">Privacy</Link>
          <Link href="/terms" className="hover:text-black">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
    </svg>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
