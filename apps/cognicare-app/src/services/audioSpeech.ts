import { LanguageCode } from '../types';

class AudioSpeechService {
  private audioCtx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isPlayingAmbient = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Speaks text using Web Speech API with regional accent configuration
   */
  public speak(text: string, lang: LanguageCode = 'as'): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported on this browser.');
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any previous speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88; // Slower cadence for elderly comprehension
      utterance.pitch = 1.05; // Friendly, warm pitch

      const langMap: { [key in LanguageCode]: string } = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        mni: 'mni-IN',
        brx: 'hi-IN',
        kha: 'en-IN',
        lus: 'en-IN',
        trp: 'bn-IN',
        ne: 'ne-NP',
        en: 'en-IN',
      };

      utterance.lang = langMap[lang] || 'en-IN';

      // Find best available voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2))) ||
                           voices.find(v => v.lang.includes('IN')) ||
                           voices[0];
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Plays a pleasant bamboo flute / temple chime chime on success or action
   */
  public playGentleChime(type: 'success' | 'tap' | 'gentle_alert' = 'success') {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'success') {
        // Pentatonic peaceful chime (E5 -> G#5 -> B5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.35);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'tap') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'gentle_alert') {
        // Soft Tibetan singing bowl chime (Low warm fundamental)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(216.0, now);
        osc.frequency.exponentialRampToValueAtTime(215.0, now + 1.2);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        osc.start(now);
        osc.stop(now + 1.5);
      }
    } catch {
      // Graceful fallback for non-user gesture restrictions
    }
  }

  /**
   * Generates continuous relaxing ambient soundscape using Web Audio API
   */
  public startSundowningAmbient() {
    if (this.isPlayingAmbient) return;

    try {
      const ctx = this.getAudioContext();
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.5);
      this.ambientGain.connect(ctx.destination);

      // Warm oscillating chord (C3 - G3 - E4 pentatonic harmony)
      const freqs = [130.81, 196.00, 329.63];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Gentle vibrato LFO
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 0.2 Hz slow breath
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(this.ambientGain!);
        osc.start();
      });

      this.isPlayingAmbient = true;
    } catch (e) {
      console.warn('Ambient soundscape could not start:', e);
    }
  }

  public stopSundowningAmbient() {
    if (this.ambientGain && this.audioCtx && this.isPlayingAmbient) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.0);
      setTimeout(() => {
        this.isPlayingAmbient = false;
      }, 1000);
    }
  }
}

export const audioSpeech = new AudioSpeechService();

/**
 * Localized voice prompts and translations
 */
