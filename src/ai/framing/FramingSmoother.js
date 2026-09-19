/**
 * FramingSmoother.js
 * Temporal smoothing filter for dynamic digital camera framing.
 *
 * Implements Section 8 of masterPrompt 1.md:
 * Eliminates frame-by-frame jumpiness and stabilizes visual framing.
 */

export class FramingSmoother {
  constructor(alpha = 0.12) {
    this.alpha = alpha; // Low alpha = ultra-smooth cinematic transitions
    this.smoothedBox = null;
  }

  reset() {
    this.smoothedBox = null;
  }

  /**
   * Smooths the target bounding box.
   * @param {Object} targetBox - New raw bounding box
   * @returns {Object} Smoothed bounding box
   */
  update(targetBox) {
    if (!targetBox || !targetBox.isValid) {
      return this.smoothedBox || targetBox;
    }

    if (!this.smoothedBox) {
      this.smoothedBox = { ...targetBox };
      return this.smoothedBox;
    }

    const a = this.alpha;
    this.smoothedBox = {
      minX: a * targetBox.minX + (1 - a) * this.smoothedBox.minX,
      maxX: a * targetBox.maxX + (1 - a) * this.smoothedBox.maxX,
      minY: a * targetBox.minY + (1 - a) * this.smoothedBox.minY,
      maxY: a * targetBox.maxY + (1 - a) * this.smoothedBox.maxY,
      width: a * targetBox.width + (1 - a) * this.smoothedBox.width,
      height: a * targetBox.height + (1 - a) * this.smoothedBox.height,
      centerX: a * targetBox.centerX + (1 - a) * this.smoothedBox.centerX,
      centerY: a * targetBox.centerY + (1 - a) * this.smoothedBox.centerY,
      isValid: true
    };

    return this.smoothedBox;
  }
}
