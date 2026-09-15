/**
 * PoseLandmarkerService.js
 * Initializes and manages Google MediaPipe PoseLandmarker (Wasm + WebGL delegate).
 * Utilizes pre-cached local offline model in `/models/pose_landmarker_lite.task`.
 */

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance = null;
let initializationPromise = null;

export async function getPoseLandmarker() {
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Prefer local cached model in public/models/
      const localModelPath = '/models/pose_landmarker_lite.task';
      const cdnModelPath =
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

      let modelPath = localModelPath;

      // Check if local model can be reached
      try {
        const check = await fetch(localModelPath, { method: 'HEAD' });
        if (!check.ok) {
          modelPath = cdnModelPath;
        }
      } catch {
        modelPath = cdnModelPath;
      }

      // 1. Try GPU delegate
      try {
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.35,
          minPosePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
      } catch (gpuErr) {
        console.warn('WebGL GPU delegate failed, falling back to CPU delegate:', gpuErr);
        // 2. Fallback to CPU delegate
        poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.35,
          minPosePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
      }

      return poseLandmarkerInstance;
    } catch (err) {
      console.error('Failed to initialize MediaPipe PoseLandmarker:', err);
      initializationPromise = null;
      throw err;
    }
  })();

  return initializationPromise;
}
