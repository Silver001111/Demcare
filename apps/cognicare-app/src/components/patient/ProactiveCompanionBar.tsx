import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, HeartHandshake, Calendar, Play } from 'lucide-react';
import { audioSpeech } from '../../services/audioSpeech';
import { PatientProfile, LanguageCode, ReminderItem, getLocalizedText } from '../../types';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  reminders: ReminderItem[];
  onStartRecommendedGame?: () => void;
}

export const ProactiveCompanionBar: React.FC<Props> = ({
  patient,
  lang,
  reminders,
  onStartRecommendedGame,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Determine time of day greeting
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const patientName = patient.localizedName?.[lang] || patient.name.split(' ')[0];

  // Find next upcoming pending reminder
  const nextReminder = reminders.find((r) => !r.completed);

  // Generate localized conversational message
  let greetingGreeting = '';
  let reminderSentence = '';

  if (lang === 'as') {
    greetingGreeting = timeOfDay === 'morning'
      ? `শুভ প্ৰভাত, ${patientName} বাইদেউ!`
      : timeOfDay === 'afternoon'
      ? `শুভ দুপৰীয়া, ${patientName} বাইদেউ!`
      : `শুভ সন্ধ্যা, ${patientName} বাইদেউ!`;

    reminderSentence = nextReminder
      ? `মনত পেলাই দিছোঁ: আপোনাৰ পৰৱৰ্তী ${getLocalizedText(nextReminder.title, 'as')} ${nextReminder.time} বজাত আছে।`
      : 'আজিৰ সকলো ঔষধ আৰু প্ৰয়োজনীয় কাম সময়মতে সম্পূৰ্ণ হৈছে!';
  } else if (lang === 'hi') {
    greetingGreeting = timeOfDay === 'morning'
      ? `शुभ प्रभात, ${patientName} जी!`
      : timeOfDay === 'afternoon'
      ? `शुभ दोपहर, ${patientName} जी!`
      : `शुभ संध्या, ${patientName} जी!`;

    reminderSentence = nextReminder
      ? `याद दिला दें: आपकी अगली ${getLocalizedText(nextReminder.title, 'hi')} का समय ${nextReminder.time} है।`
      : 'आज की सभी दवाएं और दिनचर्या समय पर पूरी हो चुकी हैं!';
  } else {
    greetingGreeting = timeOfDay === 'morning'
      ? `Good morning, ${patientName}!`
      : timeOfDay === 'afternoon'
      ? `Good afternoon, ${patientName}!`
      : `Good evening, ${patientName}!`;

    reminderSentence = nextReminder
      ? `Your next reminder for ${getLocalizedText(nextReminder.title, 'en')} is scheduled at ${nextReminder.time}.`
      : 'All your medications and daily tasks are nicely on track today!';
  }

  const encouragement = lang === 'as'
    ? 'আপুনি আজি অতি সতেজ আৰু সুস্থ অনুভৱ কৰিছে নে? আহক আমি স্মৃতিৰ অনুশীলন আৰম্ভ কৰোঁ।'
    : lang === 'hi'
    ? 'क्या आप आज तरोताज़ा महसूस कर रहे हैं? चलिए आज का हल्का मस्तिष्क व्यायाम करते हैं।'
    : 'Feeling fresh today? Let’s take care of your memory with a joyful morning workout.';

  const fullSpokenPrompt = `${greetingGreeting} ${reminderSentence} ${encouragement}`;

  const handleSpeak = () => {
    if (isSpeaking) {
      audioSpeech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    audioSpeech.speak(fullSpokenPrompt, lang);
    // Rough estimate for speech duration
    const words = fullSpokenPrompt.split(' ').length;
    setTimeout(() => setIsSpeaking(false), Math.max(3000, words * 400));
  };

  return (
    <div className="bg-gradient-to-r from-sky-50 via-white to-emerald-50 border-2 border-sky-200/90 rounded-3xl p-4 md:p-5 shadow-card-warm relative overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Companion Avatar & Text */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-300 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-3xl">
                🤖
              </div>
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" />
                {lang === 'as' ? 'বন্ধু এআই সহায়ক' : lang === 'hi' ? 'मित्र एआई साथी' : 'Friendly AI Companion'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-snug">
              {greetingGreeting}
            </h3>

            <p className="text-xs md:text-sm text-slate-700 mt-1 font-medium leading-relaxed max-w-2xl">
              <span className="text-sky-800 font-semibold">{reminderSentence}</span>{' '}
              <span className="text-slate-500 hidden sm:inline">{encouragement}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            onClick={handleSpeak}
            className={`btn-tactile px-4 py-2.5 rounded-2xl text-sm flex items-center gap-2 transition-all ${
              isSpeaking
                ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-md'
                : 'bg-white text-sky-800 border-2 border-sky-300 hover:bg-sky-50'
            }`}
            title="Listen to Assistant Greeting"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-5 h-5 text-white" />
                <span className="font-bold">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-sky-600" />
                <span className="font-bold">{lang === 'as' ? 'শুনি লওক' : lang === 'hi' ? 'सुनिए' : 'Listen'}</span>
              </>
            )}
          </button>

          {onStartRecommendedGame && (
            <button
              onClick={onStartRecommendedGame}
              className="btn-tactile bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700 px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{lang === 'as' ? 'স্মৃতি খেল' : lang === 'hi' ? 'खेलें' : 'Play Game'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
