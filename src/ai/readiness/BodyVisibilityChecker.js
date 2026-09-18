/**
 * BodyVisibilityChecker.js
 * Hardware & Viewport Boundary Visibility Validator.
 *
 * Implements Section 11 & Section 14 of masterPrompt 1.md:
 * Distinguishes software-compensable framing from physical camera limits.
 * Emits ONE simple, actionable human instruction when physical positioning is required.
 */

export const VISIBILITY_ISSUES = {
  OK: 'OK',
  TOO_CLOSE: 'TOO_CLOSE',
  TOO_FAR: 'TOO_FAR',
  FEET_MISSING: 'FEET_MISSING',
  HEAD_MISSING: 'HEAD_MISSING',
  OFF_CENTER_LEFT: 'OFF_CENTER_LEFT',
  OFF_CENTER_RIGHT: 'OFF_CENTER_RIGHT',
  JOINTS_MISSING: 'JOINTS_MISSING',
  MULTIPLE_PEOPLE: 'MULTIPLE_PEOPLE'
};

export class BodyVisibilityChecker {
  constructor(config = {}) {
    this.minBodyHeight = config.minBodyHeight ?? 0.28; // < 28% frame height = too far
    this.maxBodyHeight = config.maxBodyHeight ?? 0.88; // > 88% frame height = too close
    this.borderMargin = config.borderMargin ?? 0.02;   // border clipping boundary
  }

  /**
   * Checks full body visibility against required exercise joints.
   * @param {Array} landmarks - 33 MediaPipe body landmarks
   * @param {Object} options - { exercise: 'squat' | 'pushup' | 'jumpingjack', requiredIndices: [...] }
   * @returns {Object} { isSatisfied, issue, instruction, visibilityScore }
   */
  checkVisibility(landmarks, options = {}) {
    if (!landmarks || landmarks.length < 25) {
      return {
        isSatisfied: false,
        issue: VISIBILITY_ISSUES.JOINTS_MISSING,
        instruction: 'Step into camera view',
        visibilityScore: 0
      };
    }

    const { exercise = 'squat', requiredIndices = [11, 12, 23, 24, 25, 26, 27, 28] } = options;

    const xs = landmarks.map(p => p.x);
    const ys = landmarks.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const bodyHeight = maxY - minY;
    const bodyWidth = maxX - minX;
    const centerX = (minX + maxX) / 2;

    const nose = landmarks[0];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // 1. Check distance (Too close vs. Too far)
    if (exercise !== 'pushup') {
      if (bodyHeight > this.maxBodyHeight) {
        return {
          isSatisfied: false,
          issue: VISIBILITY_ISSUES.TOO_CLOSE,
          instruction: 'Move slightly back',
          visibilityScore: 0.50
        };
      }
      if (bodyHeight < this.minBodyHeight) {
        return {
          isSatisfied: false,
          issue: VISIBILITY_ISSUES.TOO_FAR,
          instruction: 'Move slightly closer',
          visibilityScore: 0.55
        };
      }
    }

    // 2. Check Feet Visibility for standing exercises (Squats & Jumping Jacks)
    if (exercise === 'squat' || exercise === 'jumpingjack') {
      const anklesMissing =
        (!leftAnkle || (leftAnkle.visibility ?? 1.0) < 0.28) &&
        (!rightAnkle || (rightAnkle.visibility ?? 1.0) < 0.28);
      const feetClippedAtBottom = maxY >= (1.0 - this.borderMargin);

      if (anklesMissing || feetClippedAtBottom) {
        return {
          isSatisfied: false,
          issue: VISIBILITY_ISSUES.FEET_MISSING,
          instruction: 'Make sure your feet are visible',
          visibilityScore: 0.60
        };
      }
    }

    // 3. Check Head Visibility
    if (minY <= this.borderMargin && (!nose || (nose.visibility ?? 1.0) < 0.30)) {
      return {
        isSatisfied: false,
        issue: VISIBILITY_ISSUES.HEAD_MISSING,
        instruction: 'Move the camera slightly higher',
        visibilityScore: 0.65
      };
    }

    // 4. Check Centering
    if (centerX < 0.15) {
      return {
        isSatisfied: false,
        issue: VISIBILITY_ISSUES.OFF_CENTER_LEFT,
        instruction: 'Move slightly to the center',
        visibilityScore: 0.70
      };
    }
    if (centerX > 0.85) {
      return {
        isSatisfied: false,
        issue: VISIBILITY_ISSUES.OFF_CENTER_RIGHT,
        instruction: 'Move slightly to the center',
        visibilityScore: 0.70
      };
    }

    // 5. Evaluate required landmark coverage
    let visibleCount = 0;
    for (const idx of requiredIndices) {
      const pt = landmarks[idx];
      if (pt && (pt.visibility ?? 1.0) >= 0.35) {
        visibleCount++;
      }
    }

    const coverageRatio = visibleCount / requiredIndices.length;
    if (coverageRatio < 0.75) {
      return {
        isSatisfied: false,
        issue: VISIBILITY_ISSUES.JOINTS_MISSING,
        instruction: 'Ensure full body is framed',
        visibilityScore: Math.round(coverageRatio * 100) / 100
      };
    }

    return {
      isSatisfied: true,
      issue: VISIBILITY_ISSUES.OK,
      instruction: null,
      visibilityScore: Math.min(1.0, Math.round(coverageRatio * 100) / 100)
    };
  }
}