export const LOCALIZED_STRINGS: Record<string, Record<LanguageCode, string>> = {
  welcome: {
    en: 'Welcome back. Let us exercise our memory with joy today.',
    as: 'নমস্কাৰ, আপুনি কেনে আছে? আহক আজি স্মৃতি খেল খেলোঁ।',
    mni: 'খুরুমজরি, অদোম কয়া তৌরিগে? লাউ স্মৃতি শান্নসি।',
    brx: 'खुलुमबाय, नोंथांआ माबोरै दं? फै मेमोरी गेलेनाय गेलेदिनि।',
    kha: 'Khublei, kumno phi long? Ban lehkai jingkynmaw mynta ka sngi.',
    lus: 'Chibai, i dam em? Vawiin chu rilru sawizawi nan khel ang aw.',
    trp: 'Khulumkha, nung kaham de? Tini bwsani khela kheldi.',
    ne: 'नमस्ते! तपाईं कस्तो हुनुहुन्छ? आउनुहोस् आज स्मरण अभ्यास गरौँ।',
    bn: 'নমস্কার, আপনি কেমন আছেন? আসুন আজ ব্রেন গেম খেলি।',
    hi: 'नमस्ते! आप कैसे हैं? आइए आज दिमाग की कसरत का खेल खेलें।',
  },
  cardMatchIntro: {
    en: 'Match the traditional textile patterns. Flip two cards to find pairs.',
    as: 'গামোচা আৰু বস্ত্ৰৰ ছবিবোৰ মিলাওক। দুখন একে ছবি বিচাৰক।',
    mni: 'ইনাফি অমসুং ফিগী ময়েকশিং চান্নহন্নবা শান্নসি।',
    brx: 'गामसा आरो दखनानि सावगारिखौ गोरोबहो।',
    kha: 'Pyniah ia ki dur jain Khasi bad Gamosa.',
    lus: 'Puan tah mawi tak te a inmil zawng rawh.',
    trp: 'Risa bai Gamosa ni khorok milai di.',
    ne: 'परम्परागत कपडाका ढाँचाहरू मिलाउनुहोस्। दुई समान कार्ड पत्ता लगाउनुहोस्।',
    bn: 'গামোছা ও পোশাকের ছবিগুলি মিলিয়ে জোড়া খুঁজুন।',
    hi: 'गमोसा और पारंपरिक शॉल के जोड़े खोजिए। कार्ड पलटें।',
  },
  rhythmRecallIntro: {
    en: 'Listen to the folk rhythms carefully, then tap in the exact sequence.',
    as: 'বিহু ঢোল আৰু বাদ্যৰ তাল শুনক আৰু একে অনুক্ৰমত স্পৰ্শ কৰক।',
    mni: 'পুং অমসুং তানগী খোন্থোক তারগা তুংইন্নসি।',
    brx: 'दामनाय आरो बांशि खौ खोनासं आरो गेले।',
    kha: 'Sngap ia ka sur rimawi bad pyntreikam ryngkat.',
    lus: 'Rimawi rim ngaithla la, a dawt zelin hmet rawh.',
    trp: 'Rwchapmung khnadi tei khorok khe dandi.',
    ne: 'लोक धुनहरू ध्यान दिएर सुन्नुहोस्, र सोही क्रममा थिच्नुहोस्।',
    bn: 'বিহুর ঢোল ও বাদ্যযন্ত্রের ছন্দ মনে রেখে পুনরাবৃত্তি করুন।',
    hi: 'बीहू ढोल और वाद्य यंत्रों की लय सुनिए और उसी क्रम में दोहराइए।',
  },
  routineSortIntro: {
    en: 'Arrange the daily activities from morning until evening.',
    as: 'দিনটোৰ কামবোৰ পুৱাৰ পৰা গধূলিলৈ সঠিক ক্ৰমত সজাওক।',
    mni: 'নোংমগী থবকশিং অয়ুকতগী নুমিদাং ফাওবা ক্রমান্বয়ে থমসি।',
    brx: 'सानफ्रोमबोनि खामानिफोरखौ फुंनिफ्राय बेलासिनिसिम फारि खालाम।',
    kha: 'Buh ryntih ia ki kam step haduh janmiet.',
    lus: 'Zing aṭanga tlaia thil tih turte indawtin rem rawh.',
    trp: 'Phungni simi sanja thuk samungrok khorok khe tongdi.',
    ne: 'दैनिक कामहरू बिहानदेखि साँझसम्मको क्रममा मिलाउनुहोस्।',
    bn: 'সারাদিনের কাজগুলি সকাল থেকে সন্ধ্যা অবধি সঠিক ক্রমে সাজান।',
    hi: 'दिन की गतिविधियों को सुबह से शाम तक सही क्रम में लगाएं।',
  },
  encouragement: {
    en: 'Wonderful! You did that with great grace!',
    as: 'বৰ ধুনীয়া! আপুনি বহুত ভাল খেলিছে!',
    mni: 'য়াম্না ফরে! অদোম য়াম্না ফনা শান্নরে!',
    brx: 'जोबोत मोजां! नोंथांआ जोबोत मोजां गेलेबाय!',
    kha: 'Bha shibun! Phi la leh bha bha!',
    lus: 'A va ṭha em! I ti ṭha lutuk e!',
    trp: 'Bwbelai kaham! Nung kubun khe kheldi!',
    ne: 'धेरै राम्रो! तपाईंले धेरै राम्रो खेल्नुभयो!',
    bn: 'চমৎকার! আপনি খুব সুন্দর খেলেছেন!',
    hi: 'बहुत बढ़िया! आपने बहुत अच्छा खेला!',
  },
  medReminder: {
    en: 'It is time for your medicine. Please drink a glass of water.',
    as: 'ঔষধ খোৱাৰ সময় হ’ল। পানী এগিলাচ খাবলৈ নাপাহৰিব।',
    mni: 'হিদাক চাবগী মতম ওইরে। ঈশিং থকনবা কাওগনু।',
    brx: 'औषध जानायनि सम जाबाय। दै लोंनो दाबाव।',
    kha: 'Por dih dawai la poi. Sngewbha dih shi khuri ka um.',
    lus: 'Damdawi ei a hun ta. Tui in theihnghilh suh aw.',
    trp: 'Sam nungnani sal paikha. Twi nungnani khapla di.',
    ne: 'औषधि खाने समय भयो। कृपया एक गिलास पानी पनि पिउनुहोस्।',
    bn: 'ওষুধ খাওয়ার সময় হয়েছে। এক গ্লাস জল খেতে ভুলবেন না।',
    hi: 'दवाई लेने का समय हो गया है। कृपया पानी भी अवश्य पिएं।',
  },
};
