// Import the zxcvbn library - it's a smart password checker made by Dropbox
import zxcvbn from 'zxcvbn';

// This interface defines what information we collect about a password
// Think of it like a report card for passwords!
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
  ngramLikelihood: number; // 0-100, lower is better
  hashStrength: {
    bcrypt: { time: string; guessesPerSecond: string };
    sha256: { time: string; guessesPerSecond: string };
    argon2: { time: string; guessesPerSecond: string };
  };
  entropyPerCharacter: { character: number; entropy: number }[];
}

// === ENTROPY CALCULATOR ===
// Entropy measures how unpredictable/random your password is
// Higher entropy = harder to guess!
// Think of it like: how many different ways could you arrange these characters?
export function calculateEntropy(password: string): number {
  const passwordLength = password.length;
  
  // Step 1: Count how many times each character appears
  // Example: "hello" -> { h: 1, e: 1, l: 2, o: 1 }
  const characterCounts: { [key: string]: number } = {};
  
  for (const character of password) {
    // If we've seen this character before, add 1. If not, start at 1
    characterCounts[character] = (characterCounts[character] || 0) + 1;
  }
  
  // Step 2: Calculate the entropy using Shannon's formula
  // This is the math behind measuring randomness
  let totalEntropy = 0;
  
  for (const count of Object.values(characterCounts)) {
    // probability = how often this character appears (as a fraction)
    const probability = count / passwordLength;
    
    // Add to entropy using logarithm base 2 (that's why it's measured in "bits")
    totalEntropy -= probability * Math.log2(probability);
  }
  
  // Multiply by password length to get final entropy score
  return totalEntropy * passwordLength;
}

// === REPEATED CHARACTERS DETECTOR ===
// Checks if password has the same character 3+ times in a row
// Examples: "aaa", "111", "!!!" are all bad
export function hasRepeatedCharacters(password: string): boolean {
  // This regex pattern means: find any character (.) that repeats (\1) 2 or more times ({2,})
  // So it looks for patterns like "aaa", "111", etc.
  return /(.)\1{2,}/.test(password);
}

// === SEQUENTIAL CHARACTERS DETECTOR ===
// Checks for sequences like "abc", "123", "qwerty" (keyboard rows)
// These are predictable and easy for hackers to guess
export function hasSequentialCharacters(password: string): boolean {
  // List of common sequences to look for
  const commonSequences = [
    'abcdefghijklmnopqrstuvwxyz',  // forward alphabet
    'zyxwvutsrqponmlkjihgfedcba',  // backward alphabet
    '0123456789',                   // forward numbers
    '9876543210',                   // backward numbers
    'qwertyuiop',                   // top keyboard row
    'asdfghjkl',                    // middle keyboard row
    'zxcvbnm',                      // bottom keyboard row
  ];
  
  // Convert password to lowercase so we can catch patterns regardless of case
  const lowercasePassword = password.toLowerCase();
  
  // Check each sequence
  for (const sequence of commonSequences) {
    // Look at every possible 3-character chunk in the sequence
    // We check chunks of 3 because "abc" or "123" is enough to be predictable
    for (let position = 0; position <= sequence.length - 3; position++) {
      const threeCharChunk = sequence.substring(position, position + 3);
      
      // If we find this chunk in the password, it's sequential!
      if (lowercasePassword.includes(threeCharChunk)) {
        return true;
      }
    }
  }
  
  // No sequences found - good!
  return false;
}

