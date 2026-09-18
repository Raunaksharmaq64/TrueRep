/**
 * ReadinessEngine.js
 * Automated Pre-Workout Readiness Gating & Countdown State Machine.
 *
 * Implements Section 12 & Section 13 of masterPrompt 1.md:
 * Calculates overall Readiness Score (0-100%).
 * Transitions: SEARCHING -> POSITIONING -> READY -> COUNTDOWN (3..2..1..GO) -> ACTIVE.
 * Includes Instant Motion Auto-Start: if the user immediately begins squatting or pushing up,
 * the countdown is bypassed so the rep is counted instantly.
 */

import { BodyVisibilityChecker } from './BodyVisibilityChecker.js';
import { LandmarkConfidence } from './LandmarkConfidence.js';

export const READINESS_STATES = {
  SEARCHING: 'SEARCHING',
  POSITIONING: 'POSITIONING',
  READY: 'READY',
  COUNTDOWN: 'COUNTDOWN',
  ACTIVE: 'ACTIVE'
};

export class ReadinessEngine {
  constructor(config = {}) {
    this.visibilityChecker = new BodyVisibilityChecker(config);
    this.confidenceEvaluator = new LandmarkConfidence(config);

    this.state = READINESS_STATES.SEARCHING;
    this.readinessScore = 0;
    this.readySince = 0;
    this.countdownStart = 0;
    this.countdownValue = 3;
    this.isExercising = false;

    // Previous pelvic Y to detect instant motion auto-start
    this.lastHipY = null;
  }

  reset() {
    this.state = READINESS_STATES.SEARCHING;
    this.readinessScore = 0;
    this.readySince = 0;
    this.countdownStart = 0;
    this.countdownValue = 3;
    this.isExercising = false;
    this.lastHipY = null;
  }

  /**
   * Evaluates current frame for readiness and drives the transition sequence.
   * @param {Array} landmarks - 33 MediaPipe body landmarks
   * @param {Object} options - { exercise, requiredIndices }
   * @returns {Object} { state, readinessScore, isReady, isExercising, countdownValue, instruction }
   */
  processFrame(landmarks, options = {}) {
    const now = performance.now();

    // If already active, remain active
    if (this.state === READINESS_STATES.ACTIVE) {
      return {
        state: this.state,
        readinessScore: 100,
        isReady: true,
        isExercising: true,
        countdownValue: 0,
        instruction: null
      };
    }

    // 1. Check Landmark Presence
    if (!landmarks || landmarks.length < 25) {
      this.state = READINESS_STATES.SEARCHING;
      this.readinessScore = 0;
      this.readySince = 0;
      return {
        state: this.state,
        readinessScore: 0,
        isReady: false,
        isExercising: false,
        countdownValue: 0,
        instruction: 'Step into camera view'
      };
    }

    const { exercise = 'squat', requiredIndices = [11, 12, 23, 24, 25, 26, 27, 28] } = options;

    // 2. Evaluate Visibility & Confidence
    const visResult = this.visibilityChecker.checkVisibility(landmarks, { exercise, requiredIndices });
    const confResult = this.confidenceEvaluator.assessLandmarks(landmarks, requiredIndices);

    // 3. Composite Readiness Calculation (0-100)
    const compositeScore = Math.round(
      (visResult.visibilityScore * 50) + (confResult.overallScore * 50)
    );
    this.readinessScore = compositeScore;

    // 4. INSTANT MOTION AUTO-START:
    // If person begins descending into a squat or push-up, bypass countdown immediately!
    const hip = landmarks[24] || landmarks[23];
    if (hip) {
      if (this.lastHipY !== null) {
        const deltaHip = hip.y - this.lastHipY;
        if (deltaHip > 0.04 && compositeScore >= 70) {
          // Downward motion detected with good landmarks -> Go straight to ACTIVE!
          this.state = READINESS_STATES.ACTIVE;
          this.isExercising = true;
          return {
            state: this.state,
            readinessScore: 100,
            isReady: true,
            isExercising: true,
            countdownValue: 0,
            instruction: null
          };
        }
      }
      this.lastHipY = hip.y;
    }

    // 5. State Machine Transition Logic
    if (!visResult.isSatisfied || compositeScore < 75) {
      this.state = READINESS_STATES.POSITIONING;
      this.readySince = 0;
      this.countdownStart = 0;

      return {
        state: this.state,
        readinessScore: compositeScore,
        isReady: false,
        isExercising: false,
        countdownValue: 0,
        instruction: visResult.instruction || 'Adjust position'
      };
    }

    // Conditions satisfied!
    if (this.state === READINESS_STATES.POSITIONING || this.state === READINESS_STATES.SEARCHING) {
      this.state = READINESS_STATES.READY;
      this.readySince = now;
    }

    if (this.state === READINESS_STATES.READY) {
      // Must hold stable ready position for at least 600ms before starting countdown
      if (now - this.readySince >= 600) {
        this.state = READINESS_STATES.COUNTDOWN;
        this.countdownStart = now;
      }
    }

    if (this.state === READINESS_STATES.COUNTDOWN) {
      const elapsedSec = (now - this.countdownStart) / 1000;
      if (elapsedSec < 1.0) {
        this.countdownValue = 3;
      } else if (elapsedSec < 2.0) {
        this.countdownValue = 2;
      } else if (elapsedSec < 3.0) {
        this.countdownValue = 1;
      } else {
        // Countdown finished! GO!
        this.state = READINESS_STATES.ACTIVE;
        this.isExercising = true;
        this.countdownValue = 0;
      }
    }

    return {
      state: this.state,
      readinessScore: this.readinessScore,
      isReady: this.state === READINESS_STATES.READY || this.state === READINESS_STATES.COUNTDOWN,
      isExercising: this.isExercising,
      countdownValue: this.countdownValue,
      instruction: this.state === READINESS_STATES.COUNTDOWN ? `Starting in ${this.countdownValue}...` : (this.state === READINESS_STATES.READY ? "You're Ready!" : null)
    };
  }

  /**
   * Allows manual force-start override (e.g. clicking Start button).
   */
  forceStart() {
    this.state = READINESS_STATES.ACTIVE;
    this.isExercising = true;
  }
}
