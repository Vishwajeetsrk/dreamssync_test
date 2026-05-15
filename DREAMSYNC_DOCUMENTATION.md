# DreamSync Product Documentation: The AI Career Catalyst

## 1. Product Overview
**DreamSync** is an end-to-end AI-powered career intelligence platform designed to democratize high-quality career guidance. Built for the modern job market (2026), it bridges the gap between raw ambition and professional success by providing students and job seekers with institutional-grade AI tools, personalized learning roadmaps, and community support.

## 2. Vision and Mission
*   **Vision:** To be the world's most accessible "GPS for Careers," ensuring no dream is lost due to a lack of guidance.
*   **Mission:** To empower 10 Million+ youth with data-backed career roadmaps, ATS-optimized resumes, and AI-driven mental support to navigate the complex global economy.

## Design Intelligence (New Skills Added)
The platform now incorporates **Frontend Design Skills**:
- **Figma Integration**: Direct mapping of Figma tokens to Neo-Brutalist components.
- **Theme Factory**: Dynamic color system for high-contrast accessibility.
- **Brand Guidelines**: "Supportive Architect" persona enforcement.
- **Canvas Design**: SVG/Canvas-based interactive career roadmaps.

## 3. Problem Statement
Despite the wealth of information online, job seekers face:
1.  **The Guidance Gap:** Lack of personalized "What next?" advice in tier-2/3 cities.
2.  **ATS Rejection:** 75% of resumes are filtered out by machines before a human sees them.
3.  **High Costs:** Career coaching and premium resume tools are expensive.
4.  **Mental Fatigue:** The job hunt process is emotionally draining, leading to high burnout rates.
5.  **Information Overload:** Difficulty in finding authentic govt resources and free high-quality documents.

## 4. Target Audience
*   **Indian Students (Primary):** Undergraduates from tier-2/3 cities looking for tech/corporate roles.
*   **Global Job Seekers:** Professionals looking to optimize their LinkedIn and Resume for international markets.
*   **NGOs & Social Orgs:** Partners using DreamSync to upscale underprivileged communities.
*   **Career Switchers:** Individuals moving into tech or AI-centric roles.

## 5. Core Features
| Feature | Purpose | Key Value |
| :--- | :--- | :--- |
| **AI Roadmap Architect** | Generates phase-wise learning paths. | Specific task lists, hand-picked free resources. |
| **ATS Score Check** | Analyzes resumes against job descriptions. | Real-time scoring and keyword optimization. |
| **Resume Builder** | Clean, minimalist, and professional templates. | Zero-clutter, exportable high-quality PDF/Docx. |
| **LinkedIn Optimizer** | AI-driven profile audit. | Headlines, about sections, and experience tweaks. |
| **Ikigai Discovery** | Career-match personality tool. | Finds intersection of passion, mission, and vocation. |
| **Mental Health AI** | 24/7 empathetic career support. | Stress management and motivational guidance. |
| **Auto Portfolio** | One-click website generation. | Converts resume data into a hosted professional site. |
| **Govt Docs & Resources** | Central hub for student essentials. | IDs, certifications, and free resource links. |

## 6. User Journey
1.  **Discover:** User lands on the platform and identifies their career goal via the **Ikigai Tool**.
2.  **Plan:** AI generates a **High-Depth Roadmap** with specific phases and deadlines.
3.  **Build:** User utilizes the **Resume Builder** and **ATS Check** to craft a professional identity.
4.  **Optimize:** **LinkedIn Helper** ensures their online presence matches their new resume.
5.  **Apply/Network:** User joins **Student Central (Community)** for workshops and job referrals.
6.  **Sustain:** **Mental Health AI** provides support through the inevitable ups and downs of the hunt.

## 7. Platform Modules
1.  **AI Layer:** The "Brain" (Gemini/OpenAI/Groq proxy) handling logic, parsing, and architecture.
2.  **Community Hub:** Interactive space for workshops, weekly chats, and peer networking.
3.  **Intelligence Suite:** The collection of 9+ utility tools (Roadmap, ATS, etc.).
4.  **Admin System:** The "Control Tower" for user management and performance monitoring.

