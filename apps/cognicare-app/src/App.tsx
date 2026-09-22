import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ShieldCheck, Heart, Activity, LogOut, Globe, Cloud, Settings } from 'lucide-react';
import { signOutUser } from './services/cloudSync';
import { PatientHome } from './components/patient/PatientHome';
import { LandingPage } from './components/auth/LandingPage';
import { SettingsCustomizationModal } from './components/common/SettingsCustomizationModal';
import { useAppStore } from './store/useAppStore';
import { t } from './translations';

// Code-split heavy interactive games and portal modules for fast startup & lower memory usage
const GamosaCardMatch = lazy(() => import('./components/games/GamosaCardMatch').then(m => ({ default: m.GamosaCardMatch })));
const BihuRhythmRecall = lazy(() => import('./components/games/BihuRhythmRecall').then(m => ({ default: m.BihuRhythmRecall })));
const DailyRoutineSort = lazy(() => import('./components/games/DailyRoutineSort').then(m => ({ default: m.DailyRoutineSort })));
const BambooPatternCompletion = lazy(() => import('./components/games/BambooPatternCompletion').then(m => ({ default: m.BambooPatternCompletion })));
const MarketSpotDifference = lazy(() => import('./components/games/MarketSpotDifference').then(m => ({ default: m.MarketSpotDifference })));
const WordAssociationFood = lazy(() => import('./components/games/WordAssociationFood').then(m => ({ default: m.WordAssociationFood })));
const ClockDrawingTest = lazy(() => import('./components/games/ClockDrawingTest').then(m => ({ default: m.ClockDrawingTest })));
const OlfactoryRecallKit = lazy(() => import('./components/games/OlfactoryRecallKit').then(m => ({ default: m.OlfactoryRecallKit })));
const ReminiscenceAlbum = lazy(() => import('./components/patient/ReminiscenceAlbum').then(m => ({ default: m.ReminiscenceAlbum })));
const SundowningCalm = lazy(() => import('./components/patient/SundowningCalm').then(m => ({ default: m.SundowningCalm })));
const SafeHomeSOS = lazy(() => import('./components/patient/SafeHomeSOS').then(m => ({ default: m.SafeHomeSOS })));
const BlisterPackScanner = lazy(() => import('./components/patient/BlisterPackScanner').then(m => ({ default: m.BlisterPackScanner })));
const AshaScreeningPortal = lazy(() => import('./components/asha/AshaScreeningPortal').then(m => ({ default: m.AshaScreeningPortal })));
const CaregiverDashboard = lazy(() => import('./components/caregiver/CaregiverDashboard').then(m => ({ default: m.CaregiverDashboard })));

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fadeIn">
      <div className="w-12 h-12 border-4 border-ner-terracotta border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-lg font-bold font-serif text-ner-bark flex items-center gap-2">
        <span>🌿 CogniCare</span>
        <span className="text-xs bg-amber-100 text-ner-earth px-2.5 py-0.5 rounded-full font-sans font-bold">ল’ড হৈ আছে...</span>
      </div>
      <p className="text-xs text-ner-earth/70 mt-1 font-semibold">Loading module...</p>
    </div>
  );
}
import {
  PatientProfile,
  GameSession,
  GameType,
  SUPPORTED_LANGUAGES,
} from './types';

const INITIAL_PATIENTS: PatientProfile[] = [
  {
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
      ne: 'लाखिमी बरुवा',
      bn: 'লাখিমী বরুয়া',
      hi: 'लाखिमी बरुआ',
    },
    age: 72,
    gender: 'F',
    state: 'Assam',
    district: 'Sonitpur',
    village: 'Bihaguri Gaon',
    preferredLanguage: 'as',
    dementiaStage: 'mild',
    compositeCognitiveScore: 74,
    streakDays: 12,
    caregiverName: 'Mouchumi Baruah',
    localizedCaregiverName: {
      en: 'Mouchumi Baruah',
      as: 'মৌচুমী বৰুৱা',
      mni: 'মৌসুমী বরুৱা',
      brx: 'मौसम बरुवा',
      kha: 'Mouchumi Baruah',
      lus: 'Mouchumi Baruah',
      trp: 'Mouchumi Baruah',
      ne: 'मौसम बरुवा',
      bn: 'মৌসুমী বরুয়া',
      hi: 'मौसमी बरुआ',
    },
    caregiverPhone: '+91 94350 12345',
    ashaWorkerName: 'Purnima Gogoi',
    localizedAshaWorkerName: {
      en: 'Purnima Gogoi',
      as: 'পূৰ্ণিমা গগৈ',
      mni: 'পুর্ণিমা গগৈ',
      brx: 'पुर्णिमा गगै',
      kha: 'Purnima Gogoi',
      lus: 'Purnima Gogoi',
      trp: 'Purnima Gogoi',
      ne: 'पूर्णिमा गोगोई',
      bn: 'পূর্ণিমা গগৈ',
      hi: 'पूर्णिमा गोगोई',
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
  },
];

