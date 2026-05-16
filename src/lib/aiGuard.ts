/**
 * DreamSync AI Guard - Global Safety Layer
 * Ensures all career inputs are professional, legal, and safe.
 */

interface GuardResult {
  allowed: boolean;
  message: string;
}

const BLOCKED_KEYWORDS = [
  'terrorist', 'terrorism', 'terroist', 'terror',
  'bomb', 'explosive', 'weapon', 'gun', 'kill',
  'attack', 'violence', 'murder', 'blood',
  'fraud', 'scam', 'scheme', 'money laundering',
  'illegal', 'hacking', 'cracker', 'cyber attack',
  'cybercrime', 'phishing', 'virus', 'malware',
  'drugs', 'narcotics', 'cannabis', 'marijuana', 'meth',
  'sex', 'porn', 'nsfw', 'adult',
  'suicide', 'death', 'torture', 'kidnap'
];

const SAFE_EXEMPTIONS = [
  'ethical hacker', 
  'cybersecurity analyst', 
  'security engineer', 
  'penetration tester',
  'forensic accountant',
  'compliance officer'
];

export function validateCareerInput(input: string, maxLength: number = 2000): GuardResult {
  if (!input) {
    return { allowed: true, message: '' };
  }

  const normalized = input.toLowerCase().trim();

  // 1. Check for safe exemptions first
  for (const exemption of SAFE_EXEMPTIONS) {
    if (normalized.includes(exemption)) {
      return { allowed: true, message: '' };
    }
  }

  // 2. Check for blocked keywords using whole-word matching
  for (const keyword of BLOCKED_KEYWORDS) {
    // Create a regex for whole word match to avoid false positives (e.g., "bomb" in "bombay")
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        allowed: false,
        message: "⚠️ DreamSync only supports safe, legal, and professional career paths. Please choose a valid role like Software Engineer, Data Analyst, Designer, etc."
      };
    }
  }

  // 3. Length check
  if (normalized.length > maxLength) {
    return {
      allowed: false,
      message: `⚠️ Input is abnormally long (max ${maxLength} characters). Please keep it concise.`
    };
  }

  return { allowed: true, message: '' };
}

/**
 * Logs a blocked safety violation to Firestore or console
 */
export async function logSafetyViolation(userId: string | undefined, input: string) {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      blockedInput: input,
      severity: 'HIGH'
    };
    
    console.warn('[AI GUARD VIOLATION]:', JSON.stringify(logData));
    
    // Potential Firestore logging logic here:
    // import { db } from './firebase';
    // import { collection, addDoc } from 'firebase/firestore';
    // await addDoc(collection(db, 'safety_logs'), logData);
  } catch (error) {
    console.error('Failed to log safety violation:', error);
  }
}

const GIBBERISH_OR_GREETINGS = [
  'hi', 'hello', 'hey', 'wassup', 'howdy', 'sup', 'yo', 'hola',
  'test', 'demo', 'stuff', 'something', 'anything', 'nothing',
  'job', 'work', 'career', 'role', 'placeholder', 'dummy',
  'how are you', 'good morning', 'good evening', 'thanks', 'thank you',
  'plz', 'please', 'help', 'ok', 'okay', 'yes', 'no', 'bye'
];

/**
 * Validates that a specified target career represents a valid role title
 * and is not a greeting, filler, or gibberish.
 */
export function validateCareerRole(role: string): GuardResult {
  if (!role) {
    return { allowed: false, message: '⚠️ Target career goal cannot be empty.' };
  }
  
  const normalized = role.toLowerCase().trim();

  // 1. Catch extremely short inputs (excluding legitimate short roles like QA, HR, IT, VP, MD)
  const legitShortRoles = ['qa', 'hr', 'it', 'vp', 'md', 'ai', 'ml', 'ar', 'vr', 'ui', 'ux'];
  if (normalized.length < 3 && !legitShortRoles.includes(normalized)) {
    return {
      allowed: false,
      message: "⚠️ Role name is too short. Please enter a professional career title (e.g. Frontend Engineer)."
    };
  }

  // 2. Catch simple greetings or filler phrases
  if (GIBBERISH_OR_GREETINGS.includes(normalized)) {
    return {
      allowed: false,
      message: `⚠️ "${role}" is not recognized as a professional role. Please enter a valid career goal (e.g. Data Scientist, Product Designer).`
    };
  }

  // 3. Basic character format validation (letters, numbers, standard role symbols)
  // Supports: C++, C#, Web3, Level 2, UI/UX
  const charRegex = /^[a-zA-Z0-9\s\-&.+/()#]{2,}$/;
  if (!charRegex.test(normalized)) {
     return {
       allowed: false,
       message: "⚠️ Career role contains unsupported characters. Please use alphanumeric professional titles."
     };
  }

  // 4. Block obvious conversational questions/fillers
  const questionPhrases = [
    'what is', 'tell me', 'how to', 'i want', 'give me', 
    'show me', 'generate', 'create a', 'make me'
  ];
  for (const phr of questionPhrases) {
    if (normalized.startsWith(phr)) {
      return {
        allowed: false,
        message: `⚠️ Please enter just the professional role title (e.g. "Web Developer") rather than full sentences.`
      };
    }
  }

  return { allowed: true, message: '' };
}
