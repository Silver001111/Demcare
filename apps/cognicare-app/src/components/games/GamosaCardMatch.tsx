import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { banditEngine, calculateCognitiveScore } from '../../services/aiEngine';
import { audioSpeech, LOCALIZED_STRINGS } from '../../services/audioSpeech';
import { LanguageCode, GameSession, PatientProfile } from '../../types';
import { t } from '../../translations';

import { useAppStore } from '../../store/useAppStore';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
  onFinishSession: (session: GameSession) => void;
}

interface CardItem {
  id: number;
  patternId: string;
  name: string;
  state: string;
  icon: string;
  imageUrl?: string;
  audioVoiceNoteUrl?: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

const CULTURAL_CARDS = [
  { patternId: 'gamosa', name: 'Assam Gamosa', state: 'Assam', icon: '🧣', color: 'bg-red-50 border-ner-redSilk text-ner-redSilk' },
  { patternId: 'naga_shawl', name: 'Naga Warrior Shawl', state: 'Nagaland', icon: '👘', color: 'bg-amber-50 border-ner-amber text-ner-amber' },
  { patternId: 'inaphi', name: 'Manipuri Inaphi Silk', state: 'Manipur', icon: '🪷', color: 'bg-pink-50 border-pink-700 text-pink-700' },
  { patternId: 'mizo_puan', name: 'Mizo Puan Handloom', state: 'Mizoram', icon: '🎋', color: 'bg-emerald-50 border-ner-forest text-ner-forest' },
  { patternId: 'monpa_mask', name: 'Monpa Wooden Mask', state: 'Arunachal', icon: '🎭', color: 'bg-yellow-50 border-amber-800 text-amber-800' },
  { patternId: 'bamboo_basket', name: 'Tripura Bamboo Craft', state: 'Tripura', icon: '🧺', color: 'bg-orange-50 border-amber-900 text-amber-900' },
  { patternId: 'rhino_kaziranga', name: 'Kaziranga Rhino', state: 'Assam', icon: '🦏', color: 'bg-stone-50 border-ner-bark text-ner-bark' },
  { patternId: 'kangchenjunga', name: 'Kangchenjunga Peak', state: 'Sikkim', icon: '🏔️', color: 'bg-sky-50 border-sky-800 text-sky-800' },
];

export const GamosaCardMatch: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const { familyPhotos } = useAppStore();
  const [deckMode, setDeckMode] = useState<'cultural' | 'family'>(
    familyPhotos && familyPhotos.length >= 2 ? 'family' : 'cultural'
  );
  const [difficulty, setDifficulty] = useState<number>(() => banditEngine.selectDifficulty());
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Initialize board on load, difficulty change, or mode change
  useEffect(() => {
    initGame(difficulty, deckMode);
    const introText = deckMode === 'family'
      ? (lang === 'as' ? 'আপোনাৰ মৰমৰ পৰিয়ালৰ ফটোবোৰ মেচ কৰক।' : lang === 'hi' ? 'अपने परिवार के सदस्यों की तस्वीरों का मिलान करें।' : 'Match your beloved family members and joyful memories.')
      : (LOCALIZED_STRINGS.cardMatchIntro[lang] || LOCALIZED_STRINGS.cardMatchIntro.en);
    audioSpeech.speak(introText, lang);
  }, [difficulty, deckMode]);

  const initGame = (lvl: number, mode: 'cultural' | 'family' = deckMode) => {
    const pairCount = lvl === 1 ? 2 : lvl === 2 ? 3 : lvl === 3 ? 4 : 6;
    
    let selectedPatterns: any[] = [];
    if (mode === 'family' && familyPhotos && familyPhotos.length >= 2) {
      const availableCount = Math.min(familyPhotos.length, pairCount);
      selectedPatterns = familyPhotos.slice(0, availableCount).map((f) => ({
        patternId: f.id,
        name: f.personName,
        state: f.relationship,
        icon: '❤️',
        imageUrl: f.photoUrl,
        audioVoiceNoteUrl: f.audioVoiceNoteUrl,
        color: 'bg-rose-50 border-rose-400 text-rose-900',
      }));
    } else {
      selectedPatterns = CULTURAL_CARDS.slice(0, pairCount);
    }

    const deck: CardItem[] = [];
    let idCounter = 1;
    selectedPatterns.forEach((p) => {
      deck.push({ id: idCounter++, ...p, flipped: false, matched: false });
      deck.push({ id: idCounter++, ...p, flipped: false, matched: false });
    });

    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedIndices([]);
    setAttempts(0);
    setCorrectMatches(0);
    setIsCompleted(false);
    setStartTime(Date.now());
  };

