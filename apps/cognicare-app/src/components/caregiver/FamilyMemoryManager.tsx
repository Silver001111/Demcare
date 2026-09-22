import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, Plus, Sparkles, Image as ImageIcon, Mic, Square, Play, Pause, Volume2, Printer, Download, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAppStore } from '../../store/useAppStore';
import { LanguageCode } from '../../types';
import { audioSpeech } from '../../services/audioSpeech';
import { t } from '../../translations';

interface Props {
  lang?: LanguageCode;
  onOpenGameWithFamily?: () => void;
}

const RELATIONSHIP_OPTIONS = [
  'Granddaughter',
  'Grandson',
  'Daughter',
  'Son',
  'Daughter-in-law',
  'Son-in-law',
  'Spouse / Partner',
  'Sister',
  'Brother',
  'Lifelong Friend',
  'Family Pet',
  'Ancestral Home / Memory',
];

export const FamilyMemoryManager: React.FC<Props> = ({ lang = 'en', onOpenGameWithFamily }) => {
  const { familyPhotos, addFamilyPhoto, deleteFamilyPhoto, activePatient } = useAppStore();

  const [isAdding, setIsAdding] = useState(false);
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIP_OPTIONS[0]);
  const [yearOrOccasion, setYearOrOccasion] = useState('');
  const [notes, setNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Voice Memo State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Print & PDF Flashcard Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image is too large (max 5 MB). Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Audio File Upload Fallback
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a, .webm).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRecordedAudioUrl(event.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Microphone Voice Memo Recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Microphone not supported on this browser. You can upload an audio file instead.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMessage('Microphone permission denied. Please allow microphone access or upload an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const handlePlayVoice = (id: string, audioUrl: string) => {
    if (playingAudioId === id) {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    activeAudioElementRef.current = audio;
    setPlayingAudioId(id);

    audio.play().catch(() => {
      setPlayingAudioId(null);
    });

    audio.onended = () => {
      setPlayingAudioId(null);
      activeAudioElementRef.current = null;
    };
    audio.onerror = () => {
      setPlayingAudioId(null);
      activeAudioElementRef.current = null;
    };
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      setErrorMessage('Please enter the name of the person or place in the photo.');
      return;
    }
    if (!previewUrl) {
      setErrorMessage('Please upload or capture a photo.');
      return;
    }

    addFamilyPhoto({
      photoUrl: previewUrl,
      personName: personName.trim(),
      relationship,
      yearOrOccasion: yearOrOccasion.trim() || undefined,
      notes: notes.trim() || undefined,
      audioVoiceNoteUrl: recordedAudioUrl || undefined,
      audioDurationSeconds: recordingSeconds > 0 ? recordingSeconds : undefined,
    });

    audioSpeech.playGentleChime('success');

    // Reset Form
    setPersonName('');
    setRelationship(RELATIONSHIP_OPTIONS[0]);
    setYearOrOccasion('');
    setNotes('');
    setPreviewUrl(null);
    setRecordedAudioUrl(null);
    setIsAdding(false);
    setErrorMessage(null);
  };

  // Generate PDF of Flashcards
  const handleExportFlashcardsPdf = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const cardWidth = (pageWidth - margin * 2 - 10) / 2; // 2 columns for high readability
    const cardHeight = 85;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('CogniCare NER — Bedside Tactile Memory Flashcards', pageWidth / 2, 16, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Patient: ${activePatient?.name || 'Elderly Patient'} • Print & cut for bedside tactile engagement`, pageWidth / 2, 22, { align: 'center' });

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, 25, pageWidth - margin, 25);

    let xPos = margin;
    let yPos = 30;
    let col = 0;

    familyPhotos.forEach((photo, idx) => {
      if (yPos + cardHeight > 280) {
        doc.addPage();
        yPos = 20;
        xPos = margin;
        col = 0;
      }

      // Card boundary box
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.4);
      doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, 'S');

      // Card Header
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(xPos + 0.5, yPos + 0.5, cardWidth - 1, 12, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(146, 64, 14);
      doc.text(`${photo.personName}`, xPos + 4, yPos + 8);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 53, 15);
      doc.text(photo.relationship, xPos + cardWidth - 4, yPos + 8, { align: 'right' });

      // Photo placeholder / details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(`Memory Cue: ${photo.yearOrOccasion || 'Family Moment'}`, xPos + 4, yPos + 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitNotes = doc.splitTextToSize(photo.notes || 'Ask patient: "Do you remember the wonderful times spent together?"', cardWidth - 8);
      doc.text(splitNotes, xPos + 4, yPos + 30);

      // Memory Conversation Anchor Box
      doc.setFillColor(241, 245, 249);
      doc.rect(xPos + 4, yPos + 55, cardWidth - 8, 22, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('💬 Conversation Anchor:', xPos + 6, yPos + 61);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`"What is your favorite memory with ${photo.personName}?"`, xPos + 6, yPos + 67);

      col++;
      if (col >= 2) {
        col = 0;
        xPos = margin;
        yPos += cardHeight + 8;
      } else {
        xPos += cardWidth + 10;
      }
    });

    doc.save(`CogniCare_Family_Flashcards_${new Date().toISOString().slice(0, 10)}.pdf`);
    audioSpeech.playGentleChime('success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining AI Integration */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border-2 border-rose-200/90 rounded-3xl p-5 md:p-6 shadow-card-warm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-md shrink-0">
            🖼️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900">
                Family Memory Contribution Vault
              </h3>
              <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                AI Memory Sync
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
              Family members can upload photos and record voice memos. 
              Our games automatically ingest them so {activePatient?.name || 'the patient'} plays memory matching with real familiar faces and loving voices!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-tactile bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 px-4 py-2 text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Photo</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="btn-tactile bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 px-3.5 py-2 text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Print Bedside Memory Flashcards"
          >
            <Printer className="w-4 h-4 text-amber-700" />
            <span>{t('print_flashcards', lang)}</span>
          </button>

          {onOpenGameWithFamily && (
            <button
              onClick={onOpenGameWithFamily}
              className="btn-tactile bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-50 px-3.5 py-2 text-xs md:text-sm font-bold flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Launch Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Memory Modal / Accordion Form */}
      {isAdding && (
        <form onSubmit={handleSavePhoto} className="bg-white border-2 border-rose-300 rounded-3xl p-6 shadow-xl space-y-5 animate-slideUp">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-600" />
              <span>Upload New Family Photo & Voice Memo</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
            >
              ✕ Cancel
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Preview & Upload Button */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-2xl p-4 bg-rose-50/40 min-h-[240px]">
              {previewUrl ? (
                <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-inner group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg text-xs opacity-90 hover:opacity-100"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-sm border border-rose-200">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-tactile bg-white text-rose-600 border-2 border-rose-300 px-4 py-2 text-xs font-bold hover:bg-rose-50"
                    >
                      <Upload className="w-4 h-4 mr-1.5" />
                      Browse Photo from Phone / PC
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1.5">Max size: 5MB • Formats: JPG, PNG, WebP</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Photo Details Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Person or Place Name *
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Rahul, Ananya, Uncle Pranjal"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  >
                    {RELATIONSHIP_OPTIONS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year or Occasion
                  </label>
                  <input
                    type="text"
                    value={yearOrOccasion}
                    onChange={(e) => setYearOrOccasion(e.target.value)}
                    placeholder="e.g. Bihu 2024"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Heartwarming Note (Helps Memory Prompting)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Loves eating duck curry with grandmother on Bohag Bihu."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Voice Memo Recording Box */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    <span>Attach Personal Voice Memo (Plays on Match!)</span>
                  </label>
                  {isRecording && (
                    <span className="text-[11px] font-bold text-rose-600 animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      Recording: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 15s
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{recordedAudioUrl ? 'Re-record Voice Memo' : 'Record Voice Memo'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Audio File</span>
                  </button>
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                    className="hidden"
                  />

                  {recordedAudioUrl && (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => handlePlayVoice('form-preview', recordedAudioUrl)}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        {playingAudioId === 'form-preview' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>Preview Voice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecordedAudioUrl(null)}
                        className="text-slate-400 hover:text-red-500 text-xs font-bold"
                        title="Delete audio"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-tactile bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 px-6 py-2.5 text-xs font-bold shadow-md"
                >
                  Save to Memory Vault
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Gallery of Uploaded Family Memories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
            <span>❤️ Active Family Memory Deck</span>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              {familyPhotos.length} Photos
            </span>
          </h4>
          <span className="text-xs text-slate-500 font-semibold">
            Included in Card Match, Flashcards & Bedside Reminiscence
          </span>
        </div>

        {familyPhotos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <span className="text-4xl">📸</span>
            <p className="text-sm font-bold text-slate-700 mt-2">No family photos uploaded yet.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add photos of sons, daughters, grandchildren, or joyful memories to personalize cognitive stimulation!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {familyPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-44 bg-slate-100 relative overflow-hidden">
                    <img
                      src={photo.photoUrl}
                      alt={photo.personName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      {photo.relationship}
                    </span>

                    {photo.audioVoiceNoteUrl && (
                      <span className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Mic className="w-2.5 h-2.5" /> Voice Memo
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-slate-900 text-base">
                        {photo.personName}
                      </h5>
                      {photo.yearOrOccasion && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {photo.yearOrOccasion}
                        </span>
                      )}
                    </div>
                    {photo.notes && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {photo.notes}
                      </p>
                    )}

                    {photo.audioVoiceNoteUrl && (
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(photo.id, photo.audioVoiceNoteUrl!)}
                        className={`w-full mt-2 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          playingAudioId === photo.id
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        {playingAudioId === photo.id ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Playing Loved One's Voice...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Play Voice Memo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-3.5 pb-3 pt-1 flex items-center justify-between border-t border-slate-100 mt-2">
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Active in Games
                  </span>
                  <button
                    onClick={() => deleteFamilyPhoto(photo.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRINTABLE FLASHCARD PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-600" />
                  <span>Bedside Tactile Memory Flashcards</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Print or export high-contrast flashcards for bedside display or wallet albums to stimulate physical recall.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-tactile bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Direct Print</span>
                </button>

                <button
                  onClick={handleExportFlashcardsPdf}
                  className="btn-tactile bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Flashcards Preview Grid */}
            <div className="printable-flashcards-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {familyPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="printable-card border-2 border-dashed border-amber-400 bg-amber-50/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div>
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-amber-200">
                      <img src={photo.photoUrl} alt={photo.personName} className="w-full h-full object-cover" />
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-serif font-black text-slate-900">
                          {photo.personName}
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          {photo.relationship}
                        </span>
                      </div>

                      {photo.yearOrOccasion && (
                        <p className="text-[11px] font-bold text-amber-800 mt-1">
                          📅 {photo.yearOrOccasion}
                        </p>
                      )}

                      {photo.notes && (
                        <p className="text-[11px] text-slate-700 mt-1 italic">
                          "{photo.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-amber-200 text-[10px] space-y-0.5">
                    <span className="font-bold text-slate-900 block">💬 Ask Patient:</span>
                    <span className="text-slate-600 block">"Do you remember when you and {photo.personName} shared this joyful moment?"</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowPrintModal(false)}
                className="btn-tactile bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2 rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