## 8. System Architecture
*   **Frontend:** Next.js 16 (React 19), TailwindCSS 4, Framer Motion.
*   **Backend:** Firebase (Firestore, Auth, Storage) + Supabase (Secondary DB/Edge features).
*   **AI Layer:** Dynamic model routing (Gemini for depth, Groq for speed, OpenAI for fallback).
*   **Cache:** Upstash Redis for RL and performance.

## 9. Technology Stack
*   **Next.js 16:** Chosen for Server Components (SEO) and App Router (Complex state management).
*   **Firebase:** Provides real-time synchronization needed for the Admin-to-User live flow.
*   **Tailwind 4 + Framer Motion:** Ensures a "Neo-Brutalist" premium aesthetic that feels alive and responsive.
*   **Zod + AI Guard:** Strict validation of AI inputs/outputs to prevent prompt injection or halluncination.

## 10. Database Design (Firestore)
*   **Collection: `users`**
    *   `uid`: Unique Identifier
    *   `email`, `name`, `avatar_url`
    *   `role`: user / admin
    *   `premium`: boolean
*   **Collection: `resumes`**
    *   `userId`: Ref to users
    *   `data`: JSON blob of resume content
    *   `ats_score`: number
*   **Collection: `usage`**
    *   `userId`: Ref to users
    *   `daily_ai_calls`: counter
    *   `last_reset`: timestamp

## 11. API Structure
*   `POST /api/roadmap`: Generates JSON-structured learning paths.
*   `POST /api/ats-advanced`: Parses PDFs and returns a similarity score.
*   `POST /api/mental-health`: Stateful conversation engine for empathy-first responses.
*   `GET /api/community/jobs`: Fetches real-time job listings from scrapers/partners.

## 12. Admin System Overview
*   **Dashboard:** High-level metrics (DAU, MAU, AI Credits spent).
*   **User Management:** Ability to ban, promote, or assist users directly.
*   **System Health:** Monitoring API latency and Upstash Redis usage.
*   **Moderation:** Reviewing AI safety violations caught by the AI Guard.

## 13. Real-time Data Flow
1.  **Sync:** Firebase SDK maintains a persistent socket between the Admin Panel and User Dashboard.
2.  **Push:** When an Admin updates a "Job Listing" or "Community Event," the `onSnapshot` listener on the client updates the UI instantly without a refresh.
3.  **Engagement:** Real-time "Students Joining" counters in the community module.

## 14. Performance Requirements
*   **LCP (Largest Contentful Paint):** < 1.2s (Optimized via Next.js Image component).
*   **TTI (Time to Interactive):** < 2.5s.
*   **AI Latency:** Under 4s for roadmap generation (using Groq for speed).

## 15. Security Requirements
*   **Ratelimiting:** Upstash Redis implemented on all AI routes to prevent API cost spikes.
*   **Data Encryption:** Firebase Security Rules enforced (Users can only read their own data).
*   **AI Safety:** Mandatory "No Hacking/Illegal Roadmap" protocol in prompts.

## 16. Scalability Plan
*   **Phase 1 (MVP):** Single Firebase project, basic AI routing.
*   **Phase 2 (Growth):** Implementing Redis caching for common roadmap requests to save API costs.
*   **Phase 3 (Enterprise):** Sharding Firestore and moving AI processing to dedicated background workers.

---

## 🚀 Future Roadmap & Improvements

### Identified Missing Features:
1.  **Dynamic Community Engine:** Currently, events and jobs are hardcoded placeholders. Needs a Firestore-backed CMS.
2.  **Job Application Tracker:** A dashboard for users to track where they've applied and their interview status.
3.  **Mock Interview AI:** Voice-based AI system to practice interview questions.
4.  **Vernacular Support:** Multi-language toggle for Hindi, Marathi, and Tamil to deeper penetrate rural India.

### Suggested Improvements:
1.  **Email Automation:** Use **Resend** to send automated weekly progress reports to users.
2.  **PWA Support:** Convert the platform into a Progressive Web App for better mobile access in low-bandwidth areas.
3.  **Mentorship Marketplace:** Allow senior professionals to sign up as mentors and connect with students.
