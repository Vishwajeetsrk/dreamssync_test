'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ExternalLink, FileText, Info, AlertTriangle,
  Code2, Database, GitBranch, Globe, Smartphone, Terminal,
  Shield, ChevronRight, Layers, CheckCircle2, ChevronDown, ChevronUp,
  Landmark, GraduationCap, Sparkles, Brain
} from 'lucide-react';

// ── Government Docs (with step-by-step apply instructions) ────────
const govDocs = [
  {
    title: "PAN Card",
    desc: "A PAN Card is needed to get your salary, open a bank account, and pay taxes correctly in India.",
    link: "https://www.protean-tinpan.com/",
    time: "approx 15–20 days",
    fee: "₹107 (approx)",
    required: ["Aadhaar Card", "Date of Birth Proof", "Passport Size Photos"],
    type: "government",
    steps: [
      "Go to NSDL portal: onlineservices.nsdl.com → Click 'Apply Online' under PAN",
      "Select 'New PAN – Indian Citizen (Form 49A)' and fill personal details exactly as on Aadhaar",
      "Upload scanned passport photo, signature, and Aadhaar as identity + address proof",
      "Pay ₹107 online via net banking / UPI / debit card",
      "Note down the 15-digit Acknowledgment Number for tracking",
      "E-PAN delivered to email in 2–3 days; physical card delivered in 15–20 days",
    ],
    tips: "Ensure your name spelling matches exactly across Aadhaar and Class 10 marksheet to avoid BGV issues.",
    altLink: "https://www.pan.utiitsl.com/",
    altLinkLabel: "Apply via UTIITSL",
  },
  {
    title: "Aadhaar Card Update",
    desc: "Make sure your mobile number is connected to your Aadhaar card for easy online verification.",
    link: "https://myaadhaar.uidai.gov.in/",
    time: "approx 5–15 days",
    fee: "₹50 (demographic update)",
    required: ["Proof of Identity", "Proof of Address"],
    type: "government",
    steps: [
      "Visit myaadhaar.uidai.gov.in → Log in with your Aadhaar number + OTP",
      "Click 'Update Demographics' to update name, address, DOB, or gender",
      "To link mobile: visit your nearest Aadhaar Enrolment Centre (can't do online)",
      "Upload supporting documents (Aadhaar-accepted POI / POA list on UIDAI website)",
      "Pay ₹50 update fee and note the URN (Update Request Number)",
      "Track update status at myaadhaar.uidai.gov.in using URN",
    ],
    tips: "Mobile linking must be done in person at an Aadhaar centre. Carry original documents — photocopies are not accepted.",
    altLink: "https://uidai.gov.in/",
    altLinkLabel: "UIDAI Official Website",
  },
  {
    title: "UAN / EPF Number",
    desc: "Your Employee Provident Fund (EPF) is your savings. Your first employer will create this number for you.",
    link: "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    time: "Instant (Digital)",
    fee: "Free",
    required: ["Aadhaar", "PAN", "Bank Account Details"],
    type: "career",
    steps: [
      "Your employer registers your details with EPFO and generates UAN on your first salary",
      "You'll receive UAN via SMS on your Aadhaar-linked mobile number",
      "Activate UAN at unifiedportal-mem.epfindia.gov.in/memberinterface/",
      "Click 'Activate UAN' → Enter UAN, Aadhaar, mobile → verify OTP",
      "After activation, link PAN and bank account under 'KYC' section",
      "Get Aadhaar linked and verified by employer to enable online withdrawals",
    ],
    tips: "Always verify your employer has deposited EPF by checking passbook under 'View Passbook'. If switching jobs, transfer (not withdraw) PF using online transfer claim.",
    altLink: "https://epfindia.gov.in/",
    altLinkLabel: "EPFO Official Website",
  },
  {
    title: "Passport",
    desc: "A passport is important for identity checks and if you ever need to travel or work outside of India.",
    link: "https://www.passportindia.gov.in/",
    time: "30–45 days (normal), 7–14 days (Tatkal)",
    fee: "₹1,500 (36 pages) / ₹2,000 (60 pages) | Tatkal: +₹2,000",
    required: ["Aadhaar", "10th Marksheet", "Birth Certificate / PAN"],
    type: "government",
    steps: [
      "Register at passportindia.gov.in → Click 'New User Registration'",
      "Login → Select 'Fresh Passport' or 'Tatkal' → Fill Form online",
      "Upload Aadhaar (address proof), 10th certificate (DOB proof), and PAN",
      "Pay fee online → Book appointment at nearest Passport Seva Kendra (PSK)",
      "Visit PSK on appointment date with all originals + one set of photocopies",
      "Police verification happens post-submission (online in most cities now)",
      "Passport dispatched via India Post Speed Post — track at India Post website",
    ],
    tips: "Book Tatkal if you need passport within 2 weeks. Police verification may take longer in smaller cities — apply early before job joining.",
    altLink: "https://www.passportindia.gov.in/AppOnlineProject/welcomeLink",
    altLinkLabel: "Direct Application Portal",
  },
  {
    title: "Savings Bank Account",
    desc: "You need a bank account to receive your salary, use apps like Google Pay/UPI, and save your money.",
    link: "https://www.jansamarth.in/",
    time: "Instant (Online) / 1–3 days branch",
    fee: "Free (zero-balance)",
    required: ["Aadhaar", "PAN", "Passport Photo", "Mobile Number"],
    type: "career",
    steps: [
      "Choose bank: SBI (YONO app), HDFC, ICICI, or Kotak Mahindra (known for zero-balance)",
      "Download bank app or visit website → Click 'Open Savings Account Online'",
      "Enter Aadhaar number → Complete OTP-based e-KYC verification",
      "Enter PAN details and nominee information",
      "Account number generated instantly; debit card and passbook delivered in 5–7 days",
      "For Jan Dhan account: walk into any bank branch with Aadhaar — no minimum balance needed",
    ],
    tips: "Keep one dedicated salary account separate from expenses. Ensure your employer has your exact account number + IFSC — wrong details delay salary by months.",
    altLink: "https://www.onlinesbi.sbi/",
    altLinkLabel: "Open SBI Account Online",
  },
  {
    title: "Tax Filing (ITR)",
    desc: "ITR filing is a simple way to show the government how much you earn and is great for your legal record.",
    link: "https://www.incometax.gov.in/iec/foportal/",
    time: "Employer issues by June 15 | ITR deadline: July 31",
    fee: "Free (self-filing) / CA charges apply",
    required: ["Form 16 from employer", "PAN", "Bank Account Statement"],
    type: "career",
    steps: [
      "Collect Form 16 from HR/Finance team by June 15 (mandatory for employers to issue)",
      "Visit incometax.gov.in → Login with PAN + OTP",
      "Click 'File Income Tax Return' → Choose Assessment Year (e.g. AY 2025–26 for FY24–25)",
      "Select ITR-1 (for salaried with income up to ₹50L — most freshers use this)",
      "Import pre-filled data from Form 26AS and AIS (auto-populated from Form 16)",
      "Verify deductions (Section 80C, 80D) → Submit → E-verify using Aadhaar OTP",
    ],
    tips: "Even if TDS was deducted and tax paid, filing ITR is mandatory above ₹2.5L income. It also helps for visa applications and loan approvals later.",
    altLink: "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/bl-link?lang=en",
    altLinkLabel: "Quick ITR E-file Link",
  },
  {
    title: "Driving Licence",
    desc: "Accepted as a photo ID for BGV in many companies. Get a smart card DL from your state transport office.",
    link: "https://sarathi.parivahan.gov.in/",
    time: "7–15 days (after passing test)",
    fee: "₹200–₹800 (state-wise)",
    required: ["Aadhaar", "Age Proof", "Medical Certificate"],
    type: "government",
    steps: [
      "Visit sarathi.parivahan.gov.in → Select your state",
      "Apply for Learner's Licence first: fill form, upload Aadhaar + age proof, pay fee",
      "Book slot for Learner's Licence test (computer-based multiple choice, traffic rules)",
      "After passing, wait 30 days → Apply for Permanent Driving Licence test",
      "Book a slot at your RTO (Regional Transport Office) for practical driving test",
      "If passed, DL card dispatched via post in 7–15 days (or collect from RTO)",
    ],
    tips: "Get a Learner's Licence first — it's also accepted as valid ID at most places. DL is useful for domestic travel without passport.",
    altLink: "https://parivahan.gov.in/parivahan/",
    altLinkLabel: "Parivahan – Govt Transport Portal",
  },
];

