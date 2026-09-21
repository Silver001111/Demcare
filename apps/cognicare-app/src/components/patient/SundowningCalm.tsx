import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Volume2, ShieldCheck, SunDim } from 'lucide-react';
import { audioSpeech } from '../../services/audioSpeech';
import { LanguageCode, PatientProfile } from '../../types';
import { t } from '../../translations';
import { CircadianLuxMeter } from './CircadianLuxMeter';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
}

export const SundowningCalm: React.FC<Props> = ({ patient, lang, onBack }) => {
  const [isPlayingSoundscape, setIsPlayingSoundscape] = useState(true);

  useEffect(() => {
    // Automatically start calming ambient bamboo soundscape
    audioSpeech.startSundowningAmbient();
    setIsPlayingSoundscape(true);

    const reassurance = `${patient.localizedName?.[lang] || patient.name}. ${t('resting_safely', lang)}`;
    audioSpeech.speak(reassurance, lang);

    return () => {
      audioSpeech.stopSundowningAmbient();
    };
  }, []);

  const toggleSoundscape = () => {
    if (isPlayingSoundscape) {
      audioSpeech.stopSundowningAmbient();
      setIsPlayingSoundscape(false);
    } else {
      audioSpeech.startSundowningAmbient();
      setIsPlayingSoundscape(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-gradient-to-b from-[#3E2723] via-[#4E342E] to-[#2E1C14] text-white min-h-[85vh] flex flex-col justify-between rounded-3xl shadow-2xl font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              audioSpeech.stopSundowningAmbient();
              onBack();
            }}
            className="btn-tactile bg-ner-earth text-white px-5 py-2.5 text-lg border-2 border-amber-600/50 flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-4 py-1.5 bg-amber-500/20 text-amber-300 font-bold rounded-full text-sm border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
              <SunDim className="w-4 h-4 text-amber-400" />
              <span>{t('dusk_calm_banner', lang)}</span>
            </span>
          </div>
        </div>

        {/* Reassurance Banner */}
        <div className="bg-amber-950/60 border-2 border-amber-600/40 rounded-3xl p-5 mb-6 text-center shadow-lg backdrop-blur-sm">
          <Moon className="w-12 h-12 text-amber-300 mx-auto mb-2 animate-gentle-pulse" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-200 mb-1">
            {t('you_are_safe', lang)}
          </h2>
          <p className="text-base text-amber-100/90 font-medium">
            {t('dusk_calm_sub', lang)}
          </p>
        </div>
      </div>

      {/* Circadian Ambient Lux Meter & Photometric Light Therapy */}
      <div className="mb-6">
        <CircadianLuxMeter lang={lang} />
      </div>

      {/* Center Comforting Family & Reassurance Card */}
      <div className="bg-white/10 border-2 border-amber-500/30 rounded-3xl p-6 text-center my-auto max-w-lg mx-auto w-full backdrop-blur-md shadow-tactile">
        <div className="w-24 h-24 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-300/40 shadow-inner">
          <span className="text-5xl">🏡</span>
        </div>

        <h3 className="text-2xl font-serif font-bold text-amber-100 mb-2">
          {patient.localizedName?.[lang] || patient.name}
        </h3>
        <p className="text-amber-200/90 text-lg mb-6 leading-relaxed font-serif">
          {t('resting_safely', lang)}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              const msg = t('resting_safely', lang);
              audioSpeech.speak(msg, lang);
            }}
            className="btn-tactile bg-amber-600 hover:bg-amber-500 text-white w-full py-3.5 text-lg font-bold border-2 border-amber-400 flex items-center justify-center gap-2 shadow-md"
          >
            <Volume2 className="w-6 h-6 text-amber-200" />
            <span>{t('listen_reassurance', lang)}</span>
          </button>

          <button
            onClick={toggleSoundscape}
            className={`w-full py-3 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 shadow-sm ${
              isPlayingSoundscape
                ? 'bg-emerald-800/60 text-emerald-200 border-emerald-500/50'
                : 'bg-white/10 text-amber-200 border-amber-500/30 hover:bg-white/20'
            }`}
          >
            <span className="text-xl">🎋</span>
            <span>{isPlayingSoundscape ? t('pause_music', lang) : t('play_melody', lang)}</span>
          </button>
        </div>
      </div>

      {/* Bottom Emergency Reassurance */}
      <div className="bg-amber-950/40 border border-amber-700/30 rounded-2xl p-4 text-center text-sm text-amber-200/80 mt-4">
        <div className="flex items-center justify-center gap-2 font-semibold">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{t('family_guardian_label', lang)} {patient.localizedCaregiverName?.[lang] || patient.caregiverName} ({patient.caregiverPhone})</span>
        </div>
      </div>
    </div>
  );
};
