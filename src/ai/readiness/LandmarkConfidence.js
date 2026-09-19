/**
 * LandmarkConfidence.js
 * Multi-tier Landmark Confidence Assessment Engine.
 *
 * Implements Section 5 of masterPrompt 1.md:
 * 0.85 - 1.00 -> Excellent
 * 0.70 - 0.84 -> Good
 * 0.45 - 0.69 -> Uncertain
 * < 0.45      -> Unreliable
 *
 * Configurable thresholds per joint. Prevents false form deductions when critical landmarks
 * are degraded by occlusions or lighting.
 */

export const CONFIDENCE_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  UNCERTAIN: 'uncertain',
  UNRELIABLE: 'unreliable'
};

export class LandmarkConfidence {
  constructor(config = {}) {
    this.thresholds = {
      excellent: config.excellent ?? 0.85,
      good: config.good ?? 0.70,
      uncertain: config.uncertain ?? 0.45
    };
  }

  /**
   * Evaluates the confidence tier of a single keypoint.
   * @param {Object} landmark - { x, y, z, visibility }
   * @returns {string} One of CONFIDENCE_LEVELS
   */
  getConfidenceTier(landmark) {
    if (!landmark) return CONFIDENCE_LEVELS.UNRELIABLE;
    const score = landmark.visibility ?? 1.0;

    if (score >= this.thresholds.excellent) return CONFIDENCE_LEVELS.EXCELLENT;
    if (score >= this.thresholds.good) return CONFIDENCE_LEVELS.GOOD;
    if (score >= this.thresholds.uncertain) return CONFIDENCE_LEVELS.UNCERTAIN;
    return CONFIDENCE_LEVELS.UNRELIABLE;
  }

  /**
   * Assesses a set of required joint indices across landmarks.
   * @param {Array} landmarks - Full landmarks array
   * @param {Array<number>} indices - Critical landmark indices for the exercise
   * @returns {Object} { overallScore, isReliable, degradedIndices, summary }
   */
  assessLandmarks(landmarks, indices = []) {
    if (!landmarks || landmarks.length === 0 || indices.length === 0) {
      return {
        overallScore: 0,
        isReliable: false,
        degradedIndices: indices,
        summary: 'No landmarks detected'
      };
    }

    let sum = 0;
    const degradedIndices = [];

    for (const idx of indices) {
      const pt = landmarks[idx];
      const vis = pt ? (pt.visibility ?? 1.0) : 0;
      sum += vis;

      if (vis < this.thresholds.uncertain) {
        degradedIndices.push(idx);
      }
    }

    const overallScore = Math.round((sum / indices.length) * 100) / 100;
    const isReliable = degradedIndices.length === 0 && overallScore >= this.thresholds.good;

    return {
      overallScore,
      isReliable,
      degradedIndices,
      summary: isReliable ? 'Landmarks confident' : `${degradedIndices.length} joints uncertain`
    };
  }
}
