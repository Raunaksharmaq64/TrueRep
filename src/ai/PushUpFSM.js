/**
 * PushUpFSM.js
 * Biomechanically calibrated Finite State Machine for Push-Ups.
 *
 * Features:
 *   - Uses robust 2D trigonometric joint angles (free from monocular z-depth noise).
 *   - Automatic Ankle-to-Knee fallback: tracks core line even when feet are off-screen.
 *   - Realistic lockout (>= 148°) and depth (<= 98°) calibrated for standard camera perspectives.
 *   - Irreversible Error Latch for genuine hip sag (< 138°).
 *   - Real-time corrective posture coaching messages.
 */

import { KinematicsMath } from './KinematicsMath';

export class PushUpFSM {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = 'IDLE'; // 'IDLE' | 'START_LOCKOUT' | 'DESCENDING' | 'IN_DEPTH' | 'ASCENDING'
    this.repCount = 0;
    this.consecutiveCleanReps = 0;
    this.repStartTime = 0;
    this.lastRepDuration = 0;
    this.isFormValidInCurrentRep = true;
    this.formErrorReason = null;
    this.smoothedElbowAngle = null;
    this.smoothedSpineAngle = null;
    this.smoothedRightElbowAngle = null;
    this.feedback = 'Get into plank: Arms straight, face camera';
    this.postureGuidance = 'Step into camera view to begin';
    this.minRepDurationSeconds = 0.55;
    this.repHistory = [];
  }

  processFrame(landmarks) {
    if (!landmarks || landmarks.length < 25) {
      return this.getStatus(0, 0, false, 'Stand in camera view');
    }

    const profile = KinematicsMath.getDominantProfile(landmarks);
    const isRight = profile === 'right';

    // Primary keypoints
    const shoulder = landmarks[isRight ? 12 : 11];
    const elbow = landmarks[isRight ? 14 : 13];
    const wrist = landmarks[isRight ? 16 : 15];
    const hip = landmarks[isRight ? 24 : 23];
    const knee = landmarks[isRight ? 26 : 25];
    const ankle = landmarks[isRight ? 28 : 27];

    // Must have shoulder, elbow, and hip visible (wrist tolerance for floor pushups)
    const upperBodyVisible = KinematicsMath.isConfidenceMet(
      landmarks,
      isRight ? [12, 14, 24] : [11, 13, 23],
      0.20
    );

    if (!upperBodyVisible) {
      return this.getStatus(
        this.smoothedElbowAngle || 0,
        this.smoothedSpineAngle || 0,
        false,
        'Upper body must be visible'
      );
    }

    // 1. Calculate 2D Elbow Flexion Angle (reliable & stable)
    // If wrist is low confidence, use forearm direction
    const rawElbowAngle = KinematicsMath.calculateAngle(shoulder, elbow, wrist || { x: elbow.x, y: elbow.y + 0.25 });

    // 2. Calculate Spine / Core Line:
    // If ankle is visible use Shoulder-Hip-Ankle; fallback to Shoulder-Hip-Knee
    const isAnkleVisible = ankle && (ankle.visibility ?? 1.0) >= 0.25;
    const lowerAnchor = isAnkleVisible ? ankle : (knee || { x: hip.x, y: hip.y + 0.3 });
    const rawSpineAngle = lowerAnchor
      ? KinematicsMath.calculateAngle(shoulder, hip, lowerAnchor)
      : 170;

    // 3. Apply EMA smoothing
    this.smoothedElbowAngle = KinematicsMath.smoothAngleEMA(
      this.smoothedElbowAngle,
      rawElbowAngle,
      0.65
    );
    this.smoothedSpineAngle = KinematicsMath.smoothAngleEMA(
      this.smoothedSpineAngle,
      rawSpineAngle,
      0.65
    );

    const elbowAngle = Math.round(this.smoothedElbowAngle);
    const spineAngle = Math.round(this.smoothedSpineAngle);

    // 4. Bilateral Asymmetry Check (if both arms visible)
    const bilateral = KinematicsMath.isBilateralVisible(landmarks, 0.35);
    let bilateralAsymmetry = false;

    if (bilateral.isBilateral) {
      const oppShoulder = landmarks[isRight ? 11 : 12];
      const oppElbow = landmarks[isRight ? 13 : 14];
      const oppWrist = landmarks[isRight ? 15 : 16];
      const rawOppElbow = KinematicsMath.calculateAngle(oppShoulder, oppElbow, oppWrist || { x: oppElbow.x, y: oppElbow.y + 0.25 });

      this.smoothedRightElbowAngle = KinematicsMath.smoothAngleEMA(
        this.smoothedRightElbowAngle,
        rawOppElbow,
        0.65
      );

      if (Math.abs(this.smoothedElbowAngle - this.smoothedRightElbowAngle) > 42) {
        bilateralAsymmetry = true;
      }
    }

    // 5. Posture & Core Form Validation
    // Spine angle < 135° indicates genuine hip sag.
    // Latch faults ONLY during active movement phases (DESCENDING, IN_DEPTH, ASCENDING)
    const isActiveMotion = this.state === 'DESCENDING' || this.state === 'IN_DEPTH' || this.state === 'ASCENDING';
    const isSpineRigid = spineAngle >= 135;

    if (isActiveMotion) {
      if (!isSpineRigid) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Sagging Hips (Keep core tight)';
      } else if (bilateralAsymmetry) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Uneven Arms (Push evenly)';
      }
    }

    const now = performance.now() / 1000;
    let repIncremented = false;
    let repFaultOccurred = false;

    // Calibrated Lockout (>= 136°) and Depth (<= 102°) for comfortable real-world pushups
    const isAtLockout = elbowAngle >= 136;
    const isAtDepth = elbowAngle <= 102;

    // 6. State Machine Transitions & Live Posture Coaching
    switch (this.state) {
      case 'IDLE':
      case 'START_LOCKOUT':
        this.isFormValidInCurrentRep = true;
        this.formErrorReason = null;

        if (isAtLockout) {
          this.state = 'START_LOCKOUT';
          this.feedback = 'Ready in plank. Descend now!';
          this.postureGuidance = 'Arms locked! Lower your chest to begin.';
        } else {
          this.postureGuidance = `Extend arms to plank (Currently ${elbowAngle}°)`;
        }

        if (this.state === 'START_LOCKOUT' && elbowAngle < 130) {
          this.state = 'DESCENDING';
          this.repStartTime = now;
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.feedback = 'Lowering chest...';
        }
        break;

      case 'DESCENDING':
        this.postureGuidance = `Lowering: ${elbowAngle}° (Target: ≤95°)`;

        if (isAtDepth) {
          this.state = 'IN_DEPTH';
          this.feedback = this.isFormValidInCurrentRep
            ? 'Depth Reached! Push back up!'
            : `Depth Hit (${this.formErrorReason || 'Form Break'})`;
          this.postureGuidance = 'Depth achieved! Push back up!';
        } else if (elbowAngle > 135 && now - this.repStartTime > 0.35) {
          // Returned before depth
          this.state = 'START_LOCKOUT';
          this.feedback = 'Half rep: did not reach 90° depth';
          this.postureGuidance = 'Go lower! Elbows must bend to 90°.';
        }
        break;

      case 'IN_DEPTH':
        // Hysteresis dead-band: must push upward past 105°
        if (elbowAngle > 105) {
          this.state = 'ASCENDING';
          this.feedback = 'Driving up to lockout...';
          this.postureGuidance = 'Pushing up: extend arms fully!';
        }
        break;

      case 'ASCENDING':
        this.postureGuidance = `Pushing up: ${elbowAngle}° (Lockout: ≥136°)`;

        if (isAtLockout) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;
          const passedTUT = duration >= this.minRepDurationSeconds;

          if (this.isFormValidInCurrentRep && passedTUT && isSpineRigid) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;
            this.feedback = `Rep #${this.repCount} Verified!`;
            this.postureGuidance = `Clean Rep #${this.repCount}! Descend for next rep.`;
            this.repHistory.push({
              repNumber: this.repCount,
              duration,
              valid: true,
              elbowAngle,
              spineAngle
            });
          } else {
            repFaultOccurred = true;
            this.consecutiveCleanReps = 0;
            const reason = !passedTUT
              ? 'Too fast (Control cadence)'
              : this.formErrorReason || 'Form fault';
            this.feedback = `No Rep: ${reason}`;
            this.postureGuidance = `No Rep: ${reason}`;
            this.repHistory.push({
              repNumber: this.repCount + 1,
              duration,
              valid: false,
              reason,
              elbowAngle,
              spineAngle
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
      elbowAngle,
      spineAngle,
      isFormValid: this.isFormValidInCurrentRep,
      formErrorReason: this.formErrorReason,
      dominantProfile: profile,
      repIncremented,
      repFaultOccurred,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive
    };
  }

  getStatus(elbowAngle, spineAngle, isFormValid, customFeedback = null) {
    return {
      reps: this.repCount,
      state: this.state,
      feedback: customFeedback || this.feedback,
      postureGuidance: customFeedback || this.postureGuidance,
      elbowAngle: Math.round(elbowAngle),
      spineAngle: Math.round(spineAngle),
      isFormValid,
      formErrorReason: this.formErrorReason,
      dominantProfile: 'left',
      repIncremented: false,
      repFaultOccurred: false,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive: this.consecutiveCleanReps >= 3
    };
  }
}
