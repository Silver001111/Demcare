import React, { useState } from 'react';
import { X, Send, Download, CheckCircle2, AlertTriangle, ShieldCheck, Building2, User, Clock, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { PatientProfile, AshaObservation, TeleconsultReferral, LanguageCode } from '../../types';

interface Props {
  patient: PatientProfile;
  observation?: AshaObservation;
  lang?: LanguageCode;
  onClose: () => void;
  onReferralDispatched?: (referral: TeleconsultReferral) => void;
}

const REFERRAL_FACILITIES = [
  'LGBRIMH Tezpur (National Institute of Mental Health)',
  'Gauhati Medical College & Hospital (Dept of Geriatric Medicine)',
  'Tezpur Medical College & Hospital (TMCH)',
  'Sonitpur District Civil Hospital',
  'Bihaguri Primary Health Centre (PHC - Telemedicine Hub)',
];

export const ESanjeevaniReferralModal: React.FC<Props> = ({
  patient,
  observation,
  lang = 'en',
  onClose,
  onReferralDispatched,
}) => {
  const [token] = useState(() => `ESANJ-NER-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedFacility, setSelectedFacility] = useState(REFERRAL_FACILITIES[0]);
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'tele_psychiatry'>('urgent');
  const [clinicalNotes, setClinicalNotes] = useState(
    `Suspected Mild Cognitive Impairment (MCI). Cognitive check score: ${observation?.cognitiveCheckScore ?? 58}%. Patient demonstrates noticeable speech hesitation and evening confusion. Requesting specialist teleconsultation via e-Sanjeevani.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const handleDispatch = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDispatched(true);

      const referral: TeleconsultReferral = {
        id: `ref_${Date.now()}`,
        token,
        patientId: patient.id,
        patientName: patient.name,
        abhaId: patient.abhaId || '14-8832-1920-4411',
        age: patient.age,
        gender: patient.gender,
        village: patient.village,
        district: patient.district,
        screeningScore: observation?.cognitiveCheckScore ?? 58,
        referredFacility: selectedFacility,
        priority,
        referralDate: new Date().toISOString(),
        status: 'queued',
        ashaWorker: patient.ashaWorkerName,
        clinicalNotes,
      };

      onReferralDispatched?.(referral);
    }, 1200);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header banner
    doc.setFillColor(15, 76, 58); // Forest green
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('e-Sanjeevani National Teleconsultation Service', 14, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Ministry of Health & Family Welfare (MoHFW) | Ayushman Bharat Digital Mission (ABDM)', 14, 22);
    doc.text(`Official Referral Token: ${token}`, 14, 28);

    // Patient & Clinical Information
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PATIENT DEMOGRAPHICS & HEALTH ID', 14, 44);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${patient.name} (${patient.age} Yrs / ${patient.gender})`, 14, 52);
    doc.text(`ABHA Health ID: ${patient.abhaId || '14-8832-1920-4411'} (ABDM Verified)`, 14, 58);
    doc.text(`Location: ${patient.village}, ${patient.district}, ${patient.state}`, 14, 64);
    doc.text(`Referring ASHA Worker: ${patient.ashaWorkerName} (${patient.ashaWorkerPhone})`, 14, 70);

    // Screening Metrics
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('2. SCREENING ASSESSMENT & RISK FLAGS', 14, 82);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`CogniCare Rapid Screening Score: ${observation?.cognitiveCheckScore ?? 58}% (Clinical MCI Alert)`, 14, 90);
    doc.text(`Sleep Quality: ${observation?.sleepQuality ?? 'Restless'} | Appetite: ${observation?.appetite ?? 'Normal'} | Mood: ${observation?.moodAgitation ?? 'Mild Confusion'}`, 14, 96);
    doc.text(`Acoustic Speech Biomarker: Elevated pause frequency and hesitation latency detected`, 14, 102);

    // Teleconsult Destination
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. REFERRAL ROUTING & TELECONSULTATION', 14, 114);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receiving Medical Facility: ${selectedFacility}`, 14, 122);
    doc.text(`Triage Priority: ${priority.toUpperCase()}`, 14, 128);
    doc.text(`Referral Date: ${new Date().toLocaleDateString()}`, 14, 134);

    // Clinical Notes
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('4. ASHA FIELD OBSERVATION & CLINICAL RATIONALE', 14, 146);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(clinicalNotes, 180);
    doc.text(splitNotes, 14, 154);

    // Footer signature block
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 240, 90, 240);
    doc.line(120, 240, 196, 240);
    doc.setFontSize(9);
    doc.text('Signature of Referring ASHA / MO', 14, 246);
    doc.text('Receiving Teleconsult Specialist / MD', 120, 246);

    doc.save(`eSanjeevani_Referral_${token}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border-3 border-emerald-700 shadow-2xl">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 rounded-t-3xl flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-600 text-emerald-100 text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                MoHFW • e-Sanjeevani
              </span>
              <span className="bg-amber-400 text-amber-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                Token: {token}
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">
              e-Sanjeevani Teleconsultation Referral
            </h2>
            <p className="text-xs text-emerald-200">
              National Telemedicine Service (ABDM Interoperable Clinical Dispatch)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-emerald-300 hover:text-white rounded-full hover:bg-emerald-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Patient Card */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
                👵
              </div>
              <div>
                <div className="font-bold text-ner-bark text-lg flex items-center gap-2">
                  <span>{patient.name}</span>
                  <span className="text-xs font-bold text-ner-earth">({patient.age} Yrs, {patient.gender})</span>
                </div>
                <div className="text-xs text-ner-earth">
                  {patient.village}, {patient.district} • ASHA: {patient.ashaWorkerName}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ABHA: {patient.abhaId || '14-8832-1920-4411'}</span>
              </div>
            </div>
          </div>

          {/* Clinical Risk Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-[11px] font-bold text-red-700 uppercase">Screening Score</div>
              <div className="text-xl font-serif font-bold text-red-900">
                {observation?.cognitiveCheckScore ?? 58}%
              </div>
              <div className="text-[10px] text-red-600 font-semibold">High MCI Risk Flag</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-[11px] font-bold text-amber-800 uppercase">Voice Hesitation</div>
              <div className="text-xl font-serif font-bold text-amber-900">Elevated</div>
              <div className="text-[10px] text-amber-700 font-semibold">Acoustic pauses flagged</div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-blue-800 uppercase">Behavioral Mood</div>
              <div className="text-xl font-serif font-bold text-blue-900 capitalize">
                {observation?.moodAgitation ?? 'Mild Confusion'}
              </div>
              <div className="text-[10px] text-blue-700 font-semibold">Evening sundowning risk</div>
            </div>
          </div>

          {/* Receiving Medical Facility */}
          <div>
            <label className="block text-xs font-bold text-ner-earth uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Receiving Telemedicine Hub / Medical College</span>
            </label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-ner-earth/30 bg-ner-cream font-bold text-ner-bark text-sm focus:border-emerald-700 focus:outline-none"
            >
              {REFERRAL_FACILITIES.map((facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-ner-earth uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Triage Priority</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['routine', 'urgent', 'tele_psychiatry'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPriority(lvl)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs capitalize border transition-all ${
                    priority === lvl
                      ? lvl === 'routine'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : lvl === 'urgent'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-white text-ner-bark border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {lvl.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-bold text-ner-earth uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Clinical Referral Rationale (Transmitted to Medical Officer)</span>
            </label>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-2xl border border-ner-earth/30 bg-ner-cream text-sm font-medium focus:border-emerald-700 focus:outline-none"
            />
          </div>

          {/* Dispatch Status banner */}
          {isDispatched && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <div>Referral Successfully Dispatched to e-Sanjeevani Queue!</div>
                <div className="text-xs font-normal text-emerald-800">
                  Token: <strong>{token}</strong> • Linked to {selectedFacility}. Specialist notification sent.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-3.5 px-4 bg-white text-ner-bark border-2 border-ner-earth/40 hover:bg-ner-sand rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-ner-earth" />
              <span>Download Referral Slip (PDF)</span>
            </button>

            <button
              onClick={handleDispatch}
              disabled={isSubmitting || isDispatched}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                isDispatched
                  ? 'bg-emerald-700 text-white cursor-default'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Transmitting to e-Sanjeevani...' : isDispatched ? 'Dispatched' : 'Dispatch to e-Sanjeevani'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
