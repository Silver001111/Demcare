import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LanguageCode, PatientProfile, GameSession, ReminderItem, AshaObservation, AlertNotification, CognitiveDomainScores } from '../types';
import { 
  saveSessionToCloud, 
  saveObservationToCloud, 
  savePatientProfileToCloud, 
  syncAllToCloud 
} from '../services/cloudSync';

export const INITIAL_PATIENT: PatientProfile = {
  id: 'p_lakhimi_01',
  name: 'Lakhimi Baruah',
  localizedName: {
    en: 'Lakhimi Baruah',
    as: 'লাখিমী বৰুৱা',
    mni: 'লাখিমী বরুৱা',
    brx: 'लाखिमी बरुवा',
    kha: 'Lakhimi Baruah',
    lus: 'Lakhimi Baruah',
    trp: 'Lakhimi Baruah',
    ne: 'लखिमी बरुवा',
    bn: 'লাখিমী বরুয়া',
    hi: 'लखिमी बरुआ',
  },
  age: 72,
  gender: 'F',
  state: 'Assam',
  district: 'Sonitpur',
  village: 'Bihaguri Gaon',
  preferredLanguage: 'en',
  dementiaStage: 'mild',
  compositeCognitiveScore: 74,
  streakDays: 12,
  caregiverName: 'Moushumi Baruah',
  localizedCaregiverName: {
    en: 'Moushumi Baruah (Daughter-in-law)',
    as: 'মৌচুমী বৰুৱা (বোৱাৰী)',
    hi: 'मौसमी बरुआ (बहू)',
    bn: 'মৌসুমী বরুয়া (বৌমা)',
    mni: 'মৌসুমি বরুৱা',
    brx: 'मौसुमी बरुवा',
    kha: 'Moushumi Baruah',
    lus: 'Moushumi Baruah',
    trp: 'Moushumi Baruah',
    ne: 'मौसमी बरुवा',
  },
  caregiverPhone: '+91 94350 12345',
  ashaWorkerName: 'Purnima Gogoi',
  localizedAshaWorkerName: {
    en: 'Purnima Gogoi (ASHA Worker)',
    as: 'পূৰ্ণিমা গগৈ (আশা কৰ্মী)',
    hi: 'पूर्णिमा गोगोई (आशा कार्यकर्ता)',
    bn: 'পূর্ণিমা গগৈ (আশা কর্মী)',
    mni: 'পূর্ণিমা গগৈ',
    brx: 'पुर्णिमा गगै',
    kha: 'Purnima Gogoi',
    lus: 'Purnima Gogoi',
    trp: 'Purnima Gogoi',
    ne: 'पूर्णिमा गोगोई',
  },
  ashaWorkerPhone: '+91 98640 54321',
  emergencyContact: '+91 94350 12345',
  photoUrl: '/images/lakhimi_baruah.jpg',
  abhaId: '14-8832-1920-4411',
};

export interface CustomBranding {
  logoIcon: string;
  centreName: string;
  appTitle: string;
  regionalTheme: string;
}

