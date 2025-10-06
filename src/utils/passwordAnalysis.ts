import zxcvbn from 'zxcvbn';

export interface PasswordAnalysis {
  score: number; // 0-4
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  entropy: number;
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeatedChars: boolean;
  hasSequentialChars: boolean;
  hasKeyboardPattern: boolean;
  hasDictionaryWords: boolean;
  charDistribution: {
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  };
  feedback: string[];
  crackTime: string;
}

// Calculate Shannon entropy
export function calculateEntropy(password: string): number {
  const len = password.length;
  const frequencies: { [key: string]: number } = {};
  
  for (const char of password) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const freq of Object.values(frequencies)) {
    const p = freq / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy * len;
}

// Detect repeated characters (3 or more consecutive)
export function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

// Detect sequential characters (abc, 123, etc.)
export function hasSequentialCharacters(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'zyxwvutsrqponmlkjihgfedcba',
    '0123456789',
    '9876543210',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ];
  
  const lower = password.toLowerCase();
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.substring(i, i + 3))) {
        return true;
      }
    }
  }
  return false;
}

// Detect keyboard patterns using Markov chain analysis
export function detectKeyboardPattern(password: string): boolean {
  const keyboardRows = [
    ['qwertyuiop', 'poiuytrewq'],
    ['asdfghjkl', 'lkjhgfdsa'],
    ['zxcvbnm', 'mnbvcxz'],
    ['1234567890', '0987654321'],
  ];
  
  const lower = password.toLowerCase();
  for (const [forward, backward] of keyboardRows) {
    for (let i = 0; i <= forward.length - 3; i++) {
      const pattern = forward.substring(i, i + 3);
      if (lower.includes(pattern)) return true;
    }
    for (let i = 0; i <= backward.length - 3; i++) {
      const pattern = backward.substring(i, i + 3);
      if (lower.includes(pattern)) return true;
    }
  }
  return false;
}

// Simple dictionary word detection
export function detectDictionaryWords(password: string): boolean {
  const commonWords = [
    'password', 'admin', 'user', 'login', 'welcome',
    'monkey', 'dragon', 'master', 'shadow', 'sunshine',
    'princess', 'football', 'baseball', 'superman', 'batman',
    'trustno1', 'letmein', 'welcome', 'whatever', 'secret',
  ];
  
  const lower = password.toLowerCase();
  return commonWords.some(word => lower.includes(word));
}

// Calculate character distribution
export function getCharDistribution(password: string) {
  const distribution = {
    uppercase: 0,
    lowercase: 0,
    numbers: 0,
    symbols: 0,
  };
  
  for (const char of password) {
    if (/[A-Z]/.test(char)) distribution.uppercase++;
    else if (/[a-z]/.test(char)) distribution.lowercase++;
    else if (/[0-9]/.test(char)) distribution.numbers++;
    else distribution.symbols++;
  }
  
  return distribution;
}

// Generate feedback messages
export function generateFeedback(analysis: Partial<PasswordAnalysis>): string[] {
  const feedback: string[] = [];
  
  if (!analysis.length || analysis.length < 8) {
    feedback.push('Use at least 8 characters');
  }
  if (!analysis.hasUppercase) {
    feedback.push('Add uppercase letters (A-Z)');
  }
  if (!analysis.hasLowercase) {
    feedback.push('Add lowercase letters (a-z)');
  }
  if (!analysis.hasNumbers) {
    feedback.push('Add numbers (0-9)');
  }
  if (!analysis.hasSymbols) {
    feedback.push('Add special characters (!@#$%^&*)');
  }
  if (analysis.hasRepeatedChars) {
    feedback.push('Avoid repeated characters (e.g., aaa, 111)');
  }
  if (analysis.hasSequentialChars) {
    feedback.push('Avoid sequential characters (e.g., abc, 123)');
  }
  if (analysis.hasKeyboardPattern) {
    feedback.push('Avoid keyboard patterns (e.g., qwerty, asdf)');
  }
  if (analysis.hasDictionaryWords) {
    feedback.push('Avoid common dictionary words');
  }
  if (analysis.entropy && analysis.entropy < 30) {
    feedback.push('Increase complexity with varied characters');
  }
  
  if (feedback.length === 0) {
    feedback.push('Excellent! Your password is strong and secure.');
  }
  
  return feedback;
}

// Main analysis function
export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      strength: 'very-weak',
      entropy: 0,
      length: 0,
      hasUppercase: false,
      hasLowercase: false,
      hasNumbers: false,
      hasSymbols: false,
      hasRepeatedChars: false,
      hasSequentialChars: false,
      hasKeyboardPattern: false,
      hasDictionaryWords: false,
      charDistribution: { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 },
      feedback: ['Enter a password to begin analysis'],
      crackTime: 'N/A',
    };
  }
  
  const zxcvbnResult = zxcvbn(password);
  const entropy = calculateEntropy(password);
  const charDistribution = getCharDistribution(password);
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const hasRepeatedChars = hasRepeatedCharacters(password);
  const hasSequentialChars = hasSequentialCharacters(password);
  const hasKeyboardPatternDetected = detectKeyboardPattern(password);
  const hasDictionaryWordsDetected = detectDictionaryWords(password);
  
  // Calculate adjusted score (0-4)
  let score: number = zxcvbnResult.score;
  
  // Penalties
  if (hasRepeatedChars) score = Math.max(0, score - 1);
  if (hasSequentialChars) score = Math.max(0, score - 1);
  if (hasKeyboardPatternDetected) score = Math.max(0, score - 1);
  if (hasDictionaryWordsDetected) score = Math.max(0, score - 1);
  
  // Bonuses
  if (password.length >= 16) score = Math.min(4, score + 1);
  if (entropy > 60) score = Math.min(4, score + 1);
  if (hasUppercase && hasLowercase && hasNumbers && hasSymbols) {
    score = Math.min(4, score + 1);
  }
  
  // Map score to strength label
  const strengthMap: { [key: number]: PasswordAnalysis['strength'] } = {
    0: 'very-weak',
    1: 'weak',
    2: 'fair',
    3: 'strong',
    4: 'very-strong',
  };
  
  const analysis: PasswordAnalysis = {
    score: Math.round(score) as 0 | 1 | 2 | 3 | 4,
    strength: strengthMap[Math.round(score)],
    entropy,
    length: password.length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasRepeatedChars,
    hasSequentialChars,
    hasKeyboardPattern: hasKeyboardPatternDetected,
    hasDictionaryWords: hasDictionaryWordsDetected,
    charDistribution,
    feedback: [],
    crackTime: String(zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second),
  };
  
  analysis.feedback = generateFeedback(analysis);
  
  return analysis;
}
