// Comprehensive request validation to prevent abuse and reduce costs

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

export interface TextValidationOptions {
  minLength?: number;
  maxLength?: number;
  maxWordCount?: number;
  allowedLanguages?: string[];
  blockPatterns?: RegExp[];
}

// Detect repeated/spam content
function detectRepeatedContent(text: string): boolean {
  const words = text.split(/\s+/);
  if (words.length < 10) return false;

  // Check for excessive repetition of same word
  const wordCounts = new Map<string, number>();
  let maxCount = 0;
  
  for (const word of words) {
    const normalized = word.toLowerCase().replace(/[^\w]/g, '');
    if (normalized.length < 3) continue;
    
    const count = (wordCounts.get(normalized) || 0) + 1;
    wordCounts.set(normalized, count);
    maxCount = Math.max(maxCount, count);
  }

  // If any word appears more than 30% of the time, it's likely spam
  const repetitionRatio = maxCount / words.length;
  if (repetitionRatio > 0.3) {
    return true;
  }

  // Check for repeated phrases
  const phrases = [];
  for (let i = 0; i < words.length - 2; i++) {
    phrases.push(words.slice(i, i + 3).join(' '));
  }

  const phraseCounts = new Map<string, number>();
  let maxPhraseCount = 0;
  
  for (const phrase of phrases) {
    const count = (phraseCounts.get(phrase) || 0) + 1;
    phraseCounts.set(phrase, count);
    maxPhraseCount = Math.max(maxPhraseCount, count);
  }

  // If any 3-word phrase repeats more than 5 times in short text
  if (maxPhraseCount > 5 && words.length < 500) {
    return true;
  }

  return false;
}

// Detect if text is already humanized (avoid reprocessing)
function detectAlreadyHumanized(text: string): boolean {
  // Check for patterns that indicate text was already processed
  const indicators = [
    /educational institution/i,
    /medical professional/i,
    /individuals with low income/i,
    /working position/i,
    /it has been observed that/i,
    /many people believe that/i,
    /experts claim that/i,
  ];

  let matchCount = 0;
  for (const pattern of indicators) {
    if (pattern.test(text)) {
      matchCount++;
    }
  }

  // If 3 or more indicators present, likely already processed
  return matchCount >= 3;
}

// Detect garbage/random text
function detectGarbageText(text: string): boolean {
  const words = text.trim().split(/\s+/);
  if (words.length < 5) return true;

  // Check for excessive non-alphabetic characters
  const alphaChars = text.replace(/[^a-zA-Z]/g, '').length;
  const totalChars = text.replace(/\s/g, '').length;
  
  if (totalChars > 0 && alphaChars / totalChars < 0.5) {
    return true; // Less than 50% alphabetic
  }

  // Check for random character sequences
  const randomPatterns = [
    /[a-z]{20,}/i, // Very long words
    /(.)\1{10,}/, // Same character repeated 10+ times
    /[^a-zA-Z0-9\s]{20,}/, // Long sequences of special chars
  ];

  for (const pattern of randomPatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  // Check average word length (random text has unusual patterns)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  if (avgWordLength < 2 || avgWordLength > 15) {
    return true;
  }

  return false;
}

// Detect potential code/technical content (not suitable for humanization)
function detectCodeContent(text: string): boolean {
  const codePatterns = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /import\s+\{/,
    /class\s+\w+\s*\{/,
    /<\/?\w+>/,
    /\w+\s*:\s*\w+\s*=>/,
    /def\s+\w+\(/,
    /public\s+\w+\s+\w+/,
  ];

  let codeMatches = 0;
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      codeMatches++;
    }
  }

  // If 2 or more code patterns found
  return codeMatches >= 2;
}

// Calculate text complexity score
function calculateComplexityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const lexicalDiversity = uniqueWords / words.length;

  // Score based on structure complexity
  let score = 0;
  
  // Reasonable sentence length (10-30 words is good)
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 30) score += 30;
  else if (avgWordsPerSentence >= 5) score += 15;

  // Good lexical diversity (0.4-0.8 is reasonable)
  if (lexicalDiversity >= 0.4 && lexicalDiversity <= 0.8) score += 30;
  else if (lexicalDiversity >= 0.3) score += 15;

  // Multiple paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) score += 20;

  // Reasonable length
  if (words.length >= 50 && words.length <= 5000) score += 20;

  return score;
}

