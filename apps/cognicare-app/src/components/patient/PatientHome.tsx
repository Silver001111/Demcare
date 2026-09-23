import React, { useState, useEffect } from 'react';
import { Volume2, Play, Sparkles, Check, Globe, ArrowRight, Camera } from 'lucide-react';
import { audioSpeech, LOCALIZED_STRINGS } from '../../services/audioSpeech';
import { notificationService } from '../../services/notificationService';
import { LanguageCode, PatientProfile, ReminderItem, SUPPORTED_LANGUAGES, GameType, getLocalizedText } from '../../types';
import { t } from '../../translations';
import { useAppStore } from '../../store/useAppStore';
import { WhatsAppShareButton } from '../common/WhatsAppShareButton';
import { MemoryGarden } from './MemoryGarden';
import { ProactiveCompanionBar } from './ProactiveCompanionBar';
import { DailyRoutineChecklist } from './DailyRoutineChecklist';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onStartGame: (game: GameType) => void;
  onOpenReminiscence: () => void;
  onOpenSundowning: () => void;
  onOpenSOS: () => void;
  onOpenBlisterScanner?: () => void;
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
}

export const PatientHome: React.FC<Props> = ({
  patient,
  lang,
  onStartGame,
  onOpenReminiscence,
  onOpenSundowning,
  onOpenSOS,
  onOpenBlisterScanner,
  reminders,
  onToggleReminder,
}) => {
  const { sessions, setLanguage, themeMode, setThemeMode } = useAppStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isSundowningHour, setIsSundowningHour] = useState(false);

  // Time-based Sundowning auto-detection (4 PM to 8 PM)
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsSundowningHour(hour >= 16 && hour <= 20);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Notification API medication scheduling
  useEffect(() => {
    notificationService.requestPermission();
    reminders.forEach((rem) => {
      if (!rem.completed) {
        notificationService.scheduleReminder(rem, lang);
      }
    });
    return () => notificationService.clearAll();
  }, [reminders, lang]);

  const handleSpeakWelcome = () => {
    const welcome = LOCALIZED_STRINGS.welcome[lang] || LOCALIZED_STRINGS.welcome.en;
    audioSpeech.speak(welcome, lang);
  };

  // Daily target progress calculations
  const todaySessions = sessions.filter((s) => {
    const sessionDate = new Date(s.timestamp).toDateString();
    return sessionDate === new Date().toDateString();
  });
  const gamesPlayedToday = todaySessions.length;
  const dailyTarget = 3;
  const progressPercent = Math.min(100, Math.round((gamesPlayedToday / dailyTarget) * 100));

  // Find recent accuracy per game — accuracy is stored as 0.0-1.0, multiply by 100 for display
  const getGameBadge = (game: GameType) => {
    const match = sessions.find((s) => s.gameType === game);
    if (!match) return `✨ ${t('new_badge', lang)}`;
    const pct = Math.round(match.metrics.accuracy * 100);
    return `${pct}%`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn font-sans">
      {/* Top Bar: Profile & Language Selector */}
      <div id="section-overview" className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-3xl p-4 md:p-5 shadow-card-warm gamosa-border transition-all hover:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl border-2 border-amber-300 shadow-inner overflow-hidden shrink-0">
            <img src={patient.photoUrl} alt="Patient" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs md:text-sm font-bold text-ner-amber uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('welcome', lang)}</span>
              <span className="bg-amber-100 text-ner-amber px-2 py-0.5 rounded-full text-xs font-extrabold animate-pulse">
                ⭐ {patient.streakDays} {t('streak_days', lang)}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark">
              {patient.localizedName?.[lang] || patient.name}
            </h1>
            <p className="text-sm font-semibold text-ner-earth">
              {patient.village}, {patient.district} ({patient.state})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Mode Toggle (Pastel Serenity vs Cultural Heritage) */}
          <button
            onClick={() => setThemeMode(themeMode === 'pastel' ? 'heritage' : 'pastel')}
            className={`btn-tactile px-3.5 py-2 text-xs font-bold border-2 transition-all flex items-center gap-1.5 ${
              themeMode === 'pastel'
                ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-sm'
                : 'bg-white text-ner-bark border-ner-bark'
            }`}
            title="Switch Visual Theme"
          >
            <span>{themeMode === 'pastel' ? '🌿' : '🏛️'}</span>
            <span className="hidden sm:inline">{themeMode === 'pastel' ? 'Pastel' : 'Heritage'}</span>
          </button>

          <button
            onClick={handleSpeakWelcome}
            className="p-3.5 bg-ner-gold text-ner-bark rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-transform"
            title="Listen to Welcome Greeting"
          >
            <Volume2 className="w-7 h-7" />
          </button>

          <button
            onClick={() => setShowLanguageModal(true)}
            className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-4 py-2 text-base flex items-center gap-1.5 hover:bg-ner-sand transition-colors"
          >
            <Globe className="w-5 h-5 text-ner-terracotta" />
            <span className="font-bold">{t('language', lang)}</span>
          </button>
        </div>
      </div>

      {/* Friendly Proactive Voice & Text Companion Bar */}
      <div id="section-companion">
        <ProactiveCompanionBar
          patient={patient}
          lang={lang}
          reminders={reminders}
          onStartRecommendedGame={() => onStartGame('card_match')}
        />
      </div>

      {/* Daily Progress Ring & Goal Banner */}
      <div id="section-progress" className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg width="96" height="96" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#EFEBE9"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#2E7D32"
                strokeWidth="10"
                strokeDasharray={`${(progressPercent / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.7s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold font-serif text-ner-bark">
                {gamesPlayedToday}/{dailyTarget}
              </span>
              <span className="text-[10px] uppercase font-bold text-ner-earth">Goal</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-ner-bark">
              {t('daily_progress', lang)}
            </h3>
            <p className="text-sm text-ner-earth font-medium">
              {gamesPlayedToday >= dailyTarget
                ? '🎉 Daily goal achieved! Wonderful cognitive stimulation today.'
                : `${dailyTarget - gamesPlayedToday} more game session${dailyTarget - gamesPlayedToday > 1 ? 's' : ''} recommended to maintain streak.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="text-sm font-bold bg-ner-cream text-ner-bark px-3.5 py-1.5 rounded-full border border-ner-earth/30">
            Current CCS: <strong className="text-ner-forest">{patient.compositeCognitiveScore}</strong>
          </span>
          <span className="text-sm font-bold text-ner-forest bg-ner-mint px-3.5 py-1.5 rounded-full border border-ner-forest/30 flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> Flow Zone AI
          </span>
          <WhatsAppShareButton
            patientName={patient.name}
            accuracy={patient.compositeCognitiveScore}
            streakDays={patient.streakDays}
            phoneNumber={patient.caregiverPhone}
            variant="pill"
            lang={lang}
          />
        </div>
      </div>

      {/* Gamified Memory Garden */}
      <div id="section-garden" className="transition-all">
        <MemoryGarden lang={lang} />
      </div>

      {/* Daily Routine Rhythm Checklist */}
      <div id="section-routine" className="transition-all">
        <DailyRoutineChecklist lang={lang} />
      </div>

      {/* Auto-suggested Sundowning Banner (4 PM - 8 PM) */}
      {isSundowningHour && (
        <div className="bg-gradient-to-r from-[#3E2723] via-[#4E342E] to-[#5D4037] text-amber-100 p-5 rounded-3xl border-2 border-amber-600 shadow-xl animate-pulse">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl">🌙</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-200">
                  {t('evening_calm_time', lang)}
                </h3>
                <p className="text-sm text-amber-300">
                  {t('evening_calm_desc', lang)}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSundowning}
              className="btn-tactile bg-amber-600 hover:bg-amber-700 text-white px-7 py-3 text-lg font-bold border-2 border-amber-400 shadow-lg shrink-0"
            >
              {t('enter_calm', lang)}
            </button>
          </div>
        </div>
      )}

      {/* Gentle Daily Reminder Banner */}
      {reminders.length > 0 && (
        <div id="section-reminders" className="bg-amber-50 border-3 border-ner-amber rounded-3xl p-4 md:p-5 shadow-card-warm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">💊</span>
              <h2 className="text-xl font-serif font-bold text-ner-amber">
                {t('daily_reminders', lang)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {onOpenBlisterScanner && (
                <button
                  onClick={onOpenBlisterScanner}
                  className="text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-xl border border-blue-300 flex items-center gap-1.5 shadow-sm transition-all"
                  title="Verify Foil Blister Pack with Camera"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-700" />
                  <span>Verify Pill (Camera)</span>
                </button>
              )}
              <button
                onClick={() => {
                  const text = LOCALIZED_STRINGS.medReminder[lang] || LOCALIZED_STRINGS.medReminder.en;
                  audioSpeech.speak(text, lang);
                }}
                className="text-xs font-bold text-ner-amber bg-orange-100 px-3 py-1.5 rounded-xl border border-ner-amber/30 flex items-center gap-1 hover:bg-orange-200 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>{t('listen', lang)}</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                onClick={() => onToggleReminder(rem.id)}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  rem.completed
                    ? 'bg-emerald-50 border-ner-forest opacity-80'
                    : 'bg-white border-ner-earth/30 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {rem.type === 'medicine' ? '💊' : rem.type === 'hydration' ? '💧' : rem.type === 'appointment' ? '🩺' : rem.type === 'meal' ? '🥗' : '🪔'}
                  </span>
                  <div>
                    <div className="text-base font-bold text-ner-bark">
                      {getLocalizedText(rem.title, lang)}
                    </div>
                    <div className="text-xs text-ner-earth font-medium">
                      {rem.time} • {getLocalizedText(rem.dosage, lang)}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-colors ${
                    rem.completed
                      ? 'bg-ner-forest text-white border-ner-forest'
                      : 'bg-ner-sand text-transparent border-ner-earth/40'
                  }`}
                >
                  <Check className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Grid: Cultural Cognitive Games */}
      <div id="section-games" className="transition-all">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-2xl font-serif font-bold text-ner-bark flex items-center gap-2">
            <span>🧠 {t('cognitive_workouts', lang)}</span>
          </h2>
          <span className="text-xs font-bold text-ner-forest bg-ner-mint px-3 py-1 rounded-full border border-ner-forest/30">
            8 Breakthrough Workouts & Screening Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Game 1: Gamosa Match */}
          <button
            onClick={() => onStartGame('card_match')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-ner-terracotta relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-red-100 text-ner-redSilk px-2.5 py-0.5 rounded-full border border-ner-redSilk/30">
              {getGameBadge('card_match')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-ner-redSilk flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              🧣
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game1_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game1_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-ner-terracotta text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-orange-700">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 2: Bihu Rhythm Recall */}
          <button
            onClick={() => onStartGame('rhythm_recall')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-ner-amber relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-amber-100 text-ner-amber px-2.5 py-0.5 rounded-full border border-ner-amber/30">
              {getGameBadge('rhythm_recall')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-ner-amber flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              🥁
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game2_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game2_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-ner-amber text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-yellow-600">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 3: Daily Routine Sort */}
          <button
            onClick={() => onStartGame('routine_sort')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-ner-forest relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-emerald-100 text-ner-forest px-2.5 py-0.5 rounded-full border border-ner-forest/30">
              {getGameBadge('routine_sort')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-ner-forest flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              ☕
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game3_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game3_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-ner-forest text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-green-700">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 4: Spot Difference */}
          <button
            onClick={() => onStartGame('spot_difference')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-blue-500 relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-300">
              {getGameBadge('spot_difference')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-400 flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              🧺
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game4_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game4_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-blue-600">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 5: Bamboo Pattern */}
          <button
            onClick={() => onStartGame('pattern_completion')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-purple-500 relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-300">
              {getGameBadge('pattern_completion')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border-2 border-purple-400 flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              🎋
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game5_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game5_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-purple-600">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 6: Word Association & Speech Biomarkers */}
          <button
            onClick={() => onStartGame('word_association')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-pink-500 relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-300 flex items-center gap-0.5">
              🎤 {getGameBadge('word_association')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-pink-50 border-2 border-pink-400 flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              🍲
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game6_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game6_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-pink-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-pink-600">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 7: Clock Drawing Test (CDT) */}
          <button
            onClick={() => onStartGame('clock_drawing')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-purple-600 relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-300">
              {getGameBadge('clock_drawing')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border-2 border-purple-400 flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              🕰️
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game7_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game7_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-purple-700">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>

          {/* Game 8: Olfactory (Aroma) Memory Recall Kit */}
          <button
            onClick={() => onStartGame('olfactory_recall')}
            className="btn-tactile bg-white border-3 border-ner-earth p-5 rounded-3xl flex flex-col items-center text-center justify-between h-60 group hover:border-amber-600 relative"
          >
            <span className="absolute top-3 right-3 text-xs font-extrabold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
              {getGameBadge('olfactory_recall')}
            </span>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-4xl mb-2 group-hover:scale-110 transition-transform">
              👃
            </div>
            <div>
              <div className="text-lg font-serif font-bold text-ner-bark mb-0.5">
                {t('game8_title', lang)}
              </div>
              <span className="text-xs text-ner-earth">{t('game8_subtitle', lang)}</span>
            </div>
            <span className="w-full py-2 bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 shadow-md hover:bg-amber-700">
              <Play className="w-4 h-4" /> {t('play', lang)}
            </span>
          </button>
        </div>
      </div>

      {/* Story of the Day (Photographic Reminiscence Preview) */}
      <div id="section-story" className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex flex-col md:flex-row items-center gap-5 transition-all">
        <div className="relative w-full md:w-56 h-40 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-200">
          <img
            src="/images/majuli_satra.jpg"
            alt="Majuli Story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute bottom-2 left-2 text-xs font-bold text-white bg-ner-terracotta/90 px-2 py-0.5 rounded-full">
            📍 Majuli, Assam
          </span>
        </div>
        <div className="flex-1 space-y-1 text-left">
          <div className="text-xs font-bold text-ner-amber uppercase tracking-wider">
            📸 {t('story_of_day_badge', lang)}
          </div>
          <h3 className="text-xl font-serif font-bold text-ner-bark">
            {lang === 'en'
              ? 'Majuli Island Satra Monasteries'
              : lang === 'as'
              ? 'মাজুলীৰ ঐতিহাসিক সত্ৰ আৰু ব্ৰহ্মপুত্ৰ'
              : lang === 'hi'
              ? 'माजुली द्वीप के ऐतिहासिक सत्र'
              : lang === 'bn'
              ? 'মাজুলীর ঐতিহাসিক সত্র ও ব্রহ্মপুত্র'
              : lang === 'mni'
              ? 'মাজুলীগী পুৱাগী সত্ৰশিং'
              : lang === 'kha'
              ? 'Majuli Island bad ki Satra'
              : lang === 'lus'
              ? 'Majuli Thliarkar Satra Biakinte'
              : lang === 'trp'
              ? 'Majuli Island ni Satra'
              : lang === 'ne'
              ? 'माजुली टापुका ऐतिहासिक सत्रहरू'
              : 'माजुलीनि सतवनि सावगारि'}
          </h3>
          <p className="text-sm text-ner-earth line-clamp-2">
            {lang === 'en'
              ? 'The spiritual morning prayers and serene waters of Majuli Island on the Brahmaputra river.'
              : lang === 'as'
              ? 'ব্ৰহ্মপুত্ৰৰ বুকুত মাজুলীৰ কমলাবাৰী সত্ৰ। পুৱাৰ নাম-কীৰ্তন আৰু খোলৰ মাতে মন শান্ত কৰে।'
              : lang === 'hi'
              ? 'ब्रह्मपुत्र नदी के बीच माजुली के पावन सत्र। सुबह के भजन और शांतिपूर्ण वातावरण।'
              : lang === 'bn'
              ? 'ব্রহ্মপুত্রের বুকে ঐতিহাসিক সত্র। সকালের ভক্তিসুর মনকে প্রশান্ত করে।'
              : lang === 'mni'
              ? 'ব্ৰহ্মপুত্ৰ ঈশিং অমসুং সত্ৰগী পুৱাগী লাইরিক। মন শান্ত ওইহনবা মতম।'
              : lang === 'kha'
              ? 'Ka jingduwai ba kynjah ha rud wah Brahmaputra ha Majuli Island.'
              : lang === 'lus'
              ? 'Brahmaputra luia Majuli thliarkara zing ṭawngṭaina thawm leh boruak nuam tak.'
              : lang === 'trp'
              ? 'Brahmaputra twima o Majuli Satra ni phungni rwchapmung.'
              : lang === 'ne'
              ? 'ब्रह्मपुत्र नदीको किनारमा माजुलीका ऐतिहासिक सत्र र बिहानीका शान्त धुनहरू।'
              : 'माजुलीनि सतवनि सावगारि आरो पुंनि गोजोन बिथांखि।'}
          </p>
          <button
            onClick={onOpenReminiscence}
            className="text-ner-forest font-bold text-sm flex items-center gap-1 hover:underline pt-1"
          >
            <span>{t('open_stories', lang)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Supportive Features */}
      <div id="section-tools" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 transition-all">
        <button
          onClick={onOpenReminiscence}
          className="btn-tactile bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-ner-amber/50 p-4 rounded-3xl flex items-center gap-3.5 text-left hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm border border-amber-200">
            🏞️
          </div>
          <div className="text-lg font-serif font-bold text-ner-bark">{t('reminiscence_album', lang)}</div>
        </button>

        <button
          onClick={onOpenSundowning}
          className="btn-tactile bg-gradient-to-br from-[#4E342E] to-[#3E2723] text-white border-2 border-amber-500/40 p-4 rounded-3xl flex items-center gap-3.5 text-left hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <div className="w-14 h-14 bg-amber-400/20 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-amber-400/30">
            🌙
          </div>
          <div className="text-lg font-serif font-bold text-amber-200">{t('sundowning_calm', lang)}</div>
        </button>

        <button
          onClick={onOpenSOS}
          className="btn-tactile bg-red-50 border-2 border-ner-redSilk p-4 rounded-3xl flex items-center gap-3.5 text-left hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-ner-redSilk shadow-sm">
            🏡
          </div>
          <div className="text-lg font-serif font-bold text-ner-redSilk">{t('safe_home_sos', lang)}</div>
        </button>

        {onOpenBlisterScanner && (
          <button
            onClick={onOpenBlisterScanner}
            className="btn-tactile bg-blue-50 border-2 border-blue-400 p-4 rounded-3xl flex items-center gap-3.5 text-left hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-blue-300 shadow-sm">
              📷
            </div>
            <div className="text-lg font-serif font-bold text-blue-900">{t('blister_scanner', lang)}</div>
          </button>
        )}
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border-3 border-ner-earth p-6 max-w-md w-full shadow-2xl space-y-4 animate-slideUp">
            <h3 className="text-2xl font-serif font-bold text-ner-bark text-center">
              {t('language', lang)}
            </h3>

            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLanguageModal(false);
                    audioSpeech.speak(LOCALIZED_STRINGS.welcome[l.code] || LOCALIZED_STRINGS.welcome.en, l.code);
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    lang === l.code
                      ? 'bg-amber-100 border-ner-amber ring-3 ring-ner-amber/30 scale-102 shadow-md'
                      : 'bg-ner-cream border-ner-earth/30 hover:border-ner-earth hover:shadow-sm'
                  }`}
                >
                  <span className="text-3xl mb-1">{l.flag}</span>
                  <span className="text-base font-bold text-ner-bark">{l.nativeLabel}</span>
                  <span className="text-xs font-semibold text-ner-earth">{l.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLanguageModal(false)}
              className="btn-tactile bg-ner-sand text-ner-bark border-2 border-ner-earth w-full py-3 text-base mt-2"
            >
              {t('close', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
