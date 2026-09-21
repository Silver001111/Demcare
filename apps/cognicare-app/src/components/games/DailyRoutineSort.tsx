import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2, RotateCcw, ArrowUpDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { banditEngine, calculateCognitiveScore } from '../../services/aiEngine';
import { audioSpeech, LOCALIZED_STRINGS } from '../../services/audioSpeech';
import { LanguageCode, GameSession, PatientProfile } from '../../types';
import { t } from '../../translations';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
  onFinishSession: (session: GameSession) => void;
}

interface RoutineStep {
  id: number;
  correctOrder: number;
  title: string;
  nativeTitle: string;
  timeOfDay: string;
  icon: string;
}

const ALL_ROUTINE_STEPS: RoutineStep[] = [
  { id: 1, correctOrder: 1, title: 'Morning Red Tea & Sunlight', nativeTitle: 'পুৱাৰ ৰঙা চাহ আৰু ৰ’দ লোৱা', timeOfDay: 'Early Morning', icon: '☕' },
  { id: 2, correctOrder: 2, title: 'Namghar / Monastery Morning Prayer', nativeTitle: 'নামঘৰত প্ৰাতঃ প্ৰাৰ্থনা', timeOfDay: 'Morning', icon: '🪔' },
  { id: 3, correctOrder: 3, title: 'Handloom Weaving & Crafting', nativeTitle: 'তাঁতশালত গামোচা বোৱা', timeOfDay: 'Mid-day', icon: '🧵' },
  { id: 4, correctOrder: 4, title: 'Afternoon Fish Curry & Rice Meal', nativeTitle: 'দুপৰীয়াৰ ভাত-মাছৰ আহাৰ', timeOfDay: 'Afternoon', icon: '🍚' },
  { id: 5, correctOrder: 5, title: 'Evening Folk Stories with Grandchildren', nativeTitle: 'গধূলি নাতি-নাতিনীৰ সৈতে সাধু কোৱা', timeOfDay: 'Evening', icon: '📖' },
];

