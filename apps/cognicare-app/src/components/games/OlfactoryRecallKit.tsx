import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, HeartHandshake, Eye, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioSpeech } from '../../services/audioSpeech';
import { calculateCognitiveScore } from '../../services/aiEngine';
import { LanguageCode, GameSession, PatientProfile } from '../../types';
import { t } from '../../translations';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
  onFinishSession: (session: GameSession) => void;
}

interface ScentZone {
  zoneNumber: number;
  name: { [key in LanguageCode]?: string } & { en: string };
  scentProfile: string;
  targetBrainRegion: string;
  correctOptionId: string;
  options: {
    id: string;
    label: { [key in LanguageCode]?: string } & { en: string };
    emoji: string;
    imageUrl?: string;
  }[];
}

const AROMA_ZONES: ScentZone[] = [
  {
    zoneNumber: 1,
    name: {
      en: 'Mustard Oil (Xoriyohor Tel)',
      as: 'সৰিয়হৰ তেল',
      bn: 'সর্ষের তেল',
      hi: 'सरसों का तेल',
      brx: 'सोरसि थाव',
      mni: 'হঙাম থাউ',
      ne: 'तोरीको तेल',
    },
    scentProfile: 'Pungent cold-pressed Kachi Ghani mustard oil',
    targetBrainRegion: 'Trigeminal & Olfactory Bulb',
    correctOptionId: 'mustard_oil',
    options: [
      { id: 'mustard_oil', label: { en: 'Mustard Oil', as: 'সৰিয়হৰ তেল', bn: 'সর্ষের তেল', hi: 'सरसों का तेल', brx: 'सोरसि थाव', mni: 'হঙাম থাউ', ne: 'तोरीको तेल' }, emoji: '🟡' },
      { id: 'coconut_oil', label: { en: 'Coconut Oil', as: 'নাৰিকলৰ তেল', bn: 'নারকেল তেল', hi: 'नारियल तेल', brx: 'नारिखल थाव', mni: 'য়োবী থাউ', ne: 'नरिवल तेल' }, emoji: '🥥' },
      { id: 'lemon_water', label: { en: 'Lemon Grass', as: 'নেমু পাত', bn: 'লেবু পাতা', hi: 'नींबू पत्ता', brx: 'नेबु बिलाइ', mni: 'চম্প্রা মনা', ne: 'कागतीको पात' }, emoji: '🍋' },
      { id: 'chili', label: { en: 'Red Chili', as: 'ৰঙা জলকীয়া', bn: 'লাল মরিচ', hi: 'लाल मिर्च', brx: 'गोजा फानलु', mni: 'মরোক ঙাংবা', ne: 'रातो खुर्सानी' }, emoji: '🌶️' },
    ],
  },
  {
    zoneNumber: 2,
    name: {
      en: 'Fresh Ginger (Ada)',
      as: 'আদা',
      bn: 'আদা',
      hi: 'अदरक',
      brx: 'हाजिं',
      mni: 'শিং',
      ne: 'अदुवा',
    },
    scentProfile: 'Zesty crushed ginger rhizome from village kitchen',
    targetBrainRegion: 'Entorhinal Sensory Cortex (Pre-Symptomatic Tau Target)',
    correctOptionId: 'ginger',
    options: [
      { id: 'ginger', label: { en: 'Fresh Ginger', as: 'কেঁচা আদা', bn: 'কাঁচা আদা', hi: 'ताज़ा अदरक', brx: 'हाजिं', mni: 'শিং', ne: 'ताजा अदुवा' }, emoji: '🫚' },
      { id: 'garlic', label: { en: 'Garlic', as: 'নহৰু', bn: 'রসুন', hi: 'लहसुन', brx: 'रसुन', mni: 'চনম', ne: 'लसुन' }, emoji: '🧄' },
      { id: 'onion', label: { en: 'Onion', as: 'পিয়াঁজ', bn: 'পেঁয়াজ', hi: 'प्याज', brx: 'फियाज', mni: 'তিলহৌ', ne: 'प्याज' }, emoji: '🧅' },
      { id: 'potato', label: { en: 'Potato', as: 'আলু', bn: 'আলু', hi: 'आलू', brx: 'थालिर', mni: 'আলু', ne: 'आलु' }, emoji: '🥔' },
    ],
  },
  {
    zoneNumber: 3,
    name: {
      en: 'Temple Camphor (Karpur)',
      as: 'কপূৰ (নামঘৰ)',
      bn: 'কর্পূর',
      hi: 'कपूर',
      brx: 'खर्फुर',
      mni: 'কাপুর',
      ne: 'कपूर',
    },
    scentProfile: 'Aromatic pure camphor used in Namghar prayer ceremonies',
    targetBrainRegion: 'Hippocampal Episodic Associative Memory',
    correctOptionId: 'camphor',
    options: [
      { id: 'camphor', label: { en: 'Temple Camphor', as: 'নামঘৰৰ কপূৰ', bn: 'পূজার কর্পূর', hi: 'मंदिर का कपूर', brx: 'खर्फुर', mni: 'কাপুর', ne: 'मन्दिरको कपूर' }, emoji: '🪔' },
      { id: 'incense', label: { en: 'Flowers', as: 'ফুল', bn: 'ফুল', hi: 'फूल', brx: 'बिबार', mni: 'লৈ', ne: 'फूल' }, emoji: '🌸' },
      { id: 'kerosene', label: { en: 'Kerosene', as: 'কেৰাচিন তেল', bn: 'কেরোসিন', hi: 'मिट्टी का तेल', brx: 'केरासिन थाव', mni: 'কেরোসিন থাউ', ne: 'मट्टितेल' }, emoji: '⛽' },
      { id: 'soap', label: { en: 'Bathing Soap', as: 'গা-ধোৱা চাবোন', bn: 'সাবান', hi: 'साबुन', brx: 'साबोन', mni: 'শাবোন', ne: 'नुहाउने साबुन' }, emoji: '🧼' },
    ],
  },
  {
    zoneNumber: 4,
    name: {
      en: 'Green Cardamom (Elachi)',
      as: 'ইলাচি',
      bn: 'এলাচ',
      hi: 'इलायची',
      brx: 'एलाइसि',
      mni: 'এলাইচী',
      ne: 'सुकमेल',
    },
    scentProfile: 'Crushed sweet green cardamom pod used in Assam tea & sweet pitha',
    targetBrainRegion: 'Temporal Lobe Semantic Retrieval',
    correctOptionId: 'cardamom',
    options: [
      { id: 'cardamom', label: { en: 'Cardamom', as: 'ইলাচি', bn: 'এলাচ', hi: 'इलायची', brx: 'एलाइसि', mni: 'এলাইচী', ne: 'सुकमेल' }, emoji: '🌿' },
      { id: 'cloves', label: { en: 'Cloves', as: 'লং', bn: 'লবঙ্গ', hi: 'लौंग', brx: 'लं', mni: 'লুৱাং', ne: 'ल्वाङ' }, emoji: '🪵' },
      { id: 'cinnamon', label: { en: 'Cinnamon', as: 'দালচেনি', bn: 'দারুচিনি', hi: 'दालचीनी', brx: 'दालसिनि', mni: 'উশিং', ne: 'दालचिनी' }, emoji: '🍂' },
      { id: 'coriander', label: { en: 'Coriander', as: 'ধনীয়া পাত', bn: 'ধনে পাতা', hi: 'धनिया', brx: 'धनिया बिलाइ', mni: 'ফৌওবা মনা', ne: 'धनिया' }, emoji: '🌱' },
    ],
  },
  {
    zoneNumber: 5,
    name: {
      en: 'Assam Black Tea Leaves (Chah Pat)',
      as: 'চাহ পাত',
      bn: 'চা পাতা',
      hi: 'चाय की पत्ती',
      brx: 'साहा बिलाइ',
      mni: 'চা মনা',
      ne: 'चियाको पात',
    },
    scentProfile: 'Fresh fragrant CTC black tea leaves from Assam tea gardens',
    targetBrainRegion: 'Limbic System & Affective Nostalgia Circuit',
    correctOptionId: 'tea_leaves',
    options: [
      { id: 'tea_leaves', label: { en: 'Assam Tea Leaves', as: 'চাহ পাত', bn: 'চা পাতা', hi: 'असम चाय पत्ती', brx: 'साहा बिलाइ', mni: 'চা মনা', ne: 'चियाको पात' }, emoji: '🍃' },
      { id: 'coffee', label: { en: 'Coffee Beans', as: 'কফি', bn: 'কফি', hi: 'कॉफी', brx: 'कफि', mni: 'কফি', ne: 'कफी' }, emoji: '☕' },
      { id: 'tobacco', label: { en: 'Dried Leaves', as: 'শুকান পাত', bn: 'শুকনো পাতা', hi: 'सूखे पत्ते', brx: 'गोरान बिलाइ', mni: 'অকংবা মনা', ne: 'सुकेका पात' }, emoji: '🍂' },
      { id: 'betel', label: { en: 'Betel Nut (Tamul)', as: 'তামোল-পাণ', bn: 'সুপারি-পান', hi: 'सुपारी-पान', brx: 'गोइ-फात', mni: 'কুৱা-পানা', ne: 'सुपारी-पान' }, emoji: '🥥' },
    ],
  },
];

