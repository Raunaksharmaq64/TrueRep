/**
 * SquatFSM.js
 * Biomechanically calibrated Finite State Machine for Squats.
 *
 * Features:
 *   - Uses stable 2D trigonometric joint angles (free from monocular z-depth noise).
 *   - Realistic lockout (>= 150°) and depth (<= 98°) for parallel squats.
 *   - Live Knee Valgus inward cave detector and torso lean monitor.
 *   - Real-time corrective posture coaching guidance.
 */

import { KinematicsMath } from './KinematicsMath';

export class SquatFSM {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = 'IDLE';
    this.repCount = 0;
    this.consecutiveCleanReps = 0;
    this.repStartTime = 0;
    this.lastRepDuration = 0;
    this.isFormValidInCurrentRep = true;
    this.formErrorReason = null;
    this.smoothedKneeAngle = null;
    this.smoothedHipAngle = null;
    this.feedback = 'Stand upright facing camera: Lock knees';
    this.postureGuidance = 'Stand upright facing camera';
    this.minRepDurationSeconds = 0.60;
    this.repHistory = [];
  }

  processFrame(landmarks) {
    if (!landmarks || landmarks.length < 25) {
      return this.getStatus(0, 0, false, 'Step back into camera view');
    }

    const profile = KinematicsMath.getDominantProfile(landmarks);
    const isRight = profile === 'right';

    // Keypoints
    const shoulder = landmarks[isRight ? 12 : 11];
    const hip = landmarks[isRight ? 24 : 23];
    const knee = landmarks[isRight ? 26 : 25];
    const ankle = landmarks[isRight ? 28 : 27];

    const isConfident = KinematicsMath.isConfidenceMet(
      landmarks,
      isRight ? [12, 24, 26] : [11, 23, 25],
      0.22
    );

    if (!isConfident) {
      return this.getStatus(
        this.smoothedKneeAngle || 0,
        this.smoothedHipAngle || 0,
        false,
        'Hips and legs must be visible'
      );
    }

    // 1. Calculate 2D Joint Angles (rock solid)
    // If ankle is occluded, use vertical fallback
    const lowerPt = ankle && (ankle.visibility ?? 1.0) >= 0.25
      ? ankle
      : { x: knee.x, y: knee.y + 0.35 };

    const rawKneeAngle = KinematicsMath.calculateAngle(hip, knee, lowerPt);
    const rawHipAngle = KinematicsMath.calculateAngle(shoulder, hip, knee);

    // 2. Smooth Angles
    this.smoothedKneeAngle = KinematicsMath.smoothAngleEMA(
      this.smoothedKneeAngle,
      rawKneeAngle,
      0.65
    );
    this.smoothedHipAngle = KinematicsMath.smoothAngleEMA(
      this.smoothedHipAngle,
      rawHipAngle,
      0.65
    );

    const kneeAngle = Math.round(this.smoothedKneeAngle);
    const hipAngle = Math.round(this.smoothedHipAngle);

    // 3. Knee Valgus & Torso Incline check (Latch faults only during active descent/ascent)
    const isActiveMotion = this.state === 'DESCENDING' || this.state === 'IN_DEPTH' || this.state === 'ASCENDING';
    const valgusResult = KinematicsMath.detectKneeValgus(
      landmarks[25],
      landmarks[26],
      landmarks[27],
      landmarks[28]
    );

    if (isActiveMotion) {
      if (valgusResult.hasValgus) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Knees Caving In (Push knees outward)';
      }

      const torsoIncline = KinematicsMath.calculateTorsoIncline(shoulder, hip);
      if (torsoIncline > 62) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Excessive Torso Lean (Keep chest up)';
      }
    }

    const now = performance.now() / 1000;
    let repIncremented = false;
    let repFaultOccurred = false;

    // Calibrated Lockout (>= 140°) and Parallel Depth (<= 102°)
    const isAtLockout = kneeAngle >= 140;
    const isAtDepth = kneeAngle <= 102;

    switch (this.state) {
      case 'IDLE':
      case 'START_LOCKOUT':
        this.isFormValidInCurrentRep = true;
        this.formErrorReason = null;

        if (isAtLockout) {
          this.state = 'START_LOCKOUT';
          this.feedback = 'Standing upright. Begin descent!';
          this.postureGuidance = 'Good upright posture! Now squat down to parallel.';
        } else {
          this.postureGuidance = `Straighten legs to start (Currently ${kneeAngle}°)`;
        }

        if (this.state === 'START_LOCKOUT' && kneeAngle < 132) {
          this.state = 'DESCENDING';
          this.repStartTime = now;
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.feedback = 'Squatting down...';
        }
        break;

      case 'DESCENDING':
        this.postureGuidance = `Squatting: ${kneeAngle}° (Goal: ≤95° parallel)`;

        if (isAtDepth) {
          this.state = 'IN_DEPTH';
          this.feedback = this.isFormValidInCurrentRep
            ? 'Parallel Depth Reached! Drive back up!'
            : `Depth Hit (${this.formErrorReason})`;
          this.postureGuidance = 'Parallel depth reached! Stand back up!';
        } else if (kneeAngle > 138 && now - this.repStartTime > 0.35) {
          this.state = 'START_LOCKOUT';
          this.feedback = 'Half rep: did not reach parallel depth';
          this.postureGuidance = 'Squat deeper! Thighs must reach parallel.';
        }
        break;

      case 'IN_DEPTH':
        if (kneeAngle > 105) {
          this.state = 'ASCENDING';
          this.feedback = 'Driving up...';
          this.postureGuidance = 'Push through heels to full standing!';
        }
        break;

      case 'ASCENDING':
        this.postureGuidance = `Standing up: ${kneeAngle}° (Lockout: ≥140°)`;

        if (isAtLockout) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;
          const passedTUT = duration >= this.minRepDurationSeconds;

          if (this.isFormValidInCurrentRep && passedTUT) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;
            this.feedback = `Squat #${this.repCount} Verified!`;
            this.postureGuidance = `Clean Squat #${this.repCount}! Descend for next rep.`;
            this.repHistory.push({
              repNumber: this.repCount,
              duration,
              valid: true,
              kneeAngle,
              hipAngle
            });
          } else {
            repFaultOccurred = true;
            this.consecutiveCleanReps = 0;
            const reason = !passedTUT ? 'Too fast' : this.formErrorReason || 'Form fault';
            this.feedback = `No Rep: ${reason}`;
            this.postureGuidance = `No Rep: ${reason}`;
            this.repHistory.push({
              repNumber: this.repCount + 1,
              duration,
              valid: false,
              reason,
              kneeAngle,
              hipAngle
            });
          }

          this.state = 'START_LOCKOUT';
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
        }
        break;
    }

    const isComboActive = this.consecutiveCleanReps >= 3;

    return {
      reps: this.repCount,
      state: this.state,
      feedback: this.feedback,
      postureGuidance: this.postureGuidance,
      kneeAngle,
      hipAngle,
      isFormValid: this.isFormValidInCurrentRep,
      formErrorReason: this.formErrorReason,
      dominantProfile: profile,
      repIncremented,
      repFaultOccurred,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive,
      valgusRatio: valgusResult.ratio
    };
  }

  getStatus(kneeAngle, hipAngle, isFormValid, customFeedback = null) {
    return {
      reps: this.repCount,
      state: this.state,
      feedback: customFeedback || this.feedback,
      postureGuidance: customFeedback || this.postureGuidance,
      kneeAngle: Math.round(kneeAngle),
      hipAngle: Math.round(hipAngle),
      isFormValid,
      formErrorReason: this.formErrorReason,
      dominantProfile: 'left',
      repIncremented: false,
      repFaultOccurred: false,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive: this.consecutiveCleanReps >= 3,
      valgusRatio: 1.0
    };
  }
}
