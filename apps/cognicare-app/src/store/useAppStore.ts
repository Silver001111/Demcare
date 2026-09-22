import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  LanguageCode, 
  PatientProfile, 
  GameSession, 
  ReminderItem, 
  AshaObservation, 
  AlertNotification, 
  CognitiveDomainScores,
  ThemeMode,
  FamilyMemoryPhoto,
  MemoryGardenState,
  DailyRoutineItem,
} from '../types';
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
  domainScores: {
    memory: 74,
    attention: 78,
    executive: 70,
    visuospatial: 75,
    language: 82,
  },
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
  {
    id: 'rem_4',
    type: 'appointment',
    title: {
      en: 'Dr. Sarma Neuro-Cognitive Review',
      as: 'ডাঃ শৰ্মাৰ লগত পৰামৰ্শ (তেজপুৰ)',
      hi: 'डॉ. शर्मा न्यूरोलॉजिस्ट परामर्श',
      bn: 'ডাঃ শর্মার সাথে স্বাস্থ্য পরীক্ষা',
      mni: 'দোক্তরগা উনবা মতম',
      brx: 'डाक्टरनि थावनि',
      kha: 'Ka jingshait bad u Doctor',
      lus: 'Doctor inentir hun',
      trp: 'Doctor no nuhna',
      ne: 'डाक्टरसँग परामर्श',
    },
    time: '11:00 AM',
    dosage: {
      en: 'Tezpur Memory Clinic • Room 14 (With Daughter Moushumi)',
      as: 'তেজপুৰ কেন্দ্ৰীয় হাস্পতাল • ১৪ নং কোঠা',
      hi: 'तेजपुर स्मृति क्लिनिक • कमरा 14',
      bn: 'তেজপুর স্মৃতি ক্লিনিক • রুম ১৪',
      mni: 'তেজপুর মেমোরী ক্লিনিক',
      brx: 'तेजपुर क्लिनिक',
      kha: 'Tezpur Clinic',
      lus: 'Tezpur Damdawi In',
      trp: 'Tezpur Hospital',
      ne: 'तेजपुर मेमोरी क्लिनिक',
    },
    spokenPrompt: {
      en: 'Reminder: Doctor appointment today at 11:00 AM with Dr. Sarma.',
      as: 'মনত পেলাই দিছোঁ: আজি দিনৰ ১১ বজাত ডাঃ শৰ্মাৰ লগত আপোনাৰ পৰামৰ্শ আছে।',
      hi: 'याद दिलाएं: आज सुबह 11 बजे डॉ. शर्मा से मिलने का समय है।',
      bn: 'মনে করিয়ে দিচ্ছি: আজ বেলা ১১ টায় ডাঃ শর্মার সাথে দেখা করার সময়।',
      mni: 'ঙসি পুং ১১ দা দোক্তরগা উনবা লৈরে।',
      brx: 'दिनैनि ११ तायाव डाक्टरजों लोगो हमनांगौ दं।',
      kha: 'Kynmaw: Ka jingiakynduh bad u Doctor 11:00 AM.',
      lus: 'Vawiin chawhma dar 11 ah Doctor inentir tur a ni.',
      trp: 'Doctor bai malainani 11:00 AM.',
      ne: 'याद राख्नुहोस्: आज बिहान ११ बजे डाक्टरसँग भेट्ने समय छ।',
    },
    completed: false,
    repeat: 'Today',
  },
  {
    id: 'rem_5',
    type: 'meal',
    title: {
      en: 'Nutritious Green Lunch & Seasonal Fruits',
      as: 'পুষ্টিকৰ দুপৰীয়াৰ আহাৰ আৰু ফল-মূল',
      hi: 'पौष्टिक दोपहर का भोजन और ताजे फल',
      bn: 'পুষ্টিকর দুপুরের আহার ও ফল',
      mni: 'নুংথিলগী পুষ্টিকর চারোন',
      brx: 'सान्झानि समायना जामुं',
      kha: 'Ka ja kynthei bad soh',
      lus: 'Chhun chaw ṭha leh themtê',
      trp: 'Salni bwrwi chahmung',
      ne: 'पौष्टिक दिउँसोको खाना र ताजा फलफूल',
    },
    time: '01:00 PM',
    dosage: {
      en: 'Steamed rice, green leafy saag, lentils & fresh papaya',
      as: 'ভাত, টেঙা ঝুল, লাই শাক আৰু অমিতা',
      hi: 'चावल, हरी साग, दाल और ताज़ा पपीता',
      bn: 'ভাত, শাক, ডাল এবং পাকা পেঁপে',
      mni: 'চেং, মহিং, অমসুং উ-হৈ',
      brx: 'मैगं दै, अखां आरो जामुं',
      kha: 'Ka ja, jhur bad soh',
      lus: 'Chaw, anhnah leh theite',
      trp: 'Mairong, mosla, swkwrwi',
      ne: 'भात, हरियो साग, दाल र मेवा',
    },
    spokenPrompt: {
      en: 'Time for your healthy, wholesome midday lunch and seasonal fresh fruits.',
      as: 'দুপৰীয়াৰ পুষ্টিকৰ শাক-পাচলি আৰু ফল খোৱাৰ সময় হ’ল।',
      hi: 'दोपहर के ताजे पौष्टिक भोजन का समय हो गया है।',
      bn: 'দুপুরের স্বাস্থ্যকর পুষ্টিকর আহারের সময় হয়েছে।',
      mni: 'নুংথিলগী চারোন চাবগী মতম ওইরে।',
      brx: 'सान्झानि जामुं जानाय सम जाबाय।',
      kha: 'Ka por ban bam ja kynthei.',
      lus: 'Chhun chaw ei a hun ta.',
      trp: 'Salni chahmung chani sal paikha.',
      ne: 'दिउँसोको पौष्टिक खाना खाने समय भयो।',
    },
    completed: false,
    repeat: 'Daily',
  },
];

