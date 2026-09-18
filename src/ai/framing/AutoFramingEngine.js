/**
 * AutoFramingEngine.js
 * Dynamic Digital Viewport Auto-Framing & Zoom Engine.
 *
 * Implements Section 7, 8 & 9 of masterPrompt 1.md:
 * Keeps athlete centered, eliminates excess empty space, and smoothly zooms
 * without jitter or jarring visual jumps.
 */

import { BodyBoundingBox } from './BodyBoundingBox.js';
import { FramingSmoother } from './FramingSmoother.js';

export class AutoFramingEngine {
  constructor(options = {}) {
    this.smoother = new FramingSmoother(options.smoothingAlpha ?? 0.10);
    this.maxZoom = options.maxZoom ?? 1.45;
    this.minZoom = 1.0;
    this.isEnabled = options.enabled ?? true;
  }

  reset() {
    this.smoother.reset();
  }

  /**
   * Computes digital camera viewport transform for current landmarks.
   * @param {Array} landmarks - 33 MediaPipe body landmarks
   * @param {number} canvasWidth - Viewport pixel width
   * @param {number} canvasHeight - Viewport pixel height
   * @param {string} exercise - Active exercise for predictive margins
   * @returns {Object} { scale, translateX, translateY, box }
   */
  computeFramingTransform(landmarks, canvasWidth, canvasHeight, exercise = 'squat') {
    if (!this.isEnabled || !landmarks || landmarks.length === 0) {
      return {
        scale: 1.0,
        translateX: 0,
        translateY: 0,
        box: null
      };
    }

    // Predictive padding based on exercise dynamics
    const padding = {
      horizontal: exercise === 'jumpingjack' ? 0.30 : 0.22,
      verticalTop: 0.16,
      verticalBottom: exercise === 'squat' ? 0.32 : 0.20 // Extra bottom margin for squats
    };

    const rawBox = BodyBoundingBox.compute(landmarks, padding);
    const smoothed = this.smoother.update(rawBox);

    if (!smoothed || !smoothed.isValid) {
      return { scale: 1.0, translateX: 0, translateY: 0, box: null };
    }

    // Determine scale to fill 75% of viewport safely
    const targetScaleX = 0.85 / (smoothed.width || 1);
    const targetScaleY = 0.85 / (smoothed.height || 1);
    let scale = Math.min(targetScaleX, targetScaleY);

    // Clamp zoom factor
    scale = Math.max(this.minZoom, Math.min(this.maxZoom, scale));

    // Centering offsets
    const targetCenterX = smoothed.centerX * canvasWidth;
    const targetCenterY = smoothed.centerY * canvasHeight;

    const viewportCenterX = canvasWidth / 2;
    const viewportCenterY = canvasHeight / 2;

    const translateX = (viewportCenterX - targetCenterX) * (scale - 1) * 0.5;
    const translateY = (viewportCenterY - targetCenterY) * (scale - 1) * 0.5;

    return {
      scale: Math.round(scale * 100) / 100,
      translateX: Math.round(translateX),
      translateY: Math.round(translateY),
      box: smoothed
    };
  }
}
