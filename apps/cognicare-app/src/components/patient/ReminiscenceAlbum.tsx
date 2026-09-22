import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Music, ChevronLeft, ChevronRight, Pause, Moon, Play, X, Mic } from 'lucide-react';
import { audioSpeech } from '../../services/audioSpeech';
import { LanguageCode } from '../../types';
import { t } from '../../translations';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  lang: LanguageCode;
  onBack: () => void;
}

interface MemoryStory {
  id: string;
  title: string;
  localizedTitle: { [key in LanguageCode]?: string };
  location: string;
  yearContext: string;
  imageUrl: string;
  imageEmoji: string;
  description: { [key in LanguageCode]?: string };
  audioSongTitle: string;
  audioVoiceNoteUrl?: string;
  tags: string[];
}

const MEMORY_STORIES: MemoryStory[] = [
  {
    id: 'majuli_satras',
    title: 'Majuli Island Satra Monasteries',
    localizedTitle: {
      en: 'Majuli Island Satra Monasteries',
      as: 'মাজুলীৰ ঐতিহাসিক সত্ৰ আৰু ব্ৰহ্মপুত্ৰ',
      hi: 'माजुली द्वीप के ऐतिहासिक सत्र',
      bn: 'মাজুলীর ঐতিহাসিক সত্র ও ব্রহ্মপুত্র',
      mni: 'মাজুলীগী পুৱাগী সত্ৰশিং',
      brx: 'माजुलीनि सतवनि सावगारि',
      kha: 'Majuli Island bad ki Satra',
      lus: 'Majuli Thliarkar Satra Biakinte',
      trp: 'Majuli Island ni Satra',
      ne: 'माजुली टापुका ऐतिहासिक सत्रहरू',
    },
    location: 'Majuli, Assam',
    yearContext: 'Autobiographical Heritage',
    imageUrl: '/images/majuli_satra.jpg',
    imageEmoji: '🏞️',
    description: {
      as: 'ব্ৰহ্মপুত্ৰৰ বুকুত মাজুলীৰ কমলাবাৰী সত্ৰ। পুৱাৰ নাম-কীৰ্তন আৰু খোলৰ মাতে মন শান্ত কৰে। আপোনাৰ কি মনত আছে সেই দিনবোৰ?',
      mni: 'মাজুলীদা লৈরিবা পুৱাগী সত্ৰশিং অমসুং ব্ৰহ্মপুত্ৰ ঈশিং। য়াম্না লাইরিক ওইবা অমসুং নুংঙাইবা মতম।',
      brx: 'माजुलीनि सतवनि सावगारि आरो पुंनि बिथांखि।',
      kha: 'Ka jingduwai ba kynjah ha rud wah Brahmaputra ha Majuli Island.',
      lus: 'Brahmaputra luia Majuli thliarkara zing ṭawngṭaina thawm leh boruak nuam tak.',
      trp: 'Brahmaputra twima o Majuli Satra ni phungni rwchapmung.',
      ne: 'ब्रह्मपुत्र नदीको किनारमा माजुलीका ऐतिहासिक सत्र र बिहानीका शान्त धुनहरू।',
      bn: 'মাজুলীর ঐতিহাসিক সত্র ও ব্রহ্মপুত্রের শান্ত সকালের স্মৃতি। ভক্তিগীতি ও খোল-করতালের সুর।',
      hi: 'माजुली द्वीप के ऐतिहासिक सत्र और ब्रह्मपुत्र नदी के शांत किनारे। सुबह के भजन और शांतिपूर्ण वातावरण।',
      en: 'The spiritual morning prayers and serene waters of Majuli Island on the Brahmaputra river. Do you remember these golden days?',
    },
    audioSongTitle: 'Traditional Borgeet & Flute Melody',
    tags: ['Spiritual', 'Brahmaputra', 'Folk Memory'],
  },
  {
    id: 'bihu_celebration',
    title: 'Bohag Bihu Village Festival',
    localizedTitle: {
      en: 'Bohag Bihu Village Festival',
      as: 'ব’হাগ বিহু আৰু পথাৰৰ ঢোল-পেঁপা',
      hi: 'बोहाग बीहू वसंत उत्सव',
      bn: 'বোহাগ বিহু ও লোকউৎসব',
      mni: 'বিহু লমপাকতা শান্নবা জগোই',
      brx: 'बैसागु रंजानाय',
      kha: 'Lehniam Bihu ha Shnong',
      lus: 'Bihu Kut Hlimawm',
      trp: 'Bihu festival kami o',
      ne: 'बोहाग बिहू गाउँले उत्सव',
    },
    location: 'Tezpur / Sivasagar, Assam',
    yearContext: 'Springtime Celebrations',
    imageUrl: '/images/bihu_festival.jpg',
    imageEmoji: '🌾',
    description: {
      as: 'বসন্তৰ বতাহত কপৌ ফুল আৰু নাচনীৰ পদধ্বনি। বিহুৰ পথাৰত নতুন কাপোৰ পিন্ধি গাভৰু-ডেকাৰ বিহু গান।',
      mni: 'বসন্ত মতমগী কুহ্মৈ অমসুং লমপাকতা শান্নবা জগোই। হরাও-তয়াম্বগী মতম।',
      brx: 'बैसागुनि रंजानाय आरो दखना गामसानि मोसानाय।',
      kha: 'Ka lehniam Bihu ha ka por pyrem ryngkat ki jingrwai bad jingshad tynrai.',
      lus: 'Ṭhal lai Bihu kut nuam tak, dhol vuak ri leh zai thawm nen.',
      trp: 'Kothoma rini bwsan, bihu rwchapmung bai mosamung.',
      ne: 'वसन्त ऋतुमा मनाइने बिहू उत्सव, ढोलको ताल र परम्परागत नृत्यहरू।',
      bn: 'বসন্তের রঙে রাঙানো বোহাগ বিহু, লাল গামোছা ও মেখলা চাদর পরে নতুন ফসলের গান।',
      hi: 'बोहाग बीहू का वसंत उत्सव, ढोल की थाप और खेतों में पारंपरिक उल्लास।',
      en: 'The springtime Bohag Bihu festival with orchid flowers, dhol drums, and village folk dances.',
    },
    audioSongTitle: 'Tokari Geet & Bihu Rhythm',
    tags: ['Festival', 'Handloom', 'Joy'],
  },
  {
    id: 'loktak_lake',
    title: 'Loktak Lake & Floating Phumdis',
    localizedTitle: {
      en: 'Loktak Lake & Floating Phumdis',
      as: 'লোকতাক হ্ৰদ আৰু সেন্দুৰীয়া বেলি',
      hi: 'लोकटक झील और तैरते फुमदी',
      bn: 'লোকতাক হ্রদ ও ভাসমান ফুমদি',
      mni: 'লোকতাক পাত অমসুং ফুমদি',
      brx: 'लोकतक बिलोनि सावगारि',
      kha: 'Nan Loktak bad ki Phumdi',
      lus: 'Loktak Dil Mawi',
      trp: 'Loktak twima',
      ne: 'लोकटक ताल र तैरिने फुमदीहरू',
    },
    location: 'Moirang, Manipur',
    yearContext: 'Lakeside Serenity',
    imageUrl: '/images/loktak_lake.jpg',
    imageEmoji: '⛵',
    description: {
      as: 'লোকতাক হ্ৰদৰ পানীত ওপঙি থকা সেউজীয়া ফুমদি আৰু মাছমৰীয়াৰ নাও। গধূলিৰ হেঙুলীয়া আকাশ।',
      mni: 'লোকতাক পাত্তা ফুমদি শান্না য়াওবা অমসুং ঙামীশিংগী নাও। নুমিৎ তাথবা মতমগী ফজবা।',
      brx: 'लोकतक बिलोनि दै आरो ना हमग्रा नानि सावगारि।',
      kha: 'Ka Nan Loktak ba sngur ryngkat ki lieng tongdoh ha ka janmiet.',
      lus: 'Loktak dil mawi tak, sangha man mite leh tlaileng boruak thianghlim.',
      trp: 'Loktak twima o na humani botor.',
      ne: 'मणिपुरको लोकटक तालमा तैरिने प्राकृतिक टापु र डुङ्गाहरूको शान्त दृश्य।',
      bn: 'লোকতাক হ্রদের বুকে ভেসে থাকা সবুজ ফুমদি ও জেলেদের নৌকা। শান্ত গোধূলির আলো।',
      hi: 'लोकटक झील के पानी में तैरते हरे-भरे फुमदी और मछुआरों की शांत नावें।',
      en: 'The peaceful waters of Loktak lake with floating phumdis and fishermen boats at sunset.',
    },
    audioSongTitle: 'Pena String Melody & Water Ripples',
    tags: ['Lake', 'Sunset', 'Manipur'],
  },
  {
    id: 'root_bridges',
    title: 'Living Root Bridges of Cherrapunji',
    localizedTitle: {
      en: 'Living Root Bridges of Cherrapunji',
      as: 'মেঘালয়ৰ জীৱন্ত শিপাৰ দলং',
      hi: 'मेघालय के जीवित जड़ों के पुल',
      bn: 'মেঘালয়ের জীবন্ত শেকড়ের সেতু',
      mni: 'মেঘালায়গী উপালগী মরাগা শাবা থোং',
      brx: 'मेघालयनि बिफांनि रोदा दालां',
      kha: 'Jingkieng Jri ba Im jong ka Sohra',
      lus: 'Thing Zung Lei Nung Cherrapunji',
      trp: 'Meghalaya ni dafalang',
      ne: 'चेरापुन्जीका जीवित जराका पुलहरू',
    },
    location: 'Nongriat, Meghalaya',
    yearContext: 'Rainforest Heritage',
    imageUrl: '/images/root_bridges.jpg',
    imageEmoji: '🌿',
    description: {
      as: 'খাছি পাহাৰৰ ওখ-পানী আৰু গছৰ শিপাৰে গঢ়া দলং। বৰষুণৰ টোপাল আৰু পাহাৰীয়া বতাহৰ পৰশ।',
      mni: 'মেঘালায়গী উপালগী মরাগা শাবা থোং অমসুং নোংচুবা মতম।',
      brx: 'मेघालयनि बिफांनि रोदाजों बानायनाय दालां।',
      kha: 'Ki Jingkieng Jri ba la thaw da ka mariang bad ka buit tynrai ki longshuwa.',
      lus: 'Khasi tlanga thing zung lei mak tak te, ruahtui tla kar a mawi em em.',
      trp: 'Meghalaya haphung o thwng rina dafalang.',
      ne: 'मेघालयको चेरापुन्जीका जीवित जराहरूबाट बनेका प्राकृतिक पुलहरू।',
      bn: 'মেঘালয়ের জীবন্ত শেকড়ের তৈরি সেতু এবং পাহাড়ি বৃষ্টির মিষ্টি গন্ধ।',
      hi: 'मेघालय के चेरापूंजी के जीवित जड़ों के पुल और हल्की बारिश की फुहार।',
      en: 'The ancient living root bridges of the Khasi hills, woven by nature and generational wisdom.',
    },
    audioSongTitle: 'Khasi Bamboo Flute & Rain Sound',
    tags: ['Hills', 'Meghalaya', 'Serenity'],
  },
];