export function validateTextForHumanization(
  text: string,
  options: TextValidationOptions = {}
): ValidationResult {
  // Basic checks
  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      error: 'Text is required and must be a string',
      errorCode: 'INVALID_TYPE',
    };
  }

  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return {
      valid: false,
      error: 'Text cannot be empty',
      errorCode: 'EMPTY_TEXT',
    };
  }

  // Length checks
  const minLength = options.minLength || 50;
  const maxLength = options.maxLength || 50000;

  if (trimmedText.length < minLength) {
    return {
      valid: false,
      error: `Text must be at least ${minLength} characters (currently ${trimmedText.length})`,
      errorCode: 'TEXT_TOO_SHORT',
    };
  }

  if (trimmedText.length > maxLength) {
    return {
      valid: false,
      error: `Text exceeds maximum length of ${maxLength} characters`,
      errorCode: 'TEXT_TOO_LONG',
    };
  }

  // Word count check
  const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (options.maxWordCount && wordCount > options.maxWordCount) {
    return {
      valid: false,
      error: `Text exceeds maximum word count of ${options.maxWordCount} words`,
      errorCode: 'WORD_COUNT_EXCEEDED',
    };
  }

  // Minimum word count (at least 50 words to be meaningful)
  if (wordCount < 50) {
    return {
      valid: false,
      error: 'Text must contain at least 50 words to be humanized',
      errorCode: 'INSUFFICIENT_WORDS',
    };
  }

  // Detect garbage/random text
  if (detectGarbageText(trimmedText)) {
    return {
      valid: false,
      error: 'Text appears to be random or invalid content',
      errorCode: 'INVALID_CONTENT',
    };
  }

  // Detect repeated/spam content
  if (detectRepeatedContent(trimmedText)) {
    return {
      valid: false,
      error: 'Text contains excessive repetition or spam-like content',
      errorCode: 'SPAM_DETECTED',
    };
  }

  // Detect code content
  if (detectCodeContent(trimmedText)) {
    return {
      valid: false,
      error: 'Text appears to contain code or technical content not suitable for humanization',
      errorCode: 'CODE_CONTENT_DETECTED',
    };
  }

  // Detect already humanized text
  if (detectAlreadyHumanized(trimmedText)) {
    return {
      valid: false,
      error: 'Text appears to have been already humanized. Please submit original content.',
      errorCode: 'ALREADY_PROCESSED',
    };
  }

  // Check text complexity
  const complexityScore = calculateComplexityScore(trimmedText);
  if (complexityScore < 30) {
    return {
      valid: false,
      error: 'Text quality is too low or structure is too simple for meaningful humanization',
      errorCode: 'LOW_COMPLEXITY',
    };
  }

  // Block specific patterns if provided
  if (options.blockPatterns) {
    for (const pattern of options.blockPatterns) {
      if (pattern.test(trimmedText)) {
        return {
          valid: false,
          error: 'Text contains blocked content patterns',
          errorCode: 'BLOCKED_PATTERN',
        };
      }
    }
  }

  return { valid: true };
}

// Validate request frequency to detect automated abuse
const requestHistory = new Map<string, number[]>();

export function validateRequestFrequency(
  userId: string,
  maxRequestsPerMinute = 3
): ValidationResult {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Get user's recent requests
  let timestamps = requestHistory.get(userId) || [];
  
  // Remove old timestamps
  timestamps = timestamps.filter(ts => ts > oneMinuteAgo);

  // Check if limit exceeded
  if (timestamps.length >= maxRequestsPerMinute) {
    return {
      valid: false,
      error: `Too many requests. Maximum ${maxRequestsPerMinute} requests per minute allowed.`,
      errorCode: 'RATE_LIMIT_EXCEEDED',
    };
  }

  // Add current timestamp
  timestamps.push(now);
  requestHistory.set(userId, timestamps);

  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    for (const [key, values] of requestHistory.entries()) {
      const filtered = values.filter(ts => ts > oneMinuteAgo);
      if (filtered.length === 0) {
        requestHistory.delete(key);
      } else {
        requestHistory.set(key, filtered);
      }
    }
  }

  return { valid: true };
}

// Sanitize text before processing (remove potential attack vectors)
export function sanitizeText(text: string): string {
  return text
    .trim()
    // Remove null bytes
    .replace(/\x00/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Limit consecutive newlines to 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}
