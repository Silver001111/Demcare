import { CognitiveDomainScores, GameMetrics, GameSession, GameType, PatientContext } from '../types';

/**
 * Contextual Multi-Armed Bandit (CMAB) using Thompson Sampling
 * for on-device real-time difficulty adaptation.
 * Target: 60% - 80% accuracy "Flow Zone"
 */
export class CognitiveAdaptiveEngine {
  private alpha: number[];
  private beta: number[];
  private readonly numLevels: number = 5;

  constructor() {
    // Initialize Beta priors for difficulty levels 1 to 5
    const storedAlpha = localStorage.getItem('cognicare_bandit_alpha');
    const storedBeta = localStorage.getItem('cognicare_bandit_beta');

    if (storedAlpha && storedBeta) {
      this.alpha = JSON.parse(storedAlpha);
      this.beta = JSON.parse(storedBeta);
    } else {
      // Prior favors easier starting levels for dementia patients
      this.alpha = [1, 1, 1, 1, 1];
      this.beta = [1, 1, 1, 1, 1];
    }
  }

  // Fast approximation of Beta distribution sample using Box-Muller / Gamma transform
  private sampleBeta(alpha: number, beta: number): number {
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.max(0.0001, Math.random());
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    const normal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const sample = mean + stdDev * normal;
    return Math.max(0.01, Math.min(0.99, sample));
  }

  private applyContext(samples: number[], ctx: PatientContext): number[] {
    const adjustments = [1, 1, 1, 1, 1];
    
    if (ctx.timeSinceLastSession > 48) {
      for (let i = 0; i < this.numLevels; i++) adjustments[i] *= 0.8;
    }
    if (ctx.fatigueScore > 0.7) {
      adjustments[3] *= 0.5;
      adjustments[4] *= 0.5;
    }
    if (ctx.recentTrend === 'declining') {
      for (let i = 0; i < this.numLevels; i++) adjustments[i] *= 0.9;
    }
    
    return samples.map((sample, i) => sample * adjustments[i]);
  }

  /**
   * Selects the next recommended difficulty level (1 to 5)
   */
  public selectDifficulty(ctx?: PatientContext): number {
    const defaultCtx: PatientContext = {
      timeSinceLastSession: 24,
      fatigueScore: 0.2,
      recentTrend: 'stable'
    };
    const activeCtx = ctx || defaultCtx;

    const samples: number[] = [];
    for (let i = 0; i < this.numLevels; i++) {
      samples.push(this.sampleBeta(this.alpha[i], this.beta[i]));
    }

    const adjusted = this.applyContext(samples, activeCtx);

    let bestIndex = 0;
    let maxVal = adjusted[0];
    for (let i = 1; i < this.numLevels; i++) {
      if (adjusted[i] > maxVal) {
        maxVal = adjusted[i];
        bestIndex = i;
      }
    }
    return bestIndex + 1; // 1-indexed difficulty
  }

  /**
   * Updates bandit beliefs based on patient performance
   * Success = accuracy is inside the 60% - 80% Flow Zone
   */
  public updateBeliefs(difficultyLevel: number, accuracy: number, engagement: number, ctx: PatientContext): {
    inFlowZone: boolean;
    nextLevel: number;
  } {
    const levelIdx = Math.max(0, Math.min(this.numLevels - 1, difficultyLevel - 1));
    const inFlowZone = accuracy >= 0.60 && accuracy <= 0.80;

    if (inFlowZone && engagement > 0.5) {
      this.alpha[levelIdx] += 1;
    } else {
      this.beta[levelIdx] += 1;
    }

    // Persist beliefs locally for offline continuity
    localStorage.setItem('cognicare_bandit_alpha', JSON.stringify(this.alpha));
    localStorage.setItem('cognicare_bandit_beta', JSON.stringify(this.beta));

    const nextLevel = this.selectDifficulty(ctx);
    return { inFlowZone, nextLevel };
  }
}

export const banditEngine = new CognitiveAdaptiveEngine();