export const INITIAL_BRANDING: CustomBranding = {
  logoIcon: '🧠',
  centreName: 'Bihaguri Primary Health Centre (Sonitpur)',
  appTitle: 'CogniCare NER',
  regionalTheme: 'assam',
};

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_1',
    type: 'medicine',
    title: {
      en: 'Morning Blood Pressure Medication',
      as: 'ৰাতিপুৱাৰ প্ৰেছাৰৰ টেবলেট',
      hi: 'सुबह की ब्लड प्रेशर की दवा',
      bn: 'সকালের প্রেসারের ওষুধ',
      mni: 'অয়ুক্কী বিপি হিদাক',
      brx: 'फुंनि बिपि मुलि',
      kha: 'Dawai Blood Pressure Step',
      lus: 'Zinglam Thisen Sâng Damdawi',
      trp: 'Phungni BP Sam',
      ne: 'बिहानको रक्तचापको औषधि',
    },
    time: '08:30 AM',
    dosage: {
      en: '1 tablet (Amlodipine 5mg)',
      as: '১ টা টেবলেট (এমলোডিপিন ৫ মি.গ্ৰা.)',
      hi: '1 गोली (एम्लोडिपिन 5 मि.ग्रा.)',
      bn: '১টি ট্যাবলেট (অ্যামলোডিপিন ৫ মিগ্রা)',
      mni: 'হিদাক ১ ফং',
      brx: 'मुलि १ था',
      kha: '1 tylli ka dawai',
      lus: 'Mumpui 1',
      trp: '1 khorok sam',
      ne: '१ चक्की (एम्लोडिपिन ५ मि.ग्रा.)',
    },
    spokenPrompt: {
      en: 'It is time for your morning blood pressure tablet.',
      as: 'ৰাতিপুৱাৰ প্ৰেছাৰৰ টেবলেট খোৱাৰ সময় হ’ল।',
      hi: 'सुबह की ब्लड प्रेशर की गोली लेने का समय हो गया है।',
      bn: 'সকালের প্রেসারের ওষুধ খাওয়ার সময় হয়েছে।',
      mni: 'অয়ুক্কী বিপি হিদাক চারোইবা মতম ওইরে।',
      brx: 'फुंनि बिपि मुलि लोंनायनि समा जाबाय।',
      kha: 'Ka por ban dih dawai blood pressure step.',
      lus: 'Zinglam thisen sang damdawi ei a hun ta.',
      trp: 'Phungni BP sam nungnani sal paikha.',
      ne: 'बिहानको रक्तचापको औषधि खाने समय भयो।',
    },
    completed: true,
    repeat: 'Daily',
  },
  {
    id: 'rem_2',
    type: 'hydration',
    title: {
      en: 'Hydration Water Glass',
      as: 'পানী খোৱাৰ সময়',
      hi: 'पानी पीने का समय',
      bn: 'জল খাওয়ার সময়',
      mni: 'ঈশিং থকপগী মতম',
      brx: 'दै लोंनायनि सम',
      kha: 'Ka Por Dih Um',
      lus: 'Tui In Hun',
      trp: 'Twi nungnani sal',
      ne: 'पानी पिउने समय',
    },
    time: '11:00 AM',
    dosage: {
      en: '1 glass of warm water',
      as: '১ গিলাচ কুহুমীয়া পানী',
      hi: '1 गिलास गुनगुना पानी',
      bn: '১ গ্লাস হালকা গরম জল',
      mni: 'লুম্বা ঈশিং গ্লাস ১',
      brx: 'गोजां दै गिलाससे',
      kha: '1 khuri ka um',
      lus: 'Tui lum no 1',
      trp: '1 glass kwthwi twi',
      ne: '१ गिलास मनतातो पानी',
    },
    spokenPrompt: {
      en: 'Please drink a refreshing glass of warm water.',
      as: 'অনুগ্ৰহ কৰি এগিলাচ পানী খাওক।',
      hi: 'कृपया एक गिलास गुनगुना पानी पिएं।',
      bn: 'দয়া করে এক গ্লাস জল খান।',
      mni: 'চানবীদুনা ঈশিং গ্লাস অমা থকপীবীয়ু।',
      brx: 'अननानै गोजां दै गिलाससे लोंदो।',
      kha: 'Sngewbha dih shi khuri ka um.',
      lus: 'Khawngaihin tui lum no 1 in rawh.',
      trp: 'Anani twi glass se nungdi.',
      ne: 'कृपया एक गिलास पानी पिउनुहोस्।',
    },
    completed: false,
    repeat: 'Every 2 Hours',
  },
  {
    id: 'rem_3',
    type: 'activity',
    title: {
      en: 'Evening Refreshing Walk',
      as: 'সন্ধ্যা বেলি খোজ কঢ়া',
      hi: 'शाम की हल्की सैर',
      bn: 'বিকেলের শান্ত হাঁটা',
      mni: 'নুমিদাংগী খোঙ হাম্বা',
      brx: 'बेलासिनि हान्थिनाय',
      kha: 'Ia-ia Janmiet',
      lus: 'Tlai Lengvel',
      trp: 'Sanjani himna',
      ne: 'साँझको विश्राम हिँडाइ',
    },
    time: '04:30 PM',
    dosage: {
      en: '15 mins gentle walk in garden',
      as: '১৫ মিনিট চোতালত খোজ',
      hi: '15 मिनट आंगन में हल्की सैर',
      bn: '১৫ মিনিট বারান্দায় বা বাগানে হাঁটা',
      mni: 'মিনিট ১৫ ময়ুমদা খোঙ হাম্বা',
      brx: '१५ मिनिट बिखायाव हान्थि',
      kha: '15 minit ka jingiaid jemnud',
      lus: 'Minute 15 vel lêng harh rawh',
      trp: '15 minute nokhoro himdi',
      ne: '१५ मिनेट आँगनमा शान्त हिँडाइ',
    },
    spokenPrompt: {
      en: 'Time for your 15-minute relaxing evening walk.',
      as: 'সন্ধ্যাৰ মৃদু বতাহত অলপ খোজ কঢ়াৰ সময় হ’ল।',
      hi: 'शाम की हल्की सैर का समय हो गया है।',
      bn: 'বিকেলের শান্ত হাওয়ায় একটু হাঁটার সময় হয়েছে।',
      mni: 'নুমিদাংগী মতমদা নুংশিবা নোংলৈদা চৎপগী মতম ওইরে।',
      brx: 'बेलासेनि बार बारनानै बिखायाव लासै लासै हान्थिदो।',
      kha: 'Ka por ban leit ia-ia jemnud 15 minit.',
      lus: 'Minute 15 vel tlai lêng harh a hun ta.',
      trp: 'Sanjani 15 minute himnani sal paikha.',
      ne: 'साँझको १५ मिनेटको विश्राम हिँडाइको समय भयो।',
    },
    completed: false,
    repeat: 'Daily',
  },
];

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'alt_1',
    type: 'improvement',
    severity: 'info',
    title: 'Cognitive Progress Detected',
    message: 'Lakhimi’s working memory score increased by 6% over the last 14 days.',
    timestamp: new Date().toISOString(),
    acknowledged: false,
  },
];

