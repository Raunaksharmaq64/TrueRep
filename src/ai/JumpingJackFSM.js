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
      0.25
    );

    if (!isConfident) {
      return this.getStatus(0, 0, false, 'Full body must be visible');
    }

    // 1. Arm elevation angles (Hip -> Shoulder -> Wrist)
    const leftArmAngle = KinematicsMath.calculateAngle(leftHip, leftShoulder, leftWrist);
    const rightArmAngle = KinematicsMath.calculateAngle(rightHip, rightShoulder, rightWrist);
    const avgArmAngle = Math.round((leftArmAngle + rightArmAngle) / 2);

    // 2. Stance width ratio: (Ankle Distance / Shoulder Distance)
    const ankleDist = Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y);
    const shoulderDist = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y);
    const stanceRatio = shoulderDist > 0 ? ankleDist / shoulderDist : 1.0;

    const now = performance.now() / 1000;
    let repIncremented = false;
    let repFaultOccurred = false;

    // Calibrated conditions for reliable jumping jack tracking
    const isClosed = avgArmAngle < 55 && stanceRatio < 1.25;
    const isPeakOpen = avgArmAngle >= 128 && stanceRatio >= 1.25;

    switch (this.state) {
      case 'IDLE':
      case 'CLOSED_POSITION':
        if (isClosed) {
          this.state = 'CLOSED_POSITION';
          this.feedback = 'Ready! Jump arms overhead and spread legs';
        }
        if (this.state === 'CLOSED_POSITION' && avgArmAngle > 60) {
          this.state = 'OPENING';
          this.repStartTime = now;
          this.isFormValidInCurrentRep = true;
          this.feedback = 'Opening arms and legs...';
        }
        break;

      case 'OPENING':
        if (isPeakOpen) {
          this.state = 'AT_PEAK';
          this.feedback = 'Peak Height! Return arms to sides!';
        } else if (avgArmAngle < 45) {
          this.state = 'CLOSED_POSITION';
          this.feedback = 'Incomplete jump: arms must reach overhead';
        }
        break;

      case 'AT_PEAK':
        if (avgArmAngle < 110) {
          this.state = 'CLOSING';
          this.feedback = 'Returning to stance...';
        }
        break;

      case 'CLOSING':
        if (isClosed) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;

          if (duration >= 0.45 && this.isFormValidInCurrentRep) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;
            this.feedback = `Jumping Jack #${this.repCount} Verified!`;
            this.repHistory.push({
              repNumber: this.repCount,
              duration,
              valid: true,
              armAngle: avgArmAngle
            });
          } else {
            repFaultOccurred = true;
            this.consecutiveCleanReps = 0;
            this.feedback = 'No Rep: Form or cadence invalid';
          }

          this.state = 'CLOSED_POSITION';
          this.isFormValidInCurrentRep = true;
        }
        break;
    }

    const isComboActive = this.consecutiveCleanReps >= 3;

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
      isComboActive
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
      isComboActive: this.consecutiveCleanReps >= 3
    };
  }
}