// ── Skill Guides ─────────────────────────────────────────────────
const skillGuides = [
  {
    title: "Generative AI & LLMs",
    icon: Sparkles,
    color: "bg-violet-100",
    border: "border-violet-400",
    level: "2026 High Demand",
    duration: "2–3 months",
    skills: ["Prompt Engineering", "Fine-tuning LLMs", "RAG Systems", "Vector DBs", "OpenAI / Claude API"],
    resources: [
      { name: "DeepLearning.AI – LLM Specialization", url: "https://www.deeplearning.ai/" },
      { name: "Andrej Karpathy – Intro to LLMs (Video)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g" },
      { name: "Build a Custom RAG (Project)", url: "https://github.com/langchain-ai/langchain" },
    ],
    jobs: "https://www.naukri.com/generative-ai-jobs",
    salary: "₹8L – ₹25L (Fresher/1yr)",
  },
  {
    title: "Agentic AI Developer",
    icon: Brain,
    color: "bg-indigo-100",
    border: "border-indigo-400",
    level: "Cutting Edge",
    duration: "3–4 months",
    skills: ["LangChain / LangGraph", "CrewAI / AutoGen", "Tool Selection", "Multi-Agent Systems", "Stateful Agents"],
    resources: [
      { name: "LangChain Official (Docs)", url: "https://python.langchain.com/docs/get_started/introduction" },
      { name: "Building AI Agents (Video)", url: "https://www.youtube.com/watch?v=F8NKVhkZZWI" },
      { name: "Multi-Agent Sales System (Project)", url: "https://github.com/joaomdmoura/crewAI-examples" },
    ],
    jobs: "https://www.naukri.com/ai-agent-jobs",
    salary: "₹12L – ₹35L (Specialized)",
  },
  {
    title: "Web Development (Frontend)",
    icon: Globe,
    color: "bg-blue-100",
    border: "border-blue-400",
    level: "Beginner → Job-Ready",
    duration: "4–6 months",
    skills: ["HTML5 & CSS3", "JavaScript (ES6+)", "React / Next.js", "Tailwind CSS", "Git & GitHub"],
    resources: [
      { name: "The Odin Project (Free)", url: "https://www.theodinproject.com/" },
      { name: "JS Mastery – Next.js guide (Video)", url: "https://www.youtube.com/@javascriptmastery" },
      { name: "Portfolio Site (Project)", url: "https://github.com/adrianhajdin/project_nextjs_portfolio" },
    ],
    jobs: "https://www.naukri.com/frontend-developer-jobs",
    salary: "₹3L – ₹12L / year (fresher)",
  },
  {
    title: "Python & Data Science",
    icon: Database,
    color: "bg-yellow-100",
    border: "border-yellow-400",
    level: "Essential",
    duration: "5–7 months",
    skills: ["Python Basics", "Pandas & NumPy", "Data Visualization", "Machine Learning", "SQL"],
    resources: [
      { name: "Kaggle Learn (Free)", url: "https://www.kaggle.com/learn" },
      { name: "StatQuest (YouTube)", url: "https://www.youtube.com/@statquest" },
      { name: "Movie Recommender (Project)", url: "https://github.com/topics/recommender-system" },
    ],
    jobs: "https://www.naukri.com/data-science-jobs",
    salary: "₹4L – ₹15L / year (fresher)",
  },
  {
    title: "DSA & Interviews",
    icon: Code2,
    color: "bg-purple-100",
    border: "border-purple-400",
    level: "Placement Ready",
    duration: "3–5 months",
    skills: ["Arrays & Strings", "Trees & Graphs", "DP", "Sorting", "System Design"],
    resources: [
      { name: "Striver's A2Z Sheet (Free)", url: "https://takeuforward.org/strivers-a2z-dsa-course/" },
      { name: "NeetCode DSA (Video)", url: "https://www.youtube.com/@NeetCode" },
      { name: "AlgoVisualizer (Project)", url: "https://github.com/williamfiset/Algorithms" },
    ],
    jobs: "https://www.naukri.com/software-developer-jobs",
    salary: "FAANG: ₹20L–₹60L+",
  },
  {
    title: "UI/UX Design",
    icon: Layers,
    color: "bg-pink-100",
    border: "border-pink-400",
    level: "Creative Focus",
    duration: "3–4 months",
    skills: ["Figma Basics", "User Research", "Prototyping", "Hierarchy", "Design Systems"],
    resources: [
      { name: "Google UX Course (Coursera Free-ish)", url: "https://www.coursera.org/google-certificates/ux-design-certificate" },
      { name: "Figma for Beginners (Video)", url: "https://www.youtube.com/watch?v=dXQ7IHkTiMM" },
      { name: "Re-designing Swiggy (Project)", url: "https://www.behance.net/search/projects?search=ux%20case%20study" },
    ],
    jobs: "https://www.naukri.com/ux-designer-jobs",
    salary: "₹4L – ₹20L (Portfolio based)",
  },
];

