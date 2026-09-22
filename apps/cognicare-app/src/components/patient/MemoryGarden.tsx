import React, { useState } from 'react';
import { Sparkles, Droplets, Volume2, Award, Info, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { LanguageCode } from '../../types';
import { audioSpeech } from '../../services/audioSpeech';

interface Props {
  lang: LanguageCode;
}

interface PlantSpec {
  key: string;
  name: { [key in LanguageCode]?: string } | string;
  botanicalName: string;
  icon: string;
  color: string;
  bloomedEmoji: string;
  unlockedAt: number; // minimum streak or bloomed count
  description: { [key in LanguageCode]?: string } | string;
}

const REGIONAL_PLANTS: PlantSpec[] = [
  {
    key: 'kopou_orchid',
    name: {
      en: 'Kopou Orchid (Foxtail)',
      as: 'কপৌ ফুল (বিহুৰ প্ৰাণ)',
      hi: 'कपौ ऑर्किड (असम)',
      bn: 'কপৌ অর্কিড',
    },
    botanicalName: 'Rhynchostylis retusa',
    icon: '🌸',
    color: 'from-pink-400 to-rose-500',
    bloomedEmoji: '🌺',
    unlockedAt: 0,
    description: {
      en: 'Sacred Bihu flower of love and longevity.',
      as: 'বিহুৰ পৱিত্ৰ কপৌ ফুল, আয়ু আৰু আনন্দৰ প্ৰতীক।',
      hi: 'असम के बिहू का पवित्र वसंत पुष्प।',
      bn: 'অসমের পবিত্র কপৌ ফুল।',
    },
  },
  {
    key: 'brahmaputra_lotus',
    name: {
      en: 'Brahmaputra Pink Lotus',
      as: 'ব্ৰহ্মপুত্ৰৰ পদুম ফুল',
      hi: 'ब्रह्मपुत्र कमल',
      bn: 'ব্রহ্মপুত্রের পদ্মফুল',
    },
    botanicalName: 'Nelumbo nucifera',
    icon: '🪷',
    color: 'from-fuchsia-400 to-pink-600',
    bloomedEmoji: '🪷',
    unlockedAt: 2,
    description: {
      en: 'Represents mental calm, focus, and serenity.',
      as: 'মন শান্ত আৰু স্থিৰ ৰখাৰ পৱিত্ৰ পদুম।',
      hi: 'मानसिक शांति और एकाग्रता का प्रतीक।',
      bn: 'মানসিক শান্তি ও স্থিরতার প্রতীক।',
    },
  },
  {
    key: 'assam_tea',
    name: {
      en: 'Emerald Assam Tea Bush',
      as: 'অসমৰ সেউজীয়া চাহ গছ',
      hi: 'असम की हरी चाय की पत्तियां',
      bn: 'অসমের সবুজ চা পাতা',
    },
    botanicalName: 'Camellia sinensis var. assamica',
    icon: '🍃',
    color: 'from-emerald-400 to-green-600',
    bloomedEmoji: '🍵',
    unlockedAt: 3,
    description: {
      en: 'Fresh vibrant leaves symbolizing daily vitality.',
      as: 'প্ৰতিদিনে পুৱাৰ সতেজতা আৰু স্বাস্থ্যৰ চিন।',
      hi: 'दैनिक ताजगी और स्फूर्ति की प्रतीक हरी पत्तियां।',
      bn: 'প্রতিদিনের সতেজতা ও স্বাস্থ্যের প্রতীক।',
    },
  },
  {
    key: 'marigold',
    name: {
      en: 'Golden Assam Marigold',
      as: 'সোণালী গেন্ধা ফুল',
      hi: 'सुनहरा गेंदा फूल',
      bn: 'সোনালী গাঁদা ফুল',
    },
    botanicalName: 'Tagetes erecta',
    icon: '🌼',
    color: 'from-amber-400 to-orange-500',
    bloomedEmoji: '🌻',
    unlockedAt: 5,
    description: {
      en: 'Bright golden blossoms that cheer the heart.',
      as: 'চোতাল পোহৰাই ৰখা সোণালী ফুল।',
      hi: 'उत्साह और प्रसन्नता बिखेरने वाले सुनहरे फूल।',
      bn: 'মন প্রফুল্ল করা সোনালী গাঁদা ফুল।',
    },
  },
];

export const MemoryGarden: React.FC<Props> = ({ lang }) => {
  const { gardenState, waterGarden } = useAppStore();
  const [selectedPlant, setSelectedPlant] = useState<PlantSpec | null>(null);
  const [isWatering, setIsWatering] = useState(false);

  const getLocalized = (textObj: any): string => {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[lang] || textObj.en || textObj.as || Object.values(textObj)[0] || '';
  };

  const handleWater = () => {
    if (isWatering) return;
    setIsWatering(true);
    waterGarden();
    audioSpeech.playGentleChime('success');

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38BDF8', '#60A5FA', '#34D399', '#F472B6'],
    });

    const affirmation = lang === 'as'
      ? 'আপোনাৰ মৰমে বাগিচাখন সতেজ কৰি তুলিলে!'
      : lang === 'hi'
      ? 'आपकी देखभाल से बगिया खिल उठी!'
      : 'Your care made your memory garden bloom!';
    audioSpeech.speak(affirmation, lang);

    setTimeout(() => setIsWatering(false), 1200);
  };

  const handlePlantClick = (plant: PlantSpec) => {
    setSelectedPlant(plant);
    audioSpeech.playGentleChime('tap');
    const plantName = getLocalized(plant.name);
    const plantDesc = getLocalized(plant.description);
    audioSpeech.speak(`${plantName}. ${plantDesc}`, lang);
  };

  const totalBloomed = gardenState.flowersBloomed;
  const totalGrown = gardenState.flowersGrown;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-sky-50 to-teal-50 border-2 border-emerald-200/80 rounded-3xl p-5 md:p-6 shadow-card-warm relative overflow-hidden transition-all hover:shadow-xl">
      {/* Decorative Floating Butterfly */}
      <div className="absolute top-3 right-4 text-2xl select-none animate-butterfly pointer-events-none opacity-85">
        🦋
      </div>

      {/* Header & Garden Milestones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-200 shrink-0">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-800">
                {lang === 'as' ? 'স্মৃতি বাগিচা (Memory Garden)' : lang === 'hi' ? 'स्मृति बगिया (Memory Garden)' : 'Memory Garden'}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {lang === 'as' ? 'সজীৱ' : 'Alive & Blooming'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              {lang === 'as'
                ? 'খেল সম্পূৰ্ণ কৰিলে কলি গজে, ঔষধ আৰু অভ্যাস মানিলে ফুল ফুলে!'
                : lang === 'hi'
                ? 'खेल पूरा करने पर कली खिलती है, दवा लेने पर फूल मुस्कुराते हैं!'
                : 'Every game sprouts a bud, every reminder blooms a fragrant flower!'}
            </p>
          </div>
        </div>

        {/* 1-Tap Water Button */}
        <button
          onClick={handleWater}
          disabled={isWatering}
          className={`btn-tactile bg-white text-sky-700 border-2 border-sky-300 px-4 py-2 text-sm flex items-center gap-2 hover:bg-sky-50 transition-all shrink-0 ${
            isWatering ? 'scale-95 opacity-80' : ''
          }`}
          title="Water Garden"
        >
          <Droplets className={`w-5 h-5 text-sky-500 ${isWatering ? 'animate-bounce' : ''}`} />
          <span className="font-bold">
            {lang === 'as' ? 'পানী দিয়ক' : lang === 'hi' ? 'पानी दें' : 'Water Garden'}
          </span>
        </button>
      </div>

      {/* Garden Stats Strip */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
        <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-2xl p-2.5 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'as' ? 'ফুল ফুলিল' : 'Bloomed'}
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif text-emerald-700 flex items-center justify-center gap-1">
            <span>🌺</span>
            <span>{totalBloomed}</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-2xl p-2.5 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'as' ? 'কলি গজিছে' : 'Buds Growing'}
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif text-sky-700 flex items-center justify-center gap-1">
            <span>🌱</span>
            <span>{totalGrown}</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-2xl p-2.5 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'as' ? 'আনলক গছ' : 'Plants'}
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif text-amber-700 flex items-center justify-center gap-1">
            <span>🏆</span>
            <span>{gardenState.plantsUnlocked.length}</span>
          </div>
        </div>
      </div>

      {/* Visual Garden Bed / Terrace */}
      <div className="bg-gradient-to-b from-sky-100/70 via-emerald-100/60 to-emerald-200/80 rounded-2xl p-4 md:p-6 border border-emerald-200 shadow-inner relative min-h-[160px] flex items-end justify-around">
        {/* Sky Clouds / Sunlight Aura */}
        <div className="absolute top-2 left-6 text-sm opacity-60">☁️</div>
        <div className="absolute top-4 right-12 text-sm opacity-60">☀️</div>

        {/* Plants Lineup */}
        {REGIONAL_PLANTS.map((plant, idx) => {
          const isUnlocked = gardenState.plantsUnlocked.includes(plant.key) || totalBloomed >= plant.unlockedAt;
          const isBloomed = totalBloomed > idx;

          return (
            <div
              key={plant.key}
              onClick={() => isUnlocked && handlePlantClick(plant)}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 group ${
                isUnlocked ? 'hover:scale-110 active:scale-95' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              {/* Plant / Flower Visual */}
              <div className="relative flex flex-col items-center">
                {isUnlocked && (
                  <div className="animate-sway">
                    <span className="text-4xl md:text-5xl drop-shadow-md select-none">
                      {isBloomed ? plant.bloomedEmoji : plant.icon}
                    </span>
                  </div>
                )}
                {!isUnlocked && (
                  <div className="text-3xl text-slate-400">
                    🔒
                  </div>
                )}
                {/* Pot / Earth Base */}
                <div className="w-12 h-6 md:w-14 md:h-7 bg-amber-800/80 rounded-b-xl border-t-2 border-amber-950 shadow-md mt-1 flex items-center justify-center text-[10px] text-amber-100 font-bold">
                  {isUnlocked ? '🪴' : '🌱'}
                </div>
              </div>

              {/* Plant Name Label */}
              <span className="text-[11px] md:text-xs font-bold text-slate-800 mt-1.5 text-center max-w-[80px] truncate">
                {getLocalized(plant.name)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected Plant Detail Modal / Toast */}
      {selectedPlant && (
        <div className="mt-4 p-4 bg-white/95 rounded-2xl border-2 border-emerald-300 shadow-md flex items-start justify-between gap-3 animate-slideUp">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{selectedPlant.bloomedEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif font-bold text-slate-900 text-base">
                  {getLocalized(selectedPlant.name)}
                </h4>
                <span className="text-[11px] text-slate-500 italic">({selectedPlant.botanicalName})</span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                {getLocalized(selectedPlant.description)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPlant(null)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
