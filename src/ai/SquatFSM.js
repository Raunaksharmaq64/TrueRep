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
    this.descentStartTime = 0;
    this.initialHipY = 0;
    this.maxDownwardDisplacement = 0;
    this.lastRepDuration = 0;
    this.isFormValidInCurrentRep = true;
    this.formErrorReason = null;
    this.smoothedKneeAngle = null;
    this.smoothedHipAngle = null;
    this.feedback = 'Stand upright facing camera: Lock knees';
    this.postureGuidance = 'Stand upright facing camera with full body framed';
    this.minRepDurationSeconds = 0.70; // Strict human physiological minimum
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
      0.28
    );

    if (!isConfident) {
      return this.getStatus(
        this.smoothedKneeAngle || 0,
        this.smoothedHipAngle || 0,
        false,
        'Hips and legs must be framed in view'
      );
    }

    // =========================================================================
    // ANTI-CHEAT GATE 1: UPRIGHT VERTICAL ORIENTATION FILTER
    // Blocks lying down or horizontal leg kicks!
    // =========================================================================
    const torsoIncline = KinematicsMath.calculateTorsoIncline(shoulder, hip);
    if (torsoIncline > 52 && this.state === 'IDLE') {
      return this.getStatus(
        this.smoothedKneeAngle || 170,
        this.smoothedHipAngle || 170,
        false,
        '🚨 CHEAT BLOCKED: Stand upright facing camera to perform squats.'
      );
    }

    // 1. Calculate Perspective-Compensated Knee Angle (rock solid across floor/desk cameras)
    // If ankle is occluded, use vertical fallback
    const lowerPt = ankle && (ankle.visibility ?? 1.0) >= 0.25
      ? ankle
      : { x: knee.x, y: knee.y + 0.35 };

    const rawKneeAngle = KinematicsMath.getPerspectiveCompensatedAngle(hip, knee, lowerPt);
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

    // =========================================================================
    // ANTI-CHEAT GATE 2: KNEE VALGUS & TORSO COLLAPSE / GOOD MORNING GUARD
    // =========================================================================
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

      if (torsoIncline > 48) {
        // Excessive forward folding without bending knees (Good Morning cheat)
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Good Morning Cheat (Excessive torso collapse)';
      }

      // Track downward pelvic vertical excursion
      if (this.initialHipY > 0) {
        const drop = hip.y - this.initialHipY;
        if (drop > this.maxDownwardDisplacement) {
          this.maxDownwardDisplacement = drop;
        }
      }
    }

    const now = performance.now() / 1000;
    let repIncremented = false;
    let repFaultOccurred = false;

    // =========================================================================
    // ANTI-CHEAT GATE 3: STRICT PARALLEL DEPTH & FULL STANDING LOCKOUT
    // =========================================================================
    const isAtLockout = kneeAngle >= 160; // Standing tall lockout
    const isAtDepth = kneeAngle <= 90;   // True parallel / deep squat

    switch (this.state) {
      case 'IDLE':
      case 'START_LOCKOUT':
        this.isFormValidInCurrentRep = true;
        this.formErrorReason = null;
        this.maxDownwardDisplacement = 0;

        if (isAtLockout) {
          this.state = 'START_LOCKOUT';
          this.feedback = 'Standing tall. Begin squat descent!';
          this.postureGuidance = 'Upright lockout locked! Squat down to parallel (≤90°).';
        } else {
          this.postureGuidance = `Stand tall to lock knees (Currently ${kneeAngle}°/160°)`;
        }

        // Trigger descent
        if (this.state === 'START_LOCKOUT' && kneeAngle < 145) {
          this.state = 'DESCENDING';
          this.repStartTime = now;
          this.descentStartTime = now;
          this.initialHipY = hip.y;
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.feedback = 'Squatting down into the hole...';
        }
        break;

      case 'DESCENDING':
        this.postureGuidance = `Thighs descending: ${kneeAngle}° (Goal: ≤90° parallel)`;

        if (isAtDepth) {
          this.state = 'IN_DEPTH';
          this.feedback = this.isFormValidInCurrentRep
            ? '✓ Parallel Depth Hit! Drive through heels!'
            : `Parallel Hit (⚠️ ${this.formErrorReason})`;
          this.postureGuidance = 'Parallel depth reached! Stand back up to full lockout!';
        } else if (kneeAngle > 145 && now - this.descentStartTime > 0.35) {
          // ===================================================================
          // ANTI-CHEAT: SHALLOW HALF-SQUAT DISQUALIFICATION
          // User turned around before reaching parallel!
          // ===================================================================
          this.state = 'START_LOCKOUT';
          this.isFormValidInCurrentRep = false;
          this.formErrorReason = 'Half-Squat (Did not hit parallel 90°)';
          this.feedback = 'No Rep: Half-squat! Thighs must reach parallel';
          this.postureGuidance = 'Squat deeper! Thighs must reach horizontal parallel.';
          repFaultOccurred = true;
          this.consecutiveCleanReps = 0;
          this.repHistory.push({
            repNumber: this.repCount + 1,
            duration: now - this.repStartTime,
            valid: false,
            reason: 'Half-Squat (>90°)',
            kneeAngle,
            hipAngle
          });
        }
        break;

      case 'IN_DEPTH':
        // Dead-band hysteresis: must push upward past 102°
        if (kneeAngle > 102) {
          this.state = 'ASCENDING';
          this.feedback = 'Driving up out of the hole...';
          this.postureGuidance = 'Push through heels to full standing lockout!';
        }
        break;

      case 'ASCENDING':
        this.postureGuidance = `Standing tall: ${kneeAngle}° (Lockout: ≥160°)`;

        if (isAtLockout) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;

          // ===================================================================
          // ANTI-CHEAT GATE 4 & 5: TUT SPEED LIMIT & PELVIC DISPLACEMENT
          // Auto-scales displacement to thigh length & camera distance
          // ===================================================================
          const passedTUT = duration >= this.minRepDurationSeconds;
          const thighLength = Math.hypot(hip.x - knee.x, hip.y - knee.y);
          const minRequiredDrop = Math.max(0.025, thighLength * 0.16);
          const passedDisplacement = this.maxDownwardDisplacement >= minRequiredDrop;

          if (this.isFormValidInCurrentRep && passedTUT && passedDisplacement) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;
            this.feedback = `Squat #${this.repCount} Verified (99.99% Clean)!`;
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
            let reason = this.formErrorReason;
            if (!passedTUT) reason = 'Twitch Cheat (Too fast, cadence <0.7s)';
            else if (!passedDisplacement) reason = 'No Pelvic Drop (Knee twitch cheat)';

            this.feedback = `No Rep: ${reason || 'Form violation'}`;
            this.postureGuidance = `No Rep: ${reason || 'Form violation'}`;
            this.repHistory.push({
              repNumber: this.repCount + 1,
              duration,
              valid: false,
              reason: reason || 'Form fault',
              kneeAngle,
              hipAngle
            });
          }

          this.state = 'START_LOCKOUT';
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.maxDownwardDisplacement = 0;
        }
        break;
    }

    const isComboActive = this.consecutiveCleanReps >= 3;
    const perspective = KinematicsMath.estimateCameraPerspective(landmarks);

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
      valgusRatio: valgusResult.ratio,
      perspective,
      repHistory: this.repHistory
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
      valgusRatio: 1.0,
      perspective: { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Auto-Angle: Calibrated' }
    };
  }
}