  const handleCardClick = (idx: number) => {
    if (isProcessing || cards[idx].flipped || cards[idx].matched) return;

    audioSpeech.playGentleChime('tap');

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSelected = [...selectedIndices, idx];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setIsProcessing(true);
      setAttempts((prev) => prev + 1);

      const [firstIdx, secondIdx] = newSelected;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.patternId === secondCard.patternId) {
        // MATCH FOUND!
        audioSpeech.playGentleChime('success');
        if (firstCard.imageUrl) {
          const matchSpeech = lang === 'as'
            ? `বৰ ধুনীয়া! এয়া আপোনাৰ ${firstCard.name} (${firstCard.state})!`
            : lang === 'hi'
            ? `बहुत बढ़िया! ये हैं आपकी ${firstCard.name} (${firstCard.state})!`
            : `Wonderful! That's ${firstCard.name}, your ${firstCard.state}!`;

          if (firstCard.audioVoiceNoteUrl) {
            // Play loved one's actual voice recording!
            const lovedOneAudio = new Audio(firstCard.audioVoiceNoteUrl);
            lovedOneAudio.play().catch(() => {
              audioSpeech.speak(matchSpeech, lang);
            });
          } else {
            audioSpeech.speak(matchSpeech, lang);
          }
        }
        setTimeout(() => {
          newCards[firstIdx].matched = true;
          newCards[secondIdx].matched = true;
          setCards(newCards);
          setSelectedIndices([]);
          setIsProcessing(false);

          const newMatchCount = correctMatches + 1;
          setCorrectMatches(newMatchCount);

          const totalPairs = newCards.length / 2;
          if (newMatchCount === totalPairs) {
            handleGameComplete(newCards.length / 2, attempts + 1);
          }
        }, 500);
      } else {
        // NO MATCH - Gentle reset without buzzer
        setTimeout(() => {
          newCards[firstIdx].flipped = false;
          newCards[secondIdx].flipped = false;
          setCards(newCards);
          setSelectedIndices([]);
          setIsProcessing(false);
        }, 1100);
      }
    }
  };

  const handleGameComplete = (pairs: number, finalAttempts: number) => {
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const encourageText = LOCALIZED_STRINGS.encouragement[lang] || LOCALIZED_STRINGS.encouragement.en;
    audioSpeech.speak(encourageText, lang);

    const durationSec = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(1.0, pairs / Math.max(pairs, finalAttempts));

    // Update Thompson Sampling Bandit model
    const ctx = { timeSinceLastSession: 24, fatigueScore: 0.2, recentTrend: 'stable' as const };
    const banditResult = banditEngine.updateBeliefs(difficulty, accuracy, 0.8, ctx);

    // Compute composite cognitive scores
    const metrics = {
      accuracy,
      avgResponseTimeMs: Math.round((durationSec * 1000) / finalAttempts),
      totalAttempts: finalAttempts,
      correctAttempts: pairs,
      hintsUsed,
      pauses: 0,
      touchPrecision: 0.92,
    };

    const previousScores = patient.domainScores || {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const { domainScores } = calculateCognitiveScore('card_match', difficulty, metrics, previousScores);

    const session: GameSession = {
      id: `session_${Date.now()}`,
      patientId: patient.id,
      gameType: 'card_match',
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
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <div className="flex items-center gap-2">
            {familyPhotos && familyPhotos.length >= 2 && (
              <button
                onClick={() => setDeckMode(deckMode === 'family' ? 'cultural' : 'family')}
                className={`btn-tactile px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                  deckMode === 'family'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-md'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Switch Deck Mode"
              >
                {deckMode === 'family' ? '❤️ Family Faces' : '🧣 Cultural Motifs'}
              </button>
            )}
            <span className="px-4 py-1.5 bg-ner-sand text-ner-bark font-bold rounded-full text-base border border-ner-earth/30">
              Level {difficulty} {difficulty <= 2 ? '🌱' : difficulty <= 4 ? '🌿' : '🌳'}
            </span>
            <button
              onClick={() => audioSpeech.speak(LOCALIZED_STRINGS.cardMatchIntro[lang] || LOCALIZED_STRINGS.cardMatchIntro.en, lang)}
              className="p-3 bg-ner-gold text-ner-bark rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform"
              title="Listen to Instructions"
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Title & Instructions Banner */}
        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-6 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {deckMode === 'family' ? '❤️ Family Memory Match' : t('game1_title', lang)}
          </h2>
          <p className="text-lg text-ner-earth font-medium">
            {deckMode === 'family'
              ? (lang === 'as' ? 'আপোনাৰ পৰিয়ালৰ ফটোবোৰ মিলাই আনন্দ লওক।' : 'Match the smiling faces of your loved ones.')
              : (LOCALIZED_STRINGS.cardMatchIntro[lang] || LOCALIZED_STRINGS.cardMatchIntro.en)}
          </p>
        </div>
      </div>

      {/* Game Board Grid */}
      <div
        className={`grid gap-3 md:gap-4 my-auto ${
          cards.length <= 4
            ? 'grid-cols-2 max-w-md mx-auto'
            : cards.length <= 6
            ? 'grid-cols-3 max-w-xl mx-auto'
            : cards.length <= 8
            ? 'grid-cols-4 max-w-2xl mx-auto'
            : 'grid-cols-4 max-w-3xl mx-auto'
        }`}
      >
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            disabled={card.matched || isProcessing}
            className={`h-32 md:h-40 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center p-2 relative select-none ${
              card.matched
                ? 'bg-emerald-50 border-emerald-600 scale-95 opacity-90'
                : card.flipped
                ? `${card.color} border-4 scale-100 shadow-md`
                : 'bg-gradient-to-br from-[#8D6E63] to-[#5D4037] border-ner-bark shadow-tactile text-white hover:brightness-105'
            }`}
          >
            {card.flipped || card.matched ? (
              <div className="flex flex-col items-center justify-center text-center animate-fadeIn w-full px-1">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-14 h-14 md:w-18 md:h-18 rounded-xl object-cover shadow-sm mb-1 border border-slate-200"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl mb-1">{card.icon}</span>
                )}
                <span className="text-xs md:text-sm font-bold leading-tight px-1 truncate w-full">{card.name}</span>
                <span className="text-[10px] text-slate-600 font-semibold truncate w-full">{card.state}</span>
                {card.matched && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute top-1.5 right-1.5" />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/80">
                <span className="text-3xl md:text-4xl">{deckMode === 'family' ? '❤️' : '🧣'}</span>
                <span className="text-xs font-bold mt-1 text-ner-gold">{t('touch_card', lang)}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Completion Modal / Banner */}
      {isCompleted ? (
        <div className="bg-ner-mint border-3 border-ner-forest rounded-3xl p-6 text-center shadow-tactile-green mt-6 animate-fadeIn">
          <div className="text-5xl mb-2">🎉 🌸</div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-forest mb-2">
            {t('correct_connection', lang)}
          </h3>
          <p className="text-lg text-ner-bark mb-4 font-medium">
            {correctMatches} {t('pairs_label', lang)} • {attempts} turns
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
        /* Bottom Stats Bar */
        <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ner-bark">{t('pairs_label', lang)}</span>
            <span className="text-2xl font-extrabold text-ner-forest">
              {correctMatches} / {cards.length / 2}
            </span>
          </div>
          <button
            onClick={() => {
              setHintsUsed((h) => h + 1);
              audioSpeech.playGentleChime('tap');
              audioSpeech.speak(LOCALIZED_STRINGS.cardMatchIntro[lang] || LOCALIZED_STRINGS.cardMatchIntro.en, lang);
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
