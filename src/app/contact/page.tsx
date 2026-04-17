'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Send, MapPin, Globe, CheckCircle2, Loader2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('loading');
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'YOUR_ACCESS_KEY_HERE',
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `New Contact Form Submission from ${formData.name}`,
          from_name: 'DreamSync AI Platform',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };
  return (
    <div className="space-y-12 max-w-6xl mx-auto py-16 px-4 md:px-0 mt-8">
      <header className="border-b-[8px] border-black pb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-7xl font-black mb-4 flex items-center justify-center gap-4 text-black uppercase italic leading-none">
          <MessageCircle className="w-12 h-12 text-blue-600" /> CONTACT US
        </h1>
        <p className="text-lg md:text-2xl text-gray-500 font-bold uppercase tracking-tight">Have questions? We're here to help you sync your dreams with reality.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-10 uppercase italic text-black">GET IN TOUCH</h2>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-blue-600 block">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 border-2 border-black text-black font-black uppercase tracking-tight focus:outline-none focus:bg-slate-50 transition-all placeholder:text-gray-300" 
                placeholder="YOUR NAME" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-blue-600 block">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 border-2 border-black text-black font-black uppercase tracking-tight focus:outline-none focus:bg-slate-50 transition-all placeholder:text-gray-300" 
                placeholder="YOUR EMAIL" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-blue-600 block">How can we help?</label>
              <textarea 
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5} 
                className="w-full p-4 border-2 border-black text-black font-black uppercase tracking-tight focus:outline-none focus:bg-slate-50 transition-all placeholder:text-gray-300" 
                placeholder="WRITE YOUR MESSAGE HERE" 
              />
            </div>
            
            {status === 'success' && (
              <div className="p-3 bg-green-100 border-2 border-green-500 text-green-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Message sent successfully!
              </div>
            )}
            
            {status === 'error' && (
              <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 font-bold">
                Failed to send message. Please try again.
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              className="w-full py-5 bg-black text-white font-black text-sm uppercase tracking-[0.2em] border-4 border-black shadow-[8px_8px_0px_0px_#2563EB] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex justify-center items-center gap-3 disabled:opacity-70 italic"
            >
              {status === 'loading' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> SENDING...</>
              ) : status === 'success' ? (
                <><CheckCircle2 className="w-5 h-5" /> SENT!</>
              ) : (
                <><Send className="w-5 h-5" /> SEND MESSAGE</>
              )}
            </button>
          </form>
        </div>

        {/* Contact Info Card */}
        <div className="space-y-12">
          <div className="bg-white border-4 border-black p-8 md:p-12 transform md:rotate-2 shadow-[12px_12px_0px_0px_#2563EB]">
            <h2 className="text-3xl font-black mb-8 border-b-4 border-black/10 pb-4 uppercase italic tracking-tighter text-blue-600">Connect Directly</h2>
            <div className="space-y-8 text-lg font-bold uppercase italic">
              <a href="mailto:dreamsyncbangalore@gmail.com" className="flex items-center gap-6 group text-black">
                <div className="p-3 bg-white text-black border-2 border-black group-hover:bg-black group-hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all"><Mail className="w-8 h-8" /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest not-italic">EMAIL US AT</p>
                  <span className="text-xl tracking-tighter">dreamsyncbangalore@gmail.com</span>
                </div>
              </a>
              
              <a href="https://whatsapp.com/channel/0029VaFRiHbKrWR0L22onC0f" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group text-black">
                <div className="p-3 bg-[#FACC15] text-black border-2 border-black group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-all"><Phone className="w-8 h-8" /></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest not-italic">WHATSAPP CHANNEL</p>
                  <span className="text-xl tracking-tighter uppercase">JOIN THE HUB</span>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-8 md:p-12 transform md:-rotate-1 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
            <h2 className="text-2xl font-black mb-8 border-b-4 border-gray-100 pb-4 flex items-center gap-4 text-black uppercase italic"><Globe className="text-blue-600" /> Digital Reach</h2>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
              <a href="https://www.linkedin.com/company/dreamsync-community/" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-black hover:bg-blue-600 hover:text-white transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none text-black">LinkedIn</a>
              <a href="https://instagram.com/dream_sync_hub" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none text-black">Instagram</a>
              <a href="https://www.facebook.com/groups/605404708473694/" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-black hover:bg-blue-800 hover:text-white transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none text-black">Facebook</a>
              <a href="https://twitter.com/ADreamsync" target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-black hover:bg-black hover:text-white transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none text-black">X Platform</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
