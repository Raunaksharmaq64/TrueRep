/**
 * ExerciseClassifier.js
 * Kinematic Motion Archetype & Exercise Intent Classifier.
 *
 * Evaluates 3 orthogonal biomechanical dimensions:
 * 1. Body Orientation (Vertical Upright vs. Horizontal Plank vs. Floor)
 * 2. Primary Motion Vector (Vertical Pelvic Excursion vs. Lateral Limb Abduction vs. Arm Flexion)
 * 3. Stance / Limb Symmetry (Bilateral Symmetric vs. Asymmetric Stride)
 *
 * Prevents false rep deductions when an athlete performs an exercise different
 * from the selected mode (e.g. doing jumping jacks while squats is selected).
 */

import { KinematicsMath } from './KinematicsMath.js';

export class ExerciseClassifier {
  constructor() {
    this.history = [];
    this.historyMaxLength = 30; // ~1 second of motion at 30 FPS
  }

  reset() {
    this.history = [];
  }

  /**
   * Analyzes landmarks to classify current movement archetype.
   * @param {Array} landmarks - 33 MediaPipe body landmarks
   * @returns {Object} { archetype, confidence, isMatchingExercise, cue }
   */
  classify(landmarks, targetExercise = 'squat') {
    if (!landmarks || landmarks.length < 25) {
      return {
        archetype: 'unknown',
        confidence: 0,
        isMatchingExercise: true,
        cue: null
      };
    }

    const shoulderL = landmarks[11];
    const shoulderR = landmarks[12];
    const hipL = landmarks[23];
    const hipR = landmarks[24];
    const kneeL = landmarks[25];
    const kneeR = landmarks[26];
    const ankleL = landmarks[27];
    const ankleR = landmarks[28];
    const wristL = landmarks[15];
    const wristR = landmarks[16];

    // Midpoints
    const hipMid = {
      x: (hipL.x + hipR.x) / 2,
      y: (hipL.y + hipR.y) / 2
    };
    const shoulderMid = {
      x: (shoulderL.x + shoulderR.x) / 2,
      y: (shoulderL.y + shoulderR.y) / 2
    };

    // 1. Torso Incline from vertical (0° = standing straight, 90° = horizontal plank)
    const torsoIncline = KinematicsMath.calculateTorsoIncline(shoulderMid, hipMid);

    // 2. Lateral Arm Elevation (Jumping Jack dimension)
    const armElevL = KinematicsMath.calculateAngle(hipL, shoulderL, wristL);
    const armElevR = KinematicsMath.calculateAngle(hipR, shoulderR, wristR);
    const avgArmElev = (armElevL + armElevR) / 2;

    // 3. Stance Width relative to shoulders
    const shoulderWidth = Math.hypot(shoulderL.x - shoulderR.x, shoulderL.y - shoulderR.y);
    const ankleWidth = Math.hypot(ankleL.x - ankleR.x, ankleL.y - ankleR.y);
    const stanceRatio = shoulderWidth > 0.01 ? ankleWidth / shoulderWidth : 1.0;

    // 4. Knee Flexion
    const kneeAngleL = KinematicsMath.calculateAngle(hipL, kneeL, ankleL);
    const kneeAngleR = KinematicsMath.calculateAngle(hipR, kneeR, ankleR);
    const avgKneeAngle = (kneeAngleL + kneeAngleR) / 2;

    // Record history for temporal velocity
    this.history.push({
      time: performance.now(),
      hipY: hipMid.y,
      kneeAngle: avgKneeAngle,
      armElev: avgArmElev,
      stanceRatio
    });
    if (this.history.length > this.historyMaxLength) {
      this.history.shift();
    }

    // Determine Archetype
    let archetype = 'standing_idle';
    let confidence = 0.85;

    // Check Push-Up Archetype (Horizontal core orientation)
    const isPlank = KinematicsMath.isPlankOrientationUniversal(
      shoulderMid,
      hipMid,
      wristL,
      ankleL,
      kneeL,
      landmarks
    );

    if (isPlank || torsoIncline >= 45) {
      archetype = 'pushup';
      confidence = 0.90;
    } else if (avgArmElev > 115 && stanceRatio > 1.25) {
      // Arms elevated high + wide feet = Jumping Jack
      archetype = 'jumpingjack';
      confidence = 0.92;
    } else if (avgKneeAngle < 140 && torsoIncline < 45) {
      // Upright with significant knee bend = Squat
      archetype = 'squat';
      confidence = 0.90;
    } else if (torsoIncline < 35 && avgKneeAngle >= 150) {
      archetype = 'standing_idle';
      confidence = 0.85;
    }

    // Determine if motion matches user's active workout selection
    const isMatchingExercise =
      archetype === targetExercise ||
      archetype === 'standing_idle' ||
      archetype === 'unknown';

    let cue = null;
    if (!isMatchingExercise) {
      const exerciseNames = {
        squat: 'Squats',
        pushup: 'Push-Ups',
        jumpingjack: 'Jumping Jacks'
      };
      cue = `Detected ${archetype.toUpperCase()}. Perform ${exerciseNames[targetExercise] || targetExercise} to count reps.`;
    }

    return {
      archetype,
      confidence,
      isMatchingExercise,
      cue
    };
  }
}
