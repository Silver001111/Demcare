import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PatientProfile, SUPPORTED_LANGUAGES, LanguageCode } from '../../types';
import { t } from '../../translations';
import { Globe, Heart, ShieldCheck, Activity, Lock, Sparkles, Loader2, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle } from '../../services/cloudSync';

const MOCK_PATIENT: PatientProfile = {
  id: 'p_lakhimi_01',
  name: 'Lakhimi Baruah',
  localizedName: {
    en: 'Lakhimi Baruah',
    as: 'লাখিমী বৰুৱা',
    mni: 'লাখিমী বরুৱা',
    brx: 'लाखिमी बरुवा',
    kha: 'Lakhimi Baruah',
    lus: 'Lakhimi Baruah',
    trp: 'Lakhimi Baruah',
    ne: 'लाखिमी बरुवा',
    bn: 'লাখিমী বরুয়া',
    hi: 'लाखिमी बरुआ',
  },
  age: 72,
  gender: 'F',
  state: 'Assam',
  district: 'Sonitpur',
  village: 'Bihaguri Gaon',
  preferredLanguage: 'as',
  dementiaStage: 'mild',
  compositeCognitiveScore: 74,
  streakDays: 12,
  caregiverName: 'Mouchumi Baruah',
  localizedCaregiverName: {
    en: 'Mouchumi Baruah',
    as: 'মৌচুমী বৰুৱা',
    mni: 'মৌসুমী বরুৱা',
    brx: 'मौसम बरुवा',
    kha: 'Mouchumi Baruah',
    lus: 'Mouchumi Baruah',
    trp: 'Mouchumi Baruah',
    ne: 'मौसम बरुवा',
    bn: 'মৌসুমী বরুয়া',
    hi: 'मौसमी बरुआ',
  },
  caregiverPhone: '+91 94350 12345',
  ashaWorkerName: 'Purnima Gogoi',
  localizedAshaWorkerName: {
    en: 'Purnima Gogoi',
    as: 'পূৰ্ণিমা গগৈ',
    mni: 'পুর্ণিমা গগৈ',
    brx: 'पुर्णिमा गगै',
    kha: 'Purnima Gogoi',
    lus: 'Purnima Gogoi',
    trp: 'Purnima Gogoi',
    ne: 'पूर्णिमा गोगोई',
    bn: 'পূর্ণিমা গগৈ',
    hi: 'पूर्णिमा गोगोई',
  },
  ashaWorkerPhone: '+91 98640 54321',
  emergencyContact: '+91 94350 12345',
  photoUrl: '/images/lakhimi_baruah.jpg',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring" as const, stiffness: 50 } 
  }
};

