/**
 * FormScoringEngine.js
 * Multi-Metric Biomechanical Form Scoring & Quality Engine.
 *
 * Implements Section 18, 19, 20, 21 & 22 of masterPrompt 1.md:
 * Deconstructs repetition quality into 5 sports-science dimensions:
 * 1. Depth Score (35%)
 * 2. Alignment Score (25%)
 * 3. Stability Score (20%)
 * 4. Symmetry Score (10%)
 * 5. Tempo Score (10%)
 *
 * Emits confidence-aware scores and constructive feedback.
 */

import { ExerciseConfigManager } from '../exercise/ExerciseConfig.js';

export class FormScoringEngine {
  /**
   * Evaluates a completed repetition across all 5 dimensions.
   * @param {Object} repMetrics - Collected metrics during repetition
   * @param {string} exercise - Exercise identifier
   * @returns {Object} { overallScore, confidence, breakdown, qualityRating, feedback }
   */
  static evaluateRep(repMetrics, exercise = 'squat') {
    const config = ExerciseConfigManager.getConfig(exercise);
    const weights = config.scoringWeights;

    const {
      isOlympicDeep = false,
      isParallel = true,
      hasValgus = false,
      isCleanSpine = true,
      bilateralAsymmetry = false,
      duration = 1.0,
      confidence = 0.90
    } = repMetrics;

    // 1. Depth Score (0-100)
    let depthScore = 95;
    if (isOlympicDeep) depthScore = 100;
    else if (!isParallel) depthScore = 60;

    // 2. Alignment Score (0-100)
    let alignmentScore = 100;
    if (hasValgus) alignmentScore -= 25;
    if (!isCleanSpine) alignmentScore -= 30;
    alignmentScore = Math.max(50, alignmentScore);

    // 3. Stability Score (0-100)
    const stabilityScore = hasValgus || !isCleanSpine ? 75 : 95;

    // 4. Symmetry Score (0-100)
    const symmetryScore = bilateralAsymmetry ? 70 : 98;

    // 5. Tempo Score (0-100)
    let tempoScore = 95;
    if (duration < 0.60) tempoScore = 75; // slightly rushed
    else if (duration > 4.5) tempoScore = 80; // fatigue stall

    // Calculate Weighted Composite Overall Score
    let overallScore = Math.round(
      (depthScore * (weights.depth ?? 0.35)) +
      (alignmentScore * (weights.alignment ?? 0.25)) +
      (stabilityScore * (weights.stability ?? 0.20)) +
      (symmetryScore * (weights.symmetry ?? 0.10)) +
      (tempoScore * (weights.tempo ?? 0.10))
    );

    // Rating Label
    let qualityRating = 'ELITE';
    if (overallScore < 75) qualityRating = 'DEVELOPING';
    else if (overallScore < 88) qualityRating = 'SOLID';

    // Constructive Actionable Cue
    let feedback = 'Excellent repetition!';
    if (hasValgus) feedback = 'Keep knees pushed out over toes';
    else if (!isCleanSpine) feedback = 'Keep your core braced and spine neutral';
    else if (!isParallel) feedback = 'Squat 1-2 inches deeper for full credit';
    else if (depthScore === 100) feedback = 'Olympic-level depth!';

    return {
      overallScore,
      confidence: Math.round(confidence * 100),
      breakdown: {
        depth: depthScore,
        alignment: alignmentScore,
        stability: stabilityScore,
        symmetry: symmetryScore,
        tempo: tempoScore
      },
      qualityRating,
      feedback: confidence >= 0.65 ? feedback : 'Low confidence: Rep counted, maintain position'
    };
  }
}
