import { z } from 'zod';

// Input Validation Schemas
export const UserProfileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).max(50).optional(),
  interests: z.array(z.string()).max(20).optional(),
});

export const MockInterviewRequestSchema = z.object({
  category: z.enum(['frontend', 'backend', 'fullstack', 'hr', 'behavioral']),
  difficulty: z.enum(['entry', 'mid', 'senior']),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(2000),
  })),
});

// Security Utilities
export const sanitizeString = (str: string) => {
  return str.replace(/[<>]/g, ''); // Basic XSS prevention
};

export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.firebaseapp.com https://*.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://*.googleusercontent.com https://*.firebaseapp.com https://firebasestorage.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.resend.com;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocations=()',
};
