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

interface PatternOption {
  id: string;
  icon: string;
  isCorrect: boolean;
}

export const BambooPatternCompletion: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const [difficulty, setDifficulty] = useState<number>(() => banditEngine.selectDifficulty());
  const [gridSize, setGridSize] = useState(2);
  const [grid, setGrid] = useState<(string | null)[]>([]);
  const [options, setOptions] = useState<PatternOption[]>([]);
  const [missingIndex, setMissingIndex] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const PATTERNS = ['🌿', '🎋', '🪵', '🧺', '🛖'];

  useEffect(() => {
    initGame(difficulty);
    const introText = lang === 'as' 
      ? 'খালী থাই পূৰণ কৰক। বাঁহৰ আৰ্হিটো মিলাওক।' 
      : 'Complete the empty space. Match the bamboo pattern.';
    audioSpeech.speak(introText, lang);
  }, [difficulty]);

  const initGame = (lvl: number) => {
    const size = lvl <= 2 ? 2 : lvl <= 4 ? 3 : 4;
    setGridSize(size);
    
    const totalCells = size * size;
    const newGrid: (string | null)[] = [];
    const basePattern = [PATTERNS[0], PATTERNS[1], PATTERNS[2]];
    
    for (let i = 0; i < totalCells; i++) {
        if (lvl <= 2) {
            newGrid.push(basePattern[i % 2]);
        } else {
            newGrid.push(basePattern[i % 3]);
        }
    }

    const missingIdx = Math.floor(Math.random() * totalCells);
    const correctAns = newGrid[missingIdx] as string;
    newGrid[missingIdx] = null;
    
    setMissingIndex(missingIdx);
    setGrid(newGrid);

    let newOptions: PatternOption[] = [
      { id: 'opt1', icon: correctAns, isCorrect: true },
    ];
    
    const distractors = PATTERNS.filter(p => p !== correctAns).sort(() => 0.5 - Math.random());
    const numOptions = lvl <= 2 ? 3 : 4;
    
    for (let i = 0; i < numOptions - 1; i++) {
        newOptions.push({ id: `dist_${i}`, icon: distractors[i], isCorrect: false });
    }
    
    newOptions = newOptions.sort(() => 0.5 - Math.random());
    setOptions(newOptions);
    
    setAttempts(0);
    setIsCompleted(false);
    setSelectedOption(null);
    setStartTime(Date.now());
  };

  const handleOptionSelect = (option: PatternOption) => {
    if (isCompleted) return;
    
    setAttempts(prev => prev + 1);
    setSelectedOption(option.id);

    if (option.isCorrect) {
      audioSpeech.playGentleChime('success');
      
      const newGrid = [...grid];
      newGrid[missingIndex] = option.icon;
      setGrid(newGrid);
      
      setTimeout(() => {
        handleGameComplete(attempts + 1);
      }, 800);
    } else {
      audioSpeech.playGentleChime('tap');
      setTimeout(() => setSelectedOption(null), 1000);
    }
  };

  const handleGameComplete = (finalAttempts: number) => {
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const encourageText = LOCALIZED_STRINGS.encouragement[lang] || LOCALIZED_STRINGS.encouragement.en;
    audioSpeech.speak(encourageText, lang);

    const durationSec = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(1.0, 1 / Math.max(1, finalAttempts));

    const ctx = { timeSinceLastSession: 24, fatigueScore: 0.2, recentTrend: 'stable' as const };
    const banditResult = banditEngine.updateBeliefs(difficulty, accuracy, 0.8, ctx);

    const metrics = {
      accuracy,
      avgResponseTimeMs: Math.round((durationSec * 1000) / finalAttempts),
      totalAttempts: finalAttempts,
      correctAttempts: 1,
      hintsUsed,
      pauses: 0,
      touchPrecision: 0.95,
    };

    const previousScores = {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const { domainScores } = calculateCognitiveScore('pattern_completion', difficulty, metrics, previousScores);

    const session: GameSession = {
      id: `session_${Date.now()}`,
      patientId: patient.id,
      gameType: 'pattern_completion',
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
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-amber-50 min-h-[85vh] flex flex-col justify-between">
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
              onClick={() => audioSpeech.speak(lang === 'as' ? 'খালী থাই পূৰণ কৰক।' : 'Complete the empty space.', lang)}
              className="p-3 bg-ner-gold text-ner-bark rounded-full shadow-md"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-6 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {t('game5_title', lang)}
          </h2>
          <p className="text-lg text-ner-earth font-medium">
            {lang === 'as' ? 'খালী ঘৰটোৰ বাবে সঠিক আৰ্হিটো বাছি লওক।' : 'Select the correct pattern for the empty space.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center flex-grow">
        <div 
          className={`grid gap-2 p-4 bg-white border-4 border-amber-800 rounded-xl shadow-lg mb-8`}
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((cell, idx) => (
            <div 
              key={idx} 
              className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl border-2 rounded-lg ${
                cell === null ? 'bg-amber-100 border-dashed border-amber-400' : 'bg-amber-50 border-amber-200'
              }`}
            >
              {cell}
            </div>
          ))}
        </div>

        {!isCompleted && (
          <div className="w-full max-w-lg">
            <h3 className="text-center font-bold text-ner-bark mb-4 text-lg">
              {lang === 'as' ? 'বাছনি কৰক:' : 'Choose from below:'}
            </h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={selectedOption === opt.id}
                  className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-4xl bg-white border-4 rounded-xl transition-all shadow-tactile ${
                    selectedOption === opt.id
                      ? opt.isCorrect ? 'border-ner-forest bg-green-50' : 'border-red-500 bg-red-50'
                      : 'border-ner-earth hover:border-ner-bark hover:-translate-y-1'
                  }`}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isCompleted ? (
        <div className="bg-ner-mint border-3 border-ner-forest rounded-3xl p-6 text-center shadow-tactile-green mt-6 animate-fadeIn">
          <div className="text-5xl mb-2">🎉 🎋</div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-forest mb-2">
            {t('correct_connection', lang)}
          </h3>
          <p className="text-lg text-ner-bark mb-4 font-medium">
            You completed the bamboo weave in {attempts} attempts!
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
        <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-6">
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
