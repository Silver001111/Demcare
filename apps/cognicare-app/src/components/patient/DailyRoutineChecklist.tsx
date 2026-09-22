import React from 'react';
import { Check, Clock, CalendarCheck2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { LanguageCode, getLocalizedText } from '../../types';
import { audioSpeech } from '../../services/audioSpeech';

interface Props {
  lang: LanguageCode;
}

export const DailyRoutineChecklist: React.FC<Props> = ({ lang }) => {
  const { dailyRoutine, toggleDailyRoutineItem } = useAppStore();

  const completedCount = dailyRoutine.filter((r) => r.completed).length;
  const totalCount = dailyRoutine.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleDailyRoutineItem(id);
    if (!currentlyCompleted) {
      audioSpeech.playGentleChime('success');
    } else {
      audioSpeech.playGentleChime('tap');
    }
  };

  return (
    <div className="bg-white border-2 border-sky-100 rounded-3xl p-5 md:p-6 shadow-card-warm transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-sky-200 shrink-0">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {lang === 'as' ? 'দৈনিক সুস্থ অভ্যাস (Daily Rhythm)' : lang === 'hi' ? 'दैनिक स्वस्थ दिनचर्या' : 'Daily Routine & Rhythm'}
              </h3>
              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                {completedCount}/{totalCount} {lang === 'as' ? 'সম্পূৰ্ণ' : 'Done'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {lang === 'as'
                ? 'নিয়মিত দিনচৰ্য্যাই স্মৃতিশক্তি সতেজ আৰু মন শান্ত কৰি ৰাখে।'
                : lang === 'hi'
                ? 'नियमित दिनचर्या मस्तिष्क को शांत और याददाश्त को मजबूत रखती है।'
                : 'Consistent daily routines reduce disorientation and cognitive anxiety.'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-44">
          <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>{lang === 'as' ? 'আজিৰ অগ্ৰগতি' : 'Today'}</span>
            <span className="text-sky-700 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {dailyRoutine.map((item) => {
          const isDone = item.completed;
          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id, isDone)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 select-none ${
                isDone
                  ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-sky-300 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {getLocalizedText(item.title, lang)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.defaultTime}</span>
                  </div>
                </div>
              </div>

              {/* Checkmark Button */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                    : 'bg-white border-slate-300 text-transparent hover:border-sky-400'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
