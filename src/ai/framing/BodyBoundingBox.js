/**
 * BodyBoundingBox.js
 * Calculates athlete bounding coordinates and exercise-aware safety margins.
 *
 * Implements Section 6 & Section 9 of masterPrompt 1.md:
 * minX, maxX, minY, maxY, bodyWidth, bodyHeight, centerX, centerY, with predictive margins.
 */

export class BodyBoundingBox {
  /**
   * Calculates athlete bounding box from normalized landmarks.
   * @param {Array} landmarks - 33 MediaPipe body landmarks
   * @param {Object} paddingOptions - { horizontal: 0.20, verticalTop: 0.15, verticalBottom: 0.25 }
   * @returns {Object} Bounding box dimensions in normalized [0, 1] range
   */
  static compute(landmarks, paddingOptions = {}) {
    if (!landmarks || landmarks.length === 0) {
      return {
        minX: 0, maxX: 1, minY: 0, maxY: 1,
        width: 1, height: 1,
        centerX: 0.5, centerY: 0.5,
        isValid: false
      };
    }

    const xs = landmarks.map(p => p.x);
    const ys = landmarks.map(p => p.y);

    const rawMinX = Math.max(0, Math.min(...xs));
    const rawMaxX = Math.min(1, Math.max(...xs));
    const rawMinY = Math.max(0, Math.min(...ys));
    const rawMaxY = Math.min(1, Math.max(...ys));

    const rawWidth = rawMaxX - rawMinX;
    const rawHeight = rawMaxY - rawMinY;

    // Default safety paddings
    const padH = paddingOptions.horizontal ?? (rawWidth * 0.25);
    const padVTop = paddingOptions.verticalTop ?? (rawHeight * 0.18);
    const padVBottom = paddingOptions.verticalBottom ?? (rawHeight * 0.25);

    const minX = Math.max(0, rawMinX - padH);
    const maxX = Math.min(1, rawMaxX + padH);
    const minY = Math.max(0, rawMinY - padVTop);
    const maxY = Math.min(1, rawMaxY + padVBottom);

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return {
      minX, maxX, minY, maxY,
      width, height,
      centerX, centerY,
      rawMinX, rawMaxX, rawMinY, rawMaxY,
      isValid: rawWidth > 0.05 && rawHeight > 0.10
    };
  }
}
