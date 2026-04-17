'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, Send, Mic, MicOff, Volume2, VolumeX,
  RotateCcw, Phone, PlayCircle, StopCircle, MessageCircle, Globe, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateCareerInput } from '@/lib/aiGuard';

// ── Types ─────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ── Mood Options ─────────────────────────────────────────────────
const moods = [
  { emoji: '😊', label: 'Balanced',   color: 'bg-teal-50 border-teal-200' },
  { emoji: '😔', label: 'Reflective', color: 'bg-blue-50 border-blue-200' },
  { emoji: '😠', label: 'Resilient',  color: 'bg-slate-50 border-slate-200' },
  { emoji: '😨', label: 'Focused',    color: 'bg-blue-50 border-blue-200' },
  { emoji: '😲', label: 'Observant',  color: 'bg-teal-50 border-teal-200' },
  { emoji: '🤢', label: 'Detached',   color: 'bg-slate-50 border-slate-200' },
];

const affirmations = [
  "You are doing better than you think. 🌻",
  "It's okay to not be okay. Take it one breath at a time. 💙",
  "Your struggles don't define your worth. 🌿",
  "Every difficult day is building a stronger you. ✨",
  "You are not alone in this journey. 🫂",
  "Small steps are still progress. Be kind to yourself. 🌱",
];

const resources = [
  { name: "iCall (India)",           number: "9152987821",    desc: "Tata Institute — free counseling" },
  { name: "Vandrevala Foundation",   number: "1860-2662-345", desc: "24/7 mental health helpline" },
  { name: "Snehi Helpline",          number: "044-24640050",  desc: "Emotional support & counseling" },
];

