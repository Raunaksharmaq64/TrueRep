/**
 * PoseLandmarkerService.js
 * Initializes and manages Google MediaPipe PoseLandmarker (Wasm + WebGL delegate).
 * Utilizes pre-cached local offline model in `/models/pose_landmarker_lite.task`
 * with triple-layer fallback defense (GPU -> CPU -> CDN).
 */

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance = null;
let initializationPromise = null;

function withTimeout(promise, ms, errorMsg) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function getPoseLandmarker() {
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const localWasmUrl = origin ? `${origin}/wasm` : '/wasm';
      const cdnWasmUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

      let vision;
      try {
        vision = await withTimeout(
          FilesetResolver.forVisionTasks(localWasmUrl),
          4000,
          'Local WASM resolver timeout'
        );
      } catch (localWasmErr) {
        console.warn('Local wasm resolver error or timeout, falling back to CDN:', localWasmErr);
        vision = await FilesetResolver.forVisionTasks(cdnWasmUrl);
      }

      const localModelPath = origin ? `${origin}/models/pose_landmarker_lite.task` : '/models/pose_landmarker_lite.task';
      const cdnModelPath =
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

      // 1. Try GPU delegate with local model (5s timeout)
      try {
        poseLandmarkerInstance = await withTimeout(
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: localModelPath,
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.35,
            minPosePresenceConfidence: 0.35,
            minTrackingConfidence: 0.35
          }),
          5000,
          'Local GPU delegate timeout'
        );
      } catch (gpuErr) {
        console.warn('Local GPU delegate failed, trying CPU delegate with local model:', gpuErr);
        // 2. Fallback to CPU delegate with local model (5s timeout)
        try {
          poseLandmarkerInstance = await withTimeout(
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: localModelPath,
                delegate: 'CPU'
              },
              runningMode: 'VIDEO',
              numPoses: 1,
              minPoseDetectionConfidence: 0.35,
              minPosePresenceConfidence: 0.35,
              minTrackingConfidence: 0.35
            }),
            5000,
            'Local CPU delegate timeout'
          );
        } catch (localCpuErr) {
          console.warn('Local model CPU failed, falling back to Google CDN model:', localCpuErr);
          // 3. Fallback to Google Cloud CDN model
          poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: cdnModelPath,
              delegate: 'CPU'
            },
            runningMode: 'VIDEO',
            numPoses: 1,
            minPoseDetectionConfidence: 0.35,
            minPosePresenceConfidence: 0.35,
            minTrackingConfidence: 0.35
          });
        }
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
