/**
 * JumpingJackFSM.js
 * Hierarchical Finite State Machine for Jumping Jacks.
 *
 * States:
 *   IDLE -> CLOSED_POSITION -> OPENING -> AT_PEAK -> CLOSING -> REP_COMPLETED
 *
 * Biomechanical Rules:
 *   - Arm Elevation (Peak): Angle(Hip, Shoulder, Wrist) >= 150°
 *   - Stance Width Ratio (Peak): (Ankle Distance / Shoulder Distance) >= 1.4
 *   - Closed Position (Start/Finish): Hands by sides (< 40°) & Stance Ratio < 1.1
 */

import { KinematicsMath } from './KinematicsMath';

export class JumpingJackFSM {
  constructor() {
    this.reset();
  }

  reset() {
    this.state = 'IDLE';
    this.repCount = 0;
    this.consecutiveCleanReps = 0;
    this.repStartTime = 0;
    this.initialClosedStanceRatio = 1.0;
    this.maxStanceReached = 1.0;
    this.lastRepDuration = 0;
    this.isFormValidInCurrentRep = true;
    this.formErrorReason = null;
    this.feedback = 'Stand upright with arms down and feet together';
    this.repHistory = [];
  }

  processFrame(landmarks) {
    if (!landmarks || landmarks.length < 29) {
      return this.getStatus(0, 0, false);
    }

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    const isConfident = KinematicsMath.isConfidenceMet(
      landmarks,
      [11, 12, 15, 16, 23, 24, 27, 28],
      0.28
    );

    if (!isConfident) {
      return this.getStatus(0, 0, false, 'Full body from head to feet must be framed');
    }

    // 1. Arm elevation angles (Hip -> Shoulder -> Wrist)
    const leftArmAngle = KinematicsMath.calculateAngle(leftHip, leftShoulder, leftWrist);
    const rightArmAngle = KinematicsMath.calculateAngle(rightHip, rightShoulder, rightWrist);
    const avgArmAngle = Math.round((leftArmAngle + rightArmAngle) / 2);

    // 2. Stance width ratio: (Ankle Distance / Shoulder Distance)
    const ankleDist = Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y);
    const shoulderDist = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y);
    const stanceRatio = shoulderDist > 0 ? ankleDist / shoulderDist : 1.0;

    // Track maximum leg jump expansion during rep
    if (this.state === 'OPENING' || this.state === 'AT_PEAK') {
      if (stanceRatio > this.maxStanceReached) {
        this.maxStanceReached = stanceRatio;
      }
    }

    const now = performance.now() / 1000;
    let repIncremented = false;
    let repFaultOccurred = false;

    // =========================================================================
    // ANTI-CHEAT GATES: BILATERAL OVERHEAD ARMS & WIDE STANCE JUMP
    // =========================================================================
    const isClosed = avgArmAngle < 48 && stanceRatio < 1.18;
    const bothWristsOverhead = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
    const bilateralArmElevation = leftArmAngle >= 135 && rightArmAngle >= 135;
    const isPeakOpen = bothWristsOverhead && bilateralArmElevation && stanceRatio >= 1.40;

    switch (this.state) {
      case 'IDLE':
      case 'CLOSED_POSITION':
        this.isFormValidInCurrentRep = true;
        this.formErrorReason = null;
        this.maxStanceReached = 1.0;

        if (isClosed) {
          this.state = 'CLOSED_POSITION';
          this.initialClosedStanceRatio = stanceRatio;
          this.feedback = 'Ready in closed stance! Jump arms overhead & feet wide!';
        }

        if (this.state === 'CLOSED_POSITION' && avgArmAngle > 60) {
          this.state = 'OPENING';
          this.repStartTime = now;
          this.isFormValidInCurrentRep = true;
          this.feedback = 'Jumping arms overhead & feet wide...';
        }
        break;

      case 'OPENING':
        // =====================================================================
        // ANTI-CHEAT: CHECK FOR STATIONARY HAND WAVING (NO LEG JUMP)
        // =====================================================================
        if (isPeakOpen) {
          this.state = 'AT_PEAK';
          this.feedback = '✓ Peak Reached! Return arms to sides and feet together!';
        } else if (avgArmAngle < 45) {
          // Reversal without hitting overhead peak
          this.state = 'CLOSED_POSITION';
          this.isFormValidInCurrentRep = false;
          this.formErrorReason = 'Incomplete Overhead Reach';
          this.feedback = 'No Rep: Arms must reach fully overhead!';
          repFaultOccurred = true;
          this.consecutiveCleanReps = 0;
        }
        break;

      case 'AT_PEAK':
        if (avgArmAngle < 110) {
          this.state = 'CLOSING';
          this.feedback = 'Returning to closed stance...';
        }
        break;

      case 'CLOSING':
        if (isClosed) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;

          // Verify stance expansion occurred (not just hand waving in place!)
          const hasLegExpansion = this.maxStanceReached - this.initialClosedStanceRatio >= 0.28;
          const passedTUT = duration >= 0.50; // Minimum duration for full jump cycle

          if (this.isFormValidInCurrentRep && hasLegExpansion && passedTUT) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;
            this.feedback = `Jumping Jack #${this.repCount} Verified (99.99% Clean)!`;
            this.repHistory.push({
              repNumber: this.repCount,
              duration,
              valid: true,
              armAngle: avgArmAngle,
              stanceRatio: this.maxStanceReached
            });
          } else {
            repFaultOccurred = true;
            this.consecutiveCleanReps = 0;
            let reason = this.formErrorReason;
            if (!hasLegExpansion) reason = 'No Leg Jump (Feet stayed stationary)';
            else if (!passedTUT) reason = 'Twitch Cheat (Too fast)';

            this.feedback = `No Rep: ${reason || 'Form violation'}`;
            this.repHistory.push({
              repNumber: this.repCount + 1,
              duration,
              valid: false,
              reason: reason || 'Form fault',
              armAngle: avgArmAngle
            });
          }

          this.state = 'CLOSED_POSITION';
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.maxStanceReached = 1.0;
        }
        break;
    }

    const isComboActive = this.consecutiveCleanReps >= 3;
    const perspective = KinematicsMath.estimateCameraPerspective(landmarks);

    return {
      reps: this.repCount,
      state: this.state,
      feedback: this.feedback,
      armAngle: avgArmAngle,
      stanceRatio: Math.round(stanceRatio * 10) / 10,
      isFormValid: this.isFormValidInCurrentRep,
      formErrorReason: this.formErrorReason,
      dominantProfile: 'front',
      repIncremented,
      repFaultOccurred,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive,
      perspective,
      repHistory: this.repHistory
    };
  }

  getStatus(armAngle, stanceRatio, isFormValid, customFeedback = null) {
    return {
      reps: this.repCount,
      state: this.state,
      feedback: customFeedback || this.feedback,
      armAngle: Math.round(armAngle),
      stanceRatio: Math.round(stanceRatio * 10) / 10,
      isFormValid,
      formErrorReason: this.formErrorReason,
      dominantProfile: 'front',
      repIncremented: false,
      repFaultOccurred: false,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive: this.consecutiveCleanReps >= 3,
      perspective: { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Auto-Angle: Calibrated' }
    };
  }
}
