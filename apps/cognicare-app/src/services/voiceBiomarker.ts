/**
 * Voice Biomarker Analysis Service
 * 
 * Uses the Web Audio API to analyze recorded speech and extract
 * clinically relevant dementia biomarkers:
 * 
 * 1. Pause Count — Number of silence gaps > 500ms during speech
 * 2. Response Latency — Time from question to first speech onset (ms)
 * 3. Speech Rate — Estimated syllables per second
 * 4. Amplitude Variability — Standard deviation of volume (monotone speech = decline)
 * 
 * Clinical References:
 * - Konig et al. (2015) "Automatic speech analysis for dementia detection"
 * - Fraser et al. (2016) "Linguistic features for Alzheimer's detection"
 */

export interface SpeechBiomarkers {
  pauseCount: number;           // Number of pauses > 500ms
  totalPauseDurationMs: number; // Total time spent pausing
  responseLatencyMs: number;    // Time to first speech
  speechRateEstimate: number;   // Peaks per second (rough syllable proxy)
  amplitudeStdDev: number;      // Volume variability (0-1)
  hesitationScore: number;      // Composite hesitation score 0-100
}

const SILENCE_THRESHOLD = 0.02;     // RMS amplitude below this = silence
const MIN_PAUSE_DURATION_MS = 500;  // Minimum gap to count as a "pause"
const ANALYSIS_FRAME_SIZE = 2048;   // FFT size for analysis

/**
 * Analyzes an audio Blob and returns speech biomarker metrics.
 * 
 * @param audioBlob - The recorded audio Blob from MediaRecorder
 * @param questionTimestamp - When the question was shown/spoken (Date.now())
 * @returns SpeechBiomarkers object with all extracted metrics
 */
export async function analyzeSpeechBiomarkers(
  audioBlob: Blob,
  questionTimestamp: number = Date.now()
): Promise<SpeechBiomarkers> {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    console.warn('AudioContext not supported on this platform');
    return getFallbackBiomarkers();
  }

  const audioCtx = new AudioContextClass();
  
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0); // Mono channel
    const sampleRate = audioBuffer.sampleRate;
    
    // 1. Calculate RMS amplitude per frame
    const frameSize = ANALYSIS_FRAME_SIZE;
    const frameCount = Math.floor(rawData.length / frameSize);
    const rmsValues: number[] = [];
    
    for (let i = 0; i < frameCount; i++) {
      let sumSquares = 0;
      for (let j = 0; j < frameSize; j++) {
        const sample = rawData[i * frameSize + j];
        sumSquares += sample * sample;
      }
      rmsValues.push(Math.sqrt(sumSquares / frameSize));
    }
    
    const frameDurationMs = (frameSize / sampleRate) * 1000;
    
    // 2. Detect pauses (consecutive silent frames > 500ms)
    let pauseCount = 0;
    let totalPauseDurationMs = 0;
    let currentSilentFrames = 0;
    let firstSpeechFrameIndex = -1;
    let peakCount = 0;
    
    for (let i = 0; i < rmsValues.length; i++) {
      if (rmsValues[i] < SILENCE_THRESHOLD) {
        currentSilentFrames++;
      } else {
        // Mark first speech onset
        if (firstSpeechFrameIndex === -1) {
          firstSpeechFrameIndex = i;
        }
        // Count amplitude peaks for speech rate estimation
        if (i > 0 && rmsValues[i] > rmsValues[i - 1] && 
            (i === rmsValues.length - 1 || rmsValues[i] > rmsValues[i + 1])) {
          peakCount++;
        }
        // Check if the silence was long enough to be a pause
        const silenceDurationMs = currentSilentFrames * frameDurationMs;
        if (silenceDurationMs >= MIN_PAUSE_DURATION_MS && firstSpeechFrameIndex !== -1) {
          pauseCount++;
          totalPauseDurationMs += silenceDurationMs;
        }
        currentSilentFrames = 0;
      }
    }
    
    // 3. Response latency (time from recording start to first speech)
    const responseLatencyMs = firstSpeechFrameIndex >= 0
      ? firstSpeechFrameIndex * frameDurationMs
      : rmsValues.length * frameDurationMs; // Never spoke
    
    // 4. Speech rate (peaks per second as rough syllable proxy)
    const totalDurationSec = audioBuffer.duration;
    const speechDurationSec = Math.max(0.1, totalDurationSec - (totalPauseDurationMs / 1000));
    const speechRateEstimate = speechDurationSec > 0 ? peakCount / speechDurationSec : 0;
    
    // 5. Amplitude standard deviation (monotone speech indicator)
    const speechFrames = rmsValues.filter(v => v >= SILENCE_THRESHOLD);
    const mean = speechFrames.length > 0
      ? speechFrames.reduce((a, b) => a + b, 0) / speechFrames.length
      : 0;
    const variance = speechFrames.length > 0
      ? speechFrames.reduce((acc, v) => acc + (v - mean) ** 2, 0) / speechFrames.length
      : 0;
    const amplitudeStdDev = Math.sqrt(variance);
    
    // 6. Composite hesitation score (0 = fluent, 100 = severe hesitation)
    const hesitationScore = Math.min(100, Math.round(
      (pauseCount * 15) +                             // Each pause adds 15 points
      (Math.max(0, responseLatencyMs - 2000) / 100) + // Penalty for slow start (>2s)
      (Math.max(0, 3 - speechRateEstimate) * 10)      // Penalty for slow speech (<3 syl/s)
    ));
    
    await audioCtx.close();
    
    return {
      pauseCount,
      totalPauseDurationMs: Math.round(totalPauseDurationMs),
      responseLatencyMs: Math.round(responseLatencyMs),
      speechRateEstimate: Math.round(speechRateEstimate * 10) / 10,
      amplitudeStdDev: Math.round(amplitudeStdDev * 1000) / 1000,
      hesitationScore,
    };
  } catch (error) {
    console.error('Speech biomarker analysis failed:', error);
    try { await audioCtx.close(); } catch {}
    return getFallbackBiomarkers();
  }
}

function getFallbackBiomarkers(): SpeechBiomarkers {
  return {
    pauseCount: 0,
    totalPauseDurationMs: 0,
    responseLatencyMs: 0,
    speechRateEstimate: 0,
    amplitudeStdDev: 0,
    hesitationScore: 0,
  };
}
