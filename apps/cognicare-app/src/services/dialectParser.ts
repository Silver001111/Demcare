/**
 * CogniCare NER — Dialect Code-Mixing Natural Language Parser
 * 
 * North East India is one of the most linguistically diverse regions in the world.
 * Elders in Assam, Meghalaya, Tripura, and Manipur routinely code-mix across
 * Assamese, Bengali, Sylheti, Bodo, Hindi, and English in a single sentence.
 * Standard MMSE/MoCA tests penalize patients as language-impaired when they substitute
 * a word from an alternate dialect. This parser preserves clinical diagnostic accuracy
 * by evaluating semantic intent rather than rigid monolingual grammar.
 */

// Multi-Dialect Synset Equivalence Matrix
export const REGIONAL_SYNSET_DICTIONARY: Record<string, string[]> = {
  WATER: ['pani', 'পানী', 'jol', 'জল', 'fani', 'দৈ', 'dui', 'paani', 'पानी', 'dwi'],
  TEA: ['chah', 'চাহ', 'cha', 'চা', 'chai', 'চা-পাত', 'chya', 'cha pat'],
  RICE_MEAL: ['bhat', 'ভাত', 'bhaat', 'mai', 'অন্ন', 'chawal', 'ongkham', 'ja'],
  GRANDMOTHER: ['aai', 'আই', 'aita', 'আইতা', 'thakuma', 'ঠাকুমা', 'dadi', 'nani', 'khunung', 'buri aai'],
  PRAYER_HOUSE: ['namghar', 'নামঘৰ', 'mondir', 'মন্দির', 'mandir', 'kirtan ghar', 'than', 'monas'],
  SUN: ['beli', 'বেলি', 'suruj', 'সূৰ্য', 'shurjo', 'সূর্য', 'suraj', 'san', 'numit'],
  FISH: ['mas', 'মাছ', 'maach', 'নাফা', 'machli', 'nga', 'nafa'],
  GARDEN_VEG: ['xaak', 'শাক', 'sobji', 'সবজি', 'sabzi', 'khar', 'torkari', 'enba'],
  BAMBOO: ['bah', 'বাঁহ', 'baash', 'বাঁশ', 'bans', 'wa'],
  GAMOSA: ['gamosa', 'গামোচা', 'gamusa', 'গামোছা', 'gamcha', 'গামছা', 'dokhona', 'lengyan'],
  HOUSE: ['ghor', 'ঘৰ', 'bari', 'বাড়ি', 'makan', 'ghar', 'yum'],
  RIVER: ['noi', 'নৈ', 'nodi', 'নদী', 'luhit', 'brahmaputra', 'gang', 'nadi'],
};

// Normalized Levenshtein distance calculation
export function levenshteinDistance(a: string, b: string): number {
  const an = a.trim().toLowerCase();
  const bn = b.trim().toLowerCase();
  const matrix: number[][] = [];

  for (let i = 0; i <= bn.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn.length; i++) {
    for (let j = 1; j <= an.length; j++) {
      if (bn.charAt(i - 1) === an.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn.length][an.length];
}

export interface DialectMatchResult {
  matched: boolean;
  confidence: number;       // 0.0 to 1.0
  isCodeMixed: boolean;     // true if non-primary regional dialect was recognized
  matchedTerm: string;
  conceptKey: string;
  dialectDetected?: string;
  clinicalNote: string;
}

/**
 * Evaluates spoken or typed utterance against target cultural synsets.
 * Returns true and full points if semantic intent is matched across any North-East dialect.
 */
export function evaluateDialectUtterance(
  utterance: string,
  targetConcept: string,
  primaryLang: string = 'as'
): DialectMatchResult {
  const cleanInput = utterance.trim().toLowerCase();
  const synset = REGIONAL_SYNSET_DICTIONARY[targetConcept.toUpperCase()];

  if (!synset || cleanInput.length === 0) {
    return {
      matched: false,
      confidence: 0,
      isCodeMixed: false,
      matchedTerm: '',
      conceptKey: targetConcept,
      clinicalNote: 'No target synset found or empty input',
    };
  }

  // 1. Direct or Substring Match in synset
  for (const term of synset) {
    const cleanTerm = term.toLowerCase();
    if (cleanInput === cleanTerm || cleanInput.includes(cleanTerm) || cleanTerm.includes(cleanInput)) {
      const isCodeMixed = !cleanTerm.includes(synset[0]); // not first canonical Assamese term
      return {
        matched: true,
        confidence: 1.0,
        isCodeMixed,
        matchedTerm: term,
        conceptKey: targetConcept,
        dialectDetected: isCodeMixed ? 'Cross-Dialect Synset (Bengali/Bodo/Hindi/Sylheti)' : 'Regional Canonical',
        clinicalNote: isCodeMixed
          ? `Polyglot dialect code-mixing recognized (${term}). Full points awarded, preserving semantic scoring accuracy.`
          : `Direct canonical dialect match (${term}).`,
      };
    }
  }

  // 2. Levenshtein Fuzzy Match (allow distance <= 2 for short words, <= 3 for longer words)
  let bestDistance = Infinity;
  let bestTerm = '';

  for (const term of synset) {
    const dist = levenshteinDistance(cleanInput, term);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestTerm = term;
    }
  }

  const threshold = Math.max(1, Math.floor(bestTerm.length * 0.35));
  if (bestDistance <= threshold) {
    const confidence = Math.max(0.7, 1 - bestDistance / Math.max(cleanInput.length, bestTerm.length));
    return {
      matched: true,
      confidence: Math.round(confidence * 100) / 100,
      isCodeMixed: true,
      matchedTerm: bestTerm,
      conceptKey: targetConcept,
      dialectDetected: 'Phonetic Phonemic Approximation',
      clinicalNote: `Phonetic synset match (${bestTerm}, delta: ${bestDistance}). Semantic intent preserved.`,
    };
  }

  return {
    matched: false,
    confidence: 0,
    isCodeMixed: false,
    matchedTerm: '',
    conceptKey: targetConcept,
    clinicalNote: 'Utterance did not match target semantic concept.',
  };
}
