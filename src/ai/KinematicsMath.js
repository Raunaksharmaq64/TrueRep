/**
 * KinematicsMath.js
 * High-performance 2D and 3D trigonometric vector math, bilateral symmetry evaluation,
 * knee valgus detection, and EMA jitter smoothing.
 */

export class KinematicsMath {
  /**
   * 2D Joint Angle using atan2 (vertex at B).
   */
  static calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return angle;
  }

  /**
   * 3D Spatial Vector Angle using Vector Dot Product:
   * θ = arccos( (u · v) / (|u| * |v|) )
   * Invariant to perspective distortion and camera elevation.
   */
  static calculate3DAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    // Vector u = A - B
    const ux = a.x - b.x;
    const uy = a.y - b.y;
    const uz = (a.z || 0) - (b.z || 0);

    // Vector v = C - B
    const vx = c.x - b.x;
    const vy = c.y - b.y;
    const vz = (c.z || 0) - (b.z || 0);

    const dot = ux * vx + uy * vy + uz * vz;
    const magU = Math.sqrt(ux * ux + uy * uy + uz * uz);
    const magV = Math.sqrt(vx * vx + vy * vy + vz * vz);

    if (magU * magV === 0) return 0;
    let cosTheta = dot / (magU * magV);
    // Clamp float rounding
    cosTheta = Math.max(-1.0, Math.min(1.0, cosTheta));
    return (Math.acos(cosTheta) * 180.0) / Math.PI;
  }

  /**
   * Torso Incline Angle relative to the vertical Y axis.
   * Compares the (Shoulder -> Hip) vector with vertical (0, 1).
   */
  static calculateTorsoIncline(shoulder, hip) {
    if (!shoulder || !hip) return 0;
    const dx = shoulder.x - hip.x;
    const dy = shoulder.y - hip.y;
    // Angle in degrees from vertical line
    const angleFromVertical = Math.abs(Math.atan2(dx, -dy) * (180.0 / Math.PI));
    return angleFromVertical;
  }

  /**
   * Knee Valgus Detector (Frontal Plane / Front Camera):
   * Tests if distance between knees collapses inward compared to ankle stance width:
   * Distance(Left Knee, Right Knee) >= Distance(Left Ankle, Right Ankle) * 0.85
   * Returns: { hasValgus: boolean, ratio: number }
   */
  static detectKneeValgus(leftKnee, rightKnee, leftAnkle, rightAnkle) {
    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      return { hasValgus: false, ratio: 1.0 };
    }

    const kneeDistance = Math.hypot(leftKnee.x - rightKnee.x, leftKnee.y - rightKnee.y);
    const ankleDistance = Math.hypot(leftAnkle.x - rightAnkle.x, leftAnkle.y - rightAnkle.y);

    if (ankleDistance === 0) return { hasValgus: false, ratio: 1.0 };
    const ratio = kneeDistance / ankleDistance;

    // If knee distance is less than 85% of ankle width, flag knee caving (valgus)
    return {
      hasValgus: ratio < 0.82,
      ratio: Math.round(ratio * 100) / 100
    };
  }

  /**
   * Exponential Moving Average (EMA) smoothing to eliminate camera jitter.
   * alpha = 0.65 preserves fast transitions while filtering sensor noise.
   */
  static smoothAngleEMA(prevAngle, currentAngle, alpha = 0.65) {
    if (prevAngle === null || prevAngle === undefined || isNaN(prevAngle)) {
      return currentAngle;
    }
    return alpha * currentAngle + (1 - alpha) * prevAngle;
  }

  /**
   * Confidence Gating: checks if critical landmarks have visibility >= minConfidence.
   */
  static isConfidenceMet(landmarks, indices, minConfidence = 0.25) {
    if (!landmarks || landmarks.length === 0) return false;
    for (const idx of indices) {
      const pt = landmarks[idx];
      if (!pt || (pt.visibility !== undefined && pt.visibility < minConfidence)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluates Bilateral Visibility:
   * Returns whether both left and right sides are sufficiently visible for bilateral analysis.
   */
  static isBilateralVisible(landmarks, minConfidence = 0.5) {
    const leftIndices = [11, 13, 15, 23, 25, 27];
    const rightIndices = [12, 14, 16, 24, 26, 28];
    const leftVisible = this.isConfidenceMet(landmarks, leftIndices, minConfidence);
    const rightVisible = this.isConfidenceMet(landmarks, rightIndices, minConfidence);
    return {
      isBilateral: leftVisible && rightVisible,
      leftVisible,
      rightVisible
    };
  }

  /**
   * Dynamically determines dominant side profile (left vs right) by summing visibility scores.
   */
  static getDominantProfile(landmarks) {
    if (!landmarks || landmarks.length < 29) return 'left';

    const leftIndices = [11, 13, 15, 23, 25, 27];
    const rightIndices = [12, 14, 16, 24, 26, 28];

    const sumVisibility = (indices) =>
      indices.reduce((sum, i) => sum + (landmarks[i]?.visibility ?? 1.0), 0);

    const leftScore = sumVisibility(leftIndices);
    const rightScore = sumVisibility(rightIndices);

    return rightScore > leftScore ? 'right' : 'left';
  }
}
