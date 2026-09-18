/**
 * GroundPlaneTracker.js
 * Synthetic Ground-Plane & Chest-to-Floor Proximity Engine.
 *
 * Solves monocular depth limitations for push-ups by establishing
 * a geometric floor plane from contact keypoints (wrists and toes/ankles)
 * and measuring chest vertical descent relative to arm segment length.
 */

export class GroundPlaneTracker {
  constructor(options = {}) {
    this.depthThreshold = options.depthThreshold ?? 0.38; // <= 38% arm length above floor = full depth
    this.lockoutThreshold = options.lockoutThreshold ?? 0.82; // >= 82% arm length above floor = lockout
    this.smoothedProximity = null;
    this.smoothingAlpha = options.smoothingAlpha ?? 0.55;
    this.calibratedArmLength = null;
  }

  reset() {
    this.smoothedProximity = null;
    this.calibratedArmLength = null;
  }

  /**
   * Evaluates chest-to-floor proximity in a horizontal plank.
   * @param {Array} landmarks - 33 MediaPipe pose landmarks
   * @param {boolean} isRight - dominant side profile
   * @param {Object} shoulder - shoulder landmark {x, y}
   * @param {Object} elbow - elbow landmark {x, y}
   * @param {Object} wrist - wrist landmark {x, y}
   * @param {Object} ankle - ankle landmark {x, y}
   * @returns {Object} Ground plane analysis
   */
  evaluate(landmarks, isRight, shoulder, elbow, wrist, ankle) {
    if (!shoulder || !wrist) {
      return {
        isValid: false,
        proximity: 1.0,
        isChestAtFloor: false,
        floorY: 0.9,
        chestY: shoulder ? shoulder.y : 0.5
      };
    }

    // 1. Arm segment length (Upper arm + forearm)
    const upperArmLength = Math.hypot(shoulder.x - elbow.x, shoulder.y - elbow.y);
    const forearmLength = Math.hypot(elbow.x - wrist.x, elbow.y - wrist.y);
    const instantArmLength = upperArmLength + forearmLength;

    // Calibrate maximum extended arm length from lockout so denominator does not shrink as elbows bend
    if (this.calibratedArmLength === null || instantArmLength > this.calibratedArmLength) {
      this.calibratedArmLength = instantArmLength;
    }

    const armLength = Math.max(0.18, this.calibratedArmLength);

    // 2. Establish Virtual Floor Plane (y_floor)
    // Wrists and toes establish physical floor contact
    let floorY = wrist.y;
    if (ankle && (ankle.visibility === undefined || ankle.visibility > 0.25)) {
      floorY = Math.max(wrist.y, ankle.y);
    }

    // 3. Raw Chest-to-Floor Proximity Ratio:
    const rawProximity = (floorY - shoulder.y) / armLength;

    // Apply EMA smoothing
    if (this.smoothedProximity === null) {
      this.smoothedProximity = rawProximity;
    } else {
      this.smoothedProximity =
        this.smoothingAlpha * rawProximity +
        (1 - this.smoothingAlpha) * this.smoothedProximity;
    }

    const proximity = Math.max(0, Math.round(this.smoothedProximity * 100) / 100);
    const isChestAtFloor = proximity <= this.depthThreshold;
    const isTopLockout = proximity >= this.lockoutThreshold;

    // Proximity percent: 0% = top lockout, 100% = chest touching floor
    const descentPercent = Math.min(
      100,
      Math.max(
        0,
        Math.round(((this.lockoutThreshold - proximity) / (this.lockoutThreshold - this.depthThreshold)) * 100)
      )
    );

    return {
      isValid: true,
      proximity,
      descentPercent,
      isChestAtFloor,
      isTopLockout,
      floorY,
      chestY: shoulder.y,
      upperArmLength,
      armLength
    };
  }

  /**
   * Fast Canvas Luma / Brightness Check.
   * Samples a low-res 16x16 grid to determine if room is dim without impacting FPS.
   * @param {HTMLCanvasElement|HTMLVideoElement} videoElement
   * @returns {number} average luma 0 - 255
   */
  static estimateLuma(videoElement) {
    try {
      if (!videoElement || videoElement.readyState < 2) return 120;
      const offscreen = document.createElement('canvas');
      offscreen.width = 16;
      offscreen.height = 16;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!ctx) return 120;
      ctx.drawImage(videoElement, 0, 0, 16, 16);
      const imgData = ctx.getImageData(0, 0, 16, 16).data;
      let totalLuma = 0;
      const pixelCount = 16 * 16;

      for (let i = 0; i < imgData.length; i += 4) {
        // Standard Rec. 601 luma formula
        const luma = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
        totalLuma += luma;
      }
      return Math.round(totalLuma / pixelCount);
    } catch {
      return 120;
    }
  }
}