interface AppState {
  // Authentication & Persona
  isAuthenticated: boolean;
  userRole: 'patient' | 'caregiver' | 'asha' | null;
  activePatient: PatientProfile | null;
  authUser: {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isGoogleAuth: boolean;
  } | null;

  // Language Preference
  language: LanguageCode;

  // Longitudinal Data
  sessions: GameSession[];
  reminders: ReminderItem[];
  observations: AshaObservation[];
  alerts: AlertNotification[];

  // Actions
  login: (
    role: 'patient' | 'caregiver' | 'asha', 
    patient?: PatientProfile, 
    authUser?: { email: string | null; displayName: string | null; photoURL: string | null; isGoogleAuth: boolean } | null
  ) => void;
  logout: () => void;
  setAuthUser: (user: { email: string | null; displayName: string | null; photoURL: string | null; isGoogleAuth: boolean } | null) => void;
  setLanguage: (lang: LanguageCode) => void;
  setActivePatient: (patient: PatientProfile) => void;
  updatePatientScores: (compositeScore: number, domainScores: CognitiveDomainScores) => void;
  addGameSession: (session: GameSession) => void;
  addReminder: (reminder: ReminderItem) => void;
  toggleReminder: (id: string) => void;
  addObservation: (obs: AshaObservation) => void;
  addAlert: (alert: AlertNotification) => void;
  acknowledgeAlert: (id: string) => void;
  syncAll: () => void;

  // Customization & Branding
  customBranding: CustomBranding;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  updateCustomBranding: (updates: Partial<CustomBranding>) => void;
  resetToRegionalDefaults: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State initial values
      isAuthenticated: false,
      userRole: null,
      activePatient: INITIAL_PATIENT,
      authUser: null,
      language: 'en',
      sessions: [],
      reminders: INITIAL_REMINDERS,
      observations: [],
      alerts: INITIAL_ALERTS,
      customBranding: INITIAL_BRANDING,