export const DailyRoutineSort: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const [difficulty] = useState<number>(() => banditEngine.selectDifficulty());
  const [items, setItems] = useState<RoutineStep[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [moves, setMoves] = useState(0);

  const stepCount = difficulty <= 2 ? 3 : difficulty <= 4 ? 4 : 5;

  useEffect(() => {
    initRoutine();
    const introText = LOCALIZED_STRINGS.routineSortIntro[lang] || LOCALIZED_STRINGS.routineSortIntro.en;
    audioSpeech.speak(introText, lang);
  }, []);

  const initRoutine = () => {
    const selected = ALL_ROUTINE_STEPS.slice(0, stepCount);
    // Shuffle ensuring it's not already solved
    let shuffled = [...selected].sort(() => Math.random() - 0.5);
    while (isSorted(shuffled) && shuffled.length > 1) {
      shuffled = [...selected].sort(() => Math.random() - 0.5);
    }
    setItems(shuffled);
    setSelectedIndex(null);
    setIsCompleted(false);
  };

  const isSorted = (list: RoutineStep[]) => {
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].correctOrder > list[i + 1].correctOrder) return false;
    }
    return true;
  };

  const handleCardClick = (index: number) => {
    audioSpeech.playGentleChime('tap');

    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      // Swap selected items
      const newItems = [...items];
      const temp = newItems[selectedIndex];
      newItems[selectedIndex] = newItems[index];
      newItems[index] = temp;

      setItems(newItems);
      setSelectedIndex(null);
      setMoves((m) => m + 1);

      if (isSorted(newItems)) {
        handleSuccess(newItems);
      }
    }
  };

  const handleSuccess = (finalItems: RoutineStep[]) => {
    setIsCompleted(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    audioSpeech.playGentleChime('success');
    audioSpeech.speak(LOCALIZED_STRINGS.encouragement[lang] || LOCALIZED_STRINGS.encouragement.en, lang);

    const durationSec = Math.max(8, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(1.0, finalItems.length / Math.max(finalItems.length, moves + 1));

    const ctx = { timeSinceLastSession: 24, fatigueScore: 0.2, recentTrend: 'stable' as const };
    const banditResult = banditEngine.updateBeliefs(difficulty, accuracy, 0.85, ctx);

    const metrics = {
      accuracy,
      avgResponseTimeMs: Math.round((durationSec * 1000) / Math.max(1, moves)),
      totalAttempts: moves,
      correctAttempts: finalItems.length,
      hintsUsed: 0,
      pauses: 0,
      touchPrecision: 0.94,
    };

    const previousScores = {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const { domainScores } = calculateCognitiveScore('routine_sort', difficulty, metrics, previousScores);

    const session: GameSession = {
      id: `session_routine_${Date.now()}`,
      patientId: patient.id,
      gameType: 'routine_sort',
      difficultyLevel: difficulty,
      timestamp: new Date().toISOString(),
      durationSeconds: durationSec,
      metrics,
      domainScores,
      flowZoneAchieved: banditResult.inFlowZone,
      adaptedDifficultyNext: banditResult.nextLevel,
      synced: false,
    };

    onFinishSession(session);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-ner-sand text-ner-bark font-bold rounded-full text-base border border-ner-earth/30">
              {items.length} Activities
            </span>
            <button
              onClick={() => audioSpeech.speak(LOCALIZED_STRINGS.routineSortIntro[lang] || LOCALIZED_STRINGS.routineSortIntro.en, lang)}
              className="p-3 bg-ner-gold text-ner-bark rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform"
              title="Listen to Instructions"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-6 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {t('game3_title', lang)}
          </h2>
          <p className="text-lg text-ner-earth font-medium">
            {lang === 'as' ? 'স্পৰ্শ কৰি স্থান সলনি কৰক — পুৱাৰ পৰা গধূলিলৈ সজাওক' : 'Tap two cards to swap their order from morning to evening'}
          </p>
        </div>
      </div>

      {/* Routine Cards Vertical / Responsive List */}
      <div className="space-y-3.5 my-auto max-w-xl mx-auto w-full">
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={item.id}
              onClick={() => handleCardClick(index)}
              className={`w-full p-4 rounded-2xl border-3 flex items-center justify-between transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-amber-100 border-ner-amber ring-4 ring-ner-amber/30 scale-102 shadow-lg'
                  : 'bg-white border-ner-earth/30 shadow-tactile hover:border-ner-earth active:scale-98'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{item.icon}</span>
                <div className="text-left">
                  <div className="text-lg md:text-xl font-bold text-ner-bark">{lang === 'as' ? item.nativeTitle : item.title}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-ner-sand flex items-center justify-center font-extrabold text-ner-bark text-base border border-ner-earth/30">
                  {index + 1}
                </span>
                <ArrowUpDown className="w-5 h-5 text-ner-earth/50" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isCompleted ? (
        <div className="bg-ner-mint border-3 border-ner-forest rounded-3xl p-6 text-center shadow-tactile-green mt-6 animate-fadeIn">
          <div className="text-5xl mb-2">☀️ 🪔 🌸</div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-forest mb-2">
            {t('correct_connection', lang)}
          </h3>
          <p className="text-lg text-ner-bark mb-4 font-medium">
            You accurately organized your traditional daily routine activities!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={initRoutine}
              className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-6 py-3 text-lg"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              {t('play_again', lang)}
            </button>
            <button
              onClick={onBack}
              className="btn-tactile btn-tactile-green px-8 py-3 text-xl"
            >
              <CheckCircle2 className="w-6 h-6 mr-2" />
              {t('done', lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-6">
          <span className="text-ner-earth font-medium">
            💡 {selectedIndex !== null ? (lang === 'as' ? 'এতিয়া সলনি কৰিবলৈ আন এটা কাৰ্ড স্পৰ্শ কৰক' : 'Now tap another card to swap') : (lang === 'as' ? 'কাৰ্ড স্পৰ্শ কৰি ক্ৰম সলনি কৰক' : 'Tap a card to start swapping')}
          </span>
        </div>
      )}
    </div>
  );
};