/**
 * Calculates domain scores and Composite Cognitive Score (CCS)
 */
export function calculateCognitiveScore(
  gameType: GameType,
  difficultyLevel: number,
  metrics: GameMetrics,
  previousDomainScores: CognitiveDomainScores
): { domainScores: CognitiveDomainScores; compositeScore: number } {
  // Performance factor from accuracy, speed, and precision
  const speedFactor = Math.max(0.4, Math.min(1.0, 4000 / (metrics.avgResponseTimeMs || 2500)));
  const gameScore = Math.round(
    (metrics.accuracy * 60) + (speedFactor * 25) + (metrics.touchPrecision * 15)
  );

  const updatedScores: CognitiveDomainScores = { ...previousDomainScores };

  if (gameType === 'card_match') {
    updatedScores.memory = Math.round((updatedScores.memory * 0.6) + (gameScore * 0.4));
    updatedScores.visuospatial = Math.round((updatedScores.visuospatial * 0.7) + (gameScore * 0.3));
  } else if (gameType === 'rhythm_recall') {
    updatedScores.memory = Math.round((updatedScores.memory * 0.6) + (gameScore * 0.4));
    updatedScores.attention = Math.round((updatedScores.attention * 0.5) + (gameScore * 0.5));
  } else if (gameType === 'routine_sort') {
    updatedScores.executive = Math.round((updatedScores.executive * 0.6) + (gameScore * 0.4));
    updatedScores.attention = Math.round((updatedScores.attention * 0.7) + (gameScore * 0.3));
  } else if (gameType === 'spot_difference') {
    updatedScores.attention = Math.round((updatedScores.attention * 0.6) + (gameScore * 0.4));
    updatedScores.visuospatial = Math.round((updatedScores.visuospatial * 0.6) + (gameScore * 0.4));
  } else if (gameType === 'pattern_completion') {
    updatedScores.executive = Math.round((updatedScores.executive * 0.6) + (gameScore * 0.4));
    updatedScores.visuospatial = Math.round((updatedScores.visuospatial * 0.6) + (gameScore * 0.4));
  } else if (gameType === 'word_association') {
    updatedScores.language = Math.round((updatedScores.language * 0.6) + (gameScore * 0.4));
    updatedScores.memory = Math.round((updatedScores.memory * 0.7) + (gameScore * 0.3));
  } else if (gameType === 'clock_drawing') {
    // Clock Drawing primarily tests Visuospatial, Executive, and Abstract conceptualization
    updatedScores.visuospatial = Math.round((updatedScores.visuospatial * 0.5) + (gameScore * 0.5));
    updatedScores.executive = Math.round((updatedScores.executive * 0.5) + (gameScore * 0.5));
    updatedScores.attention = Math.round((updatedScores.attention * 0.7) + (gameScore * 0.3));
  } else if (gameType === 'olfactory_recall') {
    // Olfactory Recall assesses Entorhinal / Hippocampal sensory memory and naming
    updatedScores.memory = Math.round((updatedScores.memory * 0.5) + (gameScore * 0.5));
    updatedScores.language = Math.round((updatedScores.language * 0.7) + (gameScore * 0.3));
    updatedScores.executive = Math.round((updatedScores.executive * 0.7) + (gameScore * 0.3));
  }

  // Composite Cognitive Score formulation (0 - 100)
  const compositeScore = Math.round(
    (0.25 * updatedScores.memory) +
    (0.20 * updatedScores.attention) +
    (0.20 * updatedScores.executive) +
    (0.20 * updatedScores.visuospatial) +
    (0.15 * updatedScores.language)
  );

  return { domainScores: updatedScores, compositeScore };
}

/**
 * Maps Composite Cognitive Score (0 - 100) to Clinical Standard Test Equivalents
 * (MMSE, MoCA, Clinical Dementia Rating - CDR)
 */