// ── Document Card (with expandable How to Apply) ───────────────────
function DocCard({ doc, i }: { doc: typeof govDocs[0]; i: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.07 }}
      className="bg-white border-4 border-black flex flex-col neo-box"
    >
      <div className="p-6 flex-1 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-2xl font-black">{doc.title}</h3>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black shrink-0 ${doc.type === 'government' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
            {doc.type}
          </span>
        </div>
        <p className="font-medium text-muted-foreground">{doc.desc}</p>

        {/* Meta */}
        <div className="bg-gray-50 border-2 border-black p-4 space-y-2">
          <p className="text-sm font-bold flex gap-2"><Info className="w-4 h-4 text-primary shrink-0" /> Cost: <span className="font-normal text-muted-foreground">{doc.fee}</span></p>
          <p className="text-sm font-bold flex gap-2"><FileText className="w-4 h-4 text-primary shrink-0" /> Time: <span className="font-normal text-muted-foreground">{doc.time}</span></p>
        </div>

        {/* Required docs */}
        <div>
          <h4 className="font-bold text-sm mb-2 uppercase tracking-wide">Documents Required:</h4>
          <ul className="space-y-1">
            {doc.required.map(req => (
              <li key={req} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" /> {req}
              </li>
            ))}
          </ul>
        </div>

        {/* How to Apply — Expandable */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-1 space-y-4">
                {/* Steps */}
                <div className="border-t-2 border-dashed border-black pt-4">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" /> Step-by-Step — How to Apply
                  </p>
                  <ol className="space-y-2.5">
                    {doc.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Pro Tip */}
                <div className="bg-amber-50 border-2 border-amber-400 p-3 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-amber-900"><strong>Pro Tip:</strong> {doc.tips}</p>
                </div>

                {/* Alternate link */}
                {doc.altLink && (
                  <a
                    href={doc.altLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> {doc.altLinkLabel}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="border-t-4 border-black grid grid-cols-2">
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-3 font-bold text-sm hover:bg-primary hover:text-white transition-colors border-r-2 border-black flex items-center justify-center gap-1.5"
        >
          {expanded
            ? <><ChevronUp className="w-4 h-4" /> Hide Steps</>
            : <><ChevronDown className="w-4 h-4" /> How to Apply</>
          }
        </button>
        <a
          href={doc.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
        >
          Official Site <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

// ── Skill Card ─────────────────────────────────────────────────────
function SkillCard({ guide, i }: { guide: typeof skillGuides[0]; i: number }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = guide.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.07 }}
      className="bg-white border-4 border-black neo-box flex flex-col"
    >
      <div className="p-6 space-y-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`p-3 border-2 border-black ${guide.color} shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black leading-tight">{guide.title}</h3>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{guide.level}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex gap-3 flex-wrap">
          <span className="px-2 py-1 bg-accent border-2 border-black text-xs font-bold">⏱ {guide.duration}</span>
          <span className="px-2 py-1 bg-green-100 border-2 border-black text-xs font-bold text-green-900">₹ {guide.salary}</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {guide.skills.map(s => (
            <span key={s} className="px-2 py-1 bg-gray-100 border border-black text-xs font-medium">{s}</span>
          ))}
        </div>

        {/* Resources — expandable */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Free Resources
                </p>
                {guide.resources.map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                    <ChevronRight className="w-3 h-3 shrink-0" /> {r.name}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="border-t-4 border-black grid grid-cols-2">
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-3 font-bold text-sm hover:bg-gray-100 transition-colors border-r-2 border-black flex items-center justify-center gap-1"
        >
          {expanded ? <><ChevronUp className="w-4 h-4" /> Hide</> : <><ChevronDown className="w-4 h-4" /> Resources</>}
        </button>
        <a href={guide.jobs} target="_blank" rel="noopener noreferrer"
          className="p-3 font-bold text-sm hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1">
          Find Jobs <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────
export default function Documents() {
  const [tab, setTab] = useState<'skills' | 'docs'>('skills');

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <header className="border-b-4 border-black pb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-3 flex items-center gap-4">
          <BookOpen className="w-10 h-10" /> Roadmaps & Docs
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          Step-by-step skill guides and essential government documents for Indian students & professionals.
        </p>
      </header>

      {/* Tab Switcher */}
      <div className="flex gap-0 border-4 border-black w-fit neo-box">
        <button
          onClick={() => setTab('skills')}
          className={`px-8 py-3 font-black text-sm uppercase tracking-wider transition-colors flex items-center gap-2 ${tab === 'skills' ? 'bg-[#2563EB] text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <GraduationCap className="w-4 h-4" /> Skill Guides (Videos/Projects)
        </button>
        <button
          onClick={() => setTab('docs')}
          className={`px-8 py-3 font-black text-sm uppercase tracking-wider transition-colors border-l-4 border-black flex items-center gap-2 ${tab === 'docs' ? 'bg-[#2563EB] text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <Landmark className="w-4 h-4" /> Government Docs
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'skills' ? (
          <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-blue-50 border-4 border-black p-5 flex items-start gap-4 neo-box mb-8">
              <Info className="text-blue-600 shrink-0 w-7 h-7 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg mb-1 text-blue-900">India-Focused Skill Roadmaps</h3>
                <p className="text-blue-800 font-medium">Each guide includes free learning resources, expected timeline, salary range (India), and direct job search links on Naukri.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {skillGuides.map((guide, i) => <SkillCard key={i} guide={guide} i={i} />)}
            </div>
          </motion.div>
        ) : (
          <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-yellow-50 border-4 border-black p-5 flex items-start gap-4 neo-box mb-8">
              <AlertTriangle className="text-yellow-600 shrink-0 w-7 h-7 mt-0.5" />
              <div>
                <h3 className="font-bold text-lg mb-1 text-yellow-900">Important Checklist</h3>
                <p className="text-yellow-800 font-medium">
                  Important: Make sure your Name, Birthday, and Father&apos;s Name are exactly the same on all your documents!
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {govDocs.map((doc, i) => <DocCard key={i} doc={doc} i={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