      // Actions
      login: (role, patient, authUser = null) => set({ 
        isAuthenticated: true, 
        userRole: role, 
        activePatient: patient || get().activePatient || INITIAL_PATIENT,
        authUser: authUser || null,
      }),
      
      logout: () => set({ 
        isAuthenticated: false, 
        userRole: null,
        authUser: null,
      }),

      setAuthUser: (authUser) => set({ authUser }),
      
      setLanguage: (lang) => set({ language: lang }),
      
      setActivePatient: (patient) => {
        set({ activePatient: patient });
        savePatientProfileToCloud(patient).catch(console.warn);
      },

      updatePatientScores: (compositeScore, _domainScores) => set((state) => {
        if (!state.activePatient) return state;

        const today = new Date().toDateString();
        // sessions are stored newest-first, so index 0 is the most recent
        const lastSession = state.sessions[0];
        const lastSessionDate = lastSession
          ? new Date(lastSession.timestamp).toDateString()
          : null;

        // Only increment streak if this is the first game completed on a new calendar day
        const isNewDay = lastSessionDate !== today;

        return {
          activePatient: {
            ...state.activePatient,
            compositeCognitiveScore: compositeScore,
            streakDays: isNewDay
              ? state.activePatient.streakDays + 1
              : state.activePatient.streakDays,
          }
        };
      }),
      
      addGameSession: (session) => {
        set((state) => ({ sessions: [session, ...state.sessions] }));
        saveSessionToCloud(session).catch(console.error);
      },
      
      addReminder: (reminder) => {
        set((state) => ({ reminders: [reminder, ...state.reminders] }));
      },
      
      toggleReminder: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, completed: !r.completed } : r
          ),
        }));
      },
      
      addObservation: (obs) => {
        set((state) => ({ observations: [obs, ...state.observations] }));
        saveObservationToCloud(obs).catch(console.warn);
      },
      
      addAlert: (alert) => {
        set((state) => ({ alerts: [alert, ...state.alerts] }));
      },
      
      acknowledgeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }));
      },
      
      syncAll: () => {
        const { sessions, observations } = get();
        syncAllToCloud(sessions, observations).catch(console.warn);
        set((state) => ({
          sessions: state.sessions.map((s) => ({ ...s, synced: true })),
          observations: state.observations.map((o) => ({ ...o, synced: true })),
        }));
      },

      updatePatientProfile: (updates) => {
        set((state) => {
          if (!state.activePatient) return state;
          const updated = { ...state.activePatient, ...updates };
          savePatientProfileToCloud(updated).catch(console.warn);
          return { activePatient: updated };
        });
      },

      updateCustomBranding: (updates) => {
        set((state) => ({
          customBranding: { ...state.customBranding, ...updates },
        }));
      },

      resetToRegionalDefaults: () => {
        set({
          activePatient: { ...INITIAL_PATIENT, photoUrl: '/images/lakhimi_baruah.jpg' },
          customBranding: INITIAL_BRANDING,
        });
      },
    }),
    {
      name: 'cognicare-storage',
      version: 3,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        if (version < 2) {
          state = {
            ...state,
            activePatient: INITIAL_PATIENT,
            reminders: INITIAL_REMINDERS,
          };
        }
        if (version < 3) {
          const activePatient = state?.activePatient || INITIAL_PATIENT;
          const isUnsplash = typeof activePatient.photoUrl === 'string' && activePatient.photoUrl.includes('unsplash.com');
          state = {
            ...state,
            activePatient: {
              ...activePatient,
              photoUrl: isUnsplash ? '/images/lakhimi_baruah.jpg' : (activePatient.photoUrl || '/images/lakhimi_baruah.jpg'),
            },
            customBranding: state?.customBranding || INITIAL_BRANDING,
          };
        }
        return state;
      },
      partialize: (state) => ({
        language: state.language,
        sessions: state.sessions,
        reminders: state.reminders,
        observations: state.observations,
        alerts: state.alerts,
        activePatient: state.activePatient,
        authUser: state.authUser,
        customBranding: state.customBranding,
      }),
    }
  )
);
