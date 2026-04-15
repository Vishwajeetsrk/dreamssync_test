'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Sparkles, HelpCircle, Search, Menu, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  links?: { platform: string; url: string; label: string }[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your DreamSync AI Guide. How can I help you today? I can help you find tools, fix issues, or explore career paths.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('/api/career-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMsg }],
          context: 'System Support Mode: Help user find ATS Check, Roadmap, Ikigai, or Portfolio tools.'
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        links: data.jobLinks || []
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting. Please try again or contact support.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#2563EB] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center z-[9998] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group"
      >
        <div className="relative">
          <MessageSquare className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0' : 'scale-100'}`} />
          <X className={`w-8 h-8 absolute top-0 left-0 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-0 -rotate-90'}`} />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-0 md:bottom-24 right-0 md:right-6 w-full md:w-[400px] h-screen md:h-[640px] bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] z-[9999] flex flex-col md:rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white p-6 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FACC15] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <Sparkles className="w-6 h-6 text-black" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-black text-xs tracking-[0.2em] text-black uppercase">AI Guide</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-pulse" />
                    <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Active Career Sync</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 border-2 border-black hover:bg-[#FACC15] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#f8fafc] custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${msg.role === 'user' ? 'text-[#2563EB]' : 'text-gray-400'}`}>
                    {msg.role === 'user' ? 'Professional Sync' : 'Strategic Roadmap'}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`max-w-[90%] p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[14px] font-bold leading-relaxed rounded-md ${
                      msg.role === 'user' 
                        ? 'bg-[#2563EB] text-white' 
                        : 'bg-white text-black'
                    }`}
                  >
                    {msg.content}
                  </motion.div>
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {msg.links.map((link, li) => (
                        <Link 
                          key={li}
                          href={link.label === 'Fix Profile Photo' ? '/profile?action=fix' : link.url}
                          target={link.url.startsWith('http') ? '_blank' : '_self'}
                          className="px-5 py-2.5 bg-white border-2 border-black text-black text-[11px] font-black uppercase transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:bg-[#FACC15] hover:translate-x-1 hover:translate-y-1 active:scale-95"
                        >
                          {link.label} <ArrowRight className="w-4 h-4" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions - Action Protocol */}
            <div className="px-6 py-4 flex gap-3 overflow-x-auto border-t-2 border-black bg-white no-scrollbar">
            {['Fix Profile Photo', 'LinkedIn Analysis', 'ATS Score Check', 'Find My Ikigai'].map((txt) => (
                <button 
                  key={txt}
                  onClick={() => setInput(txt)}
                  className="whitespace-nowrap px-4 py-2.5 bg-white border-2 border-black text-black text-[10px] font-black uppercase hover:bg-[#FACC15] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all active:scale-95"
                >
                  {txt}
                </button>
              ))}
            </div>

            {/* Input Architecture */}
            <div className="p-6 bg-white border-t-4 border-black">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your career trajectory..."
                  className="w-full bg-white border-2 border-black p-4 pr-16 text-black text-[14px] font-bold placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 p-2.5 bg-[#2563EB] border-2 border-black text-white hover:bg-[#1e40af] disabled:opacity-30 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; }
      `}</style>
    </>
  );
}
