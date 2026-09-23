import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const MobileInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (PWA installed or native)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(Boolean(isStandaloneMode));

    // Check if running on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for manual trigger from QuickNavigationMenu or settings
    const handleManualTrigger = () => {
      setDismissed(false);
      setShowIOSModal(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setDismissed(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-mobile-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-mobile-install', handleManualTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setDismissed(true), 3500);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions fallback
      setShowIOSModal(true);
    }
  };

  // If already installed in standalone or dismissed, do not render floating banner
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Mobile Install Banner (Bottom-left on larger screens, full width on phone) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-sm animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-md shrink-0">
              <Smartphone className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-sm tracking-wide text-white">CogniCare Mobile</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Android & iOS
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                Install as a full-screen app • Works 100% offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {installedSuccess ? (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 px-3 py-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss install banner"
              className="p-1.5 text-slate-400 hover:text-slate-200 active:scale-90 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS & Manual Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 shadow-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Install on {isIOS ? 'iPhone / iPad' : 'Your Phone'}</h3>
                <p className="text-xs text-slate-400">Zero download size • Standalone mode</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 font-bold shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">Step 1: Tap Share</p>
                  <p className="text-xs text-slate-400">
                    {isIOS
                      ? 'Tap the Share icon at the bottom of Safari toolbar.'
                      : 'Tap the 3 dots (⋮) in your mobile browser menu.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">Step 2: Add to Home Screen</p>
                  <p className="text-xs text-slate-400">
                    Scroll down and select <strong className="text-emerald-400">"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 font-bold shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">Step 3: Launch Like a Native App</p>
                  <p className="text-xs text-slate-400">
                    The CogniCare app icon will appear on your home screen without any browser address bar!
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
            >
              Got it, let's go!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
