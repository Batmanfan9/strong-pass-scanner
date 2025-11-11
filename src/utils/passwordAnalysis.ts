import zxcvbn from 'zxcvbn';

export interface PasswordAnalysis {
  score: number;
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
  ngramLikelihood: number;
  hashStrength: {
    bcrypt: { time: string; guessesPerSecond: string };
    sha256: { time: string; guessesPerSecond: string };
    argon2: { time: string; guessesPerSecond: string };
  };
  entropyPerCharacter: { character: number; entropy: number }[];
}

export function calculateEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
  
  return Math.log2(Math.pow(charsetSize, password.length));
}

export function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

export function hasSequentialCharacters(password: string): boolean {
  const sequences = ['abc', '123', 'qwe', 'asd', 'zxc'];
  const lower = password.toLowerCase();
  return sequences.some(seq => lower.includes(seq));
}

export function detectKeyboardPattern(password: string): boolean {
  const patterns = ['qwerty', 'asdfgh', 'zxcvbn'];
  const lower = password.toLowerCase();
  return patterns.some(p => lower.includes(p));
}

export function detectDictionaryWords(password: string): boolean {
  const words = ['password', 'admin', 'letmein', 'welcome', '123456'];
  const lower = password.toLowerCase();
  return words.some(word => lower.includes(word));
}

export function calculateNgramLikelihood(password: string): number {
  const common = ['12', '23', 'ab', 'er', '123', 'abc'];
  const lower = password.toLowerCase();
  let count = 0;
  
  for (const pattern of common) {
    if (lower.includes(pattern)) count++;
  }
  
  return (count / common.length) * 100;
}

export function calculateEntropyPerCharacter(password: string): { character: number; entropy: number }[] {
  const result: { character: number; entropy: number }[] = [];
  
  for (let i = 1; i <= password.length; i++) {
    const substring = password.substring(0, i);
    result.push({ character: i, entropy: calculateEntropy(substring) });
  }
  
  return result;
}

export function calculateHashStrength(password: string, entropy: number) {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
  
  const combinations = Math.pow(charsetSize, password.length);
  const bcryptSpeed = 1000;
  const sha256Speed = 1000000000;
  const argon2Speed = 500;
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    return `${Math.round(seconds / 31536000)} years`;
  };
  
  const formatGuesses = (speed: number): string => {
    if (speed >= 1000000000) return `${(speed / 1000000000).toFixed(1)}B/sec`;
    if (speed >= 1000000) return `${(speed / 1000000).toFixed(1)}M/sec`;
    return `${(speed / 1000).toFixed(1)}K/sec`;
  };
  
  return {
    bcrypt: { time: formatTime(combinations / bcryptSpeed / 2), guessesPerSecond: formatGuesses(bcryptSpeed) },
    sha256: { time: formatTime(combinations / sha256Speed / 2), guessesPerSecond: formatGuesses(sha256Speed) },
    argon2: { time: formatTime(combinations / argon2Speed / 2), guessesPerSecond: formatGuesses(argon2Speed) },
  };
}

export function getCharDistribution(password: string) {
  const dist = { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 };
  
  for (const char of password) {
    if (/[A-Z]/.test(char)) dist.uppercase++;
    else if (/[a-z]/.test(char)) dist.lowercase++;
    else if (/[0-9]/.test(char)) dist.numbers++;
    else dist.symbols++;
  }
  
  return dist;
}

export function generateFeedback(analysis: Partial<PasswordAnalysis>): string[] {
  const feedback: string[] = [];
  
  if (!analysis.length || analysis.length < 8) feedback.push('Use at least 8 characters');
  if (!analysis.hasUppercase) feedback.push('Add uppercase letters');
  if (!analysis.hasLowercase) feedback.push('Add lowercase letters');
  if (!analysis.hasNumbers) feedback.push('Add numbers');
  if (!analysis.hasSymbols) feedback.push('Add special characters');
  if (analysis.hasRepeatedChars) feedback.push('Avoid repeated characters');
  if (analysis.hasSequentialChars) feedback.push('Avoid sequences like abc or 123');
  
  if (feedback.length === 0) feedback.push('Great password!');
  return feedback;
}

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
      ngramLikelihood: 0,
      hashStrength: {
        bcrypt: { time: 'N/A', guessesPerSecond: 'N/A' },
        sha256: { time: 'N/A', guessesPerSecond: 'N/A' },
        argon2: { time: 'N/A', guessesPerSecond: 'N/A' },
      },
      entropyPerCharacter: [],
    };
  }
  
  const result = zxcvbn(password);
  const entropy = calculateEntropy(password);
  const charDistribution = getCharDistribution(password);
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const hasRepeatedChars = hasRepeatedCharacters(password);
  const hasSequentialChars = hasSequentialCharacters(password);
  const hasKeyboardPattern = detectKeyboardPattern(password);
  const hasDictionaryWords = detectDictionaryWords(password);
  
  let score: number = result.score;
  if (hasDictionaryWords) score = Math.max(0, score - 1);
  if (hasSequentialChars) score = Math.max(0, score - 0.5);
  if (password.length >= 12) score = Math.min(4, score + 0.5);
  
  const finalScore = Math.round(score) as 0 | 1 | 2 | 3 | 4;
  
  const strengthMap: { [key: number]: PasswordAnalysis['strength'] } = {
    0: 'very-weak', 1: 'weak', 2: 'fair', 3: 'strong', 4: 'very-strong'
  };
  
  const analysis: PasswordAnalysis = {
    score: finalScore,
    strength: strengthMap[finalScore],
    entropy,
    length: password.length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasRepeatedChars,
    hasSequentialChars,
    hasKeyboardPattern,
    hasDictionaryWords,
    charDistribution,
    feedback: [],
    crackTime: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
    ngramLikelihood: calculateNgramLikelihood(password),
    hashStrength: calculateHashStrength(password, entropy),
    entropyPerCharacter: calculateEntropyPerCharacter(password),
  };
  
  analysis.feedback = generateFeedback(analysis);
  return analysis;
}
