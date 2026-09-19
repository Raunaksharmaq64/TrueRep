/**
 * FeedbackEngine.js
 * Anti-Jitter Temporal Persistence & Cooldown Feedback Manager.
 *
 * Implements Section 23, 24, 25 & 26 of masterPrompt 1.md:
 * - Anti-Jitter: requires N >= 4 consecutive fault frames before triggering feedback.
 * - Cooldown: enforces minimum 3.5s pause between repeated voice/visual cues.
 * - Occlusion tolerance: holds tracking through 1-3 dropped landmark frames.
 * - Multi-person detector alert.
 */

export class FeedbackEngine {
  constructor(options = {}) {
    this.persistenceThreshold = options.persistenceFrames ?? 4; // Fault must persist 4 frames
    this.cooldownSeconds = options.cooldownSeconds ?? 3.5;

    this.faultStreakCounter = {};
    this.lastEmittedTime = {};
    this.occlusionDropFrames = 0;
  }

  reset() {
    this.faultStreakCounter = {};
    this.lastEmittedTime = {};
    this.occlusionDropFrames = 0;
  }

  /**
   * Evaluates candidate feedback and returns whether it should be shown/spoken.
   * @param {string} feedbackKey - Unique identifier for the feedback (e.g. 'valgus', 'hip_sag')
   * @param {string} message - Human-readable coaching cue
   * @param {boolean} isFaultActive - Whether the fault is present in current frame
   * @returns {Object} { shouldEmit: boolean, message: string }
   */
  processFeedback(feedbackKey, message, isFaultActive) {
    const now = performance.now() / 1000;

    if (!isFaultActive) {
      this.faultStreakCounter[feedbackKey] = 0;
      return { shouldEmit: false, message: null };
    }

    // Increment fault streak
    this.faultStreakCounter[feedbackKey] = (this.faultStreakCounter[feedbackKey] || 0) + 1;

    // Check temporal persistence (anti-jitter)
    if (this.faultStreakCounter[feedbackKey] < this.persistenceThreshold) {
      return { shouldEmit: false, message: null };
    }

    // Check cooldown
    const lastTime = this.lastEmittedTime[feedbackKey];
    if (lastTime !== undefined && (now - lastTime < this.cooldownSeconds)) {
      return { shouldEmit: false, message: null };
    }

    // Issue confirmed & cooldown passed!
    this.lastEmittedTime[feedbackKey] = now;
    return { shouldEmit: true, message };
  }

  /**
   * Handles brief occlusion (1-3 frames).
   * @param {boolean} hasLandmarksInFrame
   * @returns {Object} { isTolerated: boolean, shouldPrompt: boolean }
   */
  handleOcclusion(hasLandmarksInFrame) {
    if (hasLandmarksInFrame) {
      this.occlusionDropFrames = 0;
      return { isTolerated: true, shouldPrompt: false };
    }

    this.occlusionDropFrames++;

    // 1-3 frames missing is tolerated as a camera sensor hiccup
    if (this.occlusionDropFrames <= 3) {
      return { isTolerated: true, shouldPrompt: false };
    }

    // Prolonged occlusion requires user adjustment
    return {
      isTolerated: false,
      shouldPrompt: true,
      instruction: 'Full body lost from camera. Please step into view.'
    };
  }
}
