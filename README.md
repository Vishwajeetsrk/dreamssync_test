# 🌙 DreamSync — Career Intelligence & Support Platform

> **Empowering career journeys for students and care-experienced youth. Discover your Ikigai, build your professional identity, and grow with empathetic AI guidance.**

### 🌐 [Live Platform](https://dreamssync.vercel.app/) | 📖 [Documentation](https://github.com/Vishwajeetsrk/dreamssync_test) | 💼 [Team](https://dreamssync.vercel.app/team)

---

## 🎯 Platform Overview

DreamSync is an all-in-one career companion designed for **students, recent graduates, and care-experienced youth**. It combines AI-powered intelligence with a warm, human-centric interface to help users navigate their career paths, build professional identities, and connect with supportive communities.

---

## ✨ Core Features & Modules

### 🧠 **Ikigai Architect** 
Discover the intersection of your Passion, Skills, Market Demand, and Income. Interactive visualization helps you find your true career north star.

### 📄 **AI Resume Forge**
Transform your experiences into ATS-optimized professional documents. Guided builder with real-time preview and AI-powered suggestions.

### 🤖 **Career Agent**
Your personal AI mentor. Get instant career advice, job search strategies, interview preparation, and personalized roadmaps powered by Llama 3.

### 🏆 **ATS Checker**
Validate your resume against real job descriptions. Get actionable feedback, keyword optimization tips, and ATS compatibility scores.

### 🗺️ **Skills & Document Roadmap**
Build a structured pathway to your goals. Track identity documents (Aadhaar, PAN), certifications, and skill milestones with localized guidance for the Indian job market.

### 💼 **LinkedIn Pro Optimizer**
Craft high-performance professional summaries and profile recommendations. Increase visibility to recruiters with data-backed optimizations.

### 🖼️ **Portfolio Engine**
Generate stunning, responsive web portfolios instantly from your professional data. Share your work with a custom domain or direct link.

### 🌱 **Community Hub**
Connect with peers through local meetups, workshops, and job opportunities. Access curated resources and peer mentorship in a safe, supportive space.

### 💭 **Mental Health Support**
Career anxiety? Feeling stuck? Access empathetic guidance and wellness resources integrated into your journey.

---