// === KEYBOARD PATTERN DETECTOR ===
// Detects patterns like "qwe", "asd", "zxc" (fingers sliding across keyboard)
// Hackers know people love these patterns!
export function detectKeyboardPattern(password: string): boolean {
  // Each keyboard row, written forwards AND backwards
  const keyboardRows = [
    ['qwertyuiop', 'poiuytrewq'],  // top row
    ['asdfghjkl', 'lkjhgfdsa'],    // home row
    ['zxcvbnm', 'mnbvcxz'],        // bottom row
    ['1234567890', '0987654321'],  // number row
  ];
  
  const lowercasePassword = password.toLowerCase();
  
  // Check each keyboard row
  for (const [forward, backward] of keyboardRows) {
    // Check the forward direction (like "qwe")
    for (let i = 0; i <= forward.length - 3; i++) {
      const pattern = forward.substring(i, i + 3);
      if (lowercasePassword.includes(pattern)) return true;
    }
    
    // Check the backward direction (like "ewq")
    for (let i = 0; i <= backward.length - 3; i++) {
      const pattern = backward.substring(i, i + 3);
      if (lowercasePassword.includes(pattern)) return true;
    }
  }
  
  return false;
}

// === DICTIONARY WORD DETECTOR ===
// Checks if password contains common words that hackers try first
// These are taken from real lists that hackers use!
export function detectDictionaryWords(password: string): boolean {
  // Most common passwords found in data breaches
  const commonWords = [
    'password', 'admin', 'user', 'login', 'welcome',
    'monkey', 'dragon', 'master', 'shadow', 'sunshine',
    'princess', 'football', 'baseball', 'superman', 'batman',
    'trustno1', 'letmein', 'welcome', 'whatever', 'secret',
  ];
  
  const lowercasePassword = password.toLowerCase();
  
  // Check if ANY of these common words appear in the password
  // The .some() method returns true if at least one word is found
  return commonWords.some(word => lowercasePassword.includes(word));
}

// === N-GRAM ANALYSIS ===
// An "n-gram" is just a fancy word for "chunks of characters"
// We check if your password uses character chunks that appear a LOT in leaked passwords
// Lower score = more unique password!
export function calculateNgramLikelihood(password: string): number {
  // These are the most common 2-character and 3-character chunks from REAL leaked passwords
  // If your password has these, it means hackers have seen similar patterns before
  const common2CharChunks = ['12', '23', '34', '45', '56', '67', '78', '89', '90', 'ab', 'bc', 'cd', 'de', 'er', 'es', 'st', 'th', 'an', 'in', 'on'];
  const common3CharChunks = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'the', 'and', 'ing', 'ion', 'ass', 'ord'];
  
  const lowercasePassword = password.toLowerCase();
  let matchesFound = 0;  // How many common chunks did we find?
  let totalChunksChecked = 0;  // How many chunks did we look at total?
  
  // STEP 1: Check all 2-character chunks
  // Example: "hello" has chunks "he", "el", "ll", "lo"
  for (let position = 0; position < lowercasePassword.length - 1; position++) {
    totalChunksChecked++;
    const twoCharChunk = lowercasePassword.substring(position, position + 2);
    
    // If this chunk is in our common list, count it as a match
    if (common2CharChunks.includes(twoCharChunk)) {
      matchesFound++;
    }
  }
  
  // STEP 2: Check all 3-character chunks (these matter MORE, so we add 1.5 instead of 1)
  // Example: "hello" has chunks "hel", "ell", "llo"
  for (let position = 0; position < lowercasePassword.length - 2; position++) {
    totalChunksChecked++;
    const threeCharChunk = lowercasePassword.substring(position, position + 3);
    
    // 3-character chunks are weighted more heavily (worth 1.5 points)
    if (common3CharChunks.includes(threeCharChunk)) {
      matchesFound += 1.5;
    }
  }
  
  // If password is too short to check, return 0
  if (totalChunksChecked === 0) return 0;
  
  // Calculate percentage: how many chunks matched vs total chunks checked?
  // Higher percentage = more predictable = BAD
  // We cap it at 100% maximum
  const percentageMatch = (matchesFound / totalChunksChecked) * 100;
  return Math.min(100, percentageMatch);
}

