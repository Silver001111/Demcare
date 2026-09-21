import React, { useState } from 'react';
import { ArrowLeft, Volume2, Music, ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { audioSpeech } from '../../services/audioSpeech';
import { LanguageCode } from '../../types';
import { t } from '../../translations';

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
      hi: 'लोकतक झील और तैरते फुमदी',
      bn: 'লোকতাক হ্রদ ও ভাসমান ফুংদী',
      mni: 'লোকতাক পাত অমসুং ফুমদীশিং',
      brx: 'लोकताक बिलोनि सावगारि',
      kha: 'Pung Loktak bad ki Phumdi',
      lus: 'Loktak Dil leh Phumdi',
      trp: 'Loktak Lake twima',
      ne: 'लोकतक ताल र तैरिने फुमदीहरू',
    },
    location: 'Moirang, Manipur',
    yearContext: 'Natural Wonder',
    imageUrl: '/images/loktak_lake.jpg',
    imageEmoji: '🪷',
    description: {
      as: 'মণিপুৰৰ লোকতাক হ্ৰদৰ ফুংদী আৰু মাছমৰীয়াৰ নাও। শান্ত পানীত বেলি লহিওৱা দৃশ্যই মন ভৰাই তোলে।',
      mni: 'লোকতাক পাতকী ফুমদীশিং অমসুং নুমিদাংগী মঙাল। ইশিংদা ইচাও তৌরিবা নুংঙাইবগী মতম।',
      brx: 'लोकताक बिलोनि सावगारि आरो दानि बिलो।',
      kha: 'Ki khasiat itynnad jong ka Pung Loktak bad ka sngi ba shong janmiet.',
      lus: 'Manipur rama Loktak dil mawi tak, tlaikhawhnufim eng mawi tak hnuai a.',
      trp: 'Loktak twima ni kaham rwchabmung.',
      ne: 'मणिपुरको प्रसिद्ध लोकतक ताल र तैरिने फुमदीहरूको मनोरम दृश्य।',
      bn: 'লোকতাক হ্রদের ভাসমান ফুংদী ও শান্ত গোধূলির সুরভিত স্মৃতি।',
      hi: 'मणिपुर की प्रसिद्ध लोकतक झील और तैरते हुए फुमदी। शाम का सुखद नजारा।',
      en: 'The gentle floating islands of Loktak Lake in Manipur, reflecting the peaceful evening sun.',
    },
    audioSongTitle: 'Manipuri Pena Folk Tune',
    tags: ['Lake', 'Manipur', 'Peace'],
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const current = MEMORY_STORIES[currentIndex];

  const handleSpeakStory = () => {
    const text = current.description[lang] || current.description.en || '';
    audioSpeech.speak(text, lang);
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

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (isPlayingMusic) audioSpeech.stopSundowningAmbient();
              onBack();
            }}
            className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMusic}
              className={`btn-tactile px-4 py-2.5 text-base flex items-center gap-2 ${
                isPlayingMusic
                  ? 'bg-ner-forest text-white border-2 border-ner-moss'
                  : 'bg-white text-ner-forest border-2 border-ner-forest shadow-sm'
              }`}
            >
              {isPlayingMusic ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              <span>{isPlayingMusic ? t('pause_music', lang) : t('play_melody', lang)}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mb-4 shadow-card-warm gamosa-border">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {t('reminiscence_album', lang)}
          </h2>
          <p className="text-lg text-ner-earth font-medium">
            {t('reminiscence_subtitle', lang)}
          </p>
        </div>
      </div>

      {/* Main Memory Storybook View */}
      <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-6 shadow-tactile my-auto max-w-xl mx-auto w-full">
        {/* Real Curated Photographic Visual */}
        <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden border-2 border-amber-200 mb-5 shadow-inner bg-ner-sand/30">
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover rounded-2xl transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
          <span className="absolute bottom-3 left-3 text-sm font-bold bg-white/95 text-ner-bark px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-sm">
            📍 {current.location}
          </span>
          <span className="absolute top-3 right-3 text-xs font-bold text-white bg-ner-terracotta/90 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
            {current.yearContext}
          </span>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark mb-1">
            {current.localizedTitle[lang] || current.title}
          </h3>
        </div>

        {/* Narrative Description */}
        <p className="text-lg text-ner-bark leading-relaxed font-medium bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 mb-4">
          {current.description[lang] || current.description.en}
        </p>

        {/* Audio Narration Trigger Button */}
        <button
          onClick={handleSpeakStory}
          className="btn-tactile btn-tactile-earth w-full py-3 text-lg flex items-center justify-center gap-2 mb-2"
        >
          <Volume2 className="w-6 h-6 text-ner-gold" />
          <span>{t('listen_story', lang)}</span>
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-white border-2 border-ner-earth/20 rounded-2xl p-4 mt-6">
        <button
          onClick={() => setCurrentIndex((idx) => (idx > 0 ? idx - 1 : MEMORY_STORIES.length - 1))}
          className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-5 py-2.5 text-base flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t('previous', lang)}
        </button>

        <div className="flex items-center gap-2">
          {MEMORY_STORIES.map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-ner-terracotta scale-125' : 'bg-ner-sand'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((idx) => (idx < MEMORY_STORIES.length - 1 ? idx + 1 : 0))}
          className="btn-tactile btn-tactile-amber px-5 py-2.5 text-base flex items-center"
        >
          {t('next', lang)}
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};
