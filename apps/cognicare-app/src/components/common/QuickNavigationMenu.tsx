import React, { useEffect, useRef } from 'react';
import {
  Compass,
  Calendar,
  Pill,
  Brain,
  Camera,
  Moon,
  Globe,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ShieldAlert,
  Flower2,
  Check,
  Smartphone,
} from 'lucide-react';
import { GameType, LanguageCode, ThemeMode } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { t } from '../../translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
  onSelectGame?: (game: GameType) => void;
  onOpenReminiscence?: () => void;
  onOpenSundowning?: () => void;
  onOpenSOS?: () => void;
  onOpenBlisterScanner?: () => void;
  onOpenSettings?: () => void;
  onOpenLanguage?: () => void;
  onReturnToHome?: () => void;
}

export const QuickNavigationMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  onSelectGame,
  onOpenReminiscence,
  onOpenSundowning,
  onOpenSOS,
  onOpenBlisterScanner,
  onOpenSettings,
  onOpenLanguage,
  onReturnToHome,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { userRole, login, logout, themeMode, setThemeMode, activePatient } = useAppStore();

  // Close on Escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scrollToSection = (sectionId: string) => {
    onClose();
    if (onReturnToHome) {
      onReturnToHome();
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('section-target-highlight');
        setTimeout(() => el.classList.remove('section-target-highlight'), 2200);
      }
    }, 100);
  };

  const handleLaunchGame = (game: GameType) => {
    onClose();
    if (onSelectGame) {
      onSelectGame(game);
    }
  };

  const THEMES: { id: ThemeMode; label: string; icon: string; previewColor: string; desc: string }[] = [
    { id: 'midnight', label: 'Midnight Obsidian (Dark)', icon: '🌙', previewColor: 'bg-slate-900 border-sky-400', desc: 'Sleek dark mode' },
    { id: 'pastel', label: 'Pastel Serenity (Soft Cyan)', icon: '🌿', previewColor: 'bg-sky-100 border-sky-400', desc: 'Calms agitation' },
    { id: 'heritage', label: 'Cultural Heritage (Assamese)', icon: '🏛️', previewColor: 'bg-amber-100 border-amber-600', desc: 'Warm North-East' },
    { id: 'forest', label: 'Kaziranga Forest (Zen Green)', icon: '🌲', previewColor: 'bg-emerald-100 border-emerald-600', desc: 'Biophilic calm' },
    { id: 'sunset', label: 'Brahmaputra Sunset (Amber)', icon: '🌅', previewColor: 'bg-orange-100 border-orange-500', desc: 'Energizing warmth' },
    { id: 'lavender', label: 'Lavender Calm (Neuro-Soothe)', icon: '🌸', previewColor: 'bg-purple-100 border-purple-500', desc: 'Emotional stability' },
    { id: 'high_contrast', label: 'High Contrast Tactile (A11y)', icon: '👁️', previewColor: 'bg-black border-yellow-400', desc: 'Low-vision AAA' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out / Dropdown Menu Window (Dark Theme Matching Reference Screenshot) */}
      <div
        ref={menuRef}
        className="relative z-10 w-80 sm:w-96 h-full bg-[#131722]/95 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl flex flex-col text-slate-100 font-sans animate-slideLeft select-none"
        style={{
          boxShadow: '-10px 0 35px -5px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Top Header of Navigation Menu */}
        <div className="p-4 border-b border-slate-700/70 flex items-center justify-between bg-[#191F2F]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-slate-800 rounded-xl border border-slate-700 text-lg shadow-inner">
              🧭
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Quick Navigation</span>
                <span className="text-[10px] bg-sky-900 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                  Menu
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Instant jump without scrolling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Menu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Menu Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-700/60 py-1 text-xs">
          
          {/* Section 1: Page Scroll Jump */}
          {userRole === 'patient' && (
            <div className="py-2">
              <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Jump To Section</span>
                <span className="text-[9px] text-sky-400 font-medium">Scroll On-Page</span>
              </div>

              <button
                onClick={() => scrollToSection('section-overview')}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Compass className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">Today's Goal & Overview</span>
                <span className="text-[10px] text-slate-400">Top</span>
              </button>

              <button
                onClick={() => scrollToSection('section-garden')}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Flower2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">Gamified Memory Garden</span>
                <span className="text-[10px] text-emerald-400">Bloom</span>
              </button>

              <button
                onClick={() => scrollToSection('section-routine')}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">Daily Routine Rhythm</span>
                <span className="text-[10px] text-amber-400">Checklist</span>
              </button>

              <button
                onClick={() => scrollToSection('section-reminders')}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Pill className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">Medication Reminders</span>
                <span className="text-[10px] text-rose-400">Pills</span>
              </button>

              <button
                onClick={() => scrollToSection('section-games')}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Brain className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">Cognitive Workouts Grid</span>
                <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-bold">8 Games</span>
              </button>

              <button
                onClick={() => scrollToSection('section-story')}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Camera className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">Story of the Day (Majuli)</span>
                <span className="text-[10px] text-slate-400">Photo</span>
              </button>
            </div>
          )}

          {/* Section 2: Direct Game Launchers (Instant 0-Scroll Play) */}
          <div className="py-2">
            <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Launch Cognitive Game</span>
              <span className="text-[9px] text-purple-400 font-medium">Instant Launch</span>
            </div>

            <button
              onClick={() => handleLaunchGame('card_match')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">🧣</span>
              <span className="font-semibold flex-1">{t('game1_title', lang)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </button>

            <button
              onClick={() => handleLaunchGame('rhythm_recall')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">🥁</span>
              <span className="font-semibold flex-1">{t('game2_title', lang)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </button>

            <button
              onClick={() => handleLaunchGame('routine_sort')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">☕</span>
              <span className="font-semibold flex-1">{t('game3_title', lang)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </button>

            <button
              onClick={() => handleLaunchGame('spot_difference')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">🧺</span>
              <span className="font-semibold flex-1">{t('game4_title', lang)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </button>

            <button
              onClick={() => handleLaunchGame('pattern_completion')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">🎋</span>
              <span className="font-semibold flex-1">{t('game5_title', lang)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </button>

            <button
              onClick={() => handleLaunchGame('word_association')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">🎤</span>
              <span className="font-semibold flex-1">{t('game6_title', lang)}</span>
              <span className="text-[9px] bg-pink-900/60 text-pink-300 px-1 py-0.5 rounded font-bold">Voice AI</span>
            </button>

            <button
              onClick={() => handleLaunchGame('clock_drawing')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">🕰️</span>
              <span className="font-semibold flex-1">{t('game7_title', lang)}</span>
              <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1 py-0.5 rounded font-bold">CDT</span>
            </button>

            <button
              onClick={() => handleLaunchGame('olfactory_recall')}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <span className="text-base">👃</span>
              <span className="font-semibold flex-1">{t('game8_title', lang)}</span>
              <span className="text-[9px] bg-amber-900/60 text-amber-300 px-1 py-0.5 rounded font-bold">Aroma</span>
            </button>
          </div>

          {/* Section 3: Essential Care & Safety Tools */}
          <div className="py-2">
            <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Safety & Care Tools</span>
              <span className="text-[9px] text-red-400 font-medium">Quick Open</span>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onOpenSOS) onOpenSOS();
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-red-950/40 transition-colors group text-red-300 hover:text-red-100"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold flex-1">{t('safe_home_sos', lang)}</span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">SOS</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenSundowning) onOpenSundowning();
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <Moon className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span className="font-semibold flex-1">{t('sundowning_calm', lang)}</span>
              <span className="text-[10px] text-amber-300">Calm Room</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenReminiscence) onOpenReminiscence();
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <Camera className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform" />
              <span className="font-semibold flex-1">{t('reminiscence_album', lang)}</span>
              <span className="text-[10px] text-teal-300">Photos</span>
            </button>

            {onOpenBlisterScanner && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBlisterScanner();
                }}
                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
              >
                <Pill className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold flex-1">{t('blister_scanner', lang)}</span>
                <span className="text-[10px] text-blue-400">Scanner</span>
              </button>
            )}
          </div>

          {/* Section 4: Visual Themes (All 7 Themes) */}
          <div className="py-2">
            <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Visual Theme</span>
              <span className="text-[9px] text-sky-400 font-medium">7 Palettes</span>
            </div>

            <div className="px-3 py-1 space-y-1">
              {THEMES.map((theme) => {
                const isActive = themeMode === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id)}
                    className={`w-full px-3 py-1.5 rounded-xl flex items-center justify-between text-left transition-all ${
                      isActive
                        ? 'bg-slate-800 border border-sky-400/80 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{theme.icon}</span>
                      <div>
                        <div className="text-[11px] font-bold leading-tight flex items-center gap-1.5">
                          <span>{theme.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400">{theme.desc}</span>
                      </div>
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: System, Language, Role & Signout */}
          <div className="py-2">
            <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              System & Preferences
            </div>

            <button
              onClick={() => {
                onClose();
                if (onOpenLanguage) onOpenLanguage();
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold flex-1">Language (ভাষা)</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">{lang}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('open-mobile-install'));
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-emerald-950/40 transition-colors group text-emerald-300 hover:text-emerald-200"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold flex-1">Install Mobile App</span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                Android / iOS
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenSettings) onOpenSettings();
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-slate-800/80 transition-colors group text-slate-200 hover:text-white"
            >
              <Settings className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="font-semibold flex-1">{t('settings_customization', lang)}</span>
            </button>

            <div className="px-4 py-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Switch Persona:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/80 text-[10px] font-bold">
                <button
                  onClick={() => {
                    login('patient', activePatient || undefined);
                    onClose();
                  }}
                  className={`py-1 rounded-lg text-center transition-all ${
                    userRole === 'patient'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patient
                </button>
                <button
                  onClick={() => {
                    login('caregiver', activePatient || undefined);
                    onClose();
                  }}
                  className={`py-1 rounded-lg text-center transition-all ${
                    userRole === 'caregiver'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Caregiver
                </button>
                <button
                  onClick={() => {
                    login('asha', activePatient || undefined);
                    onClose();
                  }}
                  className={`py-1 rounded-lg text-center transition-all ${
                    userRole === 'asha'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ASHA
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-red-950/40 transition-colors group text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold flex-1">{t('logout', lang)}</span>
            </button>
          </div>

        </div>

        {/* Footer with branding */}
        <div className="p-3 border-t border-slate-700/60 bg-[#161B28] text-[10px] text-slate-400 flex items-center justify-between">
          <span>🌿 CogniCare NER</span>
          <span className="text-[9px] text-slate-500 font-mono">SIH-26003</span>
        </div>
      </div>
    </div>
  );
};