// === ENTROPY GROWTH CALCULATOR ===
// This shows how entropy (randomness) grows as you add each character
// We use this to create a cool graph showing your password getting stronger!
export function calculateEntropyPerCharacter(password: string): { character: number; entropy: number }[] {
  const growthData: { character: number; entropy: number }[] = [];
  
  // For each position in the password...
  // Example: if password is "hello", we check "h", "he", "hel", "hell", "hello"
  for (let position = 1; position <= password.length; position++) {
    // Get the password up to this position
    const partialPassword = password.substring(0, position);
    
    // Calculate entropy for this partial password
    const entropyAtThisPoint = calculateEntropy(partialPassword);
    
    // Save it so we can graph it later!
    growthData.push({ 
      character: position, 
      entropy: entropyAtThisPoint 
    });
  }
  
  return growthData;
}

// === HASH STRENGTH CALCULATOR ===
// When websites store passwords, they "hash" them (scramble them up)
// This calculates how long it would take a hacker to crack your password
// with different hashing methods. Longer = better!
export function calculateHashStrength(password: string, entropy: number) {
  // STEP 1: Figure out the "character space" (how many possible characters could be in each position)
  let characterPoolSize = 0;
  
  // If password has lowercase letters (a-z), add 26 possibilities
  if (/[a-z]/.test(password)) characterPoolSize += 26;
  
  // If password has uppercase letters (A-Z), add 26 more possibilities
  if (/[A-Z]/.test(password)) characterPoolSize += 26;
  
  // If password has numbers (0-9), add 10 possibilities
  if (/[0-9]/.test(password)) characterPoolSize += 10;
  
  // If password has symbols (!@#$%...), add 32 possibilities
  if (/[^A-Za-z0-9]/.test(password)) characterPoolSize += 32;
  
  // STEP 2: Calculate total possible combinations
  // Example: 4-digit PIN with numbers (0-9) = 10^4 = 10,000 combinations
  const totalCombinations = Math.pow(characterPoolSize, password.length);
  
  // STEP 3: Define hashing algorithm speeds (how many guesses per second)
  // These are realistic speeds on modern hacking hardware
  
  // Bcrypt: Designed to be SLOW (that's good for security!)
  const bcryptSpeed = 1000; // 1,000 password attempts per second
  
  // SHA-256: Very FAST (bad for password storage!)
  const sha256Speed = 1000000000; // 1 BILLION attempts per second!
  
  // Argon2: Even SLOWER than bcrypt (best for passwords!)
  const argon2Speed = 500; // 500 attempts per second
  
  // Helper function: Convert seconds into human-readable time
  // Examples: 90 seconds → "2 minutes", 7200 seconds → "2 hours"
  const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 60) return `${Math.round(totalSeconds)} seconds`;
    if (totalSeconds < 3600) return `${Math.round(totalSeconds / 60)} minutes`;
    if (totalSeconds < 86400) return `${Math.round(totalSeconds / 3600)} hours`;
    if (totalSeconds < 31536000) return `${Math.round(totalSeconds / 86400)} days`;
    if (totalSeconds < 3153600000) return `${Math.round(totalSeconds / 31536000)} years`;
    return `${(totalSeconds / 31536000).toExponential(2)} years`;
  };
  
  // Helper function: Format big numbers into readable format
  // Examples: 1,000,000,000 → "1.0B/sec", 5,000 → "5.0K/sec"
  const formatGuesses = (guessesPerSecond: number): string => {
    if (guessesPerSecond >= 1000000000) return `${(guessesPerSecond / 1000000000).toFixed(1)}B/sec`;
    if (guessesPerSecond >= 1000000) return `${(guessesPerSecond / 1000000).toFixed(1)}M/sec`;
    if (guessesPerSecond >= 1000) return `${(guessesPerSecond / 1000).toFixed(1)}K/sec`;
    return `${guessesPerSecond}/sec`;
  };
  
  // STEP 4: Calculate crack time for each algorithm
  // We divide by 2 because on average, hackers find the password halfway through all possibilities
  return {
    bcrypt: {
      time: formatTime(totalCombinations / (bcryptSpeed * 2)),
      guessesPerSecond: formatGuesses(bcryptSpeed),
    },
    sha256: {
      time: formatTime(totalCombinations / (sha256Speed * 2)),
      guessesPerSecond: formatGuesses(sha256Speed),
    },
    argon2: {
      time: formatTime(totalCombinations / (argon2Speed * 2)),
      guessesPerSecond: formatGuesses(argon2Speed),
    },
  };
}

