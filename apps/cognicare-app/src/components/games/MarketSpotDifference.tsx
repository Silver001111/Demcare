import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, RotateCcw } from 'lucide-react';
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

interface Item {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  isDifference: boolean;
}

export const MarketSpotDifference: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const [difficulty, setDifficulty] = useState<number>(() => banditEngine.selectDifficulty());
  const [sceneA, setSceneA] = useState<Item[]>([]);
  const [sceneB, setSceneB] = useState<Item[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [differencesFound, setDifferencesFound] = useState<Set<string>>(new Set());

  // Local market items
  const BASE_ITEMS = ['🍎', '🥬', '🧺', '🏺', '🍌', '🥕', '🫖', '🍵'];
  const DIFFERENCE_ITEMS = ['🥭', '🥥', '🧄', '🧅'];

  const requiredDifferences = difficulty <= 2 ? 1 : difficulty <= 4 ? 2 : 3;

  useEffect(() => {
    initGame(difficulty);
    const introText = lang === 'as' 
      ? 'দুখন ছবিৰ মাজত কি পাৰ্থক্য আছে বিচাৰি উলিয়াওক।' 
      : 'Spot the difference between the two pictures.';
    audioSpeech.speak(introText, lang);
  }, [difficulty]);

  const initGame = (lvl: number) => {
    const numBaseItems = lvl <= 2 ? 4 : lvl <= 4 ? 6 : 8;
    const currentBaseItems = BASE_ITEMS.slice(0, numBaseItems);
    
    const itemsA: Item[] = [];
    const itemsB: Item[] = [];

    // Generate random positions avoiding overlap (simplified for prototype)
    currentBaseItems.forEach((emoji, i) => {
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 80;
      const id = `item_${i}`;
      
      itemsA.push({ id, emoji, x, y, isDifference: false });
      itemsB.push({ id, emoji, x, y, isDifference: false });
    });

    // Add differences
    const diffsToAdd = lvl <= 2 ? 1 : lvl <= 4 ? 2 : 3;
    const diffEmojis = DIFFERENCE_ITEMS.slice(0, diffsToAdd);

    diffEmojis.forEach((emoji, i) => {
      const x = 20 + Math.random() * 60;
      const y = 20 + Math.random() * 60;
      const id = `diff_${i}`;
      
      // Add only to scene B
      itemsB.push({ id, emoji, x, y, isDifference: true });
    });

    setSceneA(itemsA);
    setSceneB(itemsB);
    setDifferencesFound(new Set());
    setAttempts(0);
    setIsCompleted(false);
    setStartTime(Date.now());
  };

  const handleSpotDifference = (item: Item, isSceneB: boolean) => {
    if (isCompleted || differencesFound.has(item.id)) return;
    
    setAttempts(prev => prev + 1);

    if (item.isDifference) {
      audioSpeech.playGentleChime('success');
      const newFound = new Set(differencesFound);
      newFound.add(item.id);
      setDifferencesFound(newFound);

      if (newFound.size === requiredDifferences) {
        setTimeout(() => {
          handleGameComplete(attempts + 1);
        }, 800);
      }
    } else {
      audioSpeech.playGentleChime('tap');
    }
  };

  const handleGameComplete = (finalAttempts: number) => {
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const encourageText = LOCALIZED_STRINGS.encouragement[lang] || LOCALIZED_STRINGS.encouragement.en;
    audioSpeech.speak(encourageText, lang);

    const durationSec = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    // Accuracy penalty
    const accuracy = Math.min(1.0, requiredDifferences / Math.max(requiredDifferences, finalAttempts));

    const ctx = { timeSinceLastSession: 24, fatigueScore: 0.2, recentTrend: 'stable' as const };
    const banditResult = banditEngine.updateBeliefs(difficulty, accuracy, 0.8, ctx);

    const metrics = {
      accuracy,
      avgResponseTimeMs: Math.round((durationSec * 1000) / finalAttempts),
      totalAttempts: finalAttempts,
      correctAttempts: requiredDifferences,
      hintsUsed,
      pauses: 0,
      touchPrecision: 0.90,
    };

    const previousScores = patient.domainScores || {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const { domainScores } = calculateCognitiveScore('spot_difference', difficulty, metrics, previousScores);

    const session: GameSession = {
      id: `session_${Date.now()}`,
      patientId: patient.id,
      gameType: 'spot_difference',
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-orange-50 min-h-[85vh] flex flex-col justify-between">
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
              Level {difficulty} {difficulty <= 2 ? '🌱' : difficulty <= 4 ? '🌿' : '🌳'}
            </span>
            <button
              onClick={() => audioSpeech.speak(lang === 'as' ? 'পাৰ্থক্য বিচাৰি উলিয়াওক।' : 'Spot the difference.', lang)}
              className="p-3 bg-ner-gold text-ner-bark rounded-full shadow-md"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-6 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {t('game4_title', lang)}
          </h2>
          <p className="text-lg text-ner-earth font-medium">
            {lang === 'as' ? `দুখন ছবিৰ মাজত ${requiredDifferences} টা পাৰ্থক্য বিচাৰি উলিয়াওক।` : `Find ${requiredDifferences} differences between the two market scenes.`}
          </p>
        </div>
      </div>

      {!isCompleted && (
        <div className="flex flex-col md:flex-row gap-4 items-center flex-grow mb-6">
          {/* Scene A */}
          <div className="w-full md:w-1/2 aspect-square relative bg-[#e7d5b8] border-4 border-ner-bark rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
            {/* Background elements */}
            <div className="absolute bottom-0 w-full h-1/3 bg-[#d4a373] opacity-50" />
            
            {sceneA.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSpotDifference(item, false)}
                className="absolute text-5xl md:text-6xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* Scene B */}
          <div className="w-full md:w-1/2 aspect-square relative bg-[#e7d5b8] border-4 border-ner-bark rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
            <div className="absolute bottom-0 w-full h-1/3 bg-[#d4a373] opacity-50" />
            
            {sceneB.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSpotDifference(item, true)}
                className="absolute text-5xl md:text-6xl transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.emoji}
                {differencesFound.has(item.id) && (
                  <div className="absolute inset-0 border-4 border-ner-forest rounded-full scale-125 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isCompleted ? (
        <div className="bg-ner-mint border-3 border-ner-forest rounded-3xl p-6 text-center shadow-tactile-green mt-6 animate-fadeIn">
          <div className="text-5xl mb-2">🎉 🧺</div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-forest mb-2">
            {t('correct_connection', lang)}
          </h3>
          <p className="text-lg text-ner-bark mb-4 font-medium">
            You found all {requiredDifferences} differences in {attempts} taps!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => initGame(difficulty)}
              className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-6 py-3 text-lg"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              {t('play_again', lang)}
            </button>
            <button
              onClick={onBack}
              className="btn-tactile btn-tactile-green px-8 py-3 text-xl"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              {t('done', lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-auto">
          <div className="text-lg font-bold text-ner-bark">
            {t('found_label', lang)}: <span className="text-ner-forest">{differencesFound.size} / {requiredDifferences}</span>
          </div>
          <button
            onClick={() => {
              setHintsUsed((h) => h + 1);
              audioSpeech.playGentleChime('tap');
            }}
            className="text-ner-amber font-bold text-base flex items-center bg-orange-50 px-4 py-2 rounded-xl border border-ner-amber/30 hover:bg-orange-100"
          >
            💡 {t('need_hint', lang)}
          </button>
        </div>
      )}
    </div>
  );
};
