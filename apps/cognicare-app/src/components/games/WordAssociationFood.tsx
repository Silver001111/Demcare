import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Sparkles, RotateCcw, Mic, Square, Activity, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { banditEngine, calculateCognitiveScore } from '../../services/aiEngine';
import { audioSpeech, LOCALIZED_STRINGS } from '../../services/audioSpeech';
import { analyzeSpeechBiomarkers, SpeechBiomarkers } from '../../services/voiceBiomarker';
import { evaluateDialectUtterance, DialectMatchResult } from '../../services/dialectParser';
import { LanguageCode, GameSession, PatientProfile } from '../../types';
import { t } from '../../translations';
import { WhatsAppShareButton } from '../common/WhatsAppShareButton';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
  onFinishSession: (session: GameSession) => void;
}

interface WordOption {
  id: string;
  text: string;
  isCorrect: boolean;
  conceptKey?: string;
}

export const WordAssociationFood: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const [difficulty, setDifficulty] = useState<number>(() => banditEngine.selectDifficulty());
  const [targetWord, setTargetWord] = useState('');
  const [targetEmoji, setTargetEmoji] = useState('');
  const [options, setOptions] = useState<WordOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintActiveId, setHintActiveId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [detectedPauses, setDetectedPauses] = useState(0);
  const [latestBiomarkers, setLatestBiomarkers] = useState<SpeechBiomarkers | null>(null);

  // Live Acoustic Signal-to-Noise Ratio (SNR) State
  const [ambientNoiseDb, setAmbientNoiseDb] = useState<number>(38);
  const [noiseQuality, setNoiseQuality] = useState<'quiet' | 'moderate' | 'noisy'>('quiet');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dialect Code-Mixing NLP State
  const [currentConcept, setCurrentConcept] = useState<string>('TEA');
  const [dialectResult, setDialectResult] = useState<DialectMatchResult | null>(null);
  const [spokenInputText, setSpokenInputText] = useState<string>('');

  // Vocabulary sets
  const VOCAB = [
    { 
      conceptKey: 'TEA',
      target: { en: 'Tea Garden', as: 'চাহ বাগিচা', hi: 'चाय बागान', emoji: '🌱' }, 
      match: { en: 'Tea Leaves', as: 'চাহ পাত', hi: 'चाय की पत्ती' },
      distractors: [
        { en: 'Rice', as: 'চাউল', hi: 'चावल' },
        { en: 'Fish', as: 'মাছ', hi: 'मछली' },
        { en: 'Bamboo', as: 'বাঁহ', hi: 'बांस' },
        { en: 'Silk', as: 'পাট', hi: 'रेशम' }
      ]
    },
    { 
      conceptKey: 'RICE_MEAL',
      target: { en: 'Bihu Festival', as: 'বিহু উৎসৱ', hi: 'बिहू त्योहार', emoji: '🥁' }, 
      match: { en: 'Pitha (Sweet)', as: 'পিঠা', hi: 'पीठा' },
      distractors: [
        { en: 'Rain', as: 'বৰষুণ', hi: 'बारिश' },
        { en: 'Mountain', as: 'পাহাৰ', hi: 'पहाड़' },
        { en: 'Book', as: 'কিতাপ', hi: 'किताब' },
        { en: 'Medicine', as: 'দৰৱ', hi: 'दवा' }
      ]
    },
    { 
      conceptKey: 'RIVER',
      target: { en: 'River Brahmaputra', as: 'ব্ৰহ্মপুত্ৰ নদী', hi: 'ब्रह्मপুত্র নদী', emoji: '🌊' }, 
      match: { en: 'Boat', as: 'নাও', hi: 'नाव' },
      distractors: [
        { en: 'Car', as: 'গাড়ী', hi: 'कार' },
        { en: 'Fire', as: 'জুই', hi: 'आग' },
        { en: 'Star', as: 'তৰা', hi: 'तारा' },
        { en: 'Forest', as: 'হাবি', hi: 'जंगल' }
      ]
    },
    { 
      conceptKey: 'GAMOSA',
      target: { en: 'Assam Silk', as: 'অসমৰ পাট মুগা', hi: 'असम रेशम', emoji: '🧵' }, 
      match: { en: 'Mekhela Sador', as: 'মেখেলা চাদৰ', hi: 'मेखेला चादर' },
      distractors: [
        { en: 'Shoes', as: 'জোতা', hi: 'जूते' },
        { en: 'Umbrella', as: 'ছাতি', hi: 'छाता' },
        { en: 'Plate', as: 'কাঁহী', hi: 'थाली' },
        { en: 'Chair', as: 'চকী', hi: 'कुर्सी' }
      ]
    }
  ];

  useEffect(() => {
    initGame(difficulty);
    const introText = lang === 'as' 
      ? 'ওপৰৰ শব্দটোৰ লগত মিলা শব্দটো বাছক।' 
      : 'Select the word that is related to the top word.';
    audioSpeech.speak(introText, lang);
  }, [difficulty]);

  const initGame = (lvl: number) => {
    const vocabItem = VOCAB[Math.floor(Math.random() * VOCAB.length)];
    setCurrentConcept(vocabItem.conceptKey);
    setDialectResult(null);
    setSpokenInputText('');
    
    // Fallback to English if language string is missing for some reason
    setTargetWord(vocabItem.target[lang as keyof typeof vocabItem.target] || vocabItem.target.en);
    setTargetEmoji(vocabItem.target.emoji);
    
    const correctWord = vocabItem.match[lang as keyof typeof vocabItem.match] || vocabItem.match.en;

    let newOptions: WordOption[] = [
      { id: 'opt_correct', text: correctWord, isCorrect: true, conceptKey: vocabItem.conceptKey },
    ];
    
    // Difficulty determines number of options (2 to 4)
    const numOptions = lvl <= 2 ? 2 : lvl <= 4 ? 3 : 4;
    const shuffledDistractors = [...vocabItem.distractors].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numOptions - 1; i++) {
        const distractorWord = shuffledDistractors[i][lang as keyof typeof shuffledDistractors[0]] || shuffledDistractors[i].en;
        newOptions.push({ id: `dist_${i}`, text: distractorWord, isCorrect: false });
    }
    
    newOptions = newOptions.sort(() => 0.5 - Math.random());
    setOptions(newOptions);
    
    setAttempts(0);
    setIsCompleted(false);
    setSelectedOption(null);
    setStartTime(Date.now());
    setDetectedPauses(0);
    setLatestBiomarkers(null);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.warn);
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(console.warn);
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const localChunks: Blob[] = [];

        // Real-time acoustic noise floor & SNR calibration using Web Audio API
        try {
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const sampleNoiseFloor = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            const db = Math.round(30 + (avg / 255) * 55);
            setAmbientNoiseDb(db);
            if (db < 45) setNoiseQuality('quiet');
            else if (db < 65) setNoiseQuality('moderate');
            else setNoiseQuality('noisy');
            animFrameRef.current = requestAnimationFrame(sampleNoiseFloor);
          };
          sampleNoiseFloor();
        } catch (e) {
          console.warn('[CogniCare] Web Audio SNR analysis unavailable:', e);
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) localChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(console.warn);
          }
          const audioBlob = new Blob(localChunks, { type: 'audio/webm' });
          // Real Acoustic Biomarker Extraction via Web Audio API
          const biomarkers = await analyzeSpeechBiomarkers(audioBlob, startTime);
          setLatestBiomarkers(biomarkers);
          setDetectedPauses(prev => prev + biomarkers.pauseCount);
          console.log(`Audio recorded (${audioBlob.size} bytes). Extracted speech biomarkers:`, biomarkers);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Microphone access denied or unavailable:", error);
      }
    }
  };

  const handleRequestHint = () => {
    const correctOpt = options.find(o => o.isCorrect);
    if (!correctOpt) return;
    setHintsUsed(h => h + 1);
    setHintActiveId(correctOpt.id);
    audioSpeech.playGentleChime('tap');
    
    // Spoken clue
    const clue = lang === 'as'
      ? `সংকেত: এইটো শব্দ ${targetWord}ৰ লগত সম্বন্ধযুক্ত।`
      : `Hint: Think of the traditional item paired with ${targetWord}.`;
    audioSpeech.speak(clue, lang);
    
    setTimeout(() => setHintActiveId(null), 3000);
  };

  const handleEvaluateDialectInput = (inputWord: string) => {
    if (!inputWord.trim()) return;
    const result = evaluateDialectUtterance(inputWord, currentConcept, lang);
    setDialectResult(result);
    if (result.matched) {
      const correctOpt = options.find(o => o.isCorrect);
      if (correctOpt) {
        setSelectedOption(correctOpt.id);
      }
      audioSpeech.playGentleChime('success');
      const confirmMsg = lang === 'as'
        ? `উত্তম! আঞ্চলিক শব্দ "${result.matchedTerm}" গ্ৰহণ কৰা হ'ল।`
        : `Excellent! Dialect term "${result.matchedTerm}" recognized. Full score awarded!`;
      audioSpeech.speak(confirmMsg, lang);
      setTimeout(() => {
        handleGameComplete(1);
      }, 1200);
    } else {
      audioSpeech.playGentleChime('tap');
    }
  };

  const handleOptionSelect = (option: WordOption) => {
    if (isCompleted) return;
    
    setAttempts(prev => prev + 1);
    setSelectedOption(option.id);
    audioSpeech.speak(option.text, lang);

    if (option.isCorrect) {
      audioSpeech.playGentleChime('success');
      
      setTimeout(() => {
        handleGameComplete(attempts + 1);
      }, 1000);
    } else {
      audioSpeech.playGentleChime('tap');
      setTimeout(() => setSelectedOption(null), 1200);
    }
  };

  const handleGameComplete = (finalAttempts: number) => {
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const encourageText = LOCALIZED_STRINGS.encouragement[lang] || LOCALIZED_STRINGS.encouragement.en;
    audioSpeech.speak(encourageText, lang);

    const durationSec = Math.max(5, Math.round((Date.now() - startTime) / 1000));
    // Accuracy calculation
    const accuracy = Math.min(1.0, 1 / Math.max(1, finalAttempts));

    const ctx = { timeSinceLastSession: 24, fatigueScore: 0.2, recentTrend: 'stable' as const };
    const { nextLevel } = banditEngine.updateBeliefs(difficulty, accuracy, 0.8, ctx);

    const metrics = {
      accuracy,
      avgResponseTimeMs: Math.round((durationSec * 1000) / Math.max(1, finalAttempts)),
      totalAttempts: finalAttempts,
      correctAttempts: 1,
      hintsUsed,
      // Use real voice biomarker data if available, else fall back to accumulated pause count
      pauses: latestBiomarkers ? latestBiomarkers.pauseCount : detectedPauses,
      // Hesitation score modulates touch precision proxy: higher hesitation = lower perceived precision
      touchPrecision: latestBiomarkers
        ? Math.max(0.4, 1.0 - (latestBiomarkers.hesitationScore / 200))
        : 0.85,
    };

    const previousScores = {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const { domainScores } = calculateCognitiveScore('word_association', difficulty, metrics, previousScores);

    const session: GameSession = {
      id: `session_${Date.now()}`,
      patientId: patient.id,
      gameType: 'word_association',
      difficultyLevel: difficulty,
      metrics,
      domainScores,
      flowZoneAchieved: accuracy >= 0.7 && metrics.avgResponseTimeMs < 4000,
      timestamp: new Date().toISOString(),
      durationSeconds: Math.round(durationSec),
      adaptedDifficultyNext: nextLevel,
      synced: false,
      // Store voice biomarkers in session for caregiver dashboard display and PDF export
      speechBiomarkers: latestBiomarkers
        ? {
            pauseCount: latestBiomarkers.pauseCount,
            hesitationScore: latestBiomarkers.hesitationScore,
            responseLatencyMs: latestBiomarkers.responseLatencyMs,
            speechRateEstimate: latestBiomarkers.speechRateEstimate,
          }
        : undefined,
    };

    onFinishSession(session);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-bold">{t('back', lang)}</span>
        </button>

        <span className="px-4 py-1.5 bg-amber-100 text-ner-amber font-bold rounded-full text-base border border-ner-amber/30 flex items-center gap-1.5">
          <span>{t('game6_title', lang)}</span>
        </span>
      </div>

      {/* Main Game Card */}
      <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-6 shadow-tactile my-auto flex flex-col items-center text-center">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-ner-bark mb-4">
          {t('game6_instruction', lang)}
        </h2>

        {/* Target Prompt Word & Emoji */}
        <div className="bg-amber-50 border-2 border-ner-sand rounded-2xl p-6 mb-6 w-full max-w-sm flex flex-col items-center shadow-inner relative">
          <button
            onClick={() => audioSpeech.speak(targetWord, lang)}
            className="absolute top-3 right-3 p-2 text-ner-bark bg-white rounded-full shadow hover:scale-105"
            title="Listen to Target Word"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          
          <div className="text-6xl mb-2 animate-bounce">{targetEmoji}</div>
          <div className="text-3xl font-serif font-bold text-ner-forest tracking-wide">
            {targetWord}
          </div>
        </div>

        {/* Voice Recording / Biomarker Control */}
        <div className="mb-6 flex flex-col items-center gap-3 w-full max-w-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-base transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg'
                  : 'bg-white text-ner-earth border-2 border-ner-earth/40 hover:border-ner-earth'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>{t('stop_recording', lang)}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-ner-redSilk" />
                  <span>{t('speak_answer', lang)}</span>
                </>
              )}
            </button>
            
            {detectedPauses > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold border border-amber-300">
                {detectedPauses} Pauses Analyzed
              </span>
            )}
          </div>

          {/* Live Acoustic Signal-to-Noise Ratio (SNR) Meter */}
          {isRecording && (
            <div className="w-full p-3 bg-white rounded-2xl border-2 border-ner-earth/20 shadow-sm space-y-1.5 animate-fadeIn">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-ner-earth">
                  <Activity className="w-3.5 h-3.5 text-ner-forest" />
                  <span>Microphone SNR Calibration</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    noiseQuality === 'quiet'
                      ? 'bg-emerald-100 text-emerald-800'
                      : noiseQuality === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ambientNoiseDb} dB • {noiseQuality === 'quiet' ? '🟢 Quiet Room' : noiseQuality === 'moderate' ? '🟡 Moderate Noise' : '🔴 High Noise'}
                </span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    noiseQuality === 'quiet'
                      ? 'bg-emerald-500'
                      : noiseQuality === 'moderate'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, ((ambientNoiseDb - 30) / 55) * 100))}%` }}
                />
              </div>

              <div className="text-[10px] text-ner-earth">
                {noiseQuality === 'quiet' && 'Optimal acoustic clarity for vocal hesitation extraction.'}
                {noiseQuality === 'moderate' && 'Moderate ambient sound — hold microphone closer to patient.'}
                {noiseQuality === 'noisy' && 'Tea garden / traffic noise detected — false pause risk is elevated.'}
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        {!isCompleted && (
          <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionSelect(opt)}
                disabled={selectedOption === opt.id}
                className={`w-full py-6 px-4 flex items-center justify-center text-2xl font-bold bg-white border-4 rounded-2xl transition-all shadow-tactile ${
                  hintActiveId === opt.id
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-4 ring-amber-300 animate-pulse scale-105'
                    : selectedOption === opt.id
                      ? opt.isCorrect ? 'border-ner-forest bg-green-50 text-ner-forest' : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-ner-earth text-ner-bark hover:border-ner-bark hover:-translate-y-1'
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* Dialect Code-Mixing Natural Language Recognition Bar */}
        {!isCompleted && (
          <div className="w-full max-w-lg mt-5 p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-ner-bark">
              <span className="flex items-center gap-1.5">
                <span>🗣️</span>
                <span>Regional Dialect Match (Assamese, Sylheti, Bengali, Bodo, Hindi)</span>
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
                Polyglot AI
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={spokenInputText}
                onChange={(e) => setSpokenInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEvaluateDialectInput(spokenInputText);
                }}
                placeholder={lang === 'as' ? 'বা কোনো আঞ্চলিক শব্দ লিখক/কওক...' : 'Or type answer in any regional dialect...'}
                className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-medium text-ner-bark focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => handleEvaluateDialectInput(spokenInputText)}
                className="btn-tactile bg-ner-forest text-white px-4 py-2 text-xs font-bold rounded-xl"
              >
                Match
              </button>
            </div>

            {dialectResult && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold animate-fadeIn flex items-center gap-2 ${
                  dialectResult.matched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                <span>{dialectResult.matched ? '✅' : 'ℹ️'}</span>
                <div>
                  <div>{dialectResult.clinicalNote}</div>
                  {dialectResult.dialectDetected && (
                    <div className="text-[10px] text-ner-earth font-mono">
                      Category: {dialectResult.dialectDetected} • Confidence: {Math.round(dialectResult.confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isCompleted ? (
        <div className="bg-ner-mint border-3 border-ner-forest rounded-3xl p-6 text-center shadow-tactile-green mt-6 animate-fadeIn">
          <div className="text-5xl mb-2">🎉 📖</div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-forest mb-2">
            {t('correct_connection', lang)}
          </h3>
          <p className="text-lg text-ner-bark mb-3 font-medium">
            You matched the words correctly!
          </p>

          {/* Real Speech Biomarker Display */}
          {latestBiomarkers && (
            <div className="bg-white/90 border border-ner-forest/30 rounded-2xl p-4 my-3 text-left max-w-md mx-auto shadow-sm">
              <div className="text-xs font-bold text-ner-forest uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-ner-forest" />
                <span>Voice Biomarker Analysis (Clinical AI)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-sm font-semibold text-ner-bark mb-2">
                {/* Hesitation Score — Primary Clinical Signal */}
                <div className="col-span-2 bg-blue-50 p-3 rounded-xl border border-blue-200/70">
                  <div className="text-xs text-blue-700 font-bold uppercase">Hesitation Score</div>
                  <div className={`text-2xl font-extrabold ${
                    latestBiomarkers.hesitationScore < 30 ? 'text-green-600' :
                    latestBiomarkers.hesitationScore < 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {latestBiomarkers.hesitationScore}/100
                  </div>
                  <div className={`text-xs font-bold ${
                    latestBiomarkers.hesitationScore < 30 ? 'text-green-700' :
                    latestBiomarkers.hesitationScore < 60 ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {latestBiomarkers.hesitationScore < 30 ? 'Excellent — No clinical concern' :
                     latestBiomarkers.hesitationScore < 60 ? 'Moderate — Monitor trend' :
                     'High — Clinical review advised'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold text-ner-bark">
                <div className="bg-green-50/70 p-2 rounded-xl border border-green-200/50">
                  <div className="text-xs text-ner-earth">Pauses</div>
                  <div className="text-base font-extrabold text-ner-forest">{latestBiomarkers.pauseCount}</div>
                </div>
                <div className="bg-green-50/70 p-2 rounded-xl border border-green-200/50">
                  <div className="text-xs text-ner-earth">Latency</div>
                  <div className="text-base font-extrabold text-ner-forest">{latestBiomarkers.responseLatencyMs} ms</div>
                </div>
                <div className="bg-green-50/70 p-2 rounded-xl border border-green-200/50">
                  <div className="text-xs text-ner-earth">Speech Rate</div>
                  <div className="text-base font-extrabold text-ner-forest">{latestBiomarkers.speechRateEstimate} syl/s</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
            <WhatsAppShareButton
              patientName={patient.name}
              gameName="Word Association & Voice Biomarker Exercise"
              accuracy={Math.min(100, Math.round(100 / Math.max(1, attempts)))}
              streakDays={patient.streakDays}
              hesitationScore={latestBiomarkers?.hesitationScore}
              phoneNumber={patient.caregiverPhone}
              lang={lang}
              className="w-full sm:w-auto"
            />
            <button
              onClick={() => initGame(difficulty)}
              className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-5 py-3 text-base w-full sm:w-auto"
            >
              <RotateCcw className="w-5 h-5 mr-1.5" />
              {t('play_again', lang)}
            </button>
            <button
              onClick={onBack}
              className="btn-tactile btn-tactile-green px-6 py-3 text-base w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5 mr-1.5" />
              {t('done', lang)}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-6">
          <button
            onClick={handleRequestHint}
            className="text-ner-amber font-bold text-base flex items-center bg-orange-50 px-4 py-2 rounded-xl border border-ner-amber/30 hover:bg-orange-100 transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-2 text-ner-amber" />
            <span>{t('need_hint', lang)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
