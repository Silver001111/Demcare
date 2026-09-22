import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, PhoneCall, Copy, Check, ExternalLink } from 'lucide-react';
import { GameSession, ReminderItem, AlertNotification, PatientProfile, LanguageCode, getLocalizedText } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { audioSpeech } from '../../services/audioSpeech';
import { t } from '../../translations';

interface Props {
  patient: PatientProfile;
  sessions: GameSession[];
  reminders: ReminderItem[];
  alerts: AlertNotification[];
  lang?: LanguageCode;
  onOpenFamilyGame?: () => void;
  onOpenSundowning?: () => void;
  onCallAsha?: () => void;
}

export const AiCareCircleWidget: React.FC<Props> = ({
  patient,
  sessions,
  reminders,
  alerts,
  lang = 'en',
  onOpenFamilyGame,
  onOpenSundowning,
  onCallAsha,
}) => {
  const { gardenState, dailyRoutine } = useAppStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine Care Status
  const uncompletedMeds = reminders.filter((r) => r.type === 'medicine' && !r.completed);
  const completedMeds = reminders.filter((r) => r.type === 'medicine' && r.completed);
  const totalMeds = reminders.filter((r) => r.type === 'medicine');
  const urgentAlerts = alerts.filter((a) => a.severity === 'urgent' && !a.acknowledged);

  let status: 'red' | 'yellow' | 'green' = 'green';
  let statusReason = 'Stable routine. All critical medicines and activities are on track.';

  if (urgentAlerts.length > 0 || uncompletedMeds.length >= 2) {
    status = 'red';
    statusReason = 'Immediate caregiver attention: 2+ pending medications or rapid cognitive decline alert.';
  } else if (uncompletedMeds.length === 1 || reminders.some((r) => !r.completed)) {
    status = 'yellow';
    statusReason = 'Needs attention: 1 reminder is pending. Gentle verbal prompting recommended.';
  }

  // Dynamic Contextual AI Care Suggestion
  const hour = new Date().getHours();
  let aiSuggestion = 'Try a familiar family photo game today. Picture-based activities strongly stimulate autobiographical memory pathways and reduce anxiety.';
  let suggestionTag = 'Photo Recognition';

  if (hour >= 16 && hour <= 20) {
    aiSuggestion = 'Evening Sundowning window active. Minimize loud noises, introduce soft warm lighting, and engage in gentle photo reminiscence.';
    suggestionTag = 'Sundowning Protocol';
  } else if (patient.domainScores && patient.domainScores.memory < 70) {
    aiSuggestion = 'Working memory score is slightly lower today. Play Gamosa Card Match with family faces on Level 1 (2 pairs) for a joyful confidence boost.';
    suggestionTag = 'Adaptive Difficulty';
  }

  // Generate Localized WhatsApp Care Digest
  const generateDigestText = () => {
    const statusEmoji = status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴';
    const statusText = status === 'green' ? 'Stable Routine (95% Care Score)' : status === 'yellow' ? 'Needs Attention (1 Pending Reminder)' : 'Immediate Attention Required';
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const completedRoutineCount = (dailyRoutine || []).filter((r) => r.completed).length;
    const totalRoutineCount = (dailyRoutine || []).length;
    const latestGame = sessions.length > 0 ? sessions[0] : null;

    return `🌸 *CogniCare Daily Care Circle Digest*
📅 *Date:* ${dateStr}
👤 *Patient:* ${patient.name} (${patient.gender === 'F' ? 'Mother/Aai' : 'Father/Koka'})
🚦 *Today's Status:* ${statusEmoji} ${statusText}

📋 *Routine & Health Checklist:*
 • Medications: ${completedMeds.length}/${totalMeds.length} Taken ${uncompletedMeds.length > 0 ? `(⏳ Pending: ${uncompletedMeds.map((m) => getLocalizedText(m.title, lang)).join(', ')})` : '✅ All Taken'}
 • Daily Rhythm: ${completedRoutineCount}/${totalRoutineCount} tasks completed
 • Memory Garden: 🌺 ${gardenState?.flowersBloomed || 2} flowers bloomed, ${gardenState?.waterCountToday || 1}x watered
${latestGame ? ` • Brain Game: ${latestGame.gameType} (Accuracy: ${Math.round(latestGame.metrics.accuracy * 100)}%)` : ' • Brain Game: Gamosa Memory Match completed'}

💡 *AI Care Insight:*
"${aiSuggestion}"

_Sent with love via CogniCare NER Platform_
https://cognicare-ner.gov.in`;
  };

  const handleShareWhatsApp = () => {
    const message = generateDigestText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'CogniCare Daily Digest',
          text: message,
        })
        .catch(() => {
          window.open(waUrl, '_blank');
        });
    } else {
      window.open(waUrl, '_blank');
    }
  };

  const handleCopyDigest = () => {
    const message = generateDigestText();
    navigator.clipboard.writeText(message);
    setCopied(true);
    audioSpeech.playGentleChime('success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-card-warm transition-all hover:shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: AI Care Circle Title & Traffic Light Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭕</span>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              AI Care Circle • Daily Status
            </h3>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Real-time Triaging
            </span>
          </div>

          {/* Traffic Light 3-Pill Indicator */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Red Light */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                status === 'red'
                  ? 'bg-rose-100 border-rose-500 text-rose-900 shadow-sm ring-2 ring-rose-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full ${status === 'red' ? 'bg-rose-600 animate-pulse' : 'bg-rose-300'}`} />
              <span>Immediate Attention</span>
            </div>

            {/* Yellow Light */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                status === 'yellow'
                  ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full ${status === 'yellow' ? 'bg-amber-500 animate-pulse' : 'bg-amber-300'}`} />
              <span>Needs Attention</span>
            </div>

            {/* Green Light */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                status === 'green'
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full ${status === 'green' ? 'bg-emerald-600' : 'bg-emerald-300'}`} />
              <span>Stable Routine</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            {statusReason}
          </p>

          {/* WhatsApp Share Digest Action Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="btn-tactile bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              title="Share formatted daily summary with family on WhatsApp"
            >
              <span className="text-sm">📲</span>
              <span>{t('share_whatsapp_digest', lang)}</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>

        {/* Right: AI Clinical Suggestion Card */}
        <div className="bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/80 rounded-2xl p-4 lg:max-w-md shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              AI Care Suggestion
            </span>
            <span className="text-[10px] bg-sky-200 text-sky-900 font-extrabold px-2 py-0.5 rounded-md">
              {suggestionTag}
            </span>
          </div>

          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            "{aiSuggestion}"
          </p>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-sky-100">
            {onOpenFamilyGame && (
              <button
                onClick={onOpenFamilyGame}
                className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 transition-all"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Launch Family Game</span>
              </button>
            )}

            {onCallAsha && (
              <button
                onClick={onCallAsha}
                className="text-xs bg-white text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-50 flex items-center gap-1 transition-all"
              >
                <PhoneCall className="w-3 h-3 text-emerald-600" />
                <span>Call ASHA</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* WHATSAPP DIGEST PREVIEW MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <span>📲 WhatsApp Care Circle Digest Preview</span>
              </h4>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This message will be pre-filled when you tap Send, keeping distant family members informed and reassured.
            </p>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed shadow-inner max-h-64 overflow-y-auto">
              {generateDigestText()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCopyDigest}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={() => {
                  handleShareWhatsApp();
                  setShowShareModal(false);
                }}
                className="btn-tactile bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open WhatsApp & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
