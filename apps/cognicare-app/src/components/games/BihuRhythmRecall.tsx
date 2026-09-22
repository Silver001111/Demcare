import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, RotateCcw, Play } from 'lucide-react';
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

interface Instrument {
  id: number;
  name: string;
  nativeName: string;
  icon: string;
  color: string;
  activeColor: string;
  freq: number;
}

const INSTRUMENTS: Instrument[] = [
  { id: 0, name: 'Bihu Dhol', nativeName: 'বিহু ঢোল', icon: '🥁', color: 'bg-amber-100 border-amber-600 text-amber-900', activeColor: 'bg-amber-500 text-white scale-105 shadow-xl', freq: 261.63 },
  { id: 1, name: 'Pepa Buffalo Horn', nativeName: 'ম’হৰ শিঙৰ পেঁপা', icon: '🎺', color: 'bg-red-100 border-ner-redSilk text-ner-redSilk', activeColor: 'bg-red-600 text-white scale-105 shadow-xl', freq: 329.63 },
  { id: 2, name: 'Gagana Bamboo Harp', nativeName: 'বাঁহৰ গগনা', icon: '🎋', color: 'bg-emerald-100 border-ner-forest text-ner-forest', activeColor: 'bg-emerald-600 text-white scale-105 shadow-xl', freq: 392.00 },
  { id: 3, name: 'Cheraw Bamboo Striker', nativeName: 'চেৰাও বাঁহ', icon: '🥢', color: 'bg-purple-100 border-purple-700 text-purple-900', activeColor: 'bg-purple-600 text-white scale-105 shadow-xl', freq: 523.25 },
];

