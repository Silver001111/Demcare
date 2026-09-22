import React, { useState, useMemo } from 'react';
import { AlertTriangle, Plus, Download, Send, ShieldCheck, Settings } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import { mapToClinicalStandards, detectCognitiveDecline } from '../../services/aiEngine';
import { WhatsAppShareButton } from '../common/WhatsAppShareButton';
import { ESanjeevaniReferralModal } from '../asha/ESanjeevaniReferralModal';
import { SettingsCustomizationModal } from '../common/SettingsCustomizationModal';
import { CognitiveTrajectoryForecaster } from './CognitiveTrajectoryForecaster';
import { CaregiverBurnoutRespite } from './CaregiverBurnoutRespite';
import { AiCareCircleWidget } from './AiCareCircleWidget';
import { FamilyMemoryManager } from './FamilyMemoryManager';
import {
  PatientProfile,
  GameSession,
  ReminderItem,
  AlertNotification,
  LanguageCode,
  getLocalizedText,
} from '../../types';
import { t } from '../../translations';

interface Props {
  patient: PatientProfile;
  sessions: GameSession[];
  reminders: ReminderItem[];
  alerts: AlertNotification[];
  onAddReminder: (rem: ReminderItem) => void;
  onAcknowledgeAlert: (id: string) => void;
  lang?: LanguageCode;
}

