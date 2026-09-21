import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MapPin, ShieldAlert, Volume2, User, Share2, Compass, AlertCircle, ShieldCheck, Radio, AlertTriangle } from 'lucide-react';
import { audioSpeech } from '../../services/audioSpeech';
import { LanguageCode, PatientProfile } from '../../types';
import { t } from '../../translations';
import {
  DEFAULT_HOME_COORDS,
  SAFE_RADIUS_METERS,
  evaluateGeofence,
  createGeofenceWhatsAppAlert,
  getSimulatedBreachCoords,
  GeofenceStatus,
} from '../../services/geofenceService';

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
}

export const SafeHomeSOS: React.FC<Props> = ({ patient, lang, onBack }) => {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(DEFAULT_HOME_COORDS);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geofence, setGeofence] = useState<GeofenceStatus>(() =>
    evaluateGeofence(DEFAULT_HOME_COORDS, DEFAULT_HOME_COORDS, SAFE_RADIUS_METERS)
  );
  const [isSimulatedBreach, setIsSimulatedBreach] = useState(false);

  // Watch position or calculate initial status
  useEffect(() => {
    if (navigator.geolocation && !isSimulatedBreach) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentCoords(coords);
          setGeofence(evaluateGeofence(coords, DEFAULT_HOME_COORDS, SAFE_RADIUS_METERS));
        },
        () => {
          // Fallback to default Bihaguri Gaon coordinates
          setCurrentCoords(DEFAULT_HOME_COORDS);
          setGeofence(evaluateGeofence(DEFAULT_HOME_COORDS, DEFAULT_HOME_COORDS, SAFE_RADIUS_METERS));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [isSimulatedBreach]);

  const handleToggleBreachSimulation = () => {
    if (!isSimulatedBreach) {
      const breachCoords = getSimulatedBreachCoords(DEFAULT_HOME_COORDS);
      setCurrentCoords(breachCoords);
      setGeofence(evaluateGeofence(breachCoords, DEFAULT_HOME_COORDS, SAFE_RADIUS_METERS));
      setIsSimulatedBreach(true);
      // Speak audio beacon warning
      const pName = patient.localizedName?.[lang] || patient.name;
      const warnMsg = lang === 'as'
        ? `সতৰ্কতা! ${pName} নিৰাপদ এলেকাৰ বাহিৰলৈ গৈছে। অনুগ্ৰহ কৰি ঘৰলৈ উভতি আহক।`
        : `Alert! ${pName} has moved outside the safe perimeter. Assistance beacon active.`;
      audioSpeech.speak(warnMsg, lang);
    } else {
      setCurrentCoords(DEFAULT_HOME_COORDS);
      setGeofence(evaluateGeofence(DEFAULT_HOME_COORDS, DEFAULT_HOME_COORDS, SAFE_RADIUS_METERS));
      setIsSimulatedBreach(false);
    }
  };

  const handleSpeakAudioBeacon = () => {
    const pName = patient.localizedName?.[lang] || patient.name;
    const cName = patient.localizedCaregiverName?.[lang] || patient.caregiverName;
    const text = lang === 'as'
      ? `মই বাট হেৰুৱালোঁ, মোক ঘৰলৈ লৈ যাওক। মোৰ নাম ${pName}। মোৰ ঘৰ ${patient.village}, জিলা ${patient.district}। মোৰ জীয়ৰী ${cName}ৰ নম্বৰ ${patient.caregiverPhone}। অনুগ্ৰহ কৰি মোক সহায় কৰক।`
      : lang === 'hi'
      ? `मैं रास्ता भटक गया हूँ, मुझे घर पहुँचाने में मदद करें। मेरा नाम ${pName} है। मेरी बेटी ${cName} का फोन ${patient.caregiverPhone} है।`
      : lang === 'bn'
      ? `আমি পথ হারিয়ে ফেলেছি, আমাকে বাড়ি ফিরতে সাহায্য করুন। আমার নাম ${pName}। আমার মেয়ের ফোন ${patient.caregiverPhone}।`
      : `I have lost my way, please help me return home. My name is ${pName}. My caregiver is ${cName}, phone ${patient.caregiverPhone}.`;
    audioSpeech.speak(text, lang);
  };

  const handleSendWhatsAppAlert = () => {
    const message = createGeofenceWhatsAppAlert(
      patient.name,
      currentCoords,
      geofence.distanceMeters,
      patient.caregiverPhone
    );
    const waUrl = `https://wa.me/${patient.caregiverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleFetchCurrentGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this device.');
      return;
    }
    setLocationLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentCoords(coords);
        setGeofence(evaluateGeofence(coords, DEFAULT_HOME_COORDS, SAFE_RADIUS_METERS));
        setLocationLoading(false);
        setIsSimulatedBreach(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setLocationLoading(false);
        setGeoError('Unable to retrieve GPS. Using village home reference.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Simulation Toggle */}
            <button
              onClick={handleToggleBreachSimulation}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all flex items-center gap-1.5 shadow-sm ${
                isSimulatedBreach
                  ? 'bg-red-600 text-white border-red-800 animate-pulse'
                  : 'bg-white text-ner-earth border-ner-earth/40 hover:bg-ner-sand'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isSimulatedBreach ? 'Reset to Safe Home' : 'Simulate Breach (850m)'}</span>
            </button>

            <span className="px-4 py-1.5 bg-red-100 text-ner-redSilk font-bold rounded-full text-base border-2 border-ner-redSilk flex items-center gap-1.5 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-ner-redSilk" />
              <span>{t('emergency_sos_card', lang)}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Geofence Radar Status Banner */}
        <div
          className={`rounded-3xl p-5 mb-5 border-3 transition-all shadow-card-warm ${
            geofence.isBreached
              ? 'bg-red-600 text-white border-red-800 animate-pulse'
              : 'bg-emerald-50 text-emerald-900 border-emerald-500'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {geofence.isBreached ? (
                <AlertTriangle className="w-10 h-10 text-amber-200 shrink-0" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0" />
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold">
                  {geofence.isBreached
                    ? '⚠️ WANDERING ALERT: OUTSIDE 500M GEOFENCE'
                    : '🛡️ VIRTUAL VILLAGE GEOFENCE: SAFE INSIDE HOME AREA'}
                </h2>
                <p className="text-sm opacity-90">
                  {geofence.isBreached
                    ? `Elder is currently ${geofence.distanceMeters}m away from Bihaguri Gaon home perimeter!`
                    : `Current location is within ${geofence.distanceMeters}m of home. Safety monitoring active.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold">
                {geofence.distanceMeters}m / 500m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BREACH SCREEN: High-Contrast Safe Return Patient Mode */}
      {geofence.isBreached ? (
        <div className="bg-white border-4 border-red-600 rounded-3xl p-6 shadow-2xl my-auto max-w-xl mx-auto w-full text-center space-y-5 animate-fadeIn">
          <div className="bg-red-100 text-red-800 py-1.5 px-4 rounded-full text-xs font-extrabold uppercase tracking-wider inline-block">
            High-Contrast Safe Return Active
          </div>

          <h3 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark">
            {lang === 'as' ? 'আপুনি নিৰাপদ, আমাৰ জীয়ৰী মৌচুমী আহি আছে' : 'You are safe! Daughter Mouchumi is on her way'}
          </h3>

          {/* Familiar Visual Anchors (Home Village + Smiling Daughter) */}
          <div className="grid grid-cols-2 gap-4 my-3">
            <div className="rounded-2xl overflow-hidden border-2 border-ner-earth/30 shadow-md">
              <img
                src="/images/majuli_satra.jpg"
                alt="Home Village"
                className="w-full h-32 object-cover"
              />
              <div className="bg-amber-50 p-2 text-xs font-bold text-ner-bark">
                🏡 {patient.village}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border-2 border-ner-earth/30 shadow-md">
              <img
                src="/images/caregiver_mouchumi.jpg"
                alt="Caregiver Daughter"
                className="w-full h-32 object-cover"
              />
              <div className="bg-emerald-50 p-2 text-xs font-bold text-ner-forest">
                👧 {patient.caregiverName}
              </div>
            </div>
          </div>

          {/* 1-Tap Audio Beacon Button */}
          <button
            onClick={handleSpeakAudioBeacon}
            className="btn-tactile bg-ner-terracotta hover:bg-orange-700 text-white w-full py-4 text-xl font-bold border-2 border-ner-bark flex items-center justify-center gap-3 shadow-lg"
          >
            <Volume2 className="w-8 h-8 text-amber-200 animate-bounce" />
            <span>
              {t('audio_beacon_btn', lang)}
            </span>
          </button>

          {/* Direct WhatsApp Emergency Dispatch to Caregiver */}
          <button
            onClick={handleSendWhatsAppAlert}
            className="btn-tactile bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3.5 text-base font-bold border-2 border-emerald-900 flex items-center justify-center gap-2 shadow-md"
          >
            <Share2 className="w-5 h-5" />
            <span>Notify Family via WhatsApp (Live GPS Pin)</span>
          </button>

          <a
            href={`tel:${patient.caregiverPhone}`}
            className="btn-tactile btn-tactile-green w-full py-3 text-base flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            <span>Call Daughter Mouchumi ({patient.caregiverPhone})</span>
          </a>
        </div>
      ) : (
        /* NORMAL IDENTITY & HOME CARD */
        <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-6 shadow-tactile my-auto max-w-xl mx-auto w-full space-y-4">
          {/* Patient Photo & Name */}
          <div className="flex items-center gap-4 border-b-2 border-ner-sand pb-4">
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl border-2 border-amber-300 shadow-sm overflow-hidden">
              <img src={patient.photoUrl} alt="Patient" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-ner-bark">
                {patient.localizedName?.[lang] || patient.name}
              </h3>
              <p className="text-sm font-semibold text-ner-earth">
                {t('age_label', lang)}: {patient.age} {t('years_old', lang)} • {t('state_label', lang)}: {patient.state}
              </p>
            </div>
          </div>

          {/* Home Village Address */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200 flex items-start gap-3">
            <MapPin className="w-7 h-7 text-ner-terracotta shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-ner-amber uppercase tracking-wide">
                {t('home_village_label', lang)}
              </div>
              <div className="text-lg font-bold text-ner-bark">{patient.village}, {patient.district}</div>
              <div className="text-sm text-ner-earth font-medium">{patient.state}, PIN: 784001 (NER)</div>
            </div>
          </div>

          {/* Live GPS Geofence Telemetry */}
          <div className="bg-blue-50/80 p-4 rounded-2xl border-2 border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Compass className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Live Virtual Geofence Radar</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-green-100 text-green-800">
                {geofence.distanceMeters}m from Home Pin
              </span>
            </div>

            <div className="text-xs text-blue-800 font-mono bg-white/70 p-2 rounded-lg border border-blue-100 flex justify-between items-center">
              <span>Lat: {currentCoords.lat.toFixed(4)}° N • Lng: {currentCoords.lng.toFixed(4)}° E</span>
              <span className="text-[10px] text-ner-forest font-bold">500m Safe Radius</span>
            </div>

            {geoError && (
              <div className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{geoError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleFetchCurrentGps}
                disabled={locationLoading}
                className="btn-tactile bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl border border-blue-800"
              >
                <Compass className="w-4 h-4" />
                <span>{locationLoading ? 'Locating...' : 'Refresh GPS'}</span>
              </button>

              <button
                onClick={handleSendWhatsAppAlert}
                className="btn-tactile bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl border border-emerald-800"
              >
                <Share2 className="w-4 h-4" />
                <span>Share WhatsApp Pin</span>
              </button>
            </div>
          </div>

          {/* Primary Caregiver Contact */}
          <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-ner-forest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-7 h-7 text-ner-forest" />
              <div>
                <div className="text-xs font-bold text-ner-forest uppercase">
                  {t('family_guardian_label', lang)}
                </div>
                <div className="text-lg font-bold text-ner-bark">
                  {patient.localizedCaregiverName?.[lang] || patient.caregiverName}
                </div>
                <div className="text-base text-ner-forest font-extrabold">{patient.caregiverPhone}</div>
              </div>
            </div>
            <a
              href={`tel:${patient.caregiverPhone}`}
              className="btn-tactile btn-tactile-green px-4 py-2.5 text-base flex items-center gap-1.5"
            >
              <Phone className="w-5 h-5" />
              <span>{t('call_now', lang)}</span>
            </a>
          </div>

          {/* Voice Read-Aloud Button */}
          <button
            onClick={handleSpeakAudioBeacon}
            className="btn-tactile btn-tactile-earth w-full py-3.5 text-lg flex items-center justify-center gap-2"
          >
            <Volume2 className="w-6 h-6 text-ner-gold" />
            <span>{t('speak_address', lang)}</span>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-3 text-center text-sm font-semibold text-ner-earth mt-4">
        🌿 CogniCare NER — Safe Return & Wandering Defense (LGBRIMH Tezpur & NHM Assam)
      </div>
    </div>
  );
};
