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

import { KinematicsMath } from './KinematicsMath.js';

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
    this.standingHipY = 0;
    this.maxDownwardDisplacement = 0;
    this.minKneeAngleDuringRep = null;
    this.achievedOlympicDepth = false;
    this.lastRepDuration = 0;
    this.isFormValidInCurrentRep = true;
    this.formErrorReason = null;
    this.smoothedKneeAngle = null;
    this.smoothedHipAngle = null;
    this.formScore = 95;
    this.feedback = 'Stand upright facing camera: Lock knees';
    this.postureGuidance = 'Stand upright facing camera with full body framed';
    this.minRepDurationSeconds = 0.55; // Accommodates 15-20 FPS drops & athletic tempos
    this.baselineStanceWidth = null;
    this.femurToTorsoRatio = 0.80;
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
    const oppAnkle = landmarks[isRight ? 27 : 28];

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

    // Measure anthropometric femur-to-torso ratio
    this.femurToTorsoRatio = KinematicsMath.calculateFemurToTorsoRatio(shoulder, hip, knee);

    // Dynamic forward lean limit: athletes with long femurs naturally lean further forward (up to 56°)
    const maxAllowedTorsoIncline = this.femurToTorsoRatio > 0.85 ? 56 : 48;

    // =========================================================================
    // ANTI-CHEAT GATE 1: UPRIGHT VERTICAL ORIENTATION FILTER
    // Blocks lying down or horizontal leg kicks!
    // =========================================================================
    const torsoIncline = KinematicsMath.calculateTorsoIncline(shoulder, hip);
    if (torsoIncline > 58 && this.state === 'IDLE') {
      return this.getStatus(
        this.smoothedKneeAngle || 170,
        this.smoothedHipAngle || 170,
        false,
        '🚨 CHEAT BLOCKED: Stand upright facing camera to perform squats.'
      );
    }

    // 1. Calculate Perspective-Compensated Knee Angle
    const lowerPt = ankle && (ankle.visibility ?? 1.0) >= 0.25
      ? ankle
      : { x: knee.x, y: knee.y + 0.35 };

    const rawKneeAngle = KinematicsMath.getPerspectiveCompensatedAngle(hip, knee, lowerPt);
    const rawHipAngle = KinematicsMath.calculateAngle(shoulder, hip, knee);

    // 2. Smooth Angles with EMA
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

    // Calculate relative depth (hip-crease vs. patella)
    const relativeDepth = KinematicsMath.calculateRelativeDepth(hip, knee);

    // Track baseline stance width when standing upright
    if (ankle && oppAnkle && (this.state === 'IDLE' || this.state === 'START_LOCKOUT')) {
      const currentStance = Math.hypot(ankle.x - oppAnkle.x, ankle.y - oppAnkle.y);
      if (!this.baselineStanceWidth) {
        this.baselineStanceWidth = currentStance;
      } else {
        this.baselineStanceWidth = 0.95 * this.baselineStanceWidth + 0.05 * currentStance;
      }
    }

    // =========================================================================
    // ANTI-CHEAT GATE 2: KNEE VALGUS & TORSO COLLAPSE GUARD
    // Uses stance-compensated valgus detection so sumo squats don't trigger false alerts
    // =========================================================================
    const isActiveMotion = this.state === 'DESCENDING' || this.state === 'IN_DEPTH' || this.state === 'ASCENDING';
    const bodyYaw = KinematicsMath.estimateBodyYaw(
      landmarks[11],
      landmarks[12],
      landmarks[23],
      landmarks[24]
    );
    const isSideView = bodyYaw.viewAngle === 'side';

    const valgusResult = KinematicsMath.detectKneeValgusAdaptive(
      landmarks[25],
      landmarks[26],
      landmarks[27],
      landmarks[28],
      this.baselineStanceWidth
    );

    if (isActiveMotion) {
      // Gate knee valgus: only penalize when facing camera (frontal/diagonal).
      // In side view, knees overlap in 2D perspective and ratio collapses naturally!
      if (!isSideView && valgusResult.hasValgus) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Knees Caving In (Push knees outward)';
      }

      if (torsoIncline > maxAllowedTorsoIncline) {
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
    // ADAPTIVE LOCKOUT & DEPTH WINDOW (SPORTS SCIENCE STANDARDS)
    // Lockout: >= 150° (or >= 146° with pelvic height proximity)
    // Parallel Depth: deltaY <= 0.02 or kneeAngle <= 95°
    // =========================================================================
    const isPelvicAtStandingHeight = this.standingHipY > 0
      ? hip.y <= this.standingHipY + 0.05
      : true;

    const isAtLockout = kneeAngle >= 150 || (kneeAngle >= 146 && isPelvicAtStandingHeight);
    const isAtDepth = relativeDepth.isParallelOrDeeper || kneeAngle <= 95;

    switch (this.state) {
      case 'IDLE':
      case 'START_LOCKOUT':
        this.isFormValidInCurrentRep = true;
        this.formErrorReason = null;
        this.maxDownwardDisplacement = 0;

        if (isAtLockout) {
          this.state = 'START_LOCKOUT';
          this.standingHipY = hip.y;
          this.feedback = 'Standing tall. Begin squat descent!';
          this.postureGuidance = 'Upright lockout locked! Squat down to parallel.';
        } else {
          this.postureGuidance = `Stand tall to lock knees (Currently ${kneeAngle}°/150°)`;
        }

        // Trigger descent (initiation of flexion)
        if (this.state === 'START_LOCKOUT' && kneeAngle < 144) {
          this.state = 'DESCENDING';
          this.repStartTime = now;
          this.descentStartTime = now;
          this.initialHipY = hip.y;
          this.minKneeAngleDuringRep = kneeAngle;
          this.achievedOlympicDepth = false;
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.feedback = 'Squatting down into the hole...';
        }
        break;

      case 'DESCENDING':
        this.postureGuidance = `Thighs descending: ${kneeAngle}° (Target: Parallel)`;
        this.minKneeAngleDuringRep = Math.min(this.minKneeAngleDuringRep ?? 999, kneeAngle);
        if (relativeDepth.isOlympicDeep || kneeAngle <= 85) {
          this.achievedOlympicDepth = true;
        }

        if (isAtDepth) {
          this.state = 'IN_DEPTH';
          this.feedback = this.isFormValidInCurrentRep
            ? '✓ Parallel Depth Hit! Drive through heels!'
            : `Parallel Hit (⚠️ ${this.formErrorReason})`;
          this.postureGuidance = 'Parallel depth reached! Stand back up to full lockout!';
        } else if (kneeAngle > 142 && now - this.descentStartTime > 0.35) {
          // Shallow half-squat turnaround
          this.state = 'START_LOCKOUT';
          this.isFormValidInCurrentRep = false;
          this.formErrorReason = 'Half-Squat (Did not hit parallel)';
          this.feedback = 'No Rep: Half-squat! Thighs must reach parallel';
          this.postureGuidance = 'Squat deeper! Thighs must reach horizontal parallel.';
          repFaultOccurred = true;
          this.consecutiveCleanReps = 0;
          this.formScore = Math.max(50, this.formScore - 15);
          const shallowAngle = this.minKneeAngleDuringRep !== null ? this.minKneeAngleDuringRep : kneeAngle;
          this.repHistory.push({
            repNumber: this.repCount + 1,
            duration: now - this.repStartTime,
            valid: false,
            score: 55,
            reason: 'Half-Squat (>95°)',
            kneeAngle: shallowAngle,
            hipAngle
          });
          this.minKneeAngleDuringRep = null;
          this.achievedOlympicDepth = false;
        }
        break;

      case 'IN_DEPTH':
        this.minKneeAngleDuringRep = Math.min(this.minKneeAngleDuringRep ?? 999, kneeAngle);
        if (relativeDepth.isOlympicDeep || kneeAngle <= 85) {
          this.achievedOlympicDepth = true;
        }
        // Dead-band hysteresis: must push upward past 102° to begin ascent
        if (kneeAngle > 102) {
          this.state = 'ASCENDING';
          this.feedback = 'Driving up out of the hole...';
          this.postureGuidance = 'Push through heels to full standing lockout!';
        }
        break;

      case 'ASCENDING':
        this.postureGuidance = `Standing tall: ${kneeAngle}° (Lockout: ≥150°)`;

        if (isAtLockout) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;

          const passedTUT = duration >= this.minRepDurationSeconds;
          const thighLength = Math.hypot(hip.x - knee.x, hip.y - knee.y);
          const minRequiredDrop = Math.max(0.025, thighLength * 0.14);
          const passedDisplacement = this.maxDownwardDisplacement >= minRequiredDrop;

          if (this.isFormValidInCurrentRep && passedTUT && passedDisplacement) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;

            // Graded Sports-Science Scoring using peak rep depth
            const repMinKnee = this.minKneeAngleDuringRep !== null ? this.minKneeAngleDuringRep : kneeAngle;
            let repScore = 95;
            let coachFeedback = `Squat #${this.repCount} Verified!`;
            if (this.achievedOlympicDepth || repMinKnee <= 85) {
              repScore = 100;
              coachFeedback = `Squat #${this.repCount}: 100% Olympic Depth!`;
            } else if (repMinKnee <= 95) {
              repScore = 98;
              coachFeedback = `Squat #${this.repCount}: Parallel Depth Hit!`;
            } else if (repMinKnee <= 102) {
              repScore = 92;
              coachFeedback = `Squat #${this.repCount}: Solid! Squat 1" deeper for 100%`;
            } else {
              repScore = 88;
              coachFeedback = `Squat #${this.repCount}: Completed!`;
            }
            this.formScore = repScore;

            this.feedback = coachFeedback;
            this.postureGuidance = `Clean Squat #${this.repCount}! Descend for next rep.`;
            this.repHistory.push({
              repNumber: this.repCount,
              duration,
              valid: true,
              score: repScore,
              kneeAngle: repMinKnee,
              hipAngle
            });
          } else {
            repFaultOccurred = true;
            this.consecutiveCleanReps = 0;
            let reason = this.formErrorReason;
            if (!passedTUT) reason = 'Twitch Cheat (Too fast, cadence <0.55s)';
            else if (!passedDisplacement) reason = 'No Pelvic Drop (Knee twitch cheat)';

            this.formScore = Math.max(50, this.formScore - 10);
            this.feedback = `No Rep: ${reason || 'Form violation'}`;
            this.postureGuidance = `No Rep: ${reason || 'Form violation'}`;
            this.repHistory.push({
              repNumber: this.repCount + 1,
              duration,
              valid: false,
              score: 60,
              reason: reason || 'Form fault',
              kneeAngle: this.minKneeAngleDuringRep !== null ? this.minKneeAngleDuringRep : kneeAngle,
              hipAngle
            });
          }

          this.state = 'START_LOCKOUT';
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.maxDownwardDisplacement = 0;
          this.minKneeAngleDuringRep = null;
          this.achievedOlympicDepth = false;
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
      formScore: this.formScore,
      isFormValid: this.isFormValidInCurrentRep,
      formErrorReason: this.formErrorReason,
      dominantProfile: profile,
      repIncremented,
      repFaultOccurred,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive,
      valgusRatio: valgusResult.ratio,
      relativeDepth: relativeDepth.deltaY,
      femurToTorsoRatio: this.femurToTorsoRatio,
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
      formScore: this.formScore,
      isFormValid,
      formErrorReason: this.formErrorReason,
      dominantProfile: 'left',
      repIncremented: false,
      repFaultOccurred: false,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive: this.consecutiveCleanReps >= 3,
      valgusRatio: 1.0,
      relativeDepth: 1.0,
      femurToTorsoRatio: this.femurToTorsoRatio,
      perspective: { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Auto-Angle: Calibrated' }
    };
  }
}
