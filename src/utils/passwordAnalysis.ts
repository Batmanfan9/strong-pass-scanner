import zxcvbn from 'zxcvbn';

const COMMON_WORDS = ['password', 'welcome', 'admin', 'letmein', 'qwerty', 'iloveyou'];

export interface PasswordAnalysis {
  score: 0 | 1 | 2 | 3 | 4;
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  entropy: number;
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  hasRepeatedChars: boolean;
  hasSequentialChars: boolean;
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

function calculateEntropy(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 33;
  return pool > 0 ? Math.log2(pool) * password.length : 0;
}

function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

function hasSequentialCharacters(password: string): boolean {
  if (password.length < 3) return false;
  for (let i = 1; i < password.length; i++) {
    const curr = password.charCodeAt(i);
    const prev = password.charCodeAt(i - 1);
    if (curr === prev + 1) {
      if (i < password.length - 1 && password.charCodeAt(i + 1) === curr + 1) {
        return true;
      }
    }
  }
  return false;
}

function detectDictionaryWords(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_WORDS.some(word => lower.includes(word));
}

function getCharDistribution(password: string) {
  let uppercase = 0, lowercase = 0, numbers = 0, symbols = 0;
  for (const char of password) {
    if (/[A-Z]/.test(char)) uppercase++;
    else if (/[a-z]/.test(char)) lowercase++;
    else if (/[0-9]/.test(char)) numbers++;
    else symbols++;
  }
  return { uppercase, lowercase, numbers, symbols };
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
      hasDictionaryWords: false,
      charDistribution: { uppercase: 0, lowercase: 0, numbers: 0, symbols: 0 },
      feedback: [],
      crackTime: 'instant',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const entropy = calculateEntropy(password);
  const hasRepeatedChars = hasRepeatedCharacters(password);
  const hasSequentialChars = hasSequentialCharacters(password);
  const hasDictionaryWords = detectDictionaryWords(password);
  const charDistribution = getCharDistribution(password);

  const zxcvbnResult = zxcvbn(password);
  let score = Number(zxcvbnResult.score);

  // Adjust score
  if (password.length >= 12) score += 0.5;
  const variety = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
  score += variety / 4;
  if (hasRepeatedChars) score -= 0.5;
  if (hasSequentialChars) score -= 0.5;
  if (hasDictionaryWords) score -= 1;

  score = Math.max(0, Math.min(4, score));
  const roundedScore = Math.round(score) as 0 | 1 | 2 | 3 | 4;

  const strength: PasswordAnalysis['strength'] = 
    roundedScore >= 4 ? 'very-strong' : 
    roundedScore >= 3 ? 'strong' : 
    roundedScore >= 2 ? 'fair' : 
    roundedScore >= 1 ? 'weak' : 'very-weak';

  const feedback: string[] = [];
  if (password.length < 12) feedback.push('Use at least 12 characters');
  if (!hasUppercase) feedback.push('Add uppercase letters');
  if (!hasLowercase) feedback.push('Add lowercase letters');
  if (!hasNumbers) feedback.push('Add numbers');
  if (!hasSymbols) feedback.push('Add special characters');
  if (hasRepeatedChars) feedback.push('Avoid repeated characters');
  if (hasSequentialChars) feedback.push('Avoid sequential characters');
  if (hasDictionaryWords) feedback.push('Avoid common words');

  return {
    score: roundedScore,
    strength,
    entropy,
    length: password.length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    hasRepeatedChars,
    hasSequentialChars,
    hasDictionaryWords,
    charDistribution,
    feedback,
    crackTime: String(zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second),
  };
}
