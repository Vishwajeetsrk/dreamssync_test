import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SessionWrapper from "@/components/SessionWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import AppChrome from "@/components/AppChrome";

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
              <AppChrome>
                {children}
              </AppChrome>
            </LanguageProvider>
          </AuthProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
