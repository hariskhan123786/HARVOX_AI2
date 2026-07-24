/**
 * HARVOX AI - Language Detection Utility
 * Automatically detects language from text for voice selection
 */

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS = {
  // Devanagari script (Hindi)
  hindi: /[\u0900-\u097F]/,
  
  // Arabic/Persian script (Urdu)
  urdu: /[\u0600-\u06FF]/,
  
  // Latin script (English)
  english: /[a-zA-Z]/,
  
  // Common Hindi words
  hindiWords: /(नमस्ते|कैसे|हैं|आप|मैं|है|हूं|क्या|कर|सकते|की|को|में|से|और|या|के|ने|पर|यह|वह|था|थी|गया|गई|था)/gi,
  
  // Common Urdu words
  urduWords: /(السلام|علیکم|کیسے|ہیں|آپ|میں|ہے|ہوں|کیا|کر|سکتے|کی|کو|سے|اور|یا|کے|نے|پر|یہ|وہ|تھا|تھی|گیا|گئی)/gi,
  
  // Common English words
  englishWords: /\b(the|is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|may|might|must|shall|to|of|in|for|on|with|at|by|from|about|as|into|through|during|before|after|above|below|between|under|over|again|further|then|once)\b/gi
};

/**
 * Language codes
 */
export const LANGUAGE_CODES = {
  HINDI: 'hi-IN',
  URDU: 'ur-PK',
  ENGLISH: 'en-US',
  HINGLISH: 'hi-IN', // Mixed Hindi-English, default to Hindi
  URDU_ENGLISH: 'ur-PK' // Mixed Urdu-English, default to Urdu
};

/**
 * Detect language from text
 * Returns language code and confidence score
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return { language: LANGUAGE_CODES.ENGLISH, confidence: 0, detected: 'english' };
  }

  const cleanText = text.trim();
  const length = cleanText.length;

  if (length === 0) {
    return { language: LANGUAGE_CODES.ENGLISH, confidence: 0, detected: 'english' };
  }

  // Count characters by script
  const hindiChars = (cleanText.match(LANGUAGE_PATTERNS.hindi) || []).length;
  const urduChars = (cleanText.match(LANGUAGE_PATTERNS.urdu) || []).length;
  const englishChars = (cleanText.match(LANGUAGE_PATTERNS.english) || []).length;

  // Count words
  const hindiWords = (cleanText.match(LANGUAGE_PATTERNS.hindiWords) || []).length;
  const urduWords = (cleanText.match(LANGUAGE_PATTERNS.urduWords) || []).length;
  const englishWords = (cleanText.match(LANGUAGE_PATTERNS.englishWords) || []).length;

  // Calculate scores (weighted: scripts 70%, words 30%)
  const hindiScore = (hindiChars * 0.7) + (hindiWords * 3 * 0.3);
  const urduScore = (urduChars * 0.7) + (urduWords * 3 * 0.3);
  const englishScore = (englishChars * 0.7) + (englishWords * 3 * 0.3);

  const totalScore = hindiScore + urduScore + englishScore;

  // Determine primary language
  let language = LANGUAGE_CODES.ENGLISH;
  let detected = 'english';
  let confidence = 0;

  if (totalScore === 0) {
    // No detectable language patterns, default to English
    return { language: LANGUAGE_CODES.ENGLISH, confidence: 0.5, detected: 'english' };
  }

  if (hindiScore > urduScore && hindiScore > englishScore) {
    language = LANGUAGE_CODES.HINDI;
    detected = 'hindi';
    confidence = hindiScore / totalScore;
  } else if (urduScore > hindiScore && urduScore > englishScore) {
    language = LANGUAGE_CODES.URDU;
    detected = 'urdu';
    confidence = urduScore / totalScore;
  } else {
    language = LANGUAGE_CODES.ENGLISH;
    detected = 'english';
    confidence = englishScore / totalScore;
  }

  // Check for mixed language (Hinglish/Urdu-English)
  const isMixed = (hindiScore > 0 && englishScore > 0) || (urduScore > 0 && englishScore > 0);

  if (isMixed) {
    const mixedType = hindiScore > urduScore ? 'hinglish' : 'urdu-english';
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[LanguageDetector] Mixed language detected:', {
        type: mixedType,
        hindi: hindiScore,
        urdu: urduScore,
        english: englishScore
      });
    }

    // For mixed language, prefer the non-English component
    if (hindiScore > englishScore * 0.3) {
      language = LANGUAGE_CODES.HINGLISH;
      detected = 'hinglish';
    } else if (urduScore > englishScore * 0.3) {
      language = LANGUAGE_CODES.URDU_ENGLISH;
      detected = 'urdu-english';
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[LanguageDetector] Detection result:', {
      text: cleanText.slice(0, 50) + '...',
      language,
      detected,
      confidence: confidence.toFixed(2),
      scores: {
        hindi: hindiScore.toFixed(1),
        urdu: urduScore.toFixed(1),
        english: englishScore.toFixed(1)
      }
    });
  }

  return { language, confidence, detected, isMixed };
}

/**
 * Detect language and select appropriate voice
 * Returns { language, gender, voiceId }
 */
export function detectLanguageAndSelectVoice(text, defaultGender = 'female', userPreference = null) {
  // If user has set a preference, use it
  if (userPreference && userPreference.autoDetect === false) {
    return {
      language: userPreference.language || LANGUAGE_CODES.HINDI,
      gender: userPreference.gender || defaultGender,
      voiceId: userPreference.voiceId || null
    };
  }

  // Auto-detect language
  const detection = detectLanguage(text);

  return {
    language: detection.language,
    gender: defaultGender,
    voiceId: null, // Let provider auto-select based on language/gender
    detected: detection.detected,
    confidence: detection.confidence,
    isMixed: detection.isMixed
  };
}

/**
 * Check if text is primarily English
 */
export function isEnglish(text) {
  const detection = detectLanguage(text);
  return detection.detected === 'english' && detection.confidence > 0.6;
}

/**
 * Check if text is primarily Hindi
 */
export function isHindi(text) {
  const detection = detectLanguage(text);
  return (detection.detected === 'hindi' || detection.detected === 'hinglish') && detection.confidence > 0.4;
}

/**
 * Check if text is primarily Urdu
 */
export function isUrdu(text) {
  const detection = detectLanguage(text);
  return (detection.detected === 'urdu' || detection.detected === 'urdu-english') && detection.confidence > 0.4;
}

/**
 * Get language display name
 */
export function getLanguageName(languageCode) {
  const names = {
    'hi-IN': 'Hindi',
    'ur-PK': 'Urdu',
    'en-US': 'English'
  };
  return names[languageCode] || 'English';
}

export default {
  detectLanguage,
  detectLanguageAndSelectVoice,
  isEnglish,
  isHindi,
  isUrdu,
  getLanguageName,
  LANGUAGE_CODES
};
