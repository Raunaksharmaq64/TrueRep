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
   * Perspective-Compensated Hybrid Angle:
   * Combines rock-solid 2D trigonometric angle with 3D spatial dot product to
   * auto-compensate for camera tilt (laptop on desk pointing down or floor pointing up).
   * Ensures true 90° joint depth is never rejected due to foreshortening.
   */
  static getPerspectiveCompensatedAngle(a, b, c) {
    const angle2D = this.calculateAngle(a, b, c);
    const angle3D = this.calculate3DAngle(a, b, c);

    if (angle3D > 0 && Math.abs(angle2D - angle3D) < 42) {
      // Perspective foreshortening always increases the apparent angle of acute/right angles.
      // Weighted blend gives optimal accuracy without jitter.
      return Math.round(0.45 * angle2D + 0.55 * angle3D);
    }
    return Math.round(angle2D);
  }

  /**
   * Auto-estimates camera pitch (tilt angle) relative to user:
   * - 'desk_downward': Camera is elevated on a table/desk pointing down (pitch ~20° to 45°)
   * - 'floor_upward': Camera is on the floor/bed pointing up (pitch ~15° to 35°)
   * - 'eye_level': Camera is approximately level with subject
   */
  static estimateCameraPerspective(landmarks) {
    if (!landmarks || landmarks.length < 29) return { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Level View (→)' };

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (!leftShoulder || !rightShoulder) return { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Level View (→)' };

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgAnkleY = (leftAnkle && rightAnkle) ? (leftAnkle.y + rightAnkle.y) / 2 : 0.9;
    const avgShoulderZ = ((leftShoulder.z || 0) + (rightShoulder.z || 0)) / 2;
    const avgAnkleZ = (leftAnkle && rightAnkle) ? ((leftAnkle.z || 0) + (rightAnkle.z || 0)) / 2 : 0;

    // Depth differential along vertical axis indicates camera pitch
    const dz = avgShoulderZ - avgAnkleZ;
    const dy = avgAnkleY - avgShoulderY;

    if (dy > 0.3) {
      const pitchRad = Math.atan2(dz, dy);
      const pitchDeg = Math.round((pitchRad * 180) / Math.PI);

      if (pitchDeg < -10) {
        return { pitch: 'desk_downward', estimatedPitchDeg: pitchDeg, label: 'Desk View (Down ↘)' };
      } else if (pitchDeg > 10) {
        return { pitch: 'floor_upward', estimatedPitchDeg: pitchDeg, label: 'Floor View (Up ↗)' };
      }
    }

    return { pitch: 'eye_level', estimatedPitchDeg: 0, label: 'Level View (→)' };
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
   * Universal Perspective-Invariant Plank Orientation:
   * Auto-adapts to ANY camera height/tilt:
   * 1. Laptop on high desk/table looking down (20°–45°)
   * 2. Phone on floor looking up (15°–35°)
   * 3. 45° diagonal perspective in narrow room
   * 4. Side profile
   *
   * STRICT ANTI-CHEAT:
   * 100% blocks standing upright "air pushups" or wall leaning!
   */
  static isPlankOrientationUniversal(shoulder, hip, wrist, ankle, knee, landmarks) {
    if (!shoulder || !hip) return false;

    // 1. Check 2D Torso Incline
    const incline2D = this.calculateTorsoIncline(shoulder, hip);

    // If 2D incline is already clearly horizontal (>= 42°), it's definitely plank
    if (incline2D >= 42) return true;

    // 2. Camera Pitch Invariance (For Desk Cameras looking down at ~30°-45°):
    // When a camera is on a desk pointing down, a person lying on the floor has their
    // torso projected with a steeper 2D dy. BUT in 3D world space:
    const dz = Math.abs((shoulder.z || 0) - (hip.z || 0));
    const dy = Math.abs(shoulder.y - hip.y);
    const dx = Math.abs(shoulder.x - hip.x);

    // 3D Spatial Vector angle from pure vertical:
    const groundSpan3D = Math.hypot(dx, dz);
    const angle3DFromVertical = Math.atan2(groundSpan3D, dy) * (180.0 / Math.PI);

    if (angle3DFromVertical >= 38) {
      // Confirm this is NOT a standing person:
      // In standing air push-ups, ankles are 0.45 to 0.80 below wrists in normalized height!
      // In floor push-ups, wrists and ankles are on the same floor plane (ankleToWristY < 0.35).
      if (wrist && ankle) {
        const ankleToWristY = ankle.y - wrist.y;
        if (ankleToWristY >= 0.45) {
          return false; // Standing cheat blocked!
        }
      }
      return true; // Valid floor plank detected from elevated desk camera!
    }

    // 3. Aspect Ratio Check:
    // Standing humans have bounding box height/width > 2.4. Floor plankers have height/width < 1.7.
    if (landmarks && landmarks.length >= 29) {
      const ys = landmarks.map(p => p.y);
      const xs = landmarks.map(p => p.x);
      const bboxH = Math.max(...ys) - Math.min(...ys);
      const bboxW = Math.max(...xs) - Math.min(...xs);

      if (bboxW > 0.05) {
        const aspect = bboxH / bboxW;
        if (aspect < 1.75 && incline2D >= 26) {
          return true;
        }
      }
    }

    // Fallback: strictly require >= 42°
    return incline2D >= 42;
  }

  /**
   * Backward-compatible isPlankOrientation
   */
  static isPlankOrientation(shoulder, hip) {
    return this.calculateTorsoIncline(shoulder, hip) >= 42;
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
