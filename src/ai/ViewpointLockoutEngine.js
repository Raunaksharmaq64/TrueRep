/**
 * ViewpointLockoutEngine.js
 * Perspective & Camera Viewpoint Metric Lockout Engine.
 *
 * Computer Vision Physics Principle:
 * A single monocular camera CANNOT simultaneously measure frontal and sagittal
 * mechanics without perspective distortion:
 * - Side Profile (Sagittal View): Cannot optically measure knee adduction (valgus).
 *   Attempting to do so triggers false knee collapse warnings on clean reps.
 * - Frontal View: Cannot measure horizontal chest-to-floor clearance in push-ups.
 *
 * This engine gates biomechanical rules according to the active viewpoint.
 */

import { KinematicsMath } from './KinematicsMath.js';

export class ViewpointLockoutEngine {
  constructor() {
    this.smoothedYaw = 'frontal';
  }

  reset() {
    this.smoothedYaw = 'frontal';
  }

  /**
   * Evaluates camera perspective and returns metric gating rules.
   * @param {Array} landmarks - 33 MediaPipe body landmarks
   * @returns {Object} { viewpoint, isValgusAllowed, isSagittalDepthOptimal, coachingGuidance }
   */
  evaluateViewpoint(landmarks, exercise = 'squat') {
    if (!landmarks || landmarks.length < 25) {
      return {
        viewpoint: 'frontal',
        isValgusAllowed: true,
        isSagittalDepthOptimal: true,
        coachingGuidance: null
      };
    }

    const shoulderL = landmarks[11];
    const shoulderR = landmarks[12];
    const hipL = landmarks[23];
    const hipR = landmarks[24];

    const yawData = KinematicsMath.estimateBodyYaw(shoulderL, shoulderR, hipL, hipR);
    this.smoothedYaw = yawData.viewAngle;

    const isValgusAllowed = this.smoothedYaw !== 'side';
    const isSagittalDepthOptimal = this.smoothedYaw === 'diagonal' || this.smoothedYaw === 'side';

    let coachingGuidance = null;
    if (exercise === 'squat' && this.smoothedYaw === 'frontal') {
      coachingGuidance = 'Tip: Stand at 45° angle for optimal depth tracking';
    } else if (exercise === 'pushup' && this.smoothedYaw === 'frontal') {
      coachingGuidance = 'Tip: Position camera side-on or at 45° to track chest depth';
    }

    return {
      viewpoint: this.smoothedYaw,
      yawRatio: yawData.yawRatio,
      isValgusAllowed,
      isSagittalDepthOptimal,
      coachingGuidance
    };
  }
}