export const INITIAL_FAMILY_PHOTOS: FamilyMemoryPhoto[] = [
  {
    id: 'fam_1',
    photoUrl: '/images/lakhimi_baruah.jpg',
    personName: 'Ananya Baruah',
    relationship: 'Granddaughter',
    yearOrOccasion: 'School Science Fair 2024',
    notes: 'Ananya won the first prize in robotics. Lakhimi blessed her with a silk Gamosa.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fam_2',
    photoUrl: '/images/caregiver_mouchumi.jpg',
    personName: 'Moushumi Baruah',
    relationship: 'Daughter-in-law & Primary Caregiver',
    yearOrOccasion: 'Bihu Kitchen Festival',
    notes: 'Preparing fresh Pitha and Laroo together in the Tezpur courtyard.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fam_3',
    photoUrl: '/images/koka_elder.jpg',
    personName: 'Bhaben Baruah (Koka)',
    relationship: 'Beloved Late Husband',
    yearOrOccasion: 'Ancestral Home Garden, 1978',
    notes: 'Planting tea bushes and Kopou orchids together by the pond.',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_GARDEN_STATE: MemoryGardenState = {
  flowersGrown: 3,
  flowersBloomed: 2,
  plantsUnlocked: ['kopou_orchid', 'brahmaputra_lotus', 'assam_tea'],
  waterCountToday: 1,
  lastUpdated: new Date().toISOString(),
};

export const INITIAL_DAILY_ROUTINE: DailyRoutineItem[] = [
  {
    id: 'rout_1',
    timeSlot: 'morning',
    title: {
      en: 'Morning Wash & Warm Herbal Tea',
      as: 'পুৱাৰ মুখ-হাত ধোৱা আৰু গৰম চাহ',
      hi: 'सुबह का स्नान और गरम चाय',
      bn: 'সকালের হাত-মুখ ধোয়া ও চা',
    },
    icon: '🌅',
    defaultTime: '07:00 AM',
    completed: true,
  },
  {
    id: 'rout_2',
    timeSlot: 'morning',
    title: {
      en: 'Blood Pressure Medication',
      as: 'প্ৰেছাৰৰ টেবলেট খোৱা',
      hi: 'ब्लड प्रेशर की दवा लेना',
      bn: 'প্রেসারের ওষুধ খাওয়া',
    },
    icon: '💊',
    defaultTime: '08:30 AM',
    completed: true,
  },
  {
    id: 'rout_3',
    timeSlot: 'breakfast',
    title: {
      en: 'Wholesome Breakfast & Boiled Egg / Dal',
      as: 'পুষ্টিকৰ ৰাতিপুৱাৰ আহাৰ (ৰুটি/ডালি)',
      hi: 'पौष्टिक नाश्ता (दलिया/अंडा)',
      bn: 'স্বাস্থ্যকর প্রাতরাশ',
    },
    icon: '🥣',
    defaultTime: '09:00 AM',
    completed: false,
  },
  {
    id: 'rout_4',
    timeSlot: 'exercise',
    title: {
      en: 'Gentle Garden Stretches & Breathing',
      as: 'চোতালত মৃদু খোজ আৰু উশাহৰ ব্যায়াম',
      hi: 'आंगन में हल्की सैर और प्राणायाम',
      bn: 'হালকা স্ট্রেচিং ও শ্বাস-প্রশ্বাস',
    },
    icon: '🧘',
    defaultTime: '10:00 AM',
    completed: false,
  },
  {
    id: 'rout_5',
    timeSlot: 'game',
    title: {
      en: 'Daily Cognitive Workout (Memory Match)',
      as: 'দৈনিক স্মৃতি খেল (গামোচা মেচ)',
      hi: 'दैनिक मस्तिष्क खेल (मेमोरी मैच)',
      bn: 'দৈনিক ব্রেন গেম',
    },
    icon: '🧠',
    defaultTime: '11:30 AM',
    completed: false,
  },
  {
    id: 'rout_6',
    timeSlot: 'rest',
    title: {
      en: 'Nutritious Lunch & Quiet Rest',
      as: 'দুপৰীয়াৰ ভাত আৰু শান্ত বিশ্ৰাম',
      hi: 'दोपहर का भोजन और आराम',
      bn: 'দুপুরের ভাত ও বিশ্রাম',
    },
    icon: '😴',
    defaultTime: '01:30 PM',
    completed: false,
  },
  {
    id: 'rout_7',
    timeSlot: 'evening',
    title: {
      en: 'Evening Calming Music & Family Chat',
      as: 'সন্ধ্যাৰ শান্ত সংগীত আৰু পৰিয়ালৰ কথা-বতৰা',
      hi: 'शाम का शांत संगीत और परिवार से बात',
      bn: 'সন্ধ্যার শান্ত সঙ্গীত ও পরিবারের সঙ্গ',
    },
    icon: '🌙',
    defaultTime: '05:30 PM',
    completed: false,
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

  // Language & Theme Preference
  language: LanguageCode;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // Longitudinal Data
  sessions: GameSession[];
  reminders: ReminderItem[];
  observations: AshaObservation[];
  alerts: AlertNotification[];

  // Family Photo Memories
  familyPhotos: FamilyMemoryPhoto[];
  addFamilyPhoto: (photo: Omit<FamilyMemoryPhoto, 'id' | 'createdAt'>) => void;
  deleteFamilyPhoto: (id: string) => void;

  // Memory Garden Gamification
  gardenState: MemoryGardenState;
  growFlower: () => void;
  bloomFlower: () => void;
  unlockPlant: (plantKey: string) => void;
  waterGarden: () => void;

  // Daily Routine Rhythm
  dailyRoutine: DailyRoutineItem[];
  toggleDailyRoutineItem: (id: string) => void;

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
      themeMode: 'pastel',
      sessions: [],
      reminders: INITIAL_REMINDERS,
      observations: [],
      alerts: INITIAL_ALERTS,
      customBranding: INITIAL_BRANDING,
      familyPhotos: INITIAL_FAMILY_PHOTOS,
      gardenState: INITIAL_GARDEN_STATE,
      dailyRoutine: INITIAL_DAILY_ROUTINE,

      // Theme toggle
      setThemeMode: (mode) => set({ themeMode: mode }),

      // Family Photos
      addFamilyPhoto: (photo) => set((state) => ({
        familyPhotos: [
          {
            id: `fam_${Date.now()}`,
            ...photo,
            createdAt: new Date().toISOString(),
          },
          ...state.familyPhotos,
        ],
      })),

      deleteFamilyPhoto: (id) => set((state) => ({
        familyPhotos: state.familyPhotos.filter((f) => f.id !== id),
      })),

      // Memory Garden Actions
      growFlower: () => set((state) => ({
        gardenState: {
          ...state.gardenState,
          flowersGrown: state.gardenState.flowersGrown + 1,
          lastUpdated: new Date().toISOString(),
        },
      })),

      bloomFlower: () => set((state) => ({
        gardenState: {
          ...state.gardenState,
          flowersBloomed: state.gardenState.flowersBloomed + 1,
          lastUpdated: new Date().toISOString(),
        },
      })),

      unlockPlant: (plantKey) => set((state) => ({
        gardenState: {
          ...state.gardenState,
          plantsUnlocked: state.gardenState.plantsUnlocked.includes(plantKey)
            ? state.gardenState.plantsUnlocked
            : [...state.gardenState.plantsUnlocked, plantKey],
          lastUpdated: new Date().toISOString(),
        },
      })),

      waterGarden: () => set((state) => ({
        gardenState: {
          ...state.gardenState,
          waterCountToday: (state.gardenState.waterCountToday || 0) + 1,
          flowersBloomed: state.gardenState.flowersBloomed + 1,
          lastUpdated: new Date().toISOString(),
        },
      })),

      // Daily Routine Toggle
      toggleDailyRoutineItem: (id) => set((state) => {
        let justCompleted = false;
        const updated = state.dailyRoutine.map((item) => {
          if (item.id === id) {
            if (!item.completed) justCompleted = true;
            return { ...item, completed: !item.completed };
          }
          return item;
        });

        const newGardenState = justCompleted
          ? {
              ...state.gardenState,
              flowersBloomed: state.gardenState.flowersBloomed + 1,
              waterCountToday: (state.gardenState.waterCountToday || 0) + 1,
              lastUpdated: new Date().toISOString(),
            }
          : state.gardenState;

        return {
          dailyRoutine: updated,
          gardenState: newGardenState,
        };
      }),

      // Auth & Role Actions
      login: (role, patient, authUser = null) => set({ 
        isAuthenticated: true, 
        userRole: role, 
        activePatient: get().activePatient || patient || INITIAL_PATIENT,
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

      updatePatientScores: (compositeScore, domainScores) => {
        const state = get();
        if (!state.activePatient) return;

        const today = new Date().toDateString();
        const priorSession = state.sessions[1];
        const priorSessionDate = priorSession
          ? new Date(priorSession.timestamp).toDateString()
          : null;

        const isNewDay = priorSessionDate !== today;

        const updatedPatient: PatientProfile = {
          ...state.activePatient,
          compositeCognitiveScore: compositeScore,
          domainScores: domainScores || state.activePatient.domainScores,
          streakDays: isNewDay
            ? state.activePatient.streakDays + 1
            : state.activePatient.streakDays,
        };

        set({ activePatient: updatedPatient });
        savePatientProfileToCloud(updatedPatient).catch(console.warn);
      },
      
      addGameSession: (session) => {
        set((state) => ({ 
          sessions: [session, ...state.sessions],
          gardenState: {
            ...state.gardenState,
            flowersGrown: state.gardenState.flowersGrown + 1,
            lastUpdated: new Date().toISOString(),
          },
        }));
        saveSessionToCloud(session).catch(console.error);
      },
      
      addReminder: (reminder) => {
        set((state) => ({ reminders: [reminder, ...state.reminders] }));
      },
      
      toggleReminder: (id) => {
        set((state) => {
          let isNewlyCompleted = false;
          const updated = state.reminders.map((r) => {
            if (r.id === id) {
              if (!r.completed) isNewlyCompleted = true;
              return { ...r, completed: !r.completed };
            }
            return r;
          });
          return {
            reminders: updated,
            gardenState: isNewlyCompleted
              ? {
                  ...state.gardenState,
                  flowersBloomed: state.gardenState.flowersBloomed + 1,
                  lastUpdated: new Date().toISOString(),
                }
              : state.gardenState,
          };
        });
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
          themeMode: 'pastel',
          familyPhotos: INITIAL_FAMILY_PHOTOS,
          gardenState: INITIAL_GARDEN_STATE,
          dailyRoutine: INITIAL_DAILY_ROUTINE,
        });
      },
    }),
    {
      name: 'cognicare-storage',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        let state = persistedState;
        if (version < 4) {
          state = {
            ...state,
            themeMode: state?.themeMode || 'pastel',
            familyPhotos: state?.familyPhotos || INITIAL_FAMILY_PHOTOS,
            gardenState: state?.gardenState || INITIAL_GARDEN_STATE,
            dailyRoutine: state?.dailyRoutine || INITIAL_DAILY_ROUTINE,
          };
        }
        return state;
      },
      partialize: (state) => ({
        language: state.language,
        themeMode: state.themeMode,
        sessions: state.sessions,
        reminders: state.reminders,
        observations: state.observations,
        alerts: state.alerts,
        activePatient: state.activePatient,
        authUser: state.authUser,
        customBranding: state.customBranding,
        familyPhotos: state.familyPhotos,
        gardenState: state.gardenState,
        dailyRoutine: state.dailyRoutine,
      }),
    }
  )
);