// === CHARACTER DISTRIBUTION CALCULATOR ===
// Counts how many of each type of character you have
// Good passwords have a MIX of all types!
export function getCharDistribution(password: string) {
  // Start with everything at zero
  const counts = {
    uppercase: 0,  // A, B, C, D...
    lowercase: 0,  // a, b, c, d...
    numbers: 0,    // 0, 1, 2, 3...
    symbols: 0,    // !, @, #, $...
  };
  
  // Look at each character and count what type it is
  for (const character of password) {
    if (/[A-Z]/.test(character)) {
      // It's an uppercase letter
      counts.uppercase++;
    } else if (/[a-z]/.test(character)) {
      // It's a lowercase letter
      counts.lowercase++;
    } else if (/[0-9]/.test(character)) {
      // It's a number
      counts.numbers++;
    } else {
      // It's a symbol (anything else)
      counts.symbols++;
    }
  }
  
  return counts;
}

// === FEEDBACK GENERATOR ===
// Creates a list of helpful suggestions to make your password better
// Think of it as a password coach giving you tips!
export function generateFeedback(analysis: Partial<PasswordAnalysis>): string[] {
  const suggestions: string[] = [];
  
  // Check password length
  if (!analysis.length || analysis.length < 8) {
    suggestions.push('Use at least 8 characters');
  }
  
  // Check for missing character types
  if (!analysis.hasUppercase) {
    suggestions.push('Add uppercase letters (A-Z)');
  }
  if (!analysis.hasLowercase) {
    suggestions.push('Add lowercase letters (a-z)');
  }
  if (!analysis.hasNumbers) {
    suggestions.push('Add numbers (0-9)');
  }
  if (!analysis.hasSymbols) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }
  
  // Check for bad patterns
  if (analysis.hasRepeatedChars) {
    suggestions.push('Avoid repeated characters (e.g., aaa, 111)');
  }
  if (analysis.hasSequentialChars) {
    suggestions.push('Avoid sequential characters (e.g., abc, 123)');
  }
  if (analysis.hasKeyboardPattern) {
    suggestions.push('Avoid keyboard patterns (e.g., qwerty, asdf)');
  }
  if (analysis.hasDictionaryWords) {
    suggestions.push('Avoid common dictionary words');
  }
  
  // Check entropy (randomness score)
  if (analysis.entropy && analysis.entropy < 30) {
    suggestions.push('Increase complexity with varied characters');
  }
  
  // If there are no suggestions, the password is great!
  if (suggestions.length === 0) {
    suggestions.push('Excellent! Your password is strong and secure.');
  }
  
  return suggestions;
}

