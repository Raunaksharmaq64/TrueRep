/**
 * ExerciseConfig.js
 * Centralized Configuration Schema for Exercise Requirements & Scoring Weights.
 *
 * Implements Section 10 & Section 21 of masterPrompt 1.md:
 * Decouples exercise rules from hardcoded application logic, making TrueRep
 * fully extensible for new exercises.
 */

export const EXERCISE_CONFIGS = {
  squat: {
    id: 'squat',
    name: 'Barbell / Bodyweight Squat',
    requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28], // shoulders, hips, knees, ankles
    preferredView: 'diagonal',
    minimumVisibility: 0.70,
    lockoutAngle: 150,
    parallelAngle: 95,
    minRepDurationSeconds: 0.55,
    scoringWeights: {
      depth: 0.35,
      alignment: 0.25,
      stability: 0.20,
      symmetry: 0.10,
      tempo: 0.10
    }
  },

  pushup: {
    id: 'pushup',
    name: 'Push-Up',
    requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24, 27, 28], // upper body, core, feet
    preferredView: 'side',
    minimumVisibility: 0.70,
    lockoutAngle: 148,
    targetDepthAngle: 95,
    minRepDurationSeconds: 0.55,
    scoringWeights: {
      depth: 0.35,
      alignment: 0.30, // core sag/pike
      stability: 0.15,
      symmetry: 0.10,
      tempo: 0.10
    }
  },

  jumpingjack: {
    id: 'jumpingjack',
    name: 'Jumping Jack',
    requiredLandmarks: [11, 12, 15, 16, 23, 24, 27, 28],
    preferredView: 'frontal',
    minimumVisibility: 0.70,
    minRepDurationSeconds: 0.45,
    scoringWeights: {
      armElevation: 0.40,
      stanceExpansion: 0.30,
      symmetry: 0.15,
      tempo: 0.15
    }
  },

  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Curls',
    category: 'Arms / Pull',
    status: 'coming_soon',
    tag: 'SOON',
    requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24],
    preferredView: 'side',
    minimumVisibility: 0.65,
    lockoutAngle: 155,
    peakContractionAngle: 45,
    minRepDurationSeconds: 0.65,
    rules: [
      'Peak Bicep Flexion (≤45° elbow flexion)',
      'Anti-Elbow Flare (Elbow locked at ribcage side)',
      'Strict Eccentric Cadence (No swinging torso momentum)'
    ],
    scoringWeights: {
      contraction: 0.35,
      elbowStability: 0.30,
      tempo: 0.20,
      symmetry: 0.15
    }
  },

  shoulder_press: {
    id: 'shoulder_press',
    name: 'Overhead Shoulder Press',
    category: 'Shoulders / Push',
    status: 'coming_soon',
    tag: 'SOON',
    requiredLandmarks: [11, 12, 13, 14, 15, 16, 23, 24],
    preferredView: 'frontal',
    minimumVisibility: 0.70,
    lockoutAngle: 165,
    descentAngle: 85,
    minRepDurationSeconds: 0.70,
    rules: [
      'Full Overhead Lockout (≥165° elbow angle at peak)',
      'Collarbone Depth (Elbows descend to shoulder level)',
      'Lumbar Guard (Zero excessive spine arch / hyperextension)'
    ],
    scoringWeights: {
      overheadLockout: 0.35,
      spineArch: 0.25,
      depth: 0.20,
      symmetry: 0.20
    }
  },

  lunge: {
    id: 'lunge',
    name: 'Walking & Static Lunges',
    category: 'Legs / Unilateral',
    status: 'coming_soon',
    tag: 'BETA',
    requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],
    preferredView: 'diagonal',
    minimumVisibility: 0.70,
    frontKneeAngle: 90,
    backKneeAngle: 90,
    minRepDurationSeconds: 0.75,
    rules: [
      '90° / 90° Dual Knee Flexion at bottom depth',
      'Torso Upright Angle (Chest vertical, no forward collapse)',
      'Front Knee Valgus Guard (Tracks strictly over toe)'
    ],
    scoringWeights: {
      depth: 0.35,
      torsoVerticality: 0.25,
      kneeOverToe: 0.20,
      balance: 0.20
    }
  },

  deadlift: {
    id: 'deadlift',
    name: 'Deadlifts (Conventional / RDL)',
    category: 'Posterior Chain',
    status: 'coming_soon',
    tag: 'SOON',
    requiredLandmarks: [11, 12, 23, 24, 25, 26, 27, 28],
    preferredView: 'side',
    minimumVisibility: 0.75,
    minRepDurationSeconds: 0.80,
    rules: [
      'Neutral Lumbar Spine (Zero cat/camel spine rounding)',
      'Pure Hip Hinge Mechanics (Hips drive back first)',
      'Standing Lockout (Full hip and knee extension at top)'
    ],
    scoringWeights: {
      lumbarSpine: 0.40,
      hipHinge: 0.30,
      lockout: 0.20,
      barPath: 0.10
    }
  }
};

export class ExerciseConfigManager {
  static getConfig(exerciseId) {
    return EXERCISE_CONFIGS[exerciseId] || EXERCISE_CONFIGS.squat;
  }
}