## 🛠 Technical Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16.2.2](https://nextjs.org/) with React 19 |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Framer Motion 12 |
| **Database** | [Firebase Cloud Firestore](https://firebase.google.com/) |
| **Authentication** | Firebase Auth + NextAuth v4 (Google, GitHub OAuth) |
| **AI Models** | Llama 3 via [OpenRouter](https://openrouter.ai/) |
| **Document Processing** | PDF Parse, DOCX, Mammoth |
| **File Storage** | Firebase Storage + Web3Forms |
| **Rate Limiting** | Upstash Redis |
| **Email** | [Resend](https://resend.com/) |

---

## 📋 File Structure

```
dreamsync/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── ikigai/               # Ikigai discovery tool
│   │   ├── resume-builder/       # Resume creation
│   │   ├── career-agent/         # AI career chat
│   │   ├── ats-check/            # ATS validation
│   │   ├── portfolio/            # Portfolio engine
│   │   ├── linkedin/             # LinkedIn optimizer
│   │   ├── community/            # Community hub
│   │   ├── mental-health/        # Wellness support
│   │   ├── documents/            # Document roadmap
│   │   ├── dashboard/            # User dashboard
│   │   ├── api/                  # Backend routes
│   │   ├── auth/                 # Authentication
│   │   └── admin/                # Admin panel (restricted)
│   ├── components/       # Reusable React components
│   ├── context/          # React context (Auth, etc.)
│   ├── lib/              # Utility functions & configs
│   └── agents/           # AI agent configurations
├── public/               # Static assets
├── portfolio/            # Portfolio template samples
└── .env.local           # Environment variables (create locally)
```

---

## 🔐 Infrastructure & Credentials

To run DreamSync, configure these services:

| Service | Purpose | Setup Link |
| :--- | :--- | :--- |
| **Firebase Project** | Database, Auth, Storage | [Firebase Console](https://console.firebase.google.com/) |
| **OpenRouter Account** | AI Model API (Llama 3) | [OpenRouter Dashboard](https://openrouter.ai/) |
| **Web3Forms Account** | Contact form processing | [Web3Forms](https://web3forms.com/) |
| **GitHub OAuth App** | OAuth credentials for auth | [GitHub Developer Settings](https://github.com/settings/developers) |
| **Google OAuth App** | Google Sign-In | [Google Cloud Console](https://console.cloud.google.com/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **Git** for version control
- All credentials from the services listed above

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/Vishwajeetsrk/dreamssync_test.git
cd dreamssync_test
```

2. **Install Dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Create Environment File**
Create `.env.local` in the root directory:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services
OPENROUTER_API_KEY=your_openrouter_key

# Forms & Contact
NEXT_PUBLIC_WEB3FORMS_KEY=your_web3forms_key

# NextAuth Configuration (Optional)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

```bash
npm run dev        # Start dev server (hot reload)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## 🌍 Deployment (Vercel)

### Quick Deploy to Vercel

1. **Push to GitHub** (if not already done)
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Click **"New Project"** → Import `dreamssync_test` repository

3. **Configure Environment Variables**
   - In Vercel Project Settings → Environment Variables
   - Add all variables from your `.env.local`

4. **Deploy**
   - Click **"Deploy"** → Vercel builds and deploys automatically

5. **Update Firebase Allowed Domains**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain (e.g., `dreamssync-test.vercel.app`) to Authorized Domains

### Verify Deployment
- Visit your Vercel URL
- Test login with Google/GitHub
- Verify all features are working

---

## 🏗️ Design System

DreamSync uses a **warm, human-centric design philosophy**:

- **Color Palette**: Soft stone grays (Stone-50 to Stone-900) with accent blues
- **Typography**: Inter font family for maximum readability
- **Geometry**: Soft rounded corners (`rounded-[3rem]`) for approachability
- **Spacing**: Consistent padding based on Tailwind's spacing scale
- **Animation**: Subtle Framer Motion transitions for delight without distraction
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader support

---

## 🔒 Security & Privacy

- **Authentication**: OAuth 2.0 (Google, GitHub) with zero password storage
- **Database Security**: Firebase Security Rules restrict unauthorized access
- **Data Encryption**: HTTPS-only communication, encrypted at rest
- **Content Filtering**: `aiGuard` ensures all AI responses are ethical, supportive, and career-focused
- **GDPR Compliant**: User data handling follows international privacy standards

---

## 📚 Documentation

- **[Requirements Specification](./requirement_specification.md)** – Functional & non-functional requirements
- **[UI/UX Guidelines](./ui_ux_guidelines.md)** – Design principles and component patterns
- **[User Documentation](./user_documentation.md)** – Feature walkthroughs
- **[Content Registry](./content_links.md)** – Information architecture and brand voice
- **[Admin Planning](./admin_planning.md)** – Dashboard features

---

## 🧩 Recommended IDE Extensions

For the best development experience:

- **[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)** – Design token suggestions
- **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)** – Code quality checks
- **[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)** – Code formatting
- **[Firebase Explorer](https://marketplace.visualstudio.com/items?itemName=jsayol.firebase-explorer)** – Firestore management
- **[Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)** – API testing

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support & Contact

- **Email**: support@dreamssync.co.in
- **LinkedIn**: [@vishwajeetsrk](https://www.linkedin.com/in/vishwajeetsrk/)
- **GitHub Issues**: [Report bugs or request features](https://github.com/Vishwajeetsrk/dreamssync_test/issues)

---

## 📜 License

This project is proprietary. All rights reserved © 2026 DreamSync.

---

## 🙏 Acknowledgments

Built with ❤️ for students and care-experienced youth. Special thanks to the open-source community for incredible tools like Next.js, Tailwind CSS, and Firebase.

---

**DreamSync: Empowering Future.**