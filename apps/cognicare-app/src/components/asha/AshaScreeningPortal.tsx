import React, { useState } from 'react';
import {
  ClipboardCheck,
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  Save,
  ShieldCheck,
  QrCode,
  Send,
  MapPin,
  Loader2,
} from 'lucide-react';
import { AshaObservation, PatientProfile, LanguageCode } from '../../types';
import { t } from '../../translations';
import { ESanjeevaniReferralModal } from './ESanjeevaniReferralModal';
import { RegionalEpidemiologyHeatmap } from './RegionalEpidemiologyHeatmap';
import { AshaBatchQrSync } from './AshaBatchQrSync';

interface Props {
  patients: PatientProfile[];
  observations: AshaObservation[];
  onAddObservation: (obs: AshaObservation) => void;
  onSync: () => void;
  isOnline: boolean;
  lang?: LanguageCode;
}

export const AshaScreeningPortal: React.FC<Props> = ({
  patients,
  observations,
  onAddObservation,
  onSync,
  isOnline,
  lang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'screening' | 'heatmap' | 'qrsync'>('screening');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [orientationScore, setOrientationScore] = useState<number>(3); // 0-5
  const [recallScore, setRecallScore] = useState<number>(3); // 0-5
  const [attentionScore, setAttentionScore] = useState<number>(4); // 0-5
  const [sleepQuality, setSleepQuality] = useState<'good' | 'restless' | 'insomnia'>('good');
  const [appetite, setAppetite] = useState<'normal' | 'low' | 'poor'>('normal');
  const [moodAgitation, setMoodAgitation] = useState<'calm' | 'mild_confusion' | 'agitated'>('calm');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lastSavedObs, setLastSavedObs] = useState<AshaObservation | null>(null);

  // ABHA ID State
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const [patientAbhaId, setPatientAbhaId] = useState<string>(selectedPatient?.abhaId || '14-8832-1920-4411');
  const [abhaVerified, setAbhaVerified] = useState<boolean>(true);
  const [isVerifyingAbha, setIsVerifyingAbha] = useState<boolean>(false);
  const [prevPatientId, setPrevPatientId] = useState<string>(selectedPatient?.id || '');

  // e-Sanjeevani Modal State
  const [showESanjeevaniModal, setShowESanjeevaniModal] = useState<boolean>(false);
  const [referralTargetObs, setReferralTargetObs] = useState<AshaObservation | undefined>(undefined);

  // Adjust ABHA ID state when selected patient changes (React-recommended state adjustment pattern)
  if (selectedPatient && selectedPatient.id !== prevPatientId) {
    setPrevPatientId(selectedPatient.id);
    setPatientAbhaId(selectedPatient.abhaId || '14-8832-1920-4411');
    setAbhaVerified(true);
  }

  const totalScore = orientationScore + recallScore + attentionScore; // Out of 15

  const formatAbhaId = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 14);
    const parts = [];
    if (digits.length > 0) parts.push(digits.slice(0, 2));
    if (digits.length > 2) parts.push(digits.slice(2, 6));
    if (digits.length > 6) parts.push(digits.slice(6, 10));
    if (digits.length > 10) parts.push(digits.slice(10, 14));
    return parts.join('-');
  };

  const handleAbhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAbhaId(e.target.value);
    setPatientAbhaId(formatted);
    setAbhaVerified(formatted.length === 17);
  };

  const handleVerifyAbha = () => {
    setIsVerifyingAbha(true);
    setTimeout(() => {
      setIsVerifyingAbha(false);
      setAbhaVerified(true);
    }, 700);
  };

  const handleScanQr = () => {
    setPatientAbhaId('14-8832-1920-4411');
    setAbhaVerified(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scorePct = Math.round((totalScore / 15) * 100);
    const newObs: AshaObservation = {
      id: `asha_obs_${Date.now()}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      timestamp: new Date().toISOString(),
      cognitiveCheckScore: scorePct,
      sleepQuality,
      appetite,
      moodAgitation,
      notes: notes || t('default_screening_note', lang),
      synced: isOnline,
      abhaId: patientAbhaId,
      teleconsultStatus: scorePct < 70 ? 'none' : undefined,
    };

    onAddObservation(newObs);
    setLastSavedObs(newObs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 5000);
    setNotes('');
  };

  const handleOpenReferral = (obs?: AshaObservation) => {
    setReferralTargetObs(obs || lastSavedObs || undefined);
    setShowESanjeevaniModal(true);
  };

  const unsyncedCount = observations.filter((o) => !o.synced).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner: ASHA Header & Sync Status */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl border-2 border-emerald-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-emerald-700 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t('nhm_banner', lang)}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                isOnline ? 'bg-emerald-500/30 text-emerald-200' : 'bg-amber-500/30 text-amber-200'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? t('online_connected', lang) : t('offline_store', lang)}</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
            {t('asha_portal', lang)}
          </h1>
          <p className="text-sm text-emerald-200">{t('district_phc', lang)}</p>
        </div>

        <div className="flex items-center gap-3">
          {unsyncedCount > 0 && (
            <div className="text-right">
              <div className="text-xs text-amber-200 font-semibold">
                {unsyncedCount} {t('unsynced_records', lang)}
              </div>
              <div className="text-[11px] text-emerald-300">{t('stored_locally', lang)}</div>
            </div>
          )}
          <button
            onClick={onSync}
            className="btn-tactile bg-emerald-700 hover:bg-emerald-600 text-white border-2 border-emerald-500 px-5 py-2.5 text-base flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>{t('sync_data', lang)}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Clinical Screening vs District Surveillance Heatmap */}
      <div className="flex border-b-2 border-ner-earth/20 gap-2">
        <button
          onClick={() => setActiveTab('screening')}
          className={`pb-3 px-5 font-bold text-sm md:text-base flex items-center gap-2 transition-all border-b-3 -mb-[2px] ${
            activeTab === 'screening'
              ? 'border-ner-forest text-ner-forest'
              : 'border-transparent text-ner-earth hover:text-ner-bark'
          }`}
        >
          <ClipboardCheck className="w-5 h-5" />
          <span>Rapid Clinical Screening</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`pb-3 px-5 font-bold text-sm md:text-base flex items-center gap-2 transition-all border-b-3 -mb-[2px] ${
            activeTab === 'heatmap'
              ? 'border-ner-forest text-ner-forest'
              : 'border-transparent text-ner-earth hover:text-ner-bark'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>District Surveillance Heatmap (DHO)</span>
          <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
            NE Region
          </span>
        </button>

        <button
          onClick={() => setActiveTab('qrsync')}
          className={`pb-3 px-5 font-bold text-sm md:text-base flex items-center gap-2 transition-all border-b-3 -mb-[2px] ${
            activeTab === 'qrsync'
              ? 'border-ner-forest text-ner-forest'
              : 'border-transparent text-ner-earth hover:text-ner-bark'
          }`}
        >
          <QrCode className="w-5 h-5 text-amber-600" />
          <span>Zero-Internet P2P QR Handoff</span>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
            Offline Sync
          </span>
        </button>
      </div>

      {activeTab === 'heatmap' ? (
        <RegionalEpidemiologyHeatmap lang={lang} />
      ) : activeTab === 'qrsync' ? (
        <AshaBatchQrSync
          observations={observations}
          patients={patients}
          onBatchImport={(imported) => {
            imported.forEach((obs) => onAddObservation(obs));
            setActiveTab('screening');
          }}
          lang={lang}
          onBack={() => setActiveTab('screening')}
        />
      ) : (
        <div className="grid md:grid-cols-12 gap-6">
          {/* Left Column: 5-Minute Screening Form */}
          <div className="md:col-span-7 bg-white border-2 border-ner-earth/20 rounded-3xl p-6 shadow-card-warm space-y-5">
            <div className="flex items-center justify-between border-b-2 border-ner-sand pb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-6 h-6 text-ner-forest" />
                <h2 className="text-xl font-serif font-bold text-ner-bark">{t('rapid_screening', lang)}</h2>
              </div>
              <span className="text-xs font-bold bg-ner-sand text-ner-earth px-3 py-1 rounded-full">
                {t('lgbrimh_model', lang)}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Select */}
              <div>
                <label className="block text-xs font-bold text-ner-amber uppercase tracking-wider mb-1">
                  {t('select_patient', lang)}
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-ner-earth/30 bg-ner-cream text-ner-bark font-bold text-base focus:border-ner-forest focus:outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age} Yrs, {p.village}) — Stage: {p.dementiaStage.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* ABHA ID Integration Card */}
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Ayushman Bharat Health Account (ABHA ID)</span>
                  </label>
                  {abhaVerified && (
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>ABDM Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={patientAbhaId}
                    onChange={handleAbhaChange}
                    placeholder="14-XXXX-XXXX-XXXX"
                    maxLength={17}
                    className="flex-1 p-2.5 rounded-xl border border-emerald-300 bg-white font-mono text-sm font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAbha}
                    disabled={isVerifyingAbha}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {isVerifyingAbha ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={handleScanQr}
                    className="px-2.5 py-2 bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1"
                    title="Simulate scanning QR code from Ayushman Card"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </button>
                </div>
                <div className="text-[11px] text-emerald-800">
                  National Digital Health ID for seamless e-Sanjeevani teleconsultation & health records.
                </div>
              </div>

              {/* Cognitive Check Questions */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                <div className="text-sm font-bold text-ner-bark mb-1">
                  {t('cognitive_check_metrics', lang)}
                </div>

                {/* Orientation */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ner-earth">{t('orientation_check', lang)}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setOrientationScore(val)}
                        className={`w-8 h-8 rounded-lg font-bold text-sm ${
                          orientationScore === val
                            ? 'bg-ner-forest text-white'
                            : 'bg-white text-ner-bark border border-ner-earth/30'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recall */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ner-earth">{t('word_recall_check', lang)}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setRecallScore(val)}
                        className={`w-8 h-8 rounded-lg font-bold text-sm ${
                          recallScore === val
                            ? 'bg-ner-forest text-white'
                            : 'bg-white text-ner-bark border border-ner-earth/30'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attention */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ner-earth">{t('attention_check', lang)}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setAttentionScore(val)}
                        className={`w-8 h-8 rounded-lg font-bold text-sm ${
                          attentionScore === val
                            ? 'bg-ner-forest text-white'
                            : 'bg-white text-ner-bark border border-ner-earth/30'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Behavioral Observations */}
              <div className="grid grid-cols-3 gap-3">
                {/* Sleep */}
                <div>
                  <label className="block text-xs font-bold text-ner-earth mb-1">{t('sleep_label', lang)}</label>
                  <select
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-ner-earth/30 bg-ner-cream text-xs font-bold"
                  >
                    <option value="good">{t('sleep_good', lang)}</option>
                    <option value="restless">{t('sleep_restless', lang)}</option>
                    <option value="insomnia">{t('sleep_insomnia', lang)}</option>
                  </select>
                </div>

                {/* Appetite */}
                <div>
                  <label className="block text-xs font-bold text-ner-earth mb-1">{t('appetite_label', lang)}</label>
                  <select
                    value={appetite}
                    onChange={(e) => setAppetite(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-ner-earth/30 bg-ner-cream text-xs font-bold"
                  >
                    <option value="normal">{t('appetite_normal', lang)}</option>
                    <option value="low">{t('appetite_low', lang)}</option>
                    <option value="poor">{t('appetite_poor', lang)}</option>
                  </select>
                </div>

                {/* Mood Agitation */}
                <div>
                  <label className="block text-xs font-bold text-ner-earth mb-1">{t('mood_label', lang)}</label>
                  <select
                    value={moodAgitation}
                    onChange={(e) => setMoodAgitation(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-ner-earth/30 bg-ner-cream text-xs font-bold"
                  >
                    <option value="calm">{t('mood_calm', lang)}</option>
                    <option value="mild_confusion">{t('mood_mild', lang)}</option>
                    <option value="agitated">{t('mood_agitated', lang)}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-ner-earth mb-1">{t('observation_notes', lang)}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('notes_placeholder', lang)}
                  className="w-full p-3 rounded-2xl border border-ner-earth/30 bg-ner-cream text-sm font-medium focus:outline-none focus:border-ner-forest"
                  rows={2}
                />
              </div>

              {savedSuccess && (
                <div className="p-3.5 bg-emerald-100 text-ner-forest rounded-2xl font-bold text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{t('screening_saved', lang)}</span>
                  </div>

                  {lastSavedObs && lastSavedObs.cognitiveCheckScore < 70 && (
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-2">
                      <span className="text-xs text-amber-900 font-bold">
                        ⚠️ Score {lastSavedObs.cognitiveCheckScore}% — Elevated MCI Risk
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenReferral(lastSavedObs)}
                        className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Refer e-Sanjeevani</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn-tactile btn-tactile-green w-full py-3.5 text-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>{t('save_screening', lang)}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Ward Roster & Recent History */}
          <div className="md:col-span-5 space-y-4">
            {/* 1-Tap Teleconsult Referral Quick Action Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-3xl border-2 border-emerald-600 shadow-card-warm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-700/80 px-2.5 py-0.5 rounded-full">
                  Telehealth Referral
                </span>
                <span className="text-[11px] text-emerald-200">e-Sanjeevani 2.0</span>
              </div>
              <h3 className="text-lg font-serif font-bold">Need Specialist Medical Consultation?</h3>
              <p className="text-xs text-emerald-200">
                Instantly transmit {selectedPatient.name}’s cognitive score & voice hesitation metrics to the nearest Medical College.
              </p>
              <button
                type="button"
                onClick={() => handleOpenReferral()}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch e-Sanjeevani Teleconsult</span>
              </button>
            </div>

            <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm">
              <h3 className="text-lg font-serif font-bold text-ner-bark mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-ner-forest" />
                <span>{t('ward_roster', lang)}</span>
              </h3>

              <div className="space-y-2.5">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedPatientId === p.id
                        ? 'bg-emerald-50 border-ner-forest'
                        : 'bg-ner-cream border-ner-earth/20 hover:border-ner-earth/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👵</span>
                      <div>
                        <div className="font-bold text-ner-bark text-base">{p.name}</div>
                        <div className="text-xs text-ner-earth">
                          {p.village} • Age {p.age}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-ner-forest">CCS: {p.compositeCognitiveScore}</div>
                      <div className="text-[10px] text-ner-amber font-semibold">{p.dementiaStage.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Observation Log */}
            <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm">
              <h3 className="text-lg font-serif font-bold text-ner-bark mb-3">
                {t('recent_asha_logs', lang)}
              </h3>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
                {observations.map((obs) => (
                  <div key={obs.id} className="p-3 bg-ner-cream rounded-xl border border-ner-earth/20 space-y-1.5">
                    <div className="flex justify-between font-bold text-ner-bark">
                      <span>{obs.patientName}</span>
                      <span className="text-ner-forest">Check: {obs.cognitiveCheckScore}%</span>
                    </div>
                    <p className="text-ner-earth font-medium">{obs.notes}</p>
                    <div className="text-[10px] text-ner-earth/70 flex justify-between items-center pt-1 border-t border-ner-earth/10">
                      <span>{new Date(obs.timestamp).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenReferral(obs)}
                        className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3 text-emerald-600" />
                        <span>Refer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* e-Sanjeevani Modal */}
      {showESanjeevaniModal && (
        <ESanjeevaniReferralModal
          patient={selectedPatient}
          observation={referralTargetObs}
          lang={lang}
          onClose={() => setShowESanjeevaniModal(false)}
          onReferralDispatched={(ref) => {
            console.log('[CogniCare] e-Sanjeevani referral dispatched:', ref);
          }}
        />
      )}
    </div>
  );
};