const languages = [
  { code: 'en-IN', name: 'English (India)', native: 'English' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

// ── Voice wave animation ───────────────────────────────────────────
function VoiceWave({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-teal-400"
          animate={active ? {
            height: ['8px', `${16 + Math.random() * 20}px`, '8px'],
          } : { height: '4px' }}
          transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────
function ChatBubble({ msg, onSpeak, isSpeaking }: {
  msg: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
    >
      {!isUser && (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 border-2 flex items-center justify-center shrink-0 mt-1 shadow-md transition-all ${isSpeaking ? 'border-teal-500 scale-110 shadow-teal-200 shadow-lg' : 'border-teal-100'}`}>
          <HeartHandshake className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm shadow-[3px_3px_0px_0px_#0F172A]'
            : 'bg-white border-2 border-slate-200 text-slate-800 rounded-tl-sm shadow-[3px_3px_0px_0px_#F1F5F9]'
        }`}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        {/* Per-message speak button — only for Serenity */}
        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(msg.content)}
            className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-600 transition-colors self-start ml-1"
            title="Hear Serenity speak this message"
          >
            <PlayCircle className="w-3.5 h-3.5" /> Speak
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function MentalHealthAgent() {
  const { user, userData } = useAuth();
  const userName = userData?.name?.split(' ')[0] || user?.email?.split('@')[0] || null;

  const [mood, setMood]               = useState<string | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [voiceMode, setVoiceMode]     = useState(false);    // full voice mode
  const [listening, setListening]     = useState(false);    // STT active
  const [speaking, setSpeaking]       = useState(false);    // TTS active
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [selectedLang, setSelectedLang] = useState(languages[0]); // Default to English (India)
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showResources, setShowResources]   = useState(false);
  const [transcript, setTranscript]   = useState('');       // live interim transcript

  const bottomRef     = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Rotate affirmations
  useEffect(() => {
    const interval = setInterval(() => setAffirmationIdx(i => (i + 1) % affirmations.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── TTS — speaks text, says user's name optionally ────────────────
  const speak = useCallback((text: string, prefix?: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') { resolve(); return; }
      window.speechSynthesis.cancel();
      setSpeaking(true);

      const fullText = prefix ? `${prefix}. ${text}` : text;
      const utter = new SpeechSynthesisUtterance(fullText);
      utter.rate   = 0.87;
      utter.pitch  = 1.08;
      utter.volume = 1.0;

      utter.onend  = () => { setSpeaking(false); resolve(); };
      utter.onerror = () => { setSpeaking(false); resolve(); };

      const trySpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const langCode = selectedLang.code;
        const primaryCode = langCode.split('-')[0];
        
        // 1. Find all potential candidate voices for this specific language
        const candidates = voices.filter(v => v.lang.startsWith(primaryCode) || v.lang.includes(langCode));
        
        if (candidates.length === 0) {
          console.warn(`No native voice found for ${selectedLang.name}. Skipping audio.`);
          setSpeaking(false);
          return;
        }

        // 2. Prioritize: Native + Female + High Quality (Google/Microsoft)
        let preferred = candidates.find(v => 
          v.name.toLowerCase().includes('female') && 
          (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural'))
        );

        // 3. Fallback: Any Female for this language
        if (!preferred) preferred = candidates.find(v => v.name.toLowerCase().includes('female'));

        // 4. Fallback: Any voice for this language
        if (!preferred) preferred = candidates[0];

        // FINAL GUARD: If we somehow picked a voice that is NOT for the selected language group, ABORT.
        // This prevents English voices with thick accents from reading non-English text.
        if (preferred && !preferred.lang.startsWith(primaryCode)) {
          console.error("Voice language mismatch. Aborting audio to prevent accent issues.");
          setSpeaking(false);
          return;
        }

        if (preferred) utter.voice = preferred;
        utter.lang = langCode;
        window.speechSynthesis.speak(utter);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        trySpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = trySpeak;
      }
    });
  }, []);

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  // ── STT — listen then auto-send in voice mode ─────────────────────
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input needs Chrome or Edge browser.');
      return;
    }
    // Stop any ongoing speech before listening
    stopSpeaking();

    const recognition: any = new SR();
    recognition.continuous     = false;
    recognition.interimResults = true;
    recognition.lang           = selectedLang.code;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (e: any) => {
      let interim = '';
      let final   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(interim);
      if (final) {
        setTranscript('');
        setListening(false);
        recognition.stop();
        // In voice mode → auto send
        if (voiceMode) {
          sendMessage(final.trim());
        } else {
          setInput(prev => prev + final.trim());
        }
      }
    };

    recognition.onerror = () => { setListening(false); setTranscript(''); };
    recognition.onend   = () => { setListening(false); setTranscript(''); };

    recognitionRef.current = recognition;
    recognition.start();
  }, [voiceMode]);  // eslint-disable-line

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setTranscript('');
  };

  // Toggle voice mode — announce on enable
  const handleVoiceModeToggle = async () => {
    const next = !voiceMode;
    setVoiceMode(next);
    if (next) {
      const greet = userName ? `Hi ${userName}` : 'Hi there';
      await speak(`${greet}. I'm Serenity, and I'm here for you. Tap the big microphone to talk to me, and I'll listen and speak back.`);
    } else {
      stopSpeaking();
      stopListening();
    }
  };

  // ── Send message (text or from voice) ────────────────────────────
  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    // 1. Safety Guard
    const safety = validateCareerInput(userText);
    if (!safety.allowed) {
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: userText },
        { 
          role: 'assistant', 
          content: `⚠️ Safety Warning: ${safety.message}\n\nPlease talk about professional, safe, and ethical topics. I am here to support your mental well-being in a positive way.` 
        }
      ]);
      setInput('');
      if (voiceMode) await speak(safety.message);
      return;
    }

    const userMsg: Message = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const res = await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mood: mood || 'not specified' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const assistantMsg: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);

      // Speak reply — prepend name on first message
      const isFirst = messages.length === 0;
      const prefix  = isFirst && userName ? userName : undefined;
      await speak(data.reply, prefix);

      // In voice mode — auto start listening again after speaking
      if (voiceMode) {
        setTimeout(() => startListening(), 400);
      }

    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: "I'm so sorry, I'm having a little trouble right now. You are not alone — please try again in a moment. 💙",
      };
      setMessages(prev => [...prev, errMsg]);
      if (voiceMode) await speak(errMsg.content);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Mood Selection Screen ─────────────────────────────────────────
  if (!mood) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          {/* Avatar */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 border-4 border-white flex items-center justify-center mx-auto shadow-xl shadow-blue-100"
          >
            <HeartHandshake className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight uppercase">
            Hi{userName ? `, ${userName}` : ''}! I am Serenity.
          </h1>
          <p className="text-lg text-slate-500 font-semibold uppercase tracking-tight max-w-md mx-auto">
            A professional synergy space for students to navigate career and academic challenges with resilience.
          </p>
        </motion.div>

        {/* Affirmation */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-5 text-center">
          <AnimatePresence mode="wait">
            <motion.p key={affirmationIdx}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="text-sm font-black text-blue-700 uppercase tracking-tight">
              &quot;{affirmations[affirmationIdx]}&quot;
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Mood Picker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-center mb-4 text-slate-400">Current Internal Synergy</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {moods.map((m, i) => (
              <motion.button
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                onClick={() => setMood(m.label)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                className={`p-5 border-2 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all ${m.color} hover:shadow-md`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-sm">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-xs text-center text-muted-foreground">
          This is a supportive space. Serenity is an AI and does not replace professional mental health care.
        </motion.p>
      </div>
    );
  }

  // ── Chat Screen ───────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={speaking ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ repeat: speaking ? Infinity : 0, duration: 0.8 }}
            className={`w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 border-[3px] flex items-center justify-center shadow-lg transition-all ${speaking ? 'border-teal-400 shadow-teal-100' : 'border-slate-900'}`}
          >
            <HeartHandshake className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Serenity</h1>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${speaking ? 'bg-teal-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {speaking ? 'Serenity is talking...' : listening ? 'Listening...' : `Well-being Guide · Mood: ${mood}`}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 relative">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 bg-white border-slate-200 text-slate-600 font-bold text-xs hover:border-blue-400 transition-all"
              title="Select language"
            >
              <Globe className="w-3.5 h-3.5" />
              {selectedLang.native}
              <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 py-2 max-h-64 overflow-y-auto"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-bold hover:bg-rose-50 transition-colors flex items-center justify-between ${selectedLang.code === lang.code ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}
                      >
                        <span>{lang.native}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Voice mode toggle */}
          <button
            onClick={handleVoiceModeToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-[3px] text-[10px] font-black uppercase transition-all shadow-[3px_3px_0px_0px_#0F172A] ${voiceMode ? 'bg-teal-500 text-white border-teal-600 shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white border-slate-900 text-slate-900'}`}
          >
            {voiceMode ? <Mic className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
            {voiceMode ? 'Voice mode on' : 'Switch to voice'}
          </button>
          <button
            onClick={() => setShowResources(r => !r)}
            className="p-2 rounded-full border-2 bg-white border-slate-200 text-slate-400 hover:border-blue-400 transition-all"
            title="Crisis resources"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setMood(null); setMessages([]); stopSpeaking(); stopListening(); }}
            className="p-2 rounded-full border-2 bg-white border-gray-300 text-gray-500 hover:border-gray-500 transition-all"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crisis Resources */}
      <AnimatePresence>
        {showResources && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 space-y-3">
            <p className="font-black text-red-900 flex items-center gap-2">
              <Phone className="w-4 h-4" /> India Mental Health Helplines
            </p>
            {resources.map(r => (
              <div key={r.name} className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-red-900">{r.name}</p>
                  <p className="text-xs text-red-700">{r.desc}</p>
                </div>
                <a href={`tel:${r.number}`} className="font-black text-red-700 text-sm hover:underline">{r.number}</a>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affirmation ticker */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center">
        <AnimatePresence mode="wait">
          <motion.p key={affirmationIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[10px] font-black uppercase tracking-tight text-blue-700 italic">
            {affirmations[affirmationIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── VOICE MODE UI ─────────────────────────────────────────── */}
      <AnimatePresence>
        {voiceMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-50 border-4 border-slate-900 rounded-3xl p-8 flex flex-col items-center gap-6 text-center shadow-[8px_8px_0px_0px_#2563EB]"
          >
            {/* Live status label */}
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">
              {speaking
                ? '✨ Serenity is speaking...'
                : listening
                  ? `🎙 Listening to you${userName ? `, ${userName}` : ''}...`
                  : loading
                    ? '💭 Reflecting on what you shared...'
                    : `I'm here to listen${userName ? `, ${userName}` : ''}. Tap to talk.`}
            </p>

            {/* Wave animation */}
            <VoiceWave active={listening || speaking} />

            {/* Live transcript */}
            {transcript && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-gray-500 italic max-w-xs"
              >
                &ldquo;{transcript}&rdquo;
              </motion.p>
            )}

            {/* BIG Mic Button */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={listening ? stopListening : (speaking ? stopSpeaking : startListening)}
              disabled={loading}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-[4px] border-slate-900 transition-all disabled:opacity-50 ${
                listening
                  ? 'bg-red-500 shadow-none translate-x-1 translate-y-1'
                  : speaking
                    ? 'bg-blue-600 shadow-none translate-x-1 translate-y-1'
                    : 'bg-teal-500 hover:scale-105 shadow-[6px_6px_0px_0px_#0F172A]'
              }`}
            >
              {listening
                ? <MicOff className="w-10 h-10 text-white" />
                : speaking
                  ? <StopCircle className="w-10 h-10 text-white" />
                  : <Mic className="w-10 h-10 text-white" />
              }
            </motion.button>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {listening ? 'TAP TO COMPLETE RESPONSE' : speaking ? 'TAP TO PAUSE SERENITY' : 'I AM LISTENING WITH AN OPEN HEART'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="bg-white border-4 border-slate-900 rounded-2xl min-h-[320px] max-h-[450px] overflow-y-auto p-5 space-y-4 shadow-[4px_4px_0px_0px_#F1F5F9]">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 space-y-3">
            <div className="text-5xl">🌸</div>
            <p className="font-bold text-gray-600">
              {userName ? `I'm so glad you're here, ${userName}.` : "I'm so glad you're here."}
            </p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
              {voiceMode
                ? "TAP THE MIC TO BEGIN SYNC"
                : "SHARE YOUR THOUGHTS FREELY"}
            </p>
            {/* Starter suggestions (text mode) */}
            {!voiceMode && (
              <div className="flex flex-col gap-2 mt-4">
                {[
                  `I'm managing academic pressure right now`,
                  "I'm exploring my professional motivation",
                  "I'm seeking strategic balance in my growth",
                ].map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="text-[10px] text-left px-4 py-2 bg-slate-50 border-2 border-slate-900 font-black uppercase hover:bg-teal-50 transition-colors text-slate-700">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            onSpeak={(t) => speak(t)}
            isSpeaking={i === messages.length - 1 && speaking && msg.role === 'assistant'}
          />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 border-2 border-rose-300 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4 text-white" />
            </div>
          <div className="bg-white border-2 border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-teal-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }} />
              ))}
            </div>
          </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── TEXT MODE Input ───────────────────────────────────────── */}
      {!voiceMode && (
        <div className="bg-white border-4 border-slate-900 rounded-2xl flex items-end gap-0 overflow-hidden shadow-[4px_4px_0px_0px_#2563EB]">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Synchronize your thoughts${userName ? `, ${userName}` : ''}...`}
            rows={2}
            className="flex-1 p-4 text-xs font-black uppercase resize-none focus:outline-none bg-transparent placeholder:text-slate-300"
            disabled={loading}
          />
          <div className="flex flex-col border-l-4 border-slate-900 p-2 gap-2">
            {/* Quick mic (in text mode, just fills the input) */}
            <button
              onClick={listening ? stopListening : startListening}
              className={`p-2 rounded-xl transition-all ${listening ? 'bg-teal-500 text-white animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              title="Voice input"
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Listening status (text mode) */}
      {listening && !voiceMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center text-sm text-rose-600 font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          Listening{userName ? `, ${userName}` : ''}... speak now
        </motion.div>
      )}

      {/* Speaking indicator (text mode) */}
      {speaking && !voiceMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center text-sm text-purple-600 font-medium flex items-center justify-center gap-2">
          <Volume2 className="w-4 h-4 animate-pulse" />
          Serenity is speaking...
          <button onClick={stopSpeaking} className="text-xs underline text-purple-400">Stop</button>
        </motion.div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Serenity is an AI companion, not a licensed therapist. For emergencies, please call iCall: 9152987821 🌸
      </p>
    </div>
  );
}