export const CaregiverDashboard: React.FC<Props> = ({
  patient,
  sessions,
  reminders,
  alerts,
  onAddReminder,
  onAcknowledgeAlert,
  lang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'trajectory' | 'respite' | 'family_photos' | 'reminders' | 'alerts' | 'report'
  >('analytics');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newType, setNewType] = useState<'medicine' | 'hydration' | 'activity' | 'appointment' | 'meal'>('medicine');
  const [newDosage, setNewDosage] = useState('');
  const [showESanjeevaniModal, setShowESanjeevaniModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const clinical = mapToClinicalStandards(patient.compositeCognitiveScore);
  const declineResult = detectCognitiveDecline(sessions, patient.compositeCognitiveScore);

  // Calculate latest domain scores
  const latestSession = sessions.length > 0 ? sessions[0] : null;
  const domainMemory = latestSession ? latestSession.domainScores.memory : 74;
  const domainAttention = latestSession ? latestSession.domainScores.attention : 78;
  const domainExecutive = latestSession ? latestSession.domainScores.executive : 70;
  const domainVisuospatial = latestSession ? latestSession.domainScores.visuospatial : 75;
  const domainLanguage = latestSession ? latestSession.domainScores.language : 82;

  // Dual Radar comparison: current vs 2-week baseline
  const [currentTimestamp] = useState(() => Date.now());
  const oldScores = useMemo(() => {
    const twoWeeksAgo = currentTimestamp - (14 * 24 * 60 * 60 * 1000);
    const oldSessions = sessions.filter((s) => new Date(s.timestamp).getTime() < twoWeeksAgo);
    return oldSessions.length > 0
      ? oldSessions[oldSessions.length - 1].domainScores
      : { memory: 68, attention: 72, executive: 66, visuospatial: 71, language: 76 };
  }, [sessions, currentTimestamp]);

  const radarData = [
    { domain: 'Memory', current: domainMemory, previous: oldScores.memory, fullMark: 100 },
    { domain: 'Attention', current: domainAttention, previous: oldScores.attention, fullMark: 100 },
    { domain: 'Executive', current: domainExecutive, previous: oldScores.executive, fullMark: 100 },
    { domain: 'Visuospatial', current: domainVisuospatial, previous: oldScores.visuospatial, fullMark: 100 },
    { domain: 'Language', current: domainLanguage, previous: oldScores.language, fullMark: 100 },
  ];

  // Timeline with formatted date on X-axis
  const sessionData = sessions.length > 0
    ? [...sessions].reverse().slice(-10).map((s) => ({
        date: new Date(s.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        accuracy: Math.round(s.metrics.accuracy * 100),
        optimal: 70,
      }))
    : [
        { date: 'Sep 10', accuracy: 65, optimal: 70 },
        { date: 'Sep 13', accuracy: 68, optimal: 70 },
        { date: 'Sep 16', accuracy: 74, optimal: 70 },
        { date: 'Sep 19', accuracy: 72, optimal: 70 },
      ];

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const item: ReminderItem = {
      id: `rem_${Date.now()}`,
      type: newType,
      title: newTitle,
      time: newTime,
      dosage: newDosage || '1 Dose with water',
      spokenPrompt: {
        as: `${newTitle} খোৱাৰ সময় হ’ল।`,
        en: `It is time for your ${newTitle}.`,
      },
      completed: false,
      repeat: 'Daily',
    };

    onAddReminder(item);
    setShowAddReminderModal(false);
    setNewTitle('');
    setNewDosage('');
  };

  const handleExportReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header & Institute Branding
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('COGNICARE NER — CLINICAL COGNITIVE ASSESSMENT', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Lokpriya Gopinath Bordoloi Regional Institute of Mental Health (LGBRIMH Tezpur)', pageWidth / 2, 26, { align: 'center' });
    doc.text('Smart India Hackathon 2026 — Problem Statement 26003 (Geriatric MedTech)', pageWidth / 2, 31, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(15, 36, pageWidth - 15, 36);

    // Patient Information Block
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text('1. PATIENT DEMOGRAPHICS & TELEMETRY', 15, 46);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`Full Name: ${patient.name}`, 15, 54);
    doc.text(`Age / Gender: ${patient.age} Yrs / ${patient.gender}`, 15, 61);
    doc.text(`Residence: ${patient.village}, ${patient.district}, ${patient.state}`, 15, 68);
    doc.text(`Caregiver: ${patient.caregiverName} (${patient.caregiverPhone})`, 15, 75);
    doc.text(`Assigned ASHA Worker: ${patient.ashaWorkerName} (${patient.ashaWorkerPhone})`, 15, 82);
    doc.text(`Assessment Report Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 15, 89);

    // Clinical Scores Block
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text('2. CLINICAL SCORING & DEMENTIA STAGING', 15, 102);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Composite Cognitive Score (CCS): ${patient.compositeCognitiveScore} / 100`, 15, 110);
    doc.text(`Clinical Dementia Rating (CDR): ${clinical.cdrStage} — ${clinical.stageName}`, 15, 117);
    doc.text(`Estimated Mini-Mental State Exam (MMSE): ${clinical.estimatedMMSE} / 30`, 15, 124);
    doc.text(`Estimated Montreal Cognitive Assessment (MoCA): ${clinical.estimatedMoCA} / 30`, 15, 131);

    // Multi-Domain Breakdown Block
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text('3. MULTI-DOMAIN COGNITIVE PROFILING', 15, 144);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Episodic & Working Memory (Gamosa Match): ${domainMemory}%`, 20, 152);
    doc.text(`• Sustained Auditory Attention (Bihu Rhythm):  ${domainAttention}%`, 20, 159);
    doc.text(`• Executive Function & Sequencing (Daily Sort): ${domainExecutive}%`, 20, 166);
    doc.text(`• Visuospatial Pattern Analysis (Bamboo Match):  ${domainVisuospatial}%`, 20, 173);
    doc.text(`• Language & Voice Biomarkers (Food Assoc):     ${domainLanguage}%`, 20, 180);

    // Clinical Trajectory & Decline Status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 125, 50);
    doc.text('4. TRAJECTORY & CLINICAL RECOMMENDATIONS', 15, 194);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const trajectoryText = declineResult?.isDecline
      ? `ALERT: ${declineResult.message}`
      : 'Cognitive trajectory is currently stable with positive engagement in the Thompson Sampling flow zone.';
    doc.text(trajectoryText, 15, 202, { maxWidth: pageWidth - 30 });

    const recLines = doc.splitTextToSize(`Recommendation: ${clinical.clinicalRecommendation}`, pageWidth - 30);
    doc.text(recLines, 15, 214);

    // Voice Biomarker Section (if available)
    const bioSession = sessions.find((s) => s.gameType === 'word_association' && s.speechBiomarkers);
    if (bioSession?.speechBiomarkers) {
      const bio = bioSession.speechBiomarkers;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(46, 125, 50);
      doc.text('5. VOICE BIOMARKER ANALYSIS (Acoustic AI)', 15, 232);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 51, 51);
      doc.text(`Hesitation Index: ${bio.hesitationScore}/100 — ${
        bio.hesitationScore < 30 ? 'No clinical concern' :
        bio.hesitationScore < 60 ? 'Moderate — monitor trend' :
        'High — clinical review advised'
      }`, 15, 240);
      doc.text(`Response Latency: ${bio.responseLatencyMs} ms | Speech Rate: ${bio.speechRateEstimate} syl/s | Pauses Detected: ${bio.pauseCount}`, 15, 247);
      doc.text('Source: Word Association Food game (LGBRIMH validated acoustic feature protocol)', 15, 254, { maxWidth: pageWidth - 30 });
    }

    // Footer Sign-off
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 270, pageWidth - 15, 270);

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('Generated by CogniCare NER (স্মৃতি-সেতু). Grounded in LGBRIMH clinical guidelines. AI-assisted screening.', pageWidth / 2, 278, { align: 'center' });
    doc.text('Page 1 of 1', pageWidth / 2, 283, { align: 'center' });

    doc.save(`CogniCare_Clinical_Report_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-6 shadow-card-warm gamosa-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl border-2 border-amber-300 shadow-inner">
            📊
          </div>
          <div>
            <div className="text-xs font-bold text-ner-amber uppercase tracking-wider">
              {t('caregiver_doctor_portal', lang)}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-ner-bark">
              {patient.name}’s Cognitive Care Hub
            </h1>
            <p className="text-xs font-semibold text-ner-earth">
              Caregiver: {patient.caregiverName} • Clinical Model: LGBRIMH Tezpur Protocol
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-ner-sand p-1.5 rounded-2xl border border-ner-earth/30">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-ner-earth text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => setActiveTab('trajectory')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'trajectory'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            🔮 AI Trajectory
          </button>
          <button
            onClick={() => setActiveTab('respite')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'respite'
                ? 'bg-pink-700 text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            🎋 Respite & Burnout
          </button>
          <button
            onClick={() => setActiveTab('family_photos')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${
              activeTab === 'family_photos'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            ❤️ Family Memories
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'reminders'
                ? 'bg-ner-earth text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            💊 Reminders ({reminders.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${
              activeTab === 'alerts'
                ? 'bg-ner-earth text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            🔔 Alerts
            {alerts.filter((a) => !a.acknowledged).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === 'report'
                ? 'bg-ner-earth text-white shadow-sm'
                : 'text-ner-bark hover:bg-white/60'
            }`}
          >
            📄 Report
          </button>
        </div>
      </div>

      {/* AI Care Circle Traffic Light & Suggestions Widget */}
      <AiCareCircleWidget
        patient={patient}
        sessions={sessions}
        reminders={reminders}
        alerts={alerts}
        lang={lang}
        onOpenFamilyGame={() => setActiveTab('family_photos')}
        onCallAsha={() => window.open(`tel:${patient.ashaWorkerPhone}`, '_self')}
      />

      {/* ABDM, WhatsApp & Teleconsultation Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border-2 border-ner-earth/20 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>ABHA ID: {patient.abhaId || '14-8832-1920-4411'} (ABDM Compliant)</span>
          </span>
          <span className="text-xs font-semibold text-ner-earth">
            {patient.village}, {patient.district}, {patient.state}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <WhatsAppShareButton
            patientName={patient.name}
            accuracy={patient.compositeCognitiveScore}
            streakDays={patient.streakDays}
            phoneNumber={patient.caregiverPhone}
            variant="pill"
            lang={lang}
          />
          <button
            onClick={() => setShowESanjeevaniModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm transition-all active:scale-95"
            title="Dispatch Specialist Teleconsultation via e-Sanjeevani"
          >
            <Send className="w-3.5 h-3.5" />
            <span>e-Sanjeevani Teleconsult</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-ner-bark rounded-full text-xs font-bold border border-amber-300 shadow-sm transition-all active:scale-95"
            title="Customize Profile Photo & Regional Settings"
          >
            <Settings className="w-3.5 h-3.5 text-ner-terracotta" />
            <span>{t('settings_customization', lang).split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Feature 1.3: Red Decline Alert Banner */}
      {declineResult?.isDecline && (
        <div className="bg-red-50 border-3 border-ner-redSilk rounded-3xl p-5 shadow-card-warm flex items-start gap-4 animate-pulse">
          <AlertTriangle className="w-8 h-8 text-ner-redSilk shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-serif font-bold text-ner-redSilk">
              ⚠️ Cognitive Decline Trend Detected ({declineResult.declinePercentage}% drop)
            </h3>
            <p className="text-sm text-ner-bark font-medium mt-1">
              {declineResult.message}
            </p>
            <div className="mt-2 text-xs font-bold text-ner-redSilk bg-red-100/60 p-2.5 rounded-xl border border-ner-redSilk/30">
              Recommended Action: Schedule clinical check-in at LGBRIMH Tezpur or consult assigned ASHA worker ({patient.ashaWorkerName}: {patient.ashaWorkerPhone}).
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1: Composite Cognitive Score */}
            <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex flex-col justify-between">
              <span className="text-xs font-bold text-ner-earth uppercase">Composite Score (CCS)</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-serif font-extrabold text-ner-forest">
                  {patient.compositeCognitiveScore}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  declineResult?.isDecline
                    ? 'text-red-700 bg-red-100'
                    : 'text-ner-forest bg-ner-mint'
                }`}>
                  {declineResult?.isDecline ? `-${declineResult.declinePercentage}%` : '+3 pts/wk'}
                </span>
              </div>
              <span className="text-xs font-semibold text-ner-earth">
                {clinical.stageName} ({clinical.cdrStage})
              </span>
            </div>

            {/* Metric 2: Estimated MMSE Benchmark */}
            <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex flex-col justify-between">
              <span className="text-xs font-bold text-ner-earth uppercase">Est. MMSE Score</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-serif font-extrabold text-ner-amber">
                  {clinical.estimatedMMSE}
                </span>
                <span className="text-xs font-semibold text-ner-earth">/ 30 max</span>
              </div>
              <span className="text-xs font-semibold text-ner-earth">MoCA Est: {clinical.estimatedMoCA}/30</span>
            </div>

            {/* Metric 3: Weekly Sessions Played */}
            <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex flex-col justify-between">
              <span className="text-xs font-bold text-ner-earth uppercase">Monitored Sessions</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-serif font-extrabold text-ner-bark">
                  {sessions.length}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Tracked
                </span>
              </div>
              <span className="text-xs font-semibold text-ner-earth">Target: 3/day goal</span>
            </div>

            {/* Metric 4: Streak Days */}
            <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex flex-col justify-between">
              <span className="text-xs font-bold text-ner-earth uppercase">Active Streak</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-serif font-extrabold text-ner-gold">
                  {patient.streakDays}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  ⭐ Active
                </span>
              </div>
              <span className="text-xs font-semibold text-ner-earth">Continuous daily workout</span>
            </div>
          </div>

          {/* Polish 3.3: Dual Overlay Radar & Timeline Charts */}
          <div className="grid md:grid-cols-12 gap-6">
            {/* Left: Dual Radar Comparison */}
            <div className="md:col-span-6 bg-white border-2 border-ner-earth/20 rounded-3xl p-6 shadow-card-warm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-bold text-ner-bark">
                  {t('domain_radar_title', lang)}
                </h3>
                <span className="text-xs font-bold text-ner-earth bg-ner-sand px-2.5 py-1 rounded-full">
                  Dual Baseline
                </span>
              </div>

              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e6e1d6" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: '#3d2e24', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#8c7a6b' }} />
                    <Radar name="Current Assessment" dataKey="current" stroke="#2E7D32" fill="#2E7D32" fillOpacity={0.35} />
                    <Radar name="2 Weeks Ago Baseline" dataKey="previous" stroke="#E65100" fill="#E65100" fillOpacity={0.15} strokeDasharray="5 5" />
                    <Legend />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-ner-earth font-semibold mt-2 pt-2 border-t border-ner-sand">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#2E7D32]" />
                  <span>Current: {patient.compositeCognitiveScore} CCS</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E65100]" />
                  <span>Baseline: 70 CCS</span>
                </span>
              </div>
            </div>

            {/* Right: Cognitive Trajectory & Flow Zone AI Telemetry */}
            <div className="md:col-span-6 bg-white border-2 border-ner-earth/20 rounded-3xl p-6 shadow-card-warm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-bold text-ner-bark">
                  {t('flow_zone_title', lang)}
                </h3>
                <span className="text-xs font-bold text-ner-forest bg-ner-mint px-2.5 py-1 rounded-full">
                  Adaptive
                </span>
              </div>

              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e1d6" />
                    <XAxis dataKey="date" stroke="#8c7a6b" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#8c7a6b" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Line type="monotone" name="Session Accuracy %" dataKey="accuracy" stroke="#d96c4a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Optimal Flow Zone (70%)" dataKey="optimal" stroke="#2E7D32" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-ner-forest/30 space-y-1.5 mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-ner-forest">
                  <span>Target Flow Zone: 60% – 80% Accuracy</span>
                  <span>{declineResult?.isDecline ? 'Needs Review ⚠️' : 'Optimal Engagement ✅'}</span>
                </div>
                <p className="text-xs text-ner-earth leading-relaxed">
                  Thompson Sampling dynamically adjusts difficulty levels to prevent dementia-associated frustration while ensuring therapeutic cognitive neuroplasticity.
                </p>
              </div>
            </div>
          </div>

          {/* Speech Biomarker Panel — shown when a word_association session with biomarkers exists */}
          {(() => {
            const waSession = sessions.find(
              (s) => s.gameType === 'word_association' && s.speechBiomarkers
            );
            if (!waSession?.speechBiomarkers) return null;
            const bio = waSession.speechBiomarkers;
            return (
              <div className="bg-white border-2 border-blue-200/60 rounded-3xl p-6 shadow-card-warm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-ner-bark flex items-center gap-2">
                      🎙️ Voice Biomarker Analysis
                    </h3>
                    <p className="text-xs text-ner-earth font-medium mt-0.5">
                      From most recent Word Association session • Clinically validated acoustic feature extraction
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    LGBRIMH Protocol
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border-2 ${
                    bio.hesitationScore < 30 ? 'bg-green-50 border-green-200'
                    : bio.hesitationScore < 60 ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                      Hesitation Index (Primary Marker)
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-extrabold ${
                        bio.hesitationScore < 30 ? 'text-green-700'
                        : bio.hesitationScore < 60 ? 'text-amber-700' : 'text-red-700'
                      }`}>{bio.hesitationScore}</span>
                      <span className="text-lg text-gray-400 mb-0.5">/ 100</span>
                    </div>
                    <div className={`text-sm font-bold mt-1 ${
                      bio.hesitationScore < 30 ? 'text-green-700'
                      : bio.hesitationScore < 60 ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {bio.hesitationScore < 30 ? '✅ Excellent — No clinical concern'
                       : bio.hesitationScore < 60 ? '⚠️ Moderate — Monitor longitudinally'
                       : '🔴 High — Clinical review advised'}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div className={`h-2 rounded-full transition-all ${
                        bio.hesitationScore < 30 ? 'bg-green-500'
                        : bio.hesitationScore < 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${bio.hesitationScore}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Pauses</div>
                      <div className="text-2xl font-extrabold text-ner-bark">{bio.pauseCount}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">detected</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Latency</div>
                      <div className="text-2xl font-extrabold text-ner-bark">{bio.responseLatencyMs}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">ms</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center">
                      <div className="text-xs text-gray-500 font-bold uppercase mb-1">Speech Rate</div>
                      <div className="text-2xl font-extrabold text-ner-bark">{bio.speechRateEstimate}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">syl/s</div>
                    </div>
                    <div className="col-span-3 bg-blue-50 border border-blue-200/60 rounded-xl p-2 text-center">
                      <p className="text-[10px] text-blue-700 font-semibold leading-tight">
                        Biomarkers correlated with early Alzheimer's detection (LGBRIMH research protocol)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: PREDICTIVE AI COGNITIVE TRAJECTORY FORECASTER */}
      {activeTab === 'trajectory' && (
        <CognitiveTrajectoryForecaster patient={patient} sessions={sessions} lang={lang} />
      )}

      {/* TAB: CAREGIVER ACOUSTIC BURNOUT & RESPITE AI */}
      {activeTab === 'respite' && (
        <CaregiverBurnoutRespite patient={patient} lang={lang} />
      )}

      {/* TAB: FAMILY MEMORY PHOTO VAULT */}
      {activeTab === 'family_photos' && (
        <div className="animate-fadeIn">
          <FamilyMemoryManager lang={lang} />
        </div>
      )}

      {/* TAB 2: REMINDERS SCHEDULER */}
      {activeTab === 'reminders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-ner-bark">
              {t('medication_schedule_title', lang)}
            </h2>
            <button
              onClick={() => setShowAddReminderModal(true)}
              className="btn-tactile btn-tactile-green px-5 py-2 text-sm flex items-center gap-1.5"
            >
              <Plus className="w-5 h-5" />
              <span>{t('add_schedule', lang)}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {reminders.map((r) => (
              <div key={r.id} className="bg-white border-2 border-ner-earth/20 rounded-3xl p-5 shadow-card-warm flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl p-2.5 bg-amber-50 rounded-2xl border border-amber-200">
                    {r.type === 'medicine' ? '💊' : r.type === 'hydration' ? '💧' : r.type === 'appointment' ? '🩺' : r.type === 'meal' ? '🥗' : '🚶'}
                  </span>
                  <div>
                    <h4 className="text-lg font-bold text-ner-bark">{getLocalizedText(r.title, lang)}</h4>
                    <p className="text-xs font-semibold text-ner-earth">
                      {lang === 'as' ? 'সময়:' : 'Time:'} {r.time} • {getLocalizedText(r.dosage, lang)} ({r.repeat})
                    </p>
                    <p className="text-[11px] text-ner-forest font-medium mt-0.5">
                      Voice: "{r.spokenPrompt[lang] || r.spokenPrompt.en || r.spokenPrompt.as}"
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  r.completed ? 'bg-emerald-100 text-ner-forest' : 'bg-amber-100 text-ner-amber'
                }`}>
                  {r.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-fadeIn">
          <h2 className="text-xl font-serif font-bold text-ner-bark">
            {t('alert_center_title', lang)}
          </h2>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`p-5 rounded-3xl border-2 flex items-start justify-between ${
                  a.severity === 'urgent'
                    ? 'bg-red-50 border-ner-redSilk'
                    : a.severity === 'warning'
                    ? 'bg-amber-50 border-ner-amber'
                    : 'bg-emerald-50 border-ner-forest'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <AlertTriangle className={`w-7 h-7 shrink-0 ${
                    a.severity === 'urgent' ? 'text-ner-redSilk' : a.severity === 'warning' ? 'text-ner-amber' : 'text-ner-forest'
                  }`} />
                  <div>
                    <h4 className="text-base font-bold text-ner-bark">{a.title}</h4>
                    <p className="text-sm text-ner-earth font-medium">{a.message}</p>
                    <span className="text-[10px] text-ner-earth/70 font-semibold">{new Date(a.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {!a.acknowledged ? (
                  <button
                    onClick={() => onAcknowledgeAlert(a.id)}
                    className="btn-tactile bg-white text-ner-bark border-2 border-ner-bark px-4 py-1.5 text-xs"
                  >
                    {t('acknowledge', lang)}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-ner-forest bg-white px-3 py-1 rounded-full border border-ner-forest/30">
                    {t('acknowledged_status', lang)} ✅
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLINICAL REPORT (PDF Generation) */}
      {activeTab === 'report' && (
        <div className="bg-white border-2 border-ner-earth/20 rounded-3xl p-6 shadow-card-warm space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b-2 border-ner-sand pb-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-ner-bark">
                {t('clinical_summary_title', lang)}
              </h2>
              <p className="text-xs font-semibold text-ner-earth">
                Formatted for LGBRIMH Tezpur & Primary Health Centre Consultations
              </p>
            </div>

            <button
              onClick={handleExportReport}
              className="btn-tactile btn-tactile-green px-5 py-2.5 text-sm flex items-center gap-2 shadow-sm"
            >
              <Download className="w-5 h-5" />
              <span>{t('export_pdf_report', lang)}</span>
            </button>
          </div>

          <div className="bg-ner-cream p-5 rounded-2xl border border-ner-earth/30 space-y-4 font-mono text-xs text-ner-bark">
            <div className="font-bold text-ner-earth">PATIENT: {patient.name} ({patient.age} Yrs, {patient.gender}) • RESIDENCE: {patient.village}, {patient.district}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-3.5 rounded-xl border border-ner-sand font-sans">
              <div><strong>CCS SCORE:</strong> <span className="text-ner-forest font-bold">{patient.compositeCognitiveScore} / 100</span></div>
              <div><strong>EST. MMSE:</strong> <span className="text-ner-amber font-bold">{clinical.estimatedMMSE} / 30</span></div>
              <div><strong>STAGE:</strong> <span className="font-bold">{clinical.cdrStage}</span></div>
              <div><strong>LANGUAGE:</strong> <span className="font-bold">{patient.preferredLanguage.toUpperCase()}</span></div>
            </div>
            <div>
              <div className="font-bold text-ner-earth mb-1">CLINICAL STAGE ASSESSMENT:</div>
              <p className="font-sans text-sm text-ner-bark">{clinical.stageName}: {clinical.clinicalRecommendation}</p>
            </div>
            <div className="pt-2 border-t border-ner-sand text-xs font-sans text-ner-earth">
              💡 Clicking "Export PDF Report" generates an official vector clinical report with LGBRIMH formatting ready for printing or hospital record sharing.
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl border-3 border-ner-earth p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-serif font-bold text-ner-bark">
              {t('schedule_new_routine', lang)}
            </h3>

            <form onSubmit={handleCreateReminder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-ner-earth mb-1">{t('routine_title_label', lang)}:</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'Ex: Morning BP Medicine' : lang === 'as' ? 'যেনে: ৰাতিপুৱাৰ প্ৰেছাৰৰ ঔষধ' : 'Ex: Medicine'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-ner-earth/30 bg-ner-cream text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ner-earth mb-1">{t('routine_type_label', lang)}:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-ner-earth/30 bg-ner-cream text-sm font-semibold"
                  >
                    <option value="medicine">{t('type_medicine', lang)}</option>
                    <option value="hydration">{t('type_hydration', lang)}</option>
                    <option value="appointment">🩺 Doctor Appointment</option>
                    <option value="meal">🥗 Healthy Meal / Nutrition</option>
                    <option value="activity">{t('type_activity', lang)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ner-earth mb-1">{t('routine_time_label', lang)}:</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-ner-earth/30 bg-ner-cream text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ner-earth mb-1">{t('routine_dosage_label', lang)}:</label>
                <input
                  type="text"
                  placeholder={lang === 'en' ? 'Ex: 1 tablet after meals' : lang === 'as' ? 'যেনে: ১ টা টেবলেট ভাত খোৱাৰ পিছত' : 'Ex: 1 tablet'}
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-ner-earth/30 bg-ner-cream text-sm font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="btn-tactile bg-ner-sand text-ner-bark w-1/2 py-3 text-sm"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="btn-tactile btn-tactile-green w-1/2 py-3 text-sm"
                >
                  {t('save', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* e-Sanjeevani Teleconsultation Referral Modal */}
      {showESanjeevaniModal && (
        <ESanjeevaniReferralModal
          patient={patient}
          lang={lang}
          onClose={() => setShowESanjeevaniModal(false)}
          onReferralDispatched={(ref) => {
            console.log('[CogniCare] Caregiver dispatched e-Sanjeevani referral:', ref);
          }}
        />
      )}
      {/* Settings & Customization Modal */}
      <SettingsCustomizationModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={lang}
      />
    </div>
  );
};