export function App() {
  const {
    isAuthenticated,
    userRole,
    authUser,
    language,
    setLanguage,
    activePatient,
    customBranding,
    sessions,
    reminders,
    alerts,
    observations,
    logout,
    addGameSession,
    addReminder,
    toggleReminder,
    acknowledgeAlert,
    addObservation,
    syncAll,
    updatePatientScores,
    themeMode,
    setThemeMode,
  } = useAppStore();

  const [activeGame, setActiveGame] = useState<'none' | GameType>('none');
  const [showReminiscence, setShowReminiscence] = useState(false);
  const [showSundowning, setShowSundowning] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showBlisterScanner, setShowBlisterScanner] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    document.body.className = `theme-${themeMode}`;
  }, [themeMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFinishGameSession = (session: GameSession) => {
    // 1. Push to persistent Zustand store + trigger Firebase cloud sync
    addGameSession(session);

    // 2. Properly weighted Composite Cognitive Score update
    if (activePatient) {
      const weightedComposite = Math.round(
        (0.25 * session.domainScores.memory) +
        (0.20 * session.domainScores.attention) +
        (0.20 * session.domainScores.executive) +
        (0.20 * session.domainScores.visuospatial) +
        (0.15 * session.domainScores.language)
      );

      // Exponential moving average: 70% previous baseline + 30% new session score
      const newComposite = Math.round(
        (activePatient.compositeCognitiveScore * 0.7) + (weightedComposite * 0.3)
      );

      updatePatientScores(newComposite, session.domainScores);
    }
  };

  const handleSyncAll = () => {
    syncAll();
    alert(language === 'as' ? 'সফলভাৱে ছিংক সম্পন্ন হ’ল!' : 'All offline records synced with cloud database!');
  };

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Determine Persona Info
  const roleName = userRole === 'patient' ? t('role_patient', language) : userRole === 'caregiver' ? t('role_caregiver', language) : t('role_asha', language);
  const RoleIcon = userRole === 'patient' ? Heart : userRole === 'caregiver' ? Activity : ShieldCheck;

  return (
    <div className="min-h-screen bg-ner-cream text-ner-bark flex flex-col justify-between font-sans">
      {/* Top Universal Persona Navigation Bar */}
      <header className="bg-white border-b-2 border-ner-earth/20 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-1.5 bg-amber-100 rounded-2xl border border-amber-300 shadow-inner">
              {customBranding?.logoIcon || '🌿'}
            </span>
            <div>
              <div className="text-lg md:text-xl font-serif font-extrabold text-ner-bark flex items-center gap-1.5">
                <span>{customBranding?.appTitle || 'CogniCare NER'}</span>
                <span className="text-xs bg-ner-terracotta text-white px-2 py-0.5 rounded-full font-sans font-bold">
                  {t('app_tagline', language)}
                </span>
              </div>
              <div className="text-[10px] text-ner-earth font-bold uppercase tracking-wider">
                {roleName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Universal Settings & Customization Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-ner-earth rounded-full border border-amber-300 transition-all text-xs font-bold shadow-sm"
              title="Settings & Profile Customization"
            >
              <Settings className="w-3.5 h-3.5 text-ner-terracotta" />
              <span className="hidden sm:inline">{t('settings_customization', language).split(' ')[0]}</span>
            </button>

            {/* Universal Language Switcher */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-ner-earth rounded-full border border-amber-300 transition-all text-xs font-bold shadow-sm"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-ner-forest" />
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeLabel || 'Language'}</span>
            </button>

            {/* Cloud Firestore Status Badge */}
            <div 
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-[11px] font-bold"
              title="Connected to Firebase Cloud Firestore (demcare-95abc)"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>demcare-95abc</span>
            </div>

            {/* Authenticated User Badge (if logged in with Google / Authorized) */}
            {authUser && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-ner-earth/30 text-xs font-bold text-ner-bark shadow-sm">
                {authUser.photoURL ? (
                  <img src={authUser.photoURL} alt="Avatar" className="w-4 h-4 rounded-full" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
                <span className="max-w-[100px] truncate">{authUser.displayName || authUser.email}</span>
                {authUser.isGoogleAuth && (
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-extrabold uppercase">Google</span>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setThemeMode(themeMode === 'pastel' ? 'heritage' : 'pastel')}
              className="px-3 py-1.5 rounded-full text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
              title="Toggle Theme (Pastel Serenity vs Cultural Heritage)"
            >
              <span>{themeMode === 'pastel' ? '🌿' : '🏛️'}</span>
              <span className="hidden sm:inline font-semibold">{themeMode === 'pastel' ? 'Pastel Serenity' : 'Heritage Theme'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-ner-sand rounded-full border border-ner-earth/30">
              <RoleIcon className="w-4 h-4 text-ner-bark" />
              <span className="text-xs font-bold text-ner-bark">{roleName}</span>
            </div>
            <button
              onClick={() => {
                logout();
                signOutUser().catch(console.warn);
                setActiveGame('none');
                setShowReminiscence(false);
                setShowSundowning(false);
                setShowSOS(false);
                setShowBlisterScanner(false);
              }}
              className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors shadow-sm"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Surface Area */}
      <main className="flex-1 py-4 md:py-6">
        <Suspense fallback={<LoadingFallback />}>
          {userRole === 'patient' && activePatient && (
          <>
            {activeGame === 'card_match' ? (
              <GamosaCardMatch
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'rhythm_recall' ? (
              <BihuRhythmRecall
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'routine_sort' ? (
              <DailyRoutineSort
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'pattern_completion' ? (
              <BambooPatternCompletion
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'spot_difference' ? (
              <MarketSpotDifference
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'word_association' ? (
              <WordAssociationFood
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'clock_drawing' ? (
              <ClockDrawingTest
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : activeGame === 'olfactory_recall' ? (
              <OlfactoryRecallKit
                patient={activePatient}
                lang={language}
                onBack={() => setActiveGame('none')}
                onFinishSession={handleFinishGameSession}
              />
            ) : showReminiscence ? (
              <ReminiscenceAlbum
                lang={language}
                onBack={() => setShowReminiscence(false)}
              />
            ) : showSundowning ? (
              <SundowningCalm
                patient={activePatient}
                lang={language}
                onBack={() => setShowSundowning(false)}
              />
            ) : showSOS ? (
              <SafeHomeSOS
                patient={activePatient}
                lang={language}
                onBack={() => setShowSOS(false)}
              />
            ) : showBlisterScanner ? (
              <BlisterPackScanner
                patient={activePatient}
                reminders={reminders}
                lang={language}
                onBack={() => setShowBlisterScanner(false)}
                onConfirmDoseTaken={(id) => {
                  toggleReminder(id);
                  setShowBlisterScanner(false);
                }}
              />
            ) : (
              <PatientHome
                patient={activePatient}
                lang={language}
                onStartGame={(g) => setActiveGame(g)}
                onOpenReminiscence={() => setShowReminiscence(true)}
                onOpenSundowning={() => setShowSundowning(true)}
                onOpenSOS={() => setShowSOS(true)}
                onOpenBlisterScanner={() => setShowBlisterScanner(true)}
                reminders={reminders}
                onToggleReminder={toggleReminder}
              />
            )}
          </>
        )}

        {userRole === 'caregiver' && activePatient && (
          <CaregiverDashboard
            patient={activePatient}
            sessions={sessions}
            reminders={reminders}
            alerts={alerts}
            onAddReminder={addReminder}
            onAcknowledgeAlert={acknowledgeAlert}
            lang={language}
          />
        )}

        {userRole === 'asha' && (
          <AshaScreeningPortal
            patients={activePatient ? [activePatient] : INITIAL_PATIENTS}
            observations={observations}
            onAddObservation={addObservation}
            onSync={handleSyncAll}
            isOnline={isOnline}
            lang={language}
          />
        )}
        </Suspense>
      </main>

      {/* Universal Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border-3 border-ner-earth p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-ner-bark text-center mb-6">
              {t('language', language)}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6 max-h-[60vh] overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLanguageModal(false);
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    language === l.code
                      ? 'bg-amber-100 border-ner-amber ring-3 ring-ner-amber/30 scale-102'
                      : 'bg-ner-cream border-ner-earth/30 hover:border-ner-earth'
                  }`}
                >
                  <span className="text-2xl mb-1">{l.flag}</span>
                  <span className="text-base font-bold text-ner-bark">{l.nativeLabel}</span>
                  <span className="text-xs font-semibold text-ner-earth">{l.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full py-3 bg-ner-sand text-ner-bark rounded-xl font-bold border border-ner-earth/20 hover:bg-amber-200 transition-colors"
            >
              {t('close', language)}
            </button>
          </div>
        </div>
      )}

      {/* Settings & Customization Modal */}
      <SettingsCustomizationModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={language}
      />

      <footer className="bg-white border-t border-ner-earth/20 py-4 text-center text-xs font-semibold text-ner-earth">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🌿 CogniCare NER (স্মৃতি-সেতু) • Smart India Hackathon 2026</span>
          <span>MDoNER & LGBRIMH Geriatric MedTech Platform</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
