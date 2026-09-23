export type LanguageCode = 'as' | 'mni' | 'brx' | 'kha' | 'lus' | 'trp' | 'ne' | 'bn' | 'hi' | 'en';

export type LocalizedText = { [key in LanguageCode]?: string } | string;

export function getLocalizedText(val?: LocalizedText, lang: LanguageCode = 'en'): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || val.as || Object.values(val)[0] || '';
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'as', label: 'Assamese', nativeLabel: 'অসমীয়া', flag: '🌿' },
  { code: 'mni', label: 'Manipuri', nativeLabel: 'মৈতৈলোন্', flag: '🌸' },
  { code: 'brx', label: 'Bodo', nativeLabel: 'बड़ो', flag: '🌾' },
  { code: 'kha', label: 'Khasi', nativeLabel: 'কা ক্তিয়েন খাসি', flag: '🌲' },
  { code: 'lus', label: 'Mizo', nativeLabel: 'মিজো ṭawng', flag: '🌄' },
  { code: 'trp', label: 'Kokborok', nativeLabel: 'ককবরক', flag: '🎋' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', flag: '🏔️' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🍃' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🪔' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🌐' },
];

export type GameType =
  | 'card_match'
  | 'rhythm_recall'
  | 'routine_sort'
  | 'spot_difference'
  | 'pattern_completion'
  | 'word_association'
  | 'clock_drawing'
  | 'olfactory_recall';

export interface PatientContext {
  timeSinceLastSession: number; // in hours
  fatigueScore: number;         // 0.0 to 1.0
  recentTrend: 'improving' | 'stable' | 'declining';
}

export interface GameMetrics {
  accuracy: number; // 0.0 - 1.0
  avgResponseTimeMs: number;
  totalAttempts: number;
  correctAttempts: number;
  hintsUsed: number;
  pauses: number;
  touchPrecision: number; // 0.0 - 1.0
}

export interface CognitiveDomainScores {
  memory: number; // 0 - 100
  attention: number;
  executive: number;
  visuospatial: number;
  language: number;
}

export interface GameSession {
  id: string;
  patientId: string;
  gameType: GameType;
  difficultyLevel: number; // 1 to 5
  timestamp: string;
  durationSeconds: number;
  metrics: GameMetrics;
  domainScores: CognitiveDomainScores;
  flowZoneAchieved: boolean;
  adaptedDifficultyNext: number;
  synced: boolean;
  // Voice biomarker data — populated only for word_association game sessions
  speechBiomarkers?: {
    pauseCount: number;
    hesitationScore: number;   // 0-100 (higher = more hesitation = clinical concern)
    responseLatencyMs: number; // time to first recognizable utterance
    speechRateEstimate: number; // syllables per second
  };
  // Digital Clock Drawing Test metrics
  clockDrawingMetrics?: {
    rouleauScore: number;         // 1 to 5 (Rouleau clinical standard)
    contourScore: number;         // 0 to 100
    numbersScore: number;         // 0 to 100
    handsScore: number;           // 0 to 100
    hemispatialNeglectDetected: boolean;
    aspectRatioVariance: number;
    handAngleDeltaDeg: number;
    clinicalStaging: string;
  };
  // Olfactory Aroma Recall metrics
  olfactoryMetrics?: {
    hriScore: number;             // 0 to 100 (Hyposmia Recognition Index)
    scentsIdentified: number;     // 0 to 5
    preSymptomaticRisk: 'normal' | 'low_risk' | 'sensory_mci_risk';
  };
}

export interface PatientProfile {
  id: string;
  name: string;
  localizedName?: { [key in LanguageCode]?: string };
  age: number;
  gender: 'M' | 'F' | 'Other';
  state: 'Assam' | 'Manipur' | 'Meghalaya' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Arunachal Pradesh' | 'Sikkim';
  district: string;
  village: string;
  preferredLanguage: LanguageCode;
  dementiaStage: 'mild' | 'moderate' | 'early_onset' | 'mci';
  compositeCognitiveScore: number; // 0 - 100
  streakDays: number;
  caregiverName: string;
  localizedCaregiverName?: { [key in LanguageCode]?: string };
  caregiverPhone: string;
  ashaWorkerName: string;
  localizedAshaWorkerName?: { [key in LanguageCode]?: string };
  ashaWorkerPhone: string;
  emergencyContact: string;
  photoUrl: string;
  abhaId?: string; // 14-digit Ayushman Bharat Health Account (e.g. 14-8832-1920-4411)
  domainScores?: CognitiveDomainScores;
}

export interface ReminderItem {
  id: string;
  type: 'medicine' | 'hydration' | 'appointment' | 'activity' | 'family_call' | 'meal';
  title: LocalizedText;
  time: string;
  dosage?: LocalizedText;
  spokenPrompt: { [key in LanguageCode]?: string };
  completed: boolean;
  repeat: string;
}

export type ThemeMode =
  | 'pastel'
  | 'heritage'
  | 'midnight'
  | 'forest'
  | 'sunset'
  | 'lavender'
  | 'high_contrast';

export interface FamilyMemoryPhoto {
  id: string;
  photoUrl: string; // Base64 or local asset
  personName: string;
  relationship: string; // e.g. "Granddaughter", "Son", "Spouse", "Friend"
  yearOrOccasion?: string;
  notes?: string;
  audioVoiceNoteUrl?: string; // Base64 audio recorded by caregiver (e.g. "Grandmother, it's Ananya!")
  audioDurationSeconds?: number;
  createdAt: string;
}

export interface MemoryGardenState {
  flowersGrown: number;     // incremented when cognitive game completed
  flowersBloomed: number;   // incremented when reminder taken
  plantsUnlocked: string[]; // regional unlocked plants: kopou_orchid, brahmaputra_lotus, assam_tea, marigold
  waterCountToday: number;  // daily water actions
  lastUpdated: string;
}

export interface DailyRoutineItem {
  id: string;
  timeSlot: 'morning' | 'breakfast' | 'exercise' | 'game' | 'rest' | 'evening';
  title: LocalizedText;
  icon: string;
  defaultTime: string;
  completed: boolean;
}

export interface AshaObservation {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  cognitiveCheckScore: number;
  sleepQuality: 'good' | 'restless' | 'insomnia';
  appetite: 'normal' | 'low' | 'poor';
  moodAgitation: 'calm' | 'mild_confusion' | 'agitated';
  notes: string;
  synced: boolean;
  abhaId?: string;
  teleconsultStatus?: 'none' | 'referred' | 'completed';
}

export interface TeleconsultReferral {
  id: string;
  token: string;
  patientId: string;
  patientName: string;
  abhaId: string;
  age: number;
  gender: string;
  village: string;
  district: string;
  screeningScore: number;
  hesitationIndex?: number;
  referredFacility: string;
  priority: 'routine' | 'urgent' | 'tele_psychiatry';
  referralDate: string;
  status: 'queued' | 'acknowledged' | 'completed';
  ashaWorker: string;
  clinicalNotes: string;
}

export interface DistrictEpidemiology {
  id: string;
  district: string;
  state: string;
  totalScreened: number;
  mciRiskPercent: number;
  averageCcs: number;
  predominantLanguage: string;
  alertLevel: 'low' | 'moderate' | 'high';
  activeAshas: number;
}

export interface AlertNotification {
  id: string;
  type: 'rapid_decline' | 'missed_meds' | 'sundowning_agitation' | 'missed_sessions' | 'improvement';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}