// === MAIN PASSWORD ANALYZER ===
// This is the BIG function that brings everything together!
// It runs ALL the checks and creates a complete report
export function analyzePassword(password: string): PasswordAnalysis {
  // If password is empty, return default "empty" analysis
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
  
  // STEP 1: Run the zxcvbn library (professional password checker)
  const zxcvbnResult = zxcvbn(password);
  
  // STEP 2: Calculate our custom metrics
  const entropy = calculateEntropy(password);
  const charDistribution = getCharDistribution(password);
  
  // STEP 3: Check what types of characters the password has
  const hasUppercase = /[A-Z]/.test(password);      // Does it have A, B, C...?
  const hasLowercase = /[a-z]/.test(password);      // Does it have a, b, c...?
  const hasNumbers = /[0-9]/.test(password);        // Does it have 0, 1, 2...?
  const hasSymbols = /[^A-Za-z0-9]/.test(password); // Does it have !, @, #...?
  
  // STEP 4: Check for bad patterns
  const hasRepeatedChars = hasRepeatedCharacters(password);           // aaa, 111?
  const hasSequentialChars = hasSequentialCharacters(password);       // abc, 123?
  const hasKeyboardPatternDetected = detectKeyboardPattern(password); // qwerty?
  const hasDictionaryWordsDetected = detectDictionaryWords(password); // password?
  
  // STEP 5: Run advanced analysis
  const ngramLikelihood = calculateNgramLikelihood(password);         // How predictable?
  const entropyPerCharacter = calculateEntropyPerCharacter(password); // Growth chart data
  const hashStrength = calculateHashStrength(password, entropy);      // Brute-force time
  
  // STEP 6: Calculate final score (0-4, where 4 is best)
  // We start with the zxcvbn score and adjust it based on our tests
  let finalScore: number = zxcvbnResult.score;
  
  // SUBTRACT points for serious problems (these are really bad!)
  if (hasDictionaryWordsDetected) {
    finalScore = Math.max(0, finalScore - 1.5);  // Common words = very bad
  }
  if (hasKeyboardPatternDetected) {
    finalScore = Math.max(0, finalScore - 1.2);  // Keyboard patterns = bad
  }
  if (ngramLikelihood > 50) {
    finalScore = Math.max(0, finalScore - 1);    // Too predictable = bad
  }
  
  // SUBTRACT points for medium problems
  if (hasSequentialChars) {
    finalScore = Math.max(0, finalScore - 0.8);  // Sequences like abc = not good
  }
  if (hasRepeatedChars) {
    finalScore = Math.max(0, finalScore - 0.7);  // Repeated chars like aaa = not good
  }
  
  // SUBTRACT points for being too short
  if (password.length < 8) {
    finalScore = Math.max(0, finalScore - 0.5);  // Too short = not good
  }
  
  // ADD BONUS points for good things!
  if (password.length >= 16) {
    finalScore = Math.min(4, finalScore + 1);    // Long passwords = bonus!
  }
  if (entropy > 60) {
    finalScore = Math.min(4, finalScore + 1);    // High entropy = bonus!
  }
  if (hasUppercase && hasLowercase && hasNumbers && hasSymbols) {
    finalScore = Math.min(4, finalScore + 1);    // All character types = bonus!
  }
  if (ngramLikelihood < 20) {
    finalScore = Math.min(4, finalScore + 0.5);  // Unique patterns = bonus!
  }
  
  // STEP 7: Convert numerical score (0-4) to a strength label
  // This map tells us what label to use for each score
  const strengthLabels: { [key: number]: PasswordAnalysis['strength'] } = {
    0: 'very-weak',   // Score 0 = very weak password
    1: 'weak',        // Score 1 = weak password
    2: 'fair',        // Score 2 = okay password
    3: 'strong',      // Score 3 = strong password
    4: 'very-strong', // Score 4 = excellent password!
  };
  
  // STEP 8: Build the final analysis report with all our findings
  const roundedScore = Math.round(finalScore) as 0 | 1 | 2 | 3 | 4;
  
  const completeAnalysis: PasswordAnalysis = {
    // Overall score and strength
    score: roundedScore,
    strength: strengthLabels[roundedScore],
    
    // Basic measurements
    entropy,
    length: password.length,
    
    // Character type checks
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    
    // Pattern detection results
    hasRepeatedChars,
    hasSequentialChars,
    hasKeyboardPattern: hasKeyboardPatternDetected,
    hasDictionaryWords: hasDictionaryWordsDetected,
    
    // Detailed breakdowns
    charDistribution,
    feedback: [], // We'll fill this in next!
    
    // Time estimates from zxcvbn
    crackTime: String(zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second),
    
    // Advanced analysis
    ngramLikelihood,
    hashStrength,
    entropyPerCharacter,
  };
  
  // STEP 9: Generate helpful feedback based on all the checks
  completeAnalysis.feedback = generateFeedback(completeAnalysis);
  
  // STEP 10: Return the complete analysis!
  return completeAnalysis;
}
