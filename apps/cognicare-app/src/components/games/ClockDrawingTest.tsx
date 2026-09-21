import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Volume2, Sparkles, Award, ShieldAlert, CheckCircle2, AlertTriangle, Eye, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioSpeech } from '../../services/audioSpeech';
import { calculateCognitiveScore } from '../../services/aiEngine';
import { LanguageCode, GameSession, PatientProfile } from '../../types';
import { t } from '../../translations';
import { WhatsAppShareButton } from '../common/WhatsAppShareButton';

interface StrokePoint {
  x: number;
  y: number;
  t: number;
}

interface Stroke {
  points: StrokePoint[];
}

interface Props {
  patient: PatientProfile;
  lang: LanguageCode;
  onBack: () => void;
  onFinishSession: (session: GameSession) => void;
}

export const ClockDrawingTest: React.FC<Props> = ({ patient, lang, onBack, onFinishSession }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [useGuideCircle, setUseGuideCircle] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    rouleauScore: number;
    contourScore: number;
    numbersScore: number;
    handsScore: number;
    hemispatialNeglectDetected: boolean;
    aspectRatioVariance: number;
    handAngleDeltaDeg: number;
    clinicalStaging: string;
    recommendation: string;
  } | null>(null);

  // Spoken native prompt
  const getPromptText = () => {
    if (lang === 'as') {
      return 'এখন ঘড়ীৰ ছবি আঁকক, তাত ১ ৰ পৰা ১২ লৈকে সংখ্যাবোৰ বহাওক, আৰু কাঁটা দুডাল ১১ বাজি ১০ মিনিট দেখুৱাই থওক।';
    } else if (lang === 'bn') {
      return 'একটি ঘড়ির ছবি আঁকুন, সেখানে ১ থেকে ১২ পর্যন্ত সংখ্যাগুলি বসান, এবং কাঁটা দুটি ১১টা বেজে ১০ মিনিট দেখান।';
    } else if (lang === 'hi') {
      return 'एक घड़ी का चित्र बनाएं, उसमें 1 से 12 तक के अंक लिखें, और सुइयों को 11 बजकर 10 मिनट पर सेट करें।';
    } else if (lang === 'brx') {
      return 'घडीनि सावगारि एर, बेवहाय 1 निफ्राय 12 सिम अनजिमा दोन, आरो खाथिया 11 बाजिना 10 मिनिथाव फज।';
    } else if (lang === 'mni') {
      return 'পুংগী শক্তম অম য়েকউ, ১দগী ১২ ফাওবগী মশিং হাপ্পু, অমসুং পুং ১১ তাবা মিনিট ১০দা খুৎশিং থম্মু।';
    } else if (lang === 'kha') {
      return 'Dro ia ka dur baje, buh ki nombor 1 haduh 12, bad buh ki kti ha ka 11:10.';
    } else if (lang === 'lus') {
      return 'Sana hmai ziak rawh, number 1 aṭanga 12 thleng dah la, a kutzung chu 11:10-ah dah rawh.';
    } else if (lang === 'trp') {
      return 'Ghori rwnai kaisa rwh, 1 ni simi 12 khorok phwrwh, tei kothoma 11:10 sonadi.';
    } else if (lang === 'ne') {
      return 'घडीको चित्र बनाउनुहोस्, १ देखि १२ सम्मका अंक लेख्नुहोस्, र सुईहरूलाई ११ बजेर १० मिनेटमा मिलाउनुहोस्।';
    }
    return 'Draw a clock face, place numbers 1 to 12, and set the hands to 10 past 11.';
  };

  useEffect(() => {
    redrawCanvas();
  }, [strokes, currentStroke, useGuideCircle]);

  useEffect(() => {
    audioSpeech.speak(getPromptText(), lang);
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional subtle dashed guide circle
    if (useGuideCircle) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 140, 0, Math.PI * 2);
      ctx.strokeStyle = '#D7CCC8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();
    }

    // Draw all completed strokes
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2D1E18';
    ctx.lineWidth = 3.5;

    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }

    // Draw current active stroke
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    setCurrentStroke([{ ...coords, t: Date.now() }]);
  };

  const handleMoveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setCurrentStroke((prev) => [...prev, { ...coords, t: Date.now() }]);
  };

  const handleEndDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes((prev) => [...prev, { points: currentStroke }]);
    }
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setResult(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  // Automated Presets for Clinical Demos & Testing
  const loadPreset = (type: 'normal' | 'neglect' | 'executive_mci') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 130;

    const newStrokes: Stroke[] = [];

    // 1. Clock contour circle
    const circlePoints: StrokePoint[] = [];
    const steps = 60;
    const aspectFactor = type === 'executive_mci' ? 1.25 : 1.02;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      circlePoints.push({
        x: cx + Math.cos(theta) * r * (type === 'executive_mci' ? aspectFactor : 1),
        y: cy + Math.sin(theta) * r,
        t: Date.now() + i * 20,
      });
    }
    newStrokes.push({ points: circlePoints });

    // 2. Numbers
    if (type === 'neglect') {
      // Hemispatial Neglect: All numbers crammed into the right half (angles -pi/2 to pi/2)
      for (let num = 1; num <= 12; num++) {
        const theta = -Math.PI / 2 + (num / 13) * Math.PI; // Right hemisphere only
        const nx = cx + Math.cos(theta) * (r - 28);
        const ny = cy + Math.sin(theta) * (r - 28);
        newStrokes.push({
          points: [
            { x: nx - 5, y: ny - 8, t: Date.now() },
            { x: nx + 5, y: ny + 8, t: Date.now() + 10 },
          ],
        });
      }
    } else {
      // Normal or mild spacing
      for (let num = 1; num <= 12; num++) {
        const theta = (num * 30 - 90) * (Math.PI / 180);
        const spacingJitter = type === 'executive_mci' ? (Math.random() - 0.5) * 20 : 0;
        const nx = cx + Math.cos(theta) * (r - 28) + spacingJitter;
        const ny = cy + Math.sin(theta) * (r - 28) + spacingJitter;
        newStrokes.push({
          points: [
            { x: nx - 4, y: ny - 6, t: Date.now() },
            { x: nx + 4, y: ny + 6, t: Date.now() + 10 },
          ],
        });
      }
    }

    // 3. Hands: 11:10 (Short hand pointing to 11 = 330 deg / -60 deg; Long hand pointing to 2 = 60 deg / -30 deg)
    if (type === 'normal') {
      // Short hand to 11
      const ang11 = (11 * 30 - 90) * (Math.PI / 180);
      newStrokes.push({
        points: [
          { x: cx, y: cy, t: Date.now() },
          { x: cx + Math.cos(ang11) * 65, y: cy + Math.sin(ang11) * 65, t: Date.now() + 50 },
        ],
      });
      // Long hand to 2 (10 past)
      const ang2 = (2 * 30 - 90) * (Math.PI / 180);
      newStrokes.push({
        points: [
          { x: cx, y: cy, t: Date.now() },
          { x: cx + Math.cos(ang2) * 95, y: cy + Math.sin(ang2) * 95, t: Date.now() + 50 },
        ],
      });
    } else {
      // Incorrect hands (e.g. pointing to 10 and 11 or jumbled)
      const angErr1 = (7 * 30 - 90) * (Math.PI / 180);
      const angErr2 = (8 * 30 - 90) * (Math.PI / 180);
      newStrokes.push({
        points: [
          { x: cx, y: cy, t: Date.now() },
          { x: cx + Math.cos(angErr1) * 75, y: cy + Math.sin(angErr1) * 75, t: Date.now() + 50 },
        ],
      });
      newStrokes.push({
        points: [
          { x: cx, y: cy, t: Date.now() },
          { x: cx + Math.cos(angErr2) * 80, y: cy + Math.sin(angErr2) * 80, t: Date.now() + 50 },
        ],
      });
    }

    setStrokes(newStrokes);
  };

  /**
   * 3-Layer AI Geometric Analysis Engine
   */
  const handleAnalyzeClock = () => {
    if (strokes.length < 3) {
      alert(lang === 'as' ? 'অনুগ্ৰহ কৰি ঘড়ীটো আঁকি সম্পূৰ্ণ কৰক।' : 'Please draw the clock face, numbers, and hands first.');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      const width = canvas ? canvas.width : 400;
      const height = canvas ? canvas.height : 400;
      const centerX = width / 2;
      const centerY = height / 2;

      // Flatten points
      const allPoints: StrokePoint[] = [];
      strokes.forEach((s) => s.points.forEach((p) => allPoints.push(p)));

      // 1. Layer A: Contour Analysis (Aspect ratio & Circularity)
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      allPoints.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const spanX = Math.max(1, maxX - minX);
      const spanY = Math.max(1, maxY - minY);
      const aspectRatioVariance = Math.abs(spanX - spanY) / Math.max(spanX, spanY);
      const contourScore = Math.max(20, Math.round(100 - aspectRatioVariance * 160));

      // 2. Layer B: Number Distribution & Hemispatial Neglect Detection
      let rightCount = 0;
      let leftCount = 0;
      allPoints.forEach((p) => {
        if (p.x >= centerX) rightCount++;
        else leftCount++;
      });

      const totalPoints = allPoints.length;
      const rightRatio = rightCount / Math.max(1, totalPoints);
      // Hemispatial Neglect flagged if > 76% of strokes lie on the right
      const hemispatialNeglectDetected = rightRatio > 0.76;
      const numbersScore = hemispatialNeglectDetected
        ? 35
        : Math.round(75 + (1 - Math.abs(rightRatio - 0.50)) * 25);

      // 3. Layer C: Hand Angle & Abstract Conceptualization
      // Looking for hands originating near center
      const centerRadius = 45;
      const radialStrokes = strokes.filter((s) => {
        const start = s.points[0];
        const distFromCenter = Math.hypot(start.x - centerX, start.y - centerY);
        return distFromCenter < centerRadius && s.points.length > 3;
      });

      let handsScore = 80;
      let handAngleDeltaDeg = 12;

      if (radialStrokes.length >= 2) {
        // Angles calculated relative to clock 12 o'clock
        const angles = radialStrokes.slice(0, 2).map((s) => {
          const end = s.points[s.points.length - 1];
          const deg = (Math.atan2(end.y - centerY, end.x - centerX) * 180) / Math.PI + 90;
          return (deg + 360) % 360;
        });

        // Target: 11 = 330 deg, 2 = 60 deg
        const d1 = Math.min(Math.abs(angles[0] - 330), Math.abs(angles[1] - 330));
        const d2 = Math.min(Math.abs(angles[0] - 60), Math.abs(angles[1] - 60));
        handAngleDeltaDeg = Math.round((d1 + d2) / 2);
        handsScore = Math.max(25, Math.round(100 - handAngleDeltaDeg * 0.8));
      } else if (hemispatialNeglectDetected) {
        handsScore = 40;
        handAngleDeltaDeg = 75;
      }

      // 4. Clinical Rouleau Scoring Scale (1 to 5)
      let rouleauScore = 5;
      let clinicalStaging = 'Normal Executive & Visuospatial Function';
      let recommendation = 'Preserve cognitive reserve with daily Bihu rhythm and routine sorting games.';

      if (hemispatialNeglectDetected || numbersScore < 45 || contourScore < 40) {
        rouleauScore = 2;
        clinicalStaging = 'Suspected Parietal Lobe / Moderate Cognitive Impairment';
        recommendation = 'Flagged for e-Sanjeevani Teleconsultation referral to LGBRIMH Tezpur neurologist.';
      } else if (handsScore < 50 || aspectRatioVariance > 0.3) {
        rouleauScore = 3;
        clinicalStaging = 'Mild Executive Dysfunction / Visuospatial Distortion';
        recommendation = 'Encourage daily Clock Drawing and Reminiscence stimulation.';
      } else if (handsScore < 75 || aspectRatioVariance > 0.15) {
        rouleauScore = 4;
        clinicalStaging = 'Minor Visuospatial Variance (Age-Appropriate)';
        recommendation = 'Healthy baseline. Continue regular monitoring with ASHA worker.';
      }

      setResult({
        rouleauScore,
        contourScore,
        numbersScore,
        handsScore,
        hemispatialNeglectDetected,
        aspectRatioVariance: Math.round(aspectRatioVariance * 100) / 100,
        handAngleDeltaDeg,
        clinicalStaging,
        recommendation,
      });

      setIsAnalyzing(false);
      audioSpeech.playGentleChime('success');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }, 900);
  };

  const handleSaveAndComplete = () => {
    if (!result) return;
    const durationSec = Math.max(10, Math.round((Date.now() - startTime) / 1000));
    const normalizedAccuracy = result.rouleauScore / 5;

    const previousScores = {
      memory: patient.compositeCognitiveScore,
      attention: patient.compositeCognitiveScore,
      executive: patient.compositeCognitiveScore,
      visuospatial: patient.compositeCognitiveScore,
      language: patient.compositeCognitiveScore,
    };

    const metrics = {
      accuracy: normalizedAccuracy,
      avgResponseTimeMs: durationSec * 1000,
      totalAttempts: 1,
      correctAttempts: result.rouleauScore >= 4 ? 1 : 0,
      hintsUsed: useGuideCircle ? 1 : 0,
      pauses: 1,
      touchPrecision: result.contourScore / 100,
    };

    const { domainScores } = calculateCognitiveScore('clock_drawing', 3, metrics, previousScores);

    const session: GameSession = {
      id: `session_cdt_${Date.now()}`,
      patientId: patient.id,
      gameType: 'clock_drawing',
      difficultyLevel: 3,
      metrics,
      domainScores,
      flowZoneAchieved: result.rouleauScore >= 4,
      timestamp: new Date().toISOString(),
      durationSeconds: durationSec,
      adaptedDifficultyNext: result.rouleauScore >= 4 ? 4 : 2,
      synced: false,
      clockDrawingMetrics: {
        rouleauScore: result.rouleauScore,
        contourScore: result.contourScore,
        numbersScore: result.numbersScore,
        handsScore: result.handsScore,
        hemispatialNeglectDetected: result.hemispatialNeglectDetected,
        aspectRatioVariance: result.aspectRatioVariance,
        handAngleDeltaDeg: result.handAngleDeltaDeg,
        clinicalStaging: result.clinicalStaging,
      },
    };

    onFinishSession(session);
    onBack();
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-ner-cream min-h-[85vh] flex flex-col justify-between font-sans animate-fadeIn">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="btn-tactile bg-white text-ner-bark px-5 py-2.5 text-lg border-2 border-ner-bark flex items-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">{t('back', lang)}</span>
          </button>

          <span className="px-4 py-1.5 bg-purple-100 text-purple-900 font-bold rounded-full text-base border border-purple-300 flex items-center gap-1.5 shadow-sm">
            <span>🕰️ {t('game7_title', lang)} (CDT)</span>
          </span>
        </div>

        {/* Spoken Instruction Banner */}
        <div className="bg-white border-3 border-ner-earth/30 rounded-3xl p-4 md:p-5 shadow-card-warm mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-ner-amber uppercase tracking-wide">
              {lang === 'brx' ? 'रुलौ 5-फुंथिनि आनजाद नेम (11:10)' : lang === 'as' ? 'ৰৌল’ ৫-পইণ্ট ক্লিনিকেল প্ৰট’কল (১১:১০)' : lang === 'hi' ? 'रूलौ 5-बिंदु नैदानिक ​​प्रोटोकॉल (11:10)' : 'Rouleau 5-Point Neuropsychological Protocol (11:10)'}
            </div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-ner-bark mt-0.5">
              {getPromptText()}
            </h2>
          </div>
          <button
            onClick={() => audioSpeech.speak(getPromptText(), lang)}
            className="p-3 bg-ner-gold text-ner-bark rounded-2xl shadow hover:scale-105 shrink-0"
            title="Listen to Spoken Prompt"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div className="bg-white border-3 border-ner-earth/40 rounded-3xl p-5 shadow-tactile my-auto flex flex-col items-center">
        {/* Presets & Drawing Tools Toolbar */}
        <div className="w-full flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseGuideCircle(!useGuideCircle)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                useGuideCircle
                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                  : 'bg-white text-ner-earth border-ner-earth/30'
              }`}
            >
              {useGuideCircle
                ? (lang === 'brx' ? '✓ गोलोन्दों हेफाजाब' : lang === 'as' ? '✓ বৃত্ত সহায়ক অন' : lang === 'hi' ? '✓ वृत्त सहायक चालू' : '✓ Circle Guide ON')
                : (lang === 'brx' ? '+ गोलोन्दों हेफाजाब' : lang === 'as' ? '+ বৃত্ত সহায়ক' : lang === 'hi' ? '+ वृत्त सहायक' : '+ Circle Guide')}
            </button>
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="px-3 py-1.5 bg-white text-ner-bark border border-ner-earth/30 rounded-xl text-xs font-bold hover:bg-ner-sand disabled:opacity-40"
            >
              {lang === 'brx' ? 'फिन खालाम' : lang === 'as' ? 'পূৰ্বৱত' : lang === 'hi' ? 'पूर्ववत' : 'Undo'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-50"
            >
              {lang === 'brx' ? 'हुखुमोर' : lang === 'as' ? 'মচি পেলাওক' : lang === 'hi' ? 'साफ़ करें' : 'Clear'}
            </button>
          </div>

          {/* Clinical Demo Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] text-ner-earth font-bold uppercase">Demo:</span>
            <button
              onClick={() => loadPreset('normal')}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-100"
            >
              Normal
            </button>
            <button
              onClick={() => loadPreset('neglect')}
              className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-300 rounded-lg text-xs font-bold hover:bg-red-100"
            >
              Neglect
            </button>
            <button
              onClick={() => loadPreset('executive_mci')}
              className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-100"
            >
              MCI
            </button>
          </div>
        </div>

        {/* The Touch/Mouse Canvas */}
        <div className="relative border-3 border-amber-200 rounded-3xl overflow-hidden bg-amber-50/30 shadow-inner">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            onMouseDown={handleStartDraw}
            onMouseMove={handleMoveDraw}
            onMouseUp={handleEndDraw}
            onMouseLeave={handleEndDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleMoveDraw}
            onTouchEnd={handleEndDraw}
            className="touch-none cursor-crosshair max-w-full"
            style={{ width: '360px', height: '360px' }}
          />
          {strokes.length === 0 && !isDrawing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-ner-earth/60">
              <span className="text-4xl mb-1">✍️</span>
              <span className="text-sm font-bold">
                {lang === 'brx' ? 'घडी एरनो आंगो बाहाय' : lang === 'as' ? 'ঘড়ী আঁকিবলৈ আঙুলি ব্যৱহাৰ কৰক' : lang === 'hi' ? 'घड़ी बनाने के लिए उंगली का उपयोग करें' : 'Use finger or stylus to draw clock face'}
              </span>
              <span className="text-xs">
                {lang === 'brx' ? 'अनजिमा 1 निफ्राय 12 • खाथि 11:10 आव' : lang === 'as' ? '১ ৰ পৰা ১২ লৈ সংখ্যা • ১১:১০ ত কাঁটা' : lang === 'hi' ? '1 से 12 तक अंक • 11:10 पर सुइयां' : 'Numbers 1 to 12 • Hands set to 11:10'}
              </span>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {!result && (
          <button
            onClick={handleAnalyzeClock}
            disabled={isAnalyzing || strokes.length === 0}
            className="btn-tactile bg-purple-700 hover:bg-purple-800 text-white mt-4 py-3.5 px-8 text-lg font-bold rounded-2xl border-2 border-purple-900 shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>
              {isAnalyzing
                ? (lang === 'brx' ? 'बिजिरगासिनो दं...' : lang === 'as' ? 'ঘড়ী বিশ্লেষণ কৰা হৈছে...' : lang === 'hi' ? 'विश्लेषण जारी है...' : 'Analyzing Clock Geometry...')
                : (lang === 'brx' ? 'AI आनजाद नायबिजिर' : lang === 'as' ? 'AI বিশ্লেষণ আৰম্ভ কৰক' : lang === 'hi' ? 'AI ज्यामितीय मूल्यांकन करें' : 'Run AI Geometric Scoring')}
            </span>
          </button>
        )}

        {/* Analysis Result Card */}
        {result && (
          <div className="w-full mt-5 p-5 bg-gradient-to-br from-purple-50 to-amber-50 border-3 border-purple-300 rounded-3xl text-left space-y-4 shadow-md animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3 border-purple-200">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                  {lang === 'brx' ? 'रुलौ 5-फुंथिनि स्कोर' : lang === 'as' ? 'ৰৌল’ ৫-পইণ্ট ক্লিনিকেল স্ক’ৰ' : lang === 'hi' ? 'रूलौ 5-बिंदु नैदानिक ​​स्कोर' : 'Rouleau 5-Point Clinical Score'}
                </span>
                <div className="text-3xl font-serif font-bold text-ner-bark flex items-baseline gap-2">
                  <span>{lang === 'brx' ? 'स्कोर' : lang === 'as' ? 'স্ক’ৰ' : lang === 'hi' ? 'स्कोर' : 'Score'} {result.rouleauScore} / 5</span>
                  <span className="text-sm font-sans font-bold text-emerald-700">
                    ({Math.round((result.rouleauScore / 5) * 100)}% {lang === 'brx' ? 'थारथि' : lang === 'as' ? 'শুদ্ধতা' : lang === 'hi' ? 'सटीकता' : 'Accuracy'})
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border-2 text-center font-bold text-xs ${
                  result.rouleauScore >= 4
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                    : result.rouleauScore === 3
                    ? 'bg-amber-100 text-amber-900 border-amber-400'
                    : 'bg-red-100 text-red-900 border-red-400'
                }`}
              >
                {result.rouleauScore >= 4
                  ? (lang === 'brx' ? '🟢 मोजां थासारि' : lang === 'as' ? '🟢 স্বাভাৱিক' : lang === 'hi' ? '🟢 सामान्य' : '🟢 Normal Staging')
                  : result.rouleauScore === 3
                  ? (lang === 'brx' ? '🟡 एसेल\' गोरोन्थि' : lang === 'as' ? '🟡 সামান্য বিজুতি' : lang === 'hi' ? '🟡 हल्का विचलन' : '🟡 Mild Deficit')
                  : (lang === 'brx' ? '🔴 सांग्रांथि' : lang === 'as' ? '🔴 সতৰ্কতা' : lang === 'hi' ? '🔴 सतर्कता आवश्यक' : '🔴 Clinical Alert')}
              </div>
            </div>

            {/* Hemispatial Neglect Warning if detected */}
            {result.hemispatialNeglectDetected && (
              <div className="p-3 bg-red-600 text-white rounded-2xl flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-amber-200 shrink-0" />
                <div className="text-xs font-semibold">
                  <strong>{lang === 'brx' ? 'हेमिसपेशियल नेग्लेक्ट नुजाबाय:' : 'Hemispatial Neglect Detected:'}</strong> {lang === 'brx' ? '76% नि बांसिन आगदा फारसे ज’ जादों। पाराइताल ल’बनि बिजिरथि।' : 'Over 76% of strokes clustered on right side. Classic biomarker for parietal lobe pathology and visual construction deficit.'}
                </div>
              </div>
            )}

            {/* 3-Layer Geometric Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <div className="text-[10px] uppercase font-bold text-ner-earth">
                  {lang === 'brx' ? 'लिर A: गोलोन्दों' : lang === 'as' ? 'স্তৰ ক: পৰিধি' : 'Layer A: Contour'}
                </div>
                <div className="text-lg font-bold text-ner-forest">{result.contourScore}%</div>
                <div className="text-[9px] text-ner-earth">Var: {result.aspectRatioVariance}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <div className="text-[10px] uppercase font-bold text-ner-earth">
                  {lang === 'brx' ? 'लिर B: अनजिमा' : lang === 'as' ? 'স্তৰ খ: সংখ্যা' : 'Layer B: Numbers'}
                </div>
                <div className="text-lg font-bold text-ner-amber">{result.numbersScore}%</div>
                <div className="text-[9px] text-ner-earth">{lang === 'brx' ? 'फाराग' : 'Quadrant Spacing'}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <div className="text-[10px] uppercase font-bold text-ner-earth">
                  {lang === 'brx' ? 'लिर C: 11:10 खाथि' : lang === 'as' ? 'স্তৰ গ: ১১:১০ কাঁটা' : 'Layer C: 11:10 Hands'}
                </div>
                <div className="text-lg font-bold text-purple-700">{result.handsScore}%</div>
                <div className="text-[9px] text-ner-earth">Delta: {result.handAngleDeltaDeg}°</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-purple-200 text-xs space-y-1">
              <div className="font-bold text-ner-bark">{lang === 'brx' ? 'आनजाद बिजिरनाय:' : lang === 'as' ? 'ক্লিনিকেল বিশ্লেষণ:' : 'Clinical Interpretation:'}</div>
              <div className="text-ner-earth">{result.clinicalStaging}</div>
              <div className="text-ner-forest font-medium pt-1">💡 {result.recommendation}</div>
            </div>

            <button
              onClick={handleSaveAndComplete}
              className="btn-tactile bg-ner-forest hover:bg-green-700 text-white w-full py-3.5 text-base font-bold rounded-xl border-2 border-green-900 shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{lang === 'brx' ? 'CDT आनजादनि फिथाइ दोनथुम' : lang === 'as' ? 'ক্লিনিকেল CDT ফলাফল সংৰক্ষণ কৰক' : lang === 'hi' ? 'क्लिनिकल CDT परिणाम सुरक्षित करें' : 'Save Clinical CDT Assessment'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-3 text-center text-xs font-semibold text-ner-earth mt-3">
        🌿 CogniCare NER — Digital CDT (Shulman / Rouleau Clinical Protocol • LGBRIMH Tezpur)
      </div>
    </div>
  );
};
