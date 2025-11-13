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
  let chars = 0;
  if (/[a-z]/.test(password)) chars += 26;
  if (/[A-Z]/.test(password)) chars += 26;
  if (/[0-9]/.test(password)) chars += 10;
  if (/[^A-Za-z0-9]/.test(password)) chars += 32;
  
  return chars * password.length / 4;
}

export function hasRepeatedCharacters(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
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
  const length = password.length;
  
  let bcryptTime = "1 year";
  let sha256Time = "1 day";
  let argon2Time = "2 years";
  
  if (length < 8) {
    bcryptTime = "1 hour";
    sha256Time = "1 second";
    argon2Time = "2 hours";
  } else if (length < 12) {
    bcryptTime = "1 week";
    sha256Time = "1 minute";
    argon2Time = "2 weeks";
  }
  
  return {
    bcrypt: { time: bcryptTime, guessesPerSecond: "1K/sec" },
    sha256: { time: sha256Time, guessesPerSecond: "1B/sec" },
    argon2: { time: argon2Time, guessesPerSecond: "500/sec" },
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
      feedback: ['Enter a password'],
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
  
  let score = result.score;
  if (password.length < 8) score = 0;
  if (password.length >= 12) score = score + 1;
  if (hasDictionaryWords) score = score - 1;
  
  if (score < 0) score = 0;
  if (score > 4) score = 4;
  
  const finalScore = score as 0 | 1 | 2 | 3 | 4;
  
  let strength: PasswordAnalysis['strength'] = 'very-weak';
  if (finalScore === 1) strength = 'weak';
  if (finalScore === 2) strength = 'fair';
  if (finalScore === 3) strength = 'strong';
  if (finalScore === 4) strength = 'very-strong';
  
  const analysis: PasswordAnalysis = {
    score: finalScore,
    strength: strength,
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
