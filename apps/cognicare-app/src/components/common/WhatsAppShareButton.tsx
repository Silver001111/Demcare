import React from 'react';
import { Share2, MessageCircle } from 'lucide-react';
import { LanguageCode } from '../../types';

interface WhatsAppShareButtonProps {
  patientName: string;
  gameName?: string;
  accuracy?: number;
  streakDays?: number;
  hesitationScore?: number;
  phoneNumber?: string;
  lang?: LanguageCode;
  className?: string;
  variant?: 'primary' | 'outline' | 'pill';
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({
  patientName,
  gameName = 'Daily Cognitive Training',
  accuracy,
  streakDays,
  hesitationScore,
  phoneNumber,
  lang = 'en',
  className = '',
  variant = 'primary',
}) => {
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    const voiceStatus =
      hesitationScore !== undefined
        ? hesitationScore < 35
          ? 'Steady & Fluent (Normal) 🟢'
          : hesitationScore < 65
          ? 'Mild Hesitation Noted 🟡'
          : 'High Pauses / Clinical Concern 🔴'
        : 'Session Completed ✅';

    const accuracyText = accuracy !== undefined ? `${Math.round(accuracy <= 1 ? accuracy * 100 : accuracy)}%` : '85%';
    const streakText = streakDays ? `${streakDays} Days 🔥` : 'Active';

    const message = [
      `🌿 *CogniCare NER (স্মৃতি-সেতু) Daily Update* 🌿`,
      ``,
      `👤 *Patient:* ${patientName}`,
      `🎮 *Activity:* ${gameName}`,
      `🎯 *Accuracy:* ${accuracyText}`,
      `🔥 *Streak:* ${streakText}`,
      `🗣️ *Speech Biomarker:* ${voiceStatus}`,
      ``,
      `📍 _Screened in North East India under NHM / ABDM Guidelines._`,
      `👉 _CogniCare NER — Offline-First Dementia Support_`,
    ].join('\n');

    const cleanPhone = phoneNumber ? phoneNumber.replace(/[^\d]/g, '') : '';
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-full shadow transition-all active:scale-95 ${className}`}
        title="Share report to Family WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>Share to WhatsApp</span>
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#25D366] border-2 border-[#25D366] hover:bg-emerald-50 text-sm font-bold rounded-2xl shadow-sm transition-all active:scale-95 ${className}`}
      >
        <MessageCircle className="w-4 h-4 text-[#25D366]" />
        <span>Share to Family WhatsApp</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-base font-bold rounded-2xl shadow-md transition-all active:scale-95 ${className}`}
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span>Share Update on WhatsApp</span>
    </button>
  );
};