export const ReminiscenceAlbum: React.FC<Props> = ({ lang, onBack }) => {
  const { familyPhotos } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Bedside Storyteller Mode State
  const [isStorytellerActive, setIsStorytellerActive] = useState(false);
  const [storytellerTimer, setStorytellerTimer] = useState(10);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);

  const activeVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const allStories: MemoryStory[] = useMemo(() => {
    const familyStories: MemoryStory[] = (familyPhotos || []).map((f) => ({
      id: f.id,
      title: `${f.personName} (${f.relationship})`,
      localizedTitle: {
        en: `${f.personName} (${f.relationship})`,
        as: `${f.personName} (${f.relationship})`,
        hi: `${f.personName} (${f.relationship})`,
      },
      location: f.yearOrOccasion || 'Family Memory',
      yearContext: 'Autobiographical Heritage',
      imageUrl: f.photoUrl,
      imageEmoji: '❤️',
      audioVoiceNoteUrl: f.audioVoiceNoteUrl,
      description: {
        en: f.notes || `Remembering precious moments with your ${f.relationship}, ${f.personName}.`,
        as: f.notes || `আপোনাৰ মৰমৰ ${f.relationship}, ${f.personName}ৰ লগত কটোৱা স্মৃতি।`,
        hi: f.notes || `आपकी प्यारी ${f.relationship}, ${f.personName} के साथ सुंदर पल।`,
      },
      audioSongTitle: 'Gentle Family Melody & Flute',
      tags: ['Family', f.relationship, 'Love'],
    }));

    return [...familyStories, ...MEMORY_STORIES];
  }, [familyPhotos]);

  const current = allStories[currentIndex] || MEMORY_STORIES[0];

  const handleSpeakStory = () => {
    const text = current.description?.[lang] || current.description?.en || '';
    audioSpeech.speak(text, lang);
  };

  const handlePlayLovedOneVoice = () => {
    if (!current.audioVoiceNoteUrl) return;

    if (isPlayingVoice) {
      if (activeVoiceAudioRef.current) {
        activeVoiceAudioRef.current.pause();
        activeVoiceAudioRef.current = null;
      }
      setIsPlayingVoice(false);
      return;
    }

    const audio = new Audio(current.audioVoiceNoteUrl);
    activeVoiceAudioRef.current = audio;
    setIsPlayingVoice(true);

    audio.play().catch(() => {
      setIsPlayingVoice(false);
      handleSpeakStory();
    });

    audio.onended = () => setIsPlayingVoice(false);
    audio.onerror = () => setIsPlayingVoice(false);
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      audioSpeech.stopSundowningAmbient();
      setIsPlayingMusic(false);
    } else {
      audioSpeech.startSundowningAmbient();
      setIsPlayingMusic(true);
    }
  };

  // Auto-Slideshow for Bedside Storyteller Mode
  useEffect(() => {
    let interval: any = null;
    if (isStorytellerActive && !isSlideshowPaused) {
      interval = setInterval(() => {
        setStorytellerTimer((prev) => {
          if (prev <= 1) {
            // Next story
            setCurrentIndex((idx) => (idx < allStories.length - 1 ? idx + 1 : 0));
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStorytellerActive, isSlideshowPaused, allStories.length]);

  // When story changes in storyteller mode, automatically narrate or play voice
  useEffect(() => {
    if (isStorytellerActive) {
      setStorytellerTimer(10);
      if (current.audioVoiceNoteUrl) {
        const audio = new Audio(current.audioVoiceNoteUrl);
        activeVoiceAudioRef.current = audio;
        setIsPlayingVoice(true);
        audio.play().catch(() => {
          setIsPlayingVoice(false);
          handleSpeakStory();
        });
        audio.onended = () => setIsPlayingVoice(false);
      } else {
        handleSpeakStory();
      }
    }
  }, [currentIndex, isStorytellerActive]);

  const handleEnterStoryteller = () => {
    setIsStorytellerActive(true);
    setIsSlideshowPaused(false);
    setStorytellerTimer(10);
    if (!isPlayingMusic) {
      audioSpeech.startSundowningAmbient();
      setIsPlayingMusic(true);
    }
  };

  const handleExitStoryteller = () => {
    setIsStorytellerActive(false);
    if (activeVoiceAudioRef.current) {
      activeVoiceAudioRef.current.pause();
      activeVoiceAudioRef.current = null;
      setIsPlayingVoice(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <button
            onClick={() => {
              if (isPlayingMusic) audioSpeech.stopSundowningAmbient();
              onBack();
            }}
            className="btn-tactile bg-white text-ner-bark px-4 py-2 text-base md:text-lg border-2 border-ner-bark flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEnterStoryteller}
              className="btn-tactile bg-indigo-900 hover:bg-indigo-950 text-amber-200 border-2 border-amber-400/60 px-4 py-2 text-xs md:text-sm font-bold flex items-center gap-2 shadow-md"
              title={t('bedside_storyteller_subtitle', lang)}
            >
              <Moon className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{t('bedside_storyteller', lang)}</span>
            </button>

            <button
              onClick={toggleMusic}
              className={`btn-tactile px-3.5 py-2 text-xs md:text-sm font-bold flex items-center gap-1.5 ${
                isPlayingMusic
                  ? 'bg-ner-forest text-white border-2 border-ner-moss'
                  : 'bg-white text-ner-forest border-2 border-ner-forest shadow-sm'
              }`}
            >
              {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              <span>{isPlayingMusic ? t('pause_music', lang) : t('play_melody', lang)}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-4 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {t('reminiscence_album', lang)}
          </h2>
          <p className="text-sm md:text-base text-ner-earth font-medium">
            {t('reminiscence_subtitle', lang)}
          </p>
        </div>
      </div>

      {/* Main Memory Storybook View */}
      <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-5 md:p-6 shadow-tactile my-auto max-w-xl mx-auto w-full">
        {/* Real Curated Photographic Visual */}
        <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden border-2 border-amber-200 mb-5 shadow-inner bg-ner-sand/30">
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
          <span className="absolute bottom-3 left-3 text-xs md:text-sm font-bold bg-white/95 text-ner-bark px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            📍 {current.location}
          </span>
          <span className="absolute top-3 right-3 text-[11px] font-bold text-white bg-ner-terracotta/90 px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
            {current.yearContext}
          </span>

          {current.audioVoiceNoteUrl && (
            <span className="absolute top-3 left-3 text-[11px] font-bold text-white bg-emerald-600/90 px-3 py-1 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1">
              <Mic className="w-3 h-3" /> Voice Memo Attached
            </span>
          )}
        </div>

        {/* Title */}
        <div className="mb-3">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-ner-bark mb-1">
            {current.localizedTitle[lang] || current.title}
          </h3>
        </div>

        {/* Narrative Description */}
        <p className="text-base md:text-lg text-ner-bark leading-relaxed font-medium bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 mb-4">
          {current.description[lang] || current.description.en}
        </p>

        {/* Audio Action Buttons */}
        <div className="space-y-2">
          {current.audioVoiceNoteUrl && (
            <button
              onClick={handlePlayLovedOneVoice}
              className="btn-tactile bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 w-full py-3 text-base font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Volume2 className="w-5 h-5 text-amber-200" />
              <span>{isPlayingVoice ? 'Playing Loved One\'s Voice...' : '🎙️ Play Loved One\'s Personal Voice'}</span>
            </button>
          )}

          <button
            onClick={handleSpeakStory}
            className="btn-tactile btn-tactile-earth w-full py-2.5 text-base flex items-center justify-center gap-2"
          >
            <Volume2 className="w-5 h-5 text-ner-gold" />
            <span>{t('listen_story', lang)}</span>
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-6">
        <button
          onClick={() => setCurrentIndex((idx) => (idx > 0 ? idx - 1 : allStories.length - 1))}
          className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-4 py-2 text-sm md:text-base flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="font-bold">{t('previous', lang)}</span>
        </button>

        <span className="text-xs md:text-sm font-bold text-ner-earth">
          {currentIndex + 1} / {allStories.length}
        </span>

        <button
          onClick={() => setCurrentIndex((idx) => (idx < allStories.length - 1 ? idx + 1 : 0))}
          className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-4 py-2 text-sm md:text-base flex items-center"
        >
          <span className="font-bold">{t('next', lang)}</span>
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      {/* FULL-SCREEN BEDSIDE STORYTELLER AMBIENT AUTO-PLAY MODAL */}
      {isStorytellerActive && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col justify-between p-6 md:p-10 animate-fadeIn">
          {/* Storyteller Top Bar */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <h3 className="text-lg md:text-xl font-serif font-bold text-amber-200">
                  {t('bedside_storyteller', lang)}
                </h3>
                <p className="text-xs text-indigo-300">
                  Auto-advancing in {storytellerTimer}s • Relax & listen to fond memories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSlideshowPaused(!isSlideshowPaused)}
                className="px-3 py-1.5 bg-indigo-800/80 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-500/40"
              >
                {isSlideshowPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isSlideshowPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleExitStoryteller}
                className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-400"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('exit_storyteller', lang)}</span>
              </button>
            </div>
          </div>

          {/* Centerpiece Photographic Stage */}
          <div className="max-w-2xl mx-auto w-full my-auto space-y-6 text-center">
            <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-amber-300/40 shadow-2xl bg-black/40">
              <img
                src={current.imageUrl}
                alt={current.title}
                className="w-full h-full object-cover rounded-3xl animate-fadeIn"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-xs font-bold bg-amber-400/90 text-slate-950 px-3 py-1 rounded-full shadow-sm">
                  {current.location}
                </span>
                <h4 className="text-2xl md:text-3xl font-serif font-bold text-white mt-2">
                  {current.localizedTitle[lang] || current.title}
                </h4>
              </div>
            </div>

            {/* Spoken Memory Text */}
            <p className="text-lg md:text-xl text-amber-100 font-serif leading-relaxed px-4 max-w-xl mx-auto drop-shadow-md">
              "{current.description[lang] || current.description.en}"
            </p>

            {/* Voice Memo Status Indicator */}
            {current.audioVoiceNoteUrl && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-300 animate-pulse">
                <Volume2 className="w-4 h-4" />
                <span>Playing Family Member's Recorded Voice</span>
              </div>
            )}
          </div>

          {/* Storyteller Bottom Controls */}
          <div className="max-w-xl mx-auto w-full flex items-center justify-between pt-4 border-t border-indigo-800/40">
            <button
              onClick={() => setCurrentIndex((idx) => (idx > 0 ? idx - 1 : allStories.length - 1))}
              className="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-indigo-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('previous', lang)}</span>
            </button>

            {/* Countdown Progress Bar */}
            <div className="w-48 h-2 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800/60 mx-4">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-1000"
                style={{ width: `${(storytellerTimer / 10) * 100}%` }}
              />
            </div>

            <button
              onClick={() => setCurrentIndex((idx) => (idx < allStories.length - 1 ? idx + 1 : 0))}
              className="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-indigo-700"
            >
              <span>{t('next', lang)}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
