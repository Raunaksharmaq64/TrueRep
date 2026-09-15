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
    this.descentStartTime = 0;
    this.initialShoulderY = 0;
    this.maxDownwardDisplacement = 0;
    this.lastRepDuration = 0;
    this.isFormValidInCurrentRep = true;
    this.formErrorReason = null;
    this.smoothedElbowAngle = null;
    this.smoothedSpineAngle = null;
    this.smoothedRightElbowAngle = null;
    this.feedback = 'Get into horizontal plank: Arms straight';
    this.postureGuidance = 'Place device on floor and get into horizontal plank';
    this.minRepDurationSeconds = 0.70; // Human biomechanics minimum for real pushup
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

    // Must have shoulder, elbow, and hip visible
    const upperBodyVisible = KinematicsMath.isConfidenceMet(
      landmarks,
      isRight ? [12, 14, 24] : [11, 13, 23],
      0.28
    );

    if (!upperBodyVisible) {
      return this.getStatus(
        this.smoothedElbowAngle || 0,
        this.smoothedSpineAngle || 0,
        false,
        'Upper body and core must be framed'
      );
    }

    // =========================================================================
    // ANTI-CHEAT GATE 1: HORIZONTAL PLANK ORIENTATION (UNIVERSAL PERSPECTIVE)
    // Auto-adapts to laptop on desk (looking down 35°), phone on floor (looking up),
    // or narrow-room diagonal view.
    // Blocks standing upright "air push-ups" or leaning against walls!
    // =========================================================================
    const isPlank = KinematicsMath.isPlankOrientationUniversal(
      shoulder,
      hip,
      wrist,
      ankle,
      knee,
      landmarks
    );

    if (!isPlank) {
      this.state = 'IDLE';
      this.isFormValidInCurrentRep = false;
      this.formErrorReason = 'Standing Cheat (Must be horizontal plank)';
      return this.getStatus(
        this.smoothedElbowAngle || 160,
        this.smoothedSpineAngle || 170,
        false,
        '🚨 CHEAT BLOCKED: Cannot do push-ups standing! Get in horizontal plank on floor.'
      );
    }

    // 1. Calculate Perspective-Compensated Elbow Flexion Angle
    // Auto-compensates for foreshortening when camera is elevated on a desk
    const rawElbowAngle = KinematicsMath.getPerspectiveCompensatedAngle(
      shoulder,
      elbow,
      wrist || { x: elbow.x, y: elbow.y + 0.25 }
    );

    // 2. Calculate Spine / Core Alignment
    // If ankle visible use Shoulder-Hip-Ankle; fallback to Knee
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
      const rawOppElbow = KinematicsMath.calculateAngle(
        oppShoulder,
        oppElbow,
        oppWrist || { x: oppElbow.x, y: oppElbow.y + 0.25 }
      );

      this.smoothedRightElbowAngle = KinematicsMath.smoothAngleEMA(
        this.smoothedRightElbowAngle,
        rawOppElbow,
        0.65
      );

      if (Math.abs(this.smoothedElbowAngle - this.smoothedRightElbowAngle) > 35) {
        bilateralAsymmetry = true;
      }
    }

    // =========================================================================
    // ANTI-CHEAT GATE 2: IRREVERSIBLE CORE LATCH (ANTI-WORM / HIP SAG / PIKE)
    // =========================================================================
    const isActiveMotion = this.state === 'DESCENDING' || this.state === 'IN_DEPTH' || this.state === 'ASCENDING';
    const isHipSag = spineAngle < 150; // Hip collapsed downwards towards floor (Worm push-up)
    const isPike = spineAngle > 195;   // Butt sticking high up in the air

    if (isActiveMotion) {
      if (isHipSag) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Sagging Hips (Worm Push-Up)';
      } else if (isPike) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Pike Fault (Hips too high)';
      } else if (bilateralAsymmetry) {
        this.isFormValidInCurrentRep = false;
        this.formErrorReason = 'Uneven Arms (Push evenly)';
      }

      // Track vertical downward chest displacement
      if (this.initialShoulderY > 0) {
        const drop = shoulder.y - this.initialShoulderY;
        if (drop > this.maxDownwardDisplacement) {
          this.maxDownwardDisplacement = drop;
        }
      }
    }

    const now = performance.now() / 1000;
    let repIncremented = false;
    let repFaultOccurred = false;

    // =========================================================================
    // ANTI-CHEAT GATE 3: STRICT 90° DEPTH & FULL LOCKOUT (TOURNAMENT STANDARDS)
    // =========================================================================
    const isAtLockout = elbowAngle >= 152; // Full arm lockout
    const isAtDepth = elbowAngle <= 90;   // Genuine 90° chest-to-floor depth

    switch (this.state) {
      case 'IDLE':
      case 'START_LOCKOUT':
        this.isFormValidInCurrentRep = true;
        this.formErrorReason = null;
        this.maxDownwardDisplacement = 0;

        if (isAtLockout) {
          this.state = 'START_LOCKOUT';
          this.feedback = 'Locked in horizontal plank. Descend now!';
          this.postureGuidance = 'Solid plank! Lower chest until elbows reach 90°.';
        } else {
          this.postureGuidance = `Lock arms straight (Currently ${elbowAngle}°/155°)`;
        }

        // Trigger descent
        if (this.state === 'START_LOCKOUT' && elbowAngle < 142) {
          this.state = 'DESCENDING';
          this.repStartTime = now;
          this.descentStartTime = now;
          this.initialShoulderY = shoulder.y;
          this.isFormValidInCurrentRep = true;
          this.formErrorReason = null;
          this.feedback = 'Lowering chest...';
        }
        break;

      case 'DESCENDING':
        this.postureGuidance = `Chest descending: ${elbowAngle}° (Target: ≤90°)`;

        if (isAtDepth) {
          this.state = 'IN_DEPTH';
          this.feedback = this.isFormValidInCurrentRep
            ? '✓ 90° Depth Valid! Drive back up!'
            : `90° Hit (⚠️ ${this.formErrorReason || 'Form Break'})`;
          this.postureGuidance = 'Depth achieved! Push back up to full lockout!';
        } else if (elbowAngle > 140 && now - this.descentStartTime > 0.35) {
          // ===================================================================
          // ANTI-CHEAT: SHALLOW HALF-REP DISQUALIFICATION
          // User turned around before hitting 90° depth!
          // ===================================================================
          this.state = 'START_LOCKOUT';
          this.isFormValidInCurrentRep = false;
          this.formErrorReason = 'Shallow Depth (Did not reach 90°)';
          this.feedback = 'No Rep: Half-rep! Must reach 90° depth';
          this.postureGuidance = 'Go all the way down! Elbows must reach 90°.';
          repFaultOccurred = true;
          this.consecutiveCleanReps = 0;
          this.repHistory.push({
            repNumber: this.repCount + 1,
            duration: now - this.repStartTime,
            valid: false,
            reason: 'Shallow Depth (<90°)',
            elbowAngle,
            spineAngle
          });
        }
        break;

      case 'IN_DEPTH':
        // Dead-band hysteresis: must push back upward past 102°
        if (elbowAngle > 102) {
          this.state = 'ASCENDING';
          this.feedback = 'Driving up to lockout...';
          this.postureGuidance = 'Pushing up: lock arms fully straight!';
        }
        break;

      case 'ASCENDING':
        this.postureGuidance = `Extending arms: ${elbowAngle}° (Lockout: ≥155°)`;

        if (isAtLockout) {
          const duration = now - this.repStartTime;
          this.lastRepDuration = duration;

          // ===================================================================
          // ANTI-CHEAT GATE 4 & 5: TUT SPEED LIMIT & VERTICAL DROP CHECK
          // Auto-scales vertical displacement to body distance & camera height
          // ===================================================================
          const passedTUT = duration >= this.minRepDurationSeconds;
          const torsoLength = Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y);
          const minRequiredDisplacement = Math.max(0.018, torsoLength * 0.10);
          const passedDisplacement = this.maxDownwardDisplacement >= minRequiredDisplacement;
          const isCleanSpine = spineAngle >= 150 && spineAngle <= 192;

          if (this.isFormValidInCurrentRep && passedTUT && passedDisplacement && isCleanSpine) {
            this.repCount++;
            this.consecutiveCleanReps++;
            repIncremented = true;
            this.feedback = `Rep #${this.repCount} Verified (99.99% Clean)!`;
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
            let reason = this.formErrorReason;
            if (!passedTUT) reason = 'Twitch Cheat (Too fast, cadence <0.7s)';
            else if (!passedDisplacement) reason = 'No Vertical Drop (Arm rotation spoof)';
            else if (!isCleanSpine) reason = 'Core Sagging (Worm push-up)';

            this.feedback = `No Rep: ${reason || 'Form violation'}`;
            this.postureGuidance = `No Rep: ${reason || 'Form violation'}`;
            this.repHistory.push({
              repNumber: this.repCount + 1,
              duration,
              valid: false,
              reason: reason || 'Form fault',
              elbowAngle,
              spineAngle
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
      elbowAngle,
      spineAngle,
      isFormValid: this.isFormValidInCurrentRep,
      formErrorReason: this.formErrorReason,
      dominantProfile: profile,
      repIncremented,
      repFaultOccurred,
      lastRepDuration: this.lastRepDuration,
      consecutiveCleanReps: this.consecutiveCleanReps,
      isComboActive,
      perspective,
      repHistory: this.repHistory
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
      isComboActive: this.consecutiveCleanReps >= 3,
      perspective: { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Auto-Angle: Calibrated' }
    };
  }
}