export const BihuRhythmRecall: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const [difficulty, setDifficulty] = useState<number>(() => banditEngine.selectDifficulty());
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeInstrument, setActiveInstrument] = useState<number | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);

  const seqLength = difficulty === 1 ? 3 : difficulty === 2 ? 3 : difficulty === 3 ? 4 : 5;

  useEffect(() => {
    startNewRound(1);
    const introText = LOCALIZED_STRINGS.rhythmRecallIntro[lang] || LOCALIZED_STRINGS.rhythmRecallIntro.en;
    audioSpeech.speak(introText, lang);
  }, [difficulty]);

  const playInstrumentSound = (freq: number) => {
    try {
      const ctx = audioSpeech.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn(e);
    }
  };

  const startNewRound = (currRound: number) => {
    const newSeq: number[] = [];
    const count = seqLength + (currRound - 1);
    for (let i = 0; i < count; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    setPlayerInput([]);
    setRound(currRound);
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSequence(true);
    setPlayerInput([]);

    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < seq.length; i++) {
      const instId = seq[i];
      setActiveInstrument(instId);
      playInstrumentSound(INSTRUMENTS[instId].freq);
      await new Promise((r) => setTimeout(r, 650));
      setActiveInstrument(null);
      await new Promise((r) => setTimeout(r, 250));
    }
    setIsPlayingSequence(false);
  };

  const handleInstrumentTap = (id: number) => {
    if (isPlayingSequence || isCompleted) return;

    playInstrumentSound(INSTRUMENTS[id].freq);
    setActiveInstrument(id);
    setTimeout(() => setActiveInstrument(null), 200);

    const nextInput = [...playerInput, id];
    setPlayerInput(nextInput);
    setAttempts((a) => a + 1);

    const currentIndex = playerInput.length;
    if (sequence[currentIndex] !== id) {
      // Gentle mismatch prompt
      const retryPrompt = lang === 'en' ? "Let's listen again" : lang === 'as' ? 'আকৌ এবাৰ শুনক' : lang === 'hi' ? 'फिर से सुनें' : lang === 'bn' ? 'আবার শুনুন' : "Let's listen again";
      audioSpeech.speak(retryPrompt, lang);
      setTimeout(() => playSequence(sequence), 1000);
      return;
    }

    // If step was correct and completed full sequence for this round
    if (nextInput.length === sequence.length) {
      audioSpeech.playGentleChime('success');
      if (round < maxRounds) {
        setTimeout(() => startNewRound(round + 1), 1200);
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = () => {
    setIsCompleted(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    audioSpeech.speak(LOCALIZED_STRINGS.encouragement[lang] || LOCALIZED_STRINGS.encouragement.en, lang);

    const durationSec = Math.max(10, Math.round((Date.now() - startTime) / 1000));
    const totalExpectedSteps = seqLength * maxRounds;
    const accuracy = Math.min(1.0, totalExpectedSteps / Math.max(totalExpectedSteps, attempts));

    const ctx = { timeSinceLastSession: 24, fatigueScore: 0.2, recentTrend: 'stable' as const };
    const banditResult = banditEngine.updateBeliefs(difficulty, accuracy, 0.9, ctx);

    const metrics = {
      accuracy,
      avgResponseTimeMs: Math.round((durationSec * 1000) / Math.max(1, attempts)),
      totalAttempts: attempts,
      correctAttempts: totalExpectedSteps,
      hintsUsed: 0,
      pauses: 0,
      touchPrecision: 0.95,
    };

    const previousScores = patient.domainScores || {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const { domainScores } = calculateCognitiveScore('rhythm_recall', difficulty, metrics, previousScores);

    const session: GameSession = {
      id: `session_rhythm_${Date.now()}`,
      patientId: patient.id,
      gameType: 'rhythm_recall',
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
              {t('round_label', lang)} {round} / {maxRounds}
            </span>
            <button
              onClick={() => playSequence(sequence)}
              disabled={isPlayingSequence}
              className="p-3 bg-ner-gold text-ner-bark rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              title="Replay Rhythm"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Title & Instructions */}
        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-6 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {t('game2_title', lang)}
          </h2>
          <p className="text-lg text-ner-earth font-medium">
            {isPlayingSequence
              ? (lang === 'as' ? '👂 মনোযোগেৰে শুনক আৰু মনত ৰাখক...' : '👂 Listen carefully to the melody...')
              : (lang === 'as' ? '👉 এতিয়া একে ক্ৰমত স্পৰ্শ কৰক' : '👉 Tap in the exact order')}
          </p>
        </div>
      </div>

      {/* Instruments 2x2 Big Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto my-auto w-full">
        {INSTRUMENTS.map((inst) => {
          const isActive = activeInstrument === inst.id;
          return (
            <button
              key={inst.id}
              onClick={() => handleInstrumentTap(inst.id)}
              disabled={isPlayingSequence}
              className={`h-40 md:h-48 rounded-3xl border-4 transition-all duration-150 flex flex-col items-center justify-center p-3 select-none ${
                isActive
                  ? `${inst.activeColor} border-white ring-4 ring-ner-gold scale-105`
                  : `${inst.color} border-current shadow-tactile hover:brightness-105 active:scale-95`
              }`}
            >
              <span className="text-5xl md:text-6xl mb-2">{inst.icon}</span>
              <span className="text-lg md:text-xl font-extrabold">{lang === 'as' ? inst.nativeName : inst.name}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Status / Completion */}
      {isCompleted ? (
        <div className="bg-ner-mint border-3 border-ner-forest rounded-3xl p-6 text-center shadow-tactile-green mt-6 animate-fadeIn">
          <div className="text-5xl mb-2">🎺 🥁 🌸</div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-forest mb-2">
            {t('correct_connection', lang)}
          </h3>
          <p className="text-lg text-ner-bark mb-4 font-medium">
            {maxRounds} {t('round_label', lang)} • Complete!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => startNewRound(1)}
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
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ner-bark">{lang === 'as' ? 'ক্ৰম:' : 'Step:'}</span>
            <div className="flex gap-1.5">
              {sequence.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full ${
                    idx < playerInput.length
                      ? 'bg-ner-forest'
                      : 'bg-ner-sand border border-ner-earth/30'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => playSequence(sequence)}
            disabled={isPlayingSequence}
            className="btn-tactile bg-amber-50 text-ner-amber border-2 border-ner-amber px-4 py-2 text-base"
          >
            <Play className="w-5 h-5 mr-1" />
            {lang === 'as' ? 'আকৌ শুনক' : 'Hear Again'}
          </button>
        </div>
      )}
    </div>
  );
};