export const OlfactoryRecallKit: React.FC<Props> = ({
  patient,
  lang,
  onBack,
  onFinishSession,
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0 to 4
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isScratched, setIsScratched] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [isComplete, setIsComplete] = useState(false);

  const activeZone = AROMA_ZONES[currentStep];

  const getZonePrompt = (zone: ScentZone) => {
    if (lang === 'as') {
      return `অনুগ্ৰহ কৰি আপোনাৰ কাৰ্ডৰ ${zone.zoneNumber} নম্বৰ স্থানত আঁচোৰ মাৰক, সুবাস লওক আৰু সঠিক ছবিখন স্পৰ্শ কৰক।`;
    } else if (lang === 'bn') {
      return `অনুগ্রহ করে আপনার কার্ডের ${zone.zoneNumber} নম্বর ঘরে ঘষা দিন, গন্ধ নিন এবং সঠিক ছবিটি স্পর্শ করুন।`;
    } else if (lang === 'hi') {
      return `कृपया अपने कार्ड के जोन ${zone.zoneNumber} पर खुरचें, खुशबू लें और सही तस्वीर को छुएं।`;
    } else if (lang === 'brx') {
      return `अननानै नोंथांनि कार्दनि जोन ${zone.zoneNumber} आव खुरसि, मोदोमनाय लायो आरो थार सावगारिखौ दां।`;
    } else if (lang === 'mni') {
      return `চানবীদুনা নহাক্কী কার্দকী জোন ${zone.zoneNumber}দা খুৎ য়েৎউ, মনম লৌ অমসুং অচুম্বা শক্তম অদু থমল্লু।`;
    } else if (lang === 'kha') {
      return `Sngewbha thoh ha Zone ${zone.zoneNumber} jong ka kot, iw ia ka bad ktah ia ka dur kaba dei.`;
    } else if (lang === 'lus') {
      return `Khawngaihin Zone ${zone.zoneNumber}-ah thai la, a rim hria la, a thlalak dik tak chu tawk rawh.`;
    } else if (lang === 'trp') {
      return `Nini card ni Zone ${zone.zoneNumber} o khursidi, mwthwng naikhe rwh tei thik photo chuwngdi.`;
    } else if (lang === 'ne') {
      return `कृपया आफ्नो कार्डको जोन ${zone.zoneNumber} मा कोर्नुहोस्, सुगन्ध लिनुहोस् र सही तस्बिर छुनुहोस्।`;
    }
    return `Please scratch Zone ${zone.zoneNumber} on your physical scent card, smell it, and touch the picture that matches the aroma.`;
  };

  useEffect(() => {
    audioSpeech.speak(getZonePrompt(AROMA_ZONES[currentStep]), lang);
  }, [currentStep, lang]);

  const handleSelectOption = (optionId: string) => {
    const updated = { ...selectedAnswers, [currentStep]: optionId };
    setSelectedAnswers(updated);
    audioSpeech.playGentleChime('tap');

    if (currentStep < AROMA_ZONES.length - 1) {
      setTimeout(() => {
        setIsScratched(false);
        setCurrentStep((prev) => prev + 1);
      }, 500);
    } else {
      setTimeout(() => {
        finishAssessment(updated);
      }, 600);
    }
  };

  const finishAssessment = (finalAnswers: Record<number, string>) => {
    setIsComplete(true);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    let correctCount = 0;
    AROMA_ZONES.forEach((zone, idx) => {
      if (finalAnswers[idx] === zone.correctOptionId) {
        correctCount++;
      }
    });

    const hriScore = Math.round((correctCount / AROMA_ZONES.length) * 100);
    const preSymptomaticRisk: 'normal' | 'low_risk' | 'sensory_mci_risk' =
      hriScore >= 80 ? 'normal' : hriScore >= 60 ? 'low_risk' : 'sensory_mci_risk';

    const durationSec = Math.max(12, Math.round((Date.now() - startTime) / 1000));

    const previousScores = patient.domainScores || {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const metrics = {
      accuracy: hriScore / 100,
      avgResponseTimeMs: Math.round((durationSec * 1000) / 5),
      totalAttempts: 5,
      correctAttempts: correctCount,
      hintsUsed: 0,
      pauses: 0,
      touchPrecision: 0.9,
    };

    const { domainScores } = calculateCognitiveScore('olfactory_recall', 3, metrics, previousScores);

    const session: GameSession = {
      id: `session_olfactory_${Date.now()}`,
      patientId: patient.id,
      gameType: 'olfactory_recall',
      difficultyLevel: 3,
      metrics,
      domainScores,
      flowZoneAchieved: hriScore >= 80,
      timestamp: new Date().toISOString(),
      durationSeconds: durationSec,
      adaptedDifficultyNext: hriScore >= 80 ? 4 : 2,
      synced: false,
      olfactoryMetrics: {
        hriScore,
        scentsIdentified: correctCount,
        preSymptomaticRisk,
      },
    };

    onFinishSession(session);

    const finishMsg = lang === 'brx'
      ? `मोदोमनाय आनजादा आबुं जाबाय! नोंथाङा 5 नि गेजेराव ${correctCount} ता मोदोमनायखौ थारै सिनिबाय।`
      : lang === 'as'
      ? `সুগন্ধি পৰীক্ষা সম্পূৰ্ণ হ’ল! আপুনি ৫টাৰ ভিতৰত ${correctCount}টা সুবাস সঠিকভাৱে চিনি পালে।`
      : lang === 'hi'
      ? `सुगंध परीक्षण पूरा हुआ! आपने 5 में से ${correctCount} सुगंधों की सही पहचान की।`
      : `Olfactory sensory recall complete! ${correctCount} of 5 regional scents recognized accurately.`;
    audioSpeech.speak(finishMsg, lang);
  };

  let correctTotal = 0;
  if (isComplete) {
    AROMA_ZONES.forEach((zone, idx) => {
      if (selectedAnswers[idx] === zone.correctOptionId) correctTotal++;
    });
  }
  const finalHriScore = Math.round((correctTotal / AROMA_ZONES.length) * 100);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between font-sans animate-fadeIn">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <span className="px-4 py-1.5 bg-amber-100 text-amber-900 font-bold rounded-full text-base border border-amber-300 flex items-center gap-1.5 shadow-sm">
            <span>👃 {t('game8_title', lang)}</span>
          </span>
        </div>

        {/* Clinical Info Banner */}
        <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-4 md:p-5 shadow-card-warm mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-ner-amber uppercase tracking-wider">
              {lang === 'brx' ? 'सिगांनि मोदोमनाय आनजाद (Doty UPSIT)' : lang === 'as' ? 'প্ৰাক-লক্ষণ সংবেদনশীল বায়’মাৰ্কাৰ (Doty UPSIT)' : lang === 'hi' ? 'प्रारंभिक संवेदी बायोमार्कर (Doty UPSIT)' : 'Pre-Symptomatic Sensory MCI Biomarker (Doty UPSIT Protocol)'}
            </div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-ner-bark mt-0.5">
              {getZonePrompt(activeZone)}
            </h2>
          </div>
          <button
            onClick={() => audioSpeech.speak(getZonePrompt(activeZone), lang)}
            className="p-3 bg-ner-gold text-ner-bark rounded-2xl shadow hover:scale-105 shrink-0"
            title="Listen to Instruction"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {!isComplete ? (
        <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-6 shadow-tactile my-auto max-w-xl mx-auto w-full text-center space-y-5">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-ner-earth border-b pb-3">
            <span>
              {lang === 'brx' ? `मोदोमनाय जोन ${currentStep + 1} / 5` : lang === 'as' ? `সুগন্ধি স্থান ${currentStep + 1} / ৫` : lang === 'hi' ? `सुगंध जोन ${currentStep + 1} / 5` : `Scent Zone ${currentStep + 1} of 5`}
            </span>
            <span className="text-ner-forest">{activeZone.targetBrainRegion}</span>
          </div>

          {/* Scent Scratch Zone Card Representation */}
          <div
            onClick={() => {
              setIsScratched(true);
              audioSpeech.playGentleChime('tap');
            }}
            className={`p-6 rounded-3xl border-3 cursor-pointer transition-all shadow-inner relative overflow-hidden ${
              isScratched
                ? 'bg-amber-100/70 border-amber-500 scale-102'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-dashed border-amber-300 hover:border-amber-400'
            }`}
          >
            <div className="text-5xl mb-2 animate-bounce">
              {isScratched ? '✨ 👃' : '🎴'}
            </div>
            <h3 className="text-2xl font-serif font-bold text-ner-bark">
              {lang === 'brx' ? 'जोन' : lang === 'as' ? 'স্থান' : lang === 'hi' ? 'जोन' : 'Zone'} {activeZone.zoneNumber}: {activeZone.name[lang] || activeZone.name.en}
            </h3>
            <p className="text-xs text-ner-earth mt-1">
              {isScratched
                ? (lang === 'brx' ? `मोदोमनाय ओंखारबाय: ${activeZone.name[lang] || activeZone.name.en}` : lang === 'as' ? `সুবাস ওলাইছে: ${activeZone.name[lang] || activeZone.name.en}` : `Aroma released: ${activeZone.scentProfile}`)
                : (lang === 'brx' ? 'मोदोमनाय लानो थाखाय कार्दखौ दां' : lang === 'as' ? 'সুবাস লবলৈ কাৰ্ডখন স্পৰ্শ কৰক' : lang === 'hi' ? 'सुगंध के लिए कार्ड पर टैप करें' : 'Tap to simulate scratch-and-sniff release on your physical card')}
            </p>
          </div>

          {/* 4 Cultural Photo Options */}
          <div className="space-y-2 text-left">
            <div className="text-xs font-bold text-ner-bark uppercase">
              {lang === 'brx' ? 'नोंथांनि मोदोमनायजों बबे सावगारिया गोरोबो?' : lang === 'as' ? 'আপুনি পোৱা সুবাসৰ লগত কোনখন ছবি মেলে?' : lang === 'hi' ? 'आपको आ रही खुशबू से कौन सा चित्र मेल खाता है?' : 'Which image matches the aroma you smell?'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activeZone.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className="p-4 bg-ner-sand/30 hover:bg-amber-100/60 border-2 border-ner-earth/30 rounded-2xl flex flex-col items-center text-center gap-1.5 transition-all hover:scale-103 active:scale-95 shadow-sm"
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-sm font-bold text-ner-bark">
                    {opt.label[lang] || opt.label.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="bg-white border-3 border-ner-forest rounded-3xl p-6 shadow-2xl my-auto max-w-xl mx-auto w-full text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl mx-auto flex items-center justify-center text-3xl border-2 border-emerald-300 shadow-inner">
            <Award className="w-8 h-8 text-ner-forest" />
          </div>

          <h3 className="text-2xl font-serif font-bold text-ner-bark">
            {lang === 'brx' ? 'मोदोमनाय सिनिनाय स्कोर (HRI)' : lang === 'as' ? 'হাইপ’স্মিয়া চিনাক্তকৰণ সূচক (HRI)' : lang === 'hi' ? 'घ्राण पहचान सूचकांक (HRI)' : 'Hyposmia Recognition Index (HRI)'}: {finalHriScore}%
          </h3>
          <p className="text-sm text-ner-earth">
            {lang === 'brx' ? `5 मोदोमनायनि गेजेराव ${correctTotal} ता मोदोमनायखौ थारै सिनिबाय।` : lang === 'as' ? `৫টাৰ ভিতৰত ${correctTotal}টা সুবাস সঠিকভাৱে চিনাক্ত কৰা হৈছে।` : lang === 'hi' ? `5 में से ${correctTotal} सुगंधों की सही पहचान की गई।` : `${correctTotal} out of 5 North-East regional aromas identified correctly.`}
          </p>

          <div
            className={`p-4 rounded-2xl border-2 text-left text-xs space-y-1 ${
              finalHriScore >= 80
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : finalHriScore >= 60
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <div className="font-bold text-sm">
              {finalHriScore >= 80
                ? (lang === 'brx' ? '🟢 थासारि 0: मोजां मोदोमनाय गोहो' : lang === 'as' ? '🟢 পৰ্যায় ০: স্বাভাৱিক সুগন্ধি সংবেদন' : lang === 'hi' ? '🟢 चरण 0: सामान्य घ्राण क्षमता' : '🟢 Phase 0: Normal Intact Olfactory Pathway')
                : finalHriScore >= 60
                ? (lang === 'brx' ? '🟡 एसेल\' खम मोदोमनाय' : lang === 'as' ? '🟡 মৃদু সংবেদনশীল হ্ৰাস' : lang === 'hi' ? '🟡 हल्का संवेदी विचलन' : '🟡 Mild Sensory Hypo-responsiveness')
                : (lang === 'brx' ? '🔴 सिगांनि MCI सांग्रांथि' : lang === 'as' ? '🔴 প্ৰাক-লক্ষণ সংবেদনশীল MCI সতৰ্কতা' : lang === 'hi' ? '🔴 प्रारंभिक संवेदी MCI जोखिम' : '🔴 Pre-Symptomatic Sensory MCI Risk (Phase -1)')}
            </div>
            <p className="leading-relaxed">
              {finalHriScore >= 80
                ? 'Entorhinal cortex and hippocampal projection pathways intact. High olfactory episodic memory reserve.'
                : 'Olfactory decline observed. Clinical trials confirm early dietary omega-3 and cognitive stimulation protects memory reserve years before episodic amnesia.'}
            </p>
          </div>

          <button
            onClick={onBack}
            className="btn-tactile bg-ner-forest hover:bg-green-700 text-white w-full py-3.5 text-base font-bold rounded-xl"
          >
            {lang === 'brx' ? 'आनजाद आबुं जाबाय & थांफिन' : lang === 'as' ? 'পৰীক্ষা সম্পূৰ্ণ কৰক আৰু উভতি যাওক' : lang === 'hi' ? 'मूल्यांकन पूरा करें और वापस जाएं' : 'Complete Assessment & Return'}
          </button>
        </div>
      )}

      {/* Footer Branding */}
      <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-3 text-center text-xs font-semibold text-ner-earth mt-4">
        🌿 CogniCare NER — Olfactory Pre-Symptomatic Biomarker (AIIMS & LGBRIMH Research Protocol)
      </div>
    </div>
  );
};