export function mapToClinicalStandards(ccs: number): {
  estimatedMMSE: number;
  estimatedMoCA: number;
  cdrStage: string;
  stageName: string;
  clinicalRecommendation: string;
} {
  if (ccs >= 80) {
    return {
      estimatedMMSE: Math.round(27 + (ccs - 80) * 0.15),
      estimatedMoCA: Math.round(26 + (ccs - 80) * 0.2),
      cdrStage: 'CDR 0',
      stageName: 'Normal Aging / High Function',
      clinicalRecommendation: 'Continue preventative cognitive stimulation and daily hydration tracking.',
    };
  } else if (ccs >= 65) {
    return {
      estimatedMMSE: Math.round(22 + (ccs - 65) * (5 / 15)),
      estimatedMoCA: Math.round(20 + (ccs - 65) * (6 / 15)),
      cdrStage: 'CDR 0.5',
      stageName: 'Mild Cognitive Impairment (MCI)',
      clinicalRecommendation: 'Structured memory workouts, daily routine adherence, and monthly ASHA check-in.',
    };
  } else if (ccs >= 45) {
    return {
      estimatedMMSE: Math.round(15 + (ccs - 45) * (7 / 20)),
      estimatedMoCA: Math.round(12 + (ccs - 45) * (8 / 20)),
      cdrStage: 'CDR 1.0',
      stageName: 'Mild Dementia',
      clinicalRecommendation: 'Supervised routine recall, reminiscence photo therapy, and evening Sundowning soothing.',
    };
  } else {
    return {
      estimatedMMSE: Math.max(8, Math.round(14 - (45 - ccs) * 0.2)),
      estimatedMoCA: Math.max(6, Math.round(11 - (45 - ccs) * 0.2)),
      cdrStage: 'CDR 2.0+',
      stageName: 'Moderate / Severe Dementia',
      clinicalRecommendation: 'Assisted sensory stimulation, calming folk music therapy, and caregiver alert monitoring.',
    };
  }
}

/**
 * Analyzes recent session history and detects cognitive decline.
 * Triggers a caregiver alert if accuracy drops by more than 10%
 * over the last 14 days, or if flow zone achievement drops below 40%.
 * 
 * @param sessions - Array of all game sessions, newest first
 * @param currentCCS - Current Composite Cognitive Score
 * @returns Decline analysis object, or null if insufficient data
 */
export function detectCognitiveDecline(
  sessions: GameSession[],
  currentCCS: number
): { isDecline: boolean; declinePercentage: number; message: string } | null {
  // Need at least 5 sessions to detect a trend
  if (sessions.length < 5) return null;
  
  const now = Date.now();
  const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);
  
  // Filter to only recent sessions
  const recentSessions = sessions.filter(
    s => new Date(s.timestamp).getTime() > twoWeeksAgo
  );
  
  if (recentSessions.length < 3) return null;
  
  // Split into first half (older) and second half (newer) for comparison
  const midpoint = Math.floor(recentSessions.length / 2);
  const firstHalf = recentSessions.slice(midpoint);   // older sessions
  const secondHalf = recentSessions.slice(0, midpoint); // newer sessions
  
  const avgFirst = firstHalf.reduce((acc, s) => acc + s.metrics.accuracy, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((acc, s) => acc + s.metrics.accuracy, 0) / secondHalf.length;
  
  const declinePercentage = Math.round(((avgFirst - avgSecond) / Math.max(avgFirst, 0.01)) * 100);
  
  // Flow zone achievement rate
  const flowRate = recentSessions.filter(s => s.flowZoneAchieved).length / recentSessions.length;
  
  if (declinePercentage > 10 || flowRate < 0.4) {
    return {
      isDecline: true,
      declinePercentage,
      message: declinePercentage > 10
        ? `Cognitive accuracy has declined by ${declinePercentage}% over the past 2 weeks. Consider consulting with LGBRIMH Tezpur.`
        : `Flow zone achievement rate has dropped to ${Math.round(flowRate * 100)}%. Patient may need difficulty adjustment or clinical review.`,
    };
  }
  
  return { isDecline: false, declinePercentage: 0, message: 'Cognitive trajectory is stable.' };
}
