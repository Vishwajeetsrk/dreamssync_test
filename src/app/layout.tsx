import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import { AuthProvider } from "@/context/AuthContext";
import SessionWrapper from "@/components/SessionWrapper";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "DreamSync - AI Career Guidance",
  description: "AI-powered career guidance, resume building, and paths for Indian students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] flex flex-col font-sans text-[var(--foreground)] antialiased" suppressHydrationWarning>
        <SessionWrapper>
          <AuthProvider>
            <LanguageProvider>
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 lg:p-8 mt-24">
                {children}
              </main>
              <Footer />
              <AIAssistant />
            </LanguageProvider>
          </AuthProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