export const LandingPage: React.FC = () => {
  const { login, language, setLanguage } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'caregiver' | 'asha' | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const handlePatientLogin = () => {
    login('patient', MOCK_PATIENT, null);
  };

  const handleGoogleLogin = async (role: 'caregiver' | 'asha') => {
    setIsSigningIn(true);
    setAuthNotice(null);
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        login(role, MOCK_PATIENT, {
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
          isGoogleAuth: true,
        });
      } else {
        // Helpful message if Google Provider is not yet toggled on in Firebase Console
        setAuthNotice('Google sign-in popup closed or provider awaiting enable in Firebase Console. You can also use Authorized Demo mode below!');
      }
    } catch {
      setAuthNotice('Google sign-in unavailable right now. Use Authorized Demo mode below.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoAuthorizedLogin = (role: 'caregiver' | 'asha') => {
    login(role, MOCK_PATIENT, {
      email: role === 'caregiver' ? 'moushumi.care@cognicare.ner' : 'purnima.asha@nhm.assam.gov.in',
      displayName: role === 'caregiver' ? 'Moushumi Baruah' : 'Purnima Gogoi (ASHA)',
      photoURL: null,
      isGoogleAuth: false,
    });
  };

  const handleLogin = () => {
    if (selectedRole === 'patient') {
      handlePatientLogin();
    } else if (selectedRole === 'caregiver' || selectedRole === 'asha') {
      handleGoogleLogin(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-ner-cream flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-6 py-4 flex justify-between items-center z-10"
      >
        <div className="flex items-center gap-2">
          <span className="text-3xl p-1.5 bg-white/50 backdrop-blur-sm rounded-2xl border border-white">🌿</span>
          <div className="font-serif font-extrabold text-ner-bark text-xl">CogniCare NER</div>
        </div>
        
        <button 
          onClick={() => setShowLanguageModal(true)}
          className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full font-bold text-ner-bark border border-ner-earth/20 shadow-sm hover:bg-white transition-all"
        >
          <Globe className="w-5 h-5" />
          <span>{t('language', language)}</span>
        </button>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full text-center space-y-6 mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-ner-bark leading-tight">
            {t('login_title', language)}
          </h1>
          <p className="text-lg md:text-xl text-ner-earth font-medium">
            {t('login_subtitle', language)}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 w-full max-w-4xl px-4"
        >
          {/* Patient Role */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRole('patient')}
            className={`flex flex-col items-center text-center p-8 rounded-3xl border-3 transition-colors ${
              selectedRole === 'patient' 
                ? 'bg-amber-50 border-ner-terracotta shadow-xl' 
                : 'bg-white border-transparent shadow-md'
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl ${selectedRole === 'patient' ? 'bg-ner-terracotta text-white' : 'bg-amber-100 text-ner-terracotta'}`}>
              <Heart className={selectedRole === 'patient' ? "text-white" : "text-ner-terracotta"} size={40} />
            </div>
            <h3 className="text-xl font-bold text-ner-bark mb-2">{t('role_patient', language)}</h3>
            <p className="text-sm text-ner-earth">{t('role_patient_desc', language)}</p>
          </motion.button>

          {/* Caregiver Role */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRole('caregiver')}
            className={`flex flex-col items-center text-center p-8 rounded-3xl border-3 transition-colors ${
              selectedRole === 'caregiver' 
                ? 'bg-orange-50 border-ner-earth shadow-xl' 
                : 'bg-white border-transparent shadow-md'
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl ${selectedRole === 'caregiver' ? 'bg-ner-earth text-white' : 'bg-orange-100 text-ner-earth'}`}>
              <Activity className={selectedRole === 'caregiver' ? "text-white" : "text-ner-earth"} size={40} />
            </div>
            <h3 className="text-xl font-bold text-ner-bark mb-2">{t('role_caregiver', language)}</h3>
            <p className="text-sm text-ner-earth">{t('role_caregiver_desc', language)}</p>
          </motion.button>

          {/* ASHA Role */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedRole('asha')}
            className={`flex flex-col items-center text-center p-8 rounded-3xl border-3 transition-colors ${
              selectedRole === 'asha' 
                ? 'bg-emerald-50 border-ner-forest shadow-xl' 
                : 'bg-white border-transparent shadow-md'
            }`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl ${selectedRole === 'asha' ? 'bg-ner-forest text-white' : 'bg-emerald-100 text-ner-forest'}`}>
              <ShieldCheck className={selectedRole === 'asha' ? "text-white" : "text-ner-forest"} size={40} />
            </div>
            <h3 className="text-xl font-bold text-ner-bark mb-2">{t('role_asha', language)}</h3>
            <p className="text-sm text-ner-earth">{t('role_asha_desc', language)}</p>
          </motion.button>
        </motion.div>

        {/* Login Action Area */}
        <div className="mt-8 flex flex-col items-center justify-center w-full max-w-lg min-h-24">
          <AnimatePresence mode="wait">
            {selectedRole === 'patient' && (
              <motion.div
                key="patient-login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePatientLogin}
                  className="bg-ner-terracotta text-white px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-amber-700 transition-colors flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{t('login_button', language)}</span>
                  <span>→</span>
                </motion.button>
                <p className="text-xs text-ner-earth font-medium mt-1">
                  🌿 100% Zero-Friction for Elderly Patients (No Passwords or OTPs Required)
                </p>
              </motion.div>
            )}

            {(selectedRole === 'caregiver' || selectedRole === 'asha') && (
              <motion.div
                key="clinical-auth-login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="flex flex-col items-center gap-3 w-full"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-ner-earth bg-amber-50/80 px-4 py-1.5 rounded-full border border-amber-200">
                  <Lock className="w-3.5 h-3.5 text-ner-amber" />
                  <span>Protected Clinical Portal — Authorised Access Required</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                  {/* Google Sign-In Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSigningIn}
                    onClick={() => handleGoogleLogin(selectedRole)}
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-3.5 rounded-full border-2 border-gray-300 shadow-md flex items-center justify-center gap-3 transition-all text-base"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-5 h-5 animate-spin text-ner-forest" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>{isSigningIn ? 'Connecting...' : 'Sign In with Google'}</span>
                  </motion.button>

                  {/* Demo/Offline Authorized Access */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDemoAuthorizedLogin(selectedRole)}
                    className="w-full sm:w-auto bg-ner-bark hover:bg-ner-earth text-white font-bold px-6 py-3.5 rounded-full shadow-md flex items-center justify-center gap-2 transition-all text-base"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Authorized Demo Access</span>
                  </motion.button>
                </div>

                {authNotice && (
                  <div className="text-xs text-amber-800 bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 text-center mt-1">
                    {authNotice}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border-3 border-ner-earth p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-serif font-bold text-ner-bark text-center mb-6">
              {t('language', language)}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6 max-h-[60vh] overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLanguageModal(false);
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    language === l.code
                      ? 'bg-amber-100 border-ner-amber ring-3 ring-ner-amber/30 scale-102'
                      : 'bg-ner-cream border-ner-earth/30 hover:border-ner-earth'
                  }`}
                >
                  <span className="text-2xl mb-1">{l.flag}</span>
                  <span className="text-base font-bold text-ner-bark">{l.nativeLabel}</span>
                  <span className="text-xs font-semibold text-ner-earth">{l.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full py-3 bg-ner-sand text-ner-bark rounded-xl font-bold border border-ner-earth/20"
            >
              {t('close', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
