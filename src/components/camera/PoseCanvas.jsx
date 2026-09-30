import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, AlertTriangle, Sparkles, Flame, Maximize2, Minimize2, FlipHorizontal, Compass, Sliders, Zap } from 'lucide-react';
import { 
  getPoseLandmarker, 
  checkDevicePerformanceTier,
  PushUpFSM, 
  SquatFSM, 
  JumpingJackFSM, 
  ExerciseClassifier, 
  ViewpointLockoutEngine,
  AutoFramingEngine,
  ReadinessEngine,
  FeedbackEngine,
  GroundPlaneTracker
} from '../../ai';
import { audioAlerts } from '../../utils';

// Standard MediaPipe Pose connections
const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
  [27, 29], [28, 30]  // feet
];

function PoseCanvas({
  exercise = 'pushup', // 'pushup' | 'squat' | 'jumpingjack'
  isExpanded = false,
  isSessionActive = true,
  onToggleExpand,
  onRepUpdate,
  onTelemetryUpdate,
  onVoiceFeedback
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isMirrored, setIsMirrored] = useState(true);
  const isMirroredRef = useRef(true);
  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);
  const [currentFps, setCurrentFps] = useState(0);
  const [cameraPerspective, setCameraPerspective] = useState({
    pitch: 'eye_level',
    estimatedPitchDeg: 0,
    label: 'Auto-Calibrated'
  });
  const lastPerspectiveLabelRef = useRef('');
  const [isLowLight, setIsLowLight] = useState(false);

  // Hardware Performance Tier & Power Saver Mode
  const deviceTierRef = useRef(checkDevicePerformanceTier());
  const [isPowerSaver, setIsPowerSaver] = useState(() => deviceTierRef.current.isLowEnd);
  const isPowerSaverRef = useRef(isPowerSaver);
  useEffect(() => {
    isPowerSaverRef.current = isPowerSaver;
  }, [isPowerSaver]);

  // Adaptive inference interval (ms): 33ms (~30 FPS) for high-end, 50ms (~20 FPS) for low-end
  const currentIntervalRef = useRef(deviceTierRef.current.isLowEnd ? 50 : 33);

  // FSM Instances & Biomechanical Engines
  const pushUpFSM = useRef(new PushUpFSM());
  const squatFSM = useRef(new SquatFSM());
  const jumpingJackFSM = useRef(new JumpingJackFSM());
  const exerciseClassifier = useRef(new ExerciseClassifier());
  const viewpointEngine = useRef(new ViewpointLockoutEngine());
  const autoFramingEngine = useRef(new AutoFramingEngine());
  const readinessEngine = useRef(new ReadinessEngine());
  const feedbackEngine = useRef(new FeedbackEngine());

  const [digitalFraming, setDigitalFraming] = useState({ scale: 1.0, translateX: 0, translateY: 0 });
  const [readinessStatus, setReadinessStatus] = useState({
    state: 'SEARCHING',
    readinessScore: 0,
    isReady: false,
    isExercising: false,
    countdownValue: 0,
    instruction: 'Step into camera view'
  });
  const lastCountdownRef = useRef(-1);

  const landmarkerRef = useRef(null);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(Date.now());
  const lastDispatchedRepRef = useRef(-1);
  const lastDispatchedStateRef = useRef('');
  const lastDepthDingStateRef = useRef('');
  const lastClassifierCueTimeRef = useRef(0);
  const lastTelemetryTimeRef = useRef(0);
  const lastInferenceTimeRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);

  // Transient visual particle / alert states for canvas rendering
  const floatingEffectsRef = useRef([]);

  const handleAutoCalibrateAngle = useCallback(() => {
    pushUpFSM.current.reset();
    squatFSM.current.reset();
    jumpingJackFSM.current.reset();
    floatingEffectsRef.current.push({
      text: '📐 AUTO-ANGLE: DESK & FLOOR CALIBRATED',
      color: '#10b981',
      y: (canvasRef.current?.height || 480) * 0.45,
      opacity: 1.0,
      createdAt: Date.now()
    });
    if (onVoiceFeedback) {
      onVoiceFeedback('Camera auto-angle calibrated!');
    }
  }, [onVoiceFeedback]);

  // Reset FSM and engines on exercise change
  useEffect(() => {
    pushUpFSM.current.reset();
    squatFSM.current.reset();
    jumpingJackFSM.current.reset();
    autoFramingEngine.current.reset();
    readinessEngine.current.reset();
    feedbackEngine.current.reset();
    floatingEffectsRef.current = [];
    setReadinessStatus({
      state: 'SEARCHING',
      readinessScore: 0,
      isReady: false,
      isExercising: false,
      countdownValue: 0,
      instruction: 'Step into camera view'
    });
  }, [exercise]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingModel(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'HTTP Security Constraint: Mobile browsers require HTTPS or localhost to access camera. Use HTTPS or enable chrome://flags (Insecure origins treated as secure).'
        );
      }

      // Concurrently kick off model fetch and camera media acquisition with adaptive resolution
      const isLowTier = isPowerSaverRef.current || deviceTierRef.current.isLowEnd;
      const mediaPromise = navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: isLowTier ? { ideal: 640, max: 854 } : { ideal: 1280, min: 640 },
          height: isLowTier ? { ideal: 480, max: 480 } : { ideal: 720, min: 480 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      });

      const modelPromise = landmarkerRef.current 
        ? Promise.resolve(landmarkerRef.current) 
        : getPoseLandmarker();

      // Await camera stream
      const stream = await mediaPromise;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;

        const playVideo = async () => {
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn('Video auto-play warning:', e);
          }
          setIsCameraActive(true);
        };

        if (videoRef.current.readyState >= 1) {
          playVideo();
        } else {
          videoRef.current.onloadedmetadata = () => {
            playVideo();
          };
          // Fallback timer: in case onloadedmetadata is delayed by browser
          setTimeout(() => {
            playVideo();
          }, 400);
        }
      }

      // Ensure AI model is fully ready
      landmarkerRef.current = await modelPromise;
      setIsLoadingModel(false);
    } catch (err) {
      console.error('Camera or Model error:', err);
      setIsLoadingModel(false);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser.'
          : err.message || 'Could not access camera or load AI model. Please retry.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setIsCameraActive(false);
    setIsLoadingModel(false);
  }, []);

  // Sync external isSessionActive trigger with camera state
  useEffect(() => {
    if (isSessionActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isSessionActive]);

  // Toggle Camera Facing
  const toggleFacingMode = () => {
    stopCamera();
    setFacingMode((prev) => {
      const next = prev === 'user' ? 'environment' : 'user';
      setIsMirrored(next === 'user');
      return next;
    });
  };

  // Main Detection Loop
  useEffect(() => {
    if (!isCameraActive) return;

    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (video && canvas && landmarker && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        // FPS & periodic light quality sampling
        frameCountRef.current++;
        const now = Date.now();
        if (now - fpsTimerRef.current >= 1000) {
          setCurrentFps(frameCountRef.current);
          frameCountRef.current = 0;
          fpsTimerRef.current = now;

          // Estimate room lighting without affecting render FPS
          const luma = GroundPlaneTracker.estimateLuma(video);
          setIsLowLight(luma < 30);
        }

        // Dynamic Adaptive Pose Inference (~30 FPS or ~20 FPS based on device capability)
        const perfNow = performance.now();
        const minInterval = isPowerSaverRef.current ? 50 : currentIntervalRef.current;
        if (perfNow - lastInferenceTimeRef.current >= minInterval && video.currentTime !== lastVideoTimeRef.current) {
          const inferStart = performance.now();
          lastInferenceTimeRef.current = perfNow;
          lastVideoTimeRef.current = video.currentTime;
          const poseResult = landmarker.detectForVideo(video, perfNow);
          const inferDuration = performance.now() - inferStart;

          // Dynamic adaptive latency scaling: if device GPU/CPU is struggling, adjust interval
          if (inferDuration > 30) {
            currentIntervalRef.current = Math.min(60, currentIntervalRef.current + 2);
          } else if (inferDuration < 18 && !isPowerSaverRef.current && currentIntervalRef.current > 33) {
            currentIntervalRef.current = Math.max(33, currentIntervalRef.current - 1);
          }

          ctx.clearRect(0, 0, width, height);

          if (poseResult.landmarks && poseResult.landmarks.length > 0) {
            const landmarks = poseResult.landmarks[0];

            // 1. Process Pre-Workout Readiness & Auto-Start Gating
            const readiness = readinessEngine.current.processFrame(landmarks, { exercise });
            setReadinessStatus(readiness);

            // Audio countdown chime for 3.. 2.. 1.. GO
            if (readiness.state === 'COUNTDOWN' && readiness.countdownValue !== lastCountdownRef.current) {
              lastCountdownRef.current = readiness.countdownValue;
              if (readiness.countdownValue > 0) {
                audioAlerts.playDepthDing();
                if (onVoiceFeedback) onVoiceFeedback(`${readiness.countdownValue}`);
              }
            } else if (readiness.state === 'ACTIVE' && lastCountdownRef.current === 1) {
              lastCountdownRef.current = 0;
              audioAlerts.playStartHorn();
              if (onVoiceFeedback) onVoiceFeedback('Go!');
            }

            // 2. Dynamic Digital Auto-Framing
            const framing = autoFramingEngine.current.computeFramingTransform(landmarks, width, height, exercise);
            setDigitalFraming(framing);

            // Select active FSM
            let activeFSM = pushUpFSM.current;
            if (exercise === 'squat') activeFSM = squatFSM.current;
            if (exercise === 'jumpingjack') activeFSM = jumpingJackFSM.current;

            // ALWAYS process frame in the FSM so movement is tracked, angles are calculated,
            // and reps increment regardless of whether the user waited for countdown!
            const evalResult = activeFSM.processFrame(landmarks);

            // If athlete is actively moving or completing reps, ensure readiness is marked exercising
            if (evalResult.reps > 0 || (evalResult.state !== 'IDLE' && evalResult.state !== 'START_LOCKOUT')) {
              if (!readiness.isExercising) {
                readiness.isExercising = true;
                readiness.state = 'ACTIVE';
                setReadinessStatus({ ...readiness, isExercising: true, state: 'ACTIVE' });
              }
            }

            // Exercise Motion Archetype & Viewpoint Lockout Analysis
            const classifierResult = exerciseClassifier.current.classify(landmarks, exercise);
            const viewpointResult = viewpointEngine.current.evaluateViewpoint(landmarks, exercise);

            // If user performs an unrelated exercise, notify without penalizing reps
            if (!classifierResult.isMatchingExercise && classifierResult.cue) {
              const nowMs = Date.now();
              if (nowMs - lastClassifierCueTimeRef.current > 4000) {
                lastClassifierCueTimeRef.current = nowMs;
                floatingEffectsRef.current.push({
                  text: `⚡ ${classifierResult.cue}`,
                  color: '#f59e0b',
                  y: height * 0.35,
                  opacity: 1.0,
                  createdAt: nowMs
                });
              }
            }

            // Trigger Audio & Visual alerts whenever reps increment or faults occur
            if (evalResult.repIncremented) {
              audioAlerts.playValidRepChime();
              floatingEffectsRef.current.push({
                text: `+1 VALID ${exercise.toUpperCase()} (${evalResult.formScore || 95}%)`,
                color: '#10b981',
                y: height * 0.45,
                opacity: 1.0,
                createdAt: Date.now()
              });

              if (onVoiceFeedback) {
                onVoiceFeedback(`Rep ${evalResult.reps} completed!`, true);
              }
            } else if (evalResult.repFaultOccurred) {
              audioAlerts.playWarningBuzz();
              floatingEffectsRef.current.push({
                text: `NO REP: ${evalResult.formErrorReason || 'FORM BREAK'}`,
                color: '#ef4444',
                y: height * 0.45,
                opacity: 1.0,
                createdAt: Date.now()
              });

              if (onVoiceFeedback && evalResult.formErrorReason) {
                onVoiceFeedback(`Warning: ${evalResult.formErrorReason}!`);
              }
            } else if (evalResult.state === 'IN_DEPTH' || evalResult.state === 'AT_PEAK') {
              // Debounced: trigger depth audio chime exactly once upon hitting depth
              if (lastDepthDingStateRef.current !== evalResult.state) {
                audioAlerts.playDepthDing();
                lastDepthDingStateRef.current = evalResult.state;
              }
            } else {
              lastDepthDingStateRef.current = '';
            }

            // Anti-jitter real-time corrective coaching during movement
            if (!evalResult.isFormValid && evalResult.formErrorReason && !evalResult.repFaultOccurred) {
              const cueFeedback = feedbackEngine.current.processFeedback(
                evalResult.formErrorReason,
                evalResult.formErrorReason,
                true
              );
              if (cueFeedback.shouldEmit) {
                floatingEffectsRef.current.push({
                  text: `⚠️ ${cueFeedback.message}`,
                  color: '#f59e0b',
                  y: height * 0.40,
                  opacity: 1.0,
                  createdAt: Date.now()
                });
                if (onVoiceFeedback) {
                  onVoiceFeedback(cueFeedback.message);
                }
              }
            }

            // Real-time voice coaching on posture state transitions
            if (onVoiceFeedback && evalResult.state !== lastDispatchedStateRef.current) {
              if (evalResult.state === 'START_LOCKOUT') {
                onVoiceFeedback('Position locked. Descend now!');
              } else if (evalResult.state === 'IN_DEPTH') {
                onVoiceFeedback(exercise === 'pushup' ? 'Depth reached! Push up!' : 'Parallel reached! Stand up!');
              }
            }

            // Sync rep count only on actual change
            if (onRepUpdate && evalResult.reps !== lastDispatchedRepRef.current) {
              lastDispatchedRepRef.current = evalResult.reps;
              onRepUpdate(evalResult.reps);
            }

            // Sync camera perspective detection
            if (evalResult.perspective && evalResult.perspective.label && evalResult.perspective.label !== lastPerspectiveLabelRef.current) {
              lastPerspectiveLabelRef.current = evalResult.perspective.label;
              setCameraPerspective(evalResult.perspective);
            }

            // Throttle React state telemetry
            const shouldDispatch =
              evalResult.repIncremented ||
              evalResult.repFaultOccurred ||
              evalResult.state !== lastDispatchedStateRef.current ||
              now - lastTelemetryTimeRef.current >= 150;

            if (onTelemetryUpdate && shouldDispatch) {
              lastDispatchedStateRef.current = evalResult.state;
              lastTelemetryTimeRef.current = now;
              onTelemetryUpdate({
                ...evalResult,
                readinessScore: readiness.readinessScore,
                readinessState: readiness.state,
                isExercising: readiness.isExercising,
                viewpoint: viewpointResult.viewpoint,
                isValgusAllowed: viewpointResult.isValgusAllowed,
                isMatchingExercise: classifierResult.isMatchingExercise,
                exerciseCue: classifierResult.cue
              });
            }

            // ALWAYS Draw Skeleton so the user sees tracking points on their body!
            drawCyberpunkSkeleton(ctx, landmarks, width, height, evalResult, exercise, isMirroredRef.current, isPowerSaverRef.current);

            // Overlay Readiness HUD when positioning, counting down, or searching
            if (!readiness.isExercising || readiness.state === 'COUNTDOWN') {
              drawReadinessHUD(ctx, width, height, readiness);
            }
          } else {
            // No landmarks detected - draw searching guide
            drawReadinessHUD(ctx, width, height, {
              state: 'SEARCHING',
              readinessScore: 0,
              instruction: 'Step into camera view to automatically begin'
            });
          }

          // Render active floating particles & banners
          renderFloatingEffects(ctx, width, floatingEffectsRef.current);
        }
      }

      // Use requestAnimationFrame for fluid 60 FPS visual rendering and skeletal overlay
      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isCameraActive, exercise, onRepUpdate, onTelemetryUpdate, onVoiceFeedback]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative w-full h-full min-h-[420px] bg-transparent flex items-center justify-center overflow-hidden group">
      {/* Dynamic Digital Auto-Framing Viewport Container */}
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-300 ease-out origin-center"
        style={{
          transform: `scale(${digitalFraming.scale || 1.0}) translate(${digitalFraming.translateX || 0}px, ${digitalFraming.translateY || 0}px)`
        }}
      >
        {/* Video element (uncropped full-sensor feed) */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${isCameraActive ? 'opacity-85 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        />

        {/* Decoupled Canvas overlay (unmirrored context: text renders crisp and readable left-to-right) */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            isCameraActive ? 'z-10 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
      </div>

      {/* Camera Off Status & Errors */}
      {!isCameraActive && (isLoadingModel || cameraError) && (
        <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center space-y-3 max-w-sm pointer-events-none">
          {isLoadingModel && (
            <p className="text-slate-400 text-xs font-['Arial_MT_Pro']">
              Loading MediaPipe BlazePose 3D Model...
            </p>
          )}

          {cameraError && (
            <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>
      )}

      {/* Live Tactical HUD Badges */}
      {isCameraActive && (
        <>
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
            <div className="bg-[#050914]/90 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-400 backdrop-blur-md flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{currentFps} FPS</span>
            </div>

            <div className="bg-[#050914]/95 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-300 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Compass className="w-3 h-3 text-emerald-400" />
              <span>📐 AUTO-ANGLE: {cameraPerspective.label ? cameraPerspective.label.toUpperCase() : 'ADAPTED'}</span>
            </div>

            {isLowLight && (
              <div className="bg-amber-950/90 border border-amber-500/70 px-2.5 py-1 rounded-lg text-[10px] font-mono text-amber-300 backdrop-blur-md flex items-center gap-1.5 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>DIM LIGHT DETECTED</span>
              </div>
            )}
            {/* Performance Mode / Power-Saver Indicator Badge */}
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border backdrop-blur-md flex items-center gap-1.5 ${
              isPowerSaver 
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
                : 'bg-[#050914]/90 border-slate-700/80 text-cyan-400'
            }`}>
              <Zap className={`w-3 h-3 ${isPowerSaver ? 'text-amber-400' : 'text-cyan-400'}`} />
              <span>{isPowerSaver ? '⚡ POWER SAVER ON' : '🚀 TURBO AI'}</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setIsPowerSaver(prev => !prev)}
              title={isPowerSaver ? 'Power Saver Mode ON (Optimized for low-spec CPU/GPU)' : 'Turbo AI Mode ON (Maximum 60FPS visual FX)'}
              className={`p-2 rounded-lg border backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isPowerSaver
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-[#050914]/90 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[10px] uppercase font-mono">{isPowerSaver ? 'Power-Saver' : 'Turbo'}</span>
            </button>
            <button
              onClick={handleAutoCalibrateAngle}
              title="Auto-Calibrate Camera Angle (Auto-adapts to desk/floor height without touching laptop)"
              className="p-2 rounded-lg bg-[#050914]/90 border border-emerald-500/50 text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-[10px] uppercase font-mono">Auto-Adjust</span>
            </button>

            <button
              onClick={() => setIsMirrored(prev => !prev)}
              title={isMirrored ? 'Mirror / Selfie View is ON' : 'Mirror / Selfie View is OFF'}
              className={`p-2 rounded-full border backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isMirrored 
                  ? 'bg-[#EAB308] border-[#EAB308] text-[#18181B]' 
                  : 'bg-black/80 border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px] uppercase font-mono">{isMirrored ? 'Mirrored' : 'Normal'}</span>
            </button>
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                title={isExpanded ? 'Normal view' : 'Expand full-height camera'}
                className="p-2 rounded-full bg-black/80 border border-white/20 text-white hover:text-[#EAB308] backdrop-blur-md transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={toggleFacingMode}
              title="Switch camera"
              className="p-2 rounded-full bg-black/80 border border-white/20 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={stopCamera}
              title="Stop camera"
              className="p-2 rounded-full bg-rose-600 border border-rose-500 text-white hover:bg-rose-700 backdrop-blur-md transition-colors"
            >
              <CameraOff className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Draws Cyberpunk glowing skeleton overlay, angle badges, and error lasers.
 * Optimized with dual-vector stroking and single-pass path batching for low-end hardware.
 */
function drawCyberpunkSkeleton(ctx, landmarks, width, height, evalResult, exercise, isMirrored = false, isPowerSaver = false) {
  const isFormValid = evalResult.isFormValid;
  const inDepth = evalResult.state === 'IN_DEPTH' || evalResult.state === 'AT_PEAK';
  const isCombo = evalResult.isComboActive;

  // Coordinate mapping helper:
  const getX = (pt) => (isMirrored ? (1.0 - pt.x) * width : pt.x * width);
  const getY = (pt) => pt.y * height;

  // Dynamic theme colors
  let boneColor = '#EAB308'; // Warm yellow default
  let darkUnderglow = '#713f12';

  if (!isFormValid) {
    boneColor = '#ef4444'; // Red fault
    darkUnderglow = '#7f1d1d';
  } else if (inDepth) {
    boneColor = '#10b981'; // Emerald green depth
    darkUnderglow = '#064e3b';
  } else if (isCombo) {
    boneColor = '#f59e0b'; // Gold / Flame combo
    darkUnderglow = '#78350f';
  }

  // Draw Bones (Single batched path execution for high FPS)
  ctx.save();
  ctx.lineCap = 'round';

  ctx.beginPath();
  for (const [i, j] of POSE_CONNECTIONS) {
    const p1 = landmarks[i];
    const p2 = landmarks[j];

    if (
      p1 &&
      p2 &&
      (p1.visibility === undefined || p1.visibility > 0.25) &&
      (p2.visibility === undefined || p2.visibility > 0.25)
    ) {
      ctx.moveTo(getX(p1), getY(p1));
      ctx.lineTo(getX(p2), getY(p2));
    }
  }

  if (isPowerSaver) {
    // Ultra-Fast Dual-Pass Vector Stroking (NO GPU shadowBlur penalty)
    ctx.lineWidth = isCombo ? 7 : 5;
    ctx.strokeStyle = darkUnderglow;
    ctx.stroke();

    ctx.lineWidth = isCombo ? 3.5 : 2.5;
    ctx.strokeStyle = boneColor;
    ctx.stroke();
  } else {
    // High-End Glowing Canvas Shadow
    ctx.lineWidth = isCombo ? 4 : 3;
    ctx.strokeStyle = boneColor;
    ctx.shadowColor = boneColor;
    ctx.shadowBlur = isCombo ? 14 : 8;
    ctx.stroke();
  }
  ctx.restore();

  // Draw Spine Hazard Line if form is broken on push-ups
  if (!isFormValid && exercise === 'pushup') {
    const isRight = evalResult.dominantProfile === 'right';
    const shoulder = landmarks[isRight ? 12 : 11];
    const hip = landmarks[isRight ? 24 : 23];
    const ankle = landmarks[isRight ? 28 : 27] || landmarks[isRight ? 26 : 25];

    if (shoulder && hip && ankle) {
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(getX(shoulder), getY(shoulder));
      ctx.lineTo(getX(hip), getY(hip));
      ctx.lineTo(getX(ankle), getY(ankle));
      ctx.stroke();
      ctx.restore();
    }
  }

  // Major biomechanical joints for enhanced visibility
  const MAJOR_JOINTS = new Set([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]);

  // Batch Draw Joints
  ctx.save();
  if (!isPowerSaver) {
    ctx.shadowColor = boneColor;
    ctx.shadowBlur = 10;
  }

  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i];
    if (pt && (pt.visibility === undefined || pt.visibility > 0.12)) {
      const x = getX(pt);
      const y = getY(pt);
      const isMajor = MAJOR_JOINTS.has(i);

      ctx.beginPath();
      ctx.arc(x, y, isMajor ? (isCombo ? 7 : 6) : 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = isMajor ? 2.5 : 1.5;
      ctx.strokeStyle = boneColor;
      ctx.stroke();

      // Outer halo ring for primary kinetic vertices
      if (isMajor) {
        ctx.beginPath();
        ctx.arc(x, y, isCombo ? 12 : 10, 0, 2 * Math.PI);
        ctx.strokeStyle = boneColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }
  ctx.restore();

  // Active vertex joints for visual guidance
  const isRight = evalResult.dominantProfile === 'right';
  const elbowPt = landmarks[isRight ? 14 : 13];
  const kneePt = landmarks[isRight ? 26 : 25];
  const hipPt = landmarks[isRight ? 24 : 23];

  if (exercise === 'pushup') {
    // 1. Render Synthetic Ground-Plane & Depth Shadow
    if (evalResult.groundResult && evalResult.groundResult.isValid) {
      drawSyntheticDepthShadow(ctx, width, height, evalResult.groundResult, evalResult, landmarks, isRight, isMirrored);
    }

    if (elbowPt && evalResult.elbowAngle) {
      const isAtDepth = evalResult.elbowAngle <= 102 || (evalResult.groundResult && evalResult.groundResult.isChestAtFloor);
      const jointColor = isAtDepth ? '#10b981' : '#38bdf8';
      const ex = getX(elbowPt);
      const ey = getY(elbowPt);

      // Glowing target ring around active elbow vertex
      ctx.beginPath();
      ctx.arc(ex, ey, 16, 0, 2 * Math.PI);
      ctx.strokeStyle = jointColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      drawFloatingBadge(
        ctx,
        ex,
        ey - 24,
        `${evalResult.elbowAngle}° ${isAtDepth ? '✓ DEPTH' : '→ ≤95°'}`,
        jointColor
      );

      if (hipPt && evalResult.spineAngle) {
        const isSagging = evalResult.spineAngle < 135;
        drawFloatingBadge(
          ctx,
          getX(hipPt),
          getY(hipPt) - 24,
          `Core: ${evalResult.spineAngle}° ${isSagging ? '⚠️ SAG' : '✓ RIGID'}`,
          isSagging ? '#ef4444' : '#38bdf8'
        );
      }
    }

    // Perspective angle guide for push-ups
    if (evalResult.perspective) {
      const isFrontal = evalResult.dominantProfile === 'center' || evalResult.perspective.label === 'Eye Level Frontal';
      if (isFrontal) {
        drawFloatingBadge(
          ctx,
          width / 2,
          height - 24,
          '💡 Pro Tip: Place camera at 45° angle at floor level for optimal push-up tracking',
          '#38bdf8'
        );
      }
    }
  }

  if (exercise === 'squat' && kneePt && evalResult.kneeAngle) {
    const isAtDepth = evalResult.kneeAngle <= 102;
    const jointColor = isAtDepth ? '#10b981' : '#38bdf8';
    const kx = getX(kneePt);
    const ky = getY(kneePt);

    // Glowing target ring around active knee vertex
    ctx.beginPath();
    ctx.arc(kx, ky, 16, 0, 2 * Math.PI);
    ctx.strokeStyle = jointColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    drawFloatingBadge(
      ctx,
      kx,
      ky - 24,
      `${evalResult.kneeAngle}° ${isAtDepth ? '✓ PARALLEL' : '→ ≤95°'}`,
      jointColor
    );
  }

  if (exercise === 'jumpingjack' && evalResult.armAngle) {
    drawFloatingBadge(
      ctx,
      width / 2,
      height * 0.16,
      `Arm: ${evalResult.armAngle}° | Stance: ${evalResult.stanceRatio}x`,
      inDepth ? '#10b981' : '#38bdf8'
    );
  }

  // Combo Multiplier Banner
  if (isCombo) {
    drawComboAuraBanner(ctx, width, evalResult.consecutiveCleanReps);
  }

  ctx.restore();
}

/**
 * Renders Synthetic Depth Shadow and Virtual Ground-Plane
 */
function drawSyntheticDepthShadow(ctx, width, height, groundResult, evalResult, landmarks, isRight, isMirrored) {
  const getX = (pt) => (isMirrored ? (1.0 - pt.x) * width : pt.x * width);
  const getY = (pt) => pt.y * height;

  const shoulder = landmarks[isRight ? 12 : 11];
  const wrist = landmarks[isRight ? 16 : 15];
  const ankle = landmarks[isRight ? 28 : 27] || landmarks[isRight ? 26 : 25];

  if (!shoulder || !wrist) return;

  ctx.save();
  const floorYPixel = groundResult.floorY * height;
  const chestXPixel = getX(shoulder);
  const chestYPixel = getY(shoulder);
  const wristXPixel = getX(wrist);
  const ankleXPixel = ankle ? getX(ankle) : wristXPixel + (isRight ? 180 : -180);

  const minX = Math.min(wristXPixel, ankleXPixel) - 30;
  const maxX = Math.max(wristXPixel, ankleXPixel) + 30;

  const isDepth = groundResult.isChestAtFloor;
  const beamColor = isDepth ? '#10b981' : groundResult.descentPercent > 65 ? '#f59e0b' : 'rgba(0, 210, 255, 0.75)';

  // 1. Virtual Ground Plane Laser Line
  ctx.strokeStyle = isDepth ? '#10b981' : 'rgba(0, 210, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.shadowColor = isDepth ? 'rgba(16, 185, 129, 0.7)' : 'rgba(0, 210, 255, 0.4)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(minX, floorYPixel);
  ctx.lineTo(maxX, floorYPixel);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Synthetic Depth Shadow Beam (From Chest straight down to floor plane)
  ctx.strokeStyle = beamColor;
  ctx.lineWidth = isDepth ? 3.5 : 2;
  ctx.shadowColor = beamColor;
  ctx.shadowBlur = isDepth ? 16 : 8;
  ctx.beginPath();
  ctx.moveTo(chestXPixel, chestYPixel);
  ctx.lineTo(chestXPixel, floorYPixel);
  ctx.stroke();

  // 3. Ground contact target pad
  ctx.fillStyle = beamColor;
  ctx.beginPath();
  ctx.arc(chestXPixel, floorYPixel, isDepth ? 6 : 4, 0, 2 * Math.PI);
  ctx.fill();

  // 4. Floating HUD readout for Chest Depth
  const badgeText = isDepth
    ? '✓ CHEST AT FLOOR'
    : `Chest Descent: ${groundResult.descentPercent}%`;
  drawFloatingBadge(ctx, chestXPixel, Math.max(chestYPixel + 20, Math.min(floorYPixel - 14, chestYPixel + 26)), badgeText, beamColor);

  ctx.restore();
}

/**
 * AR Holographic Readiness & Countdown HUD
 * Implements Section 13 & 15 of masterPrompt 1.md
 */
function drawReadinessHUD(ctx, width, height, readiness) {
  if (!readiness) return;

  ctx.save();

  if (readiness.state === 'COUNTDOWN') {
    // Cinematic glowing countdown numeral
    const count = readiness.countdownValue;
    const text = count > 0 ? `${count}` : 'GO!';
    const fontSize = Math.max(72, Math.round(height * 0.22));

    ctx.fillStyle = count > 0 ? '#00d2ff' : '#10b981';
    ctx.shadowColor = count > 0 ? 'rgba(0, 210, 255, 0.9)' : 'rgba(16, 185, 129, 0.9)';
    ctx.shadowBlur = 35;
    ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.font = `bold 16px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GET READY TO MOVE', width / 2, height / 2 + fontSize * 0.58);
  } else if (readiness.state === 'READY') {
    // Sleek top HUD pill: Ready
    const pillW = Math.min(320, width * 0.70);
    const pillH = 44;
    const pillX = (width - pillW) / 2;
    const pillY = 16;

    ctx.fillStyle = 'rgba(6, 26, 18, 0.88)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    ctx.shadowBlur = 12;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#10b981';
    ctx.font = `bold 14px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🟢 READY • START EXERCISING', width / 2, pillY + pillH / 2);
  } else if (readiness.state === 'POSITIONING') {
    // Sleek top HUD pill with human instruction
    const pillW = Math.min(420, width * 0.85);
    const pillH = 48;
    const pillX = (width - pillW) / 2;
    const pillY = 16;

    ctx.fillStyle = 'rgba(26, 16, 6, 0.88)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 12;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f59e0b';
    ctx.font = `bold 13px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📐 ${readiness.instruction || 'Adjust Camera Framing'}`, width / 2, pillY + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `11px "Space Grotesk", sans-serif`;
    ctx.fillText(`Readiness: ${readiness.readinessScore}% (Goal: ≥75%)`, width / 2, pillY + 34);
  } else {
    // SEARCHING: subtle cyan top guide pill
    const pillW = Math.min(360, width * 0.78);
    const pillH = 44;
    const pillX = (width - pillW) / 2;
    const pillY = 16;

    ctx.fillStyle = 'rgba(8, 19, 38, 0.88)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.3)';
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#38bdf8';
    ctx.font = `bold 13px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔍 STEP INTO CAMERA VIEW TO START', width / 2, pillY + pillH / 2);
  }

  ctx.restore();
}

/**
 * Renders floating particles and "+1 VALID REP" animations on canvas.
 */
function renderFloatingEffects(ctx, width, effects) {
  const now = Date.now();
  for (let i = effects.length - 1; i >= 0; i--) {
    const fx = effects[i];
    const elapsed = now - fx.createdAt;

    if (elapsed > 1200) {
      effects.splice(i, 1);
      continue;
    }

    const progress = elapsed / 1200;
    const y = fx.y - progress * 40;
    const alpha = Math.max(0, 1.0 - progress);

    ctx.save();
    ctx.globalAlpha = alpha;
    const fontSize = Math.max(22, Math.round(width * 0.028));
    ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = fx.color;
    ctx.shadowColor = fx.color;
    ctx.shadowBlur = 15;
    ctx.fillText(fx.text, width / 2, y);
    ctx.restore();
  }
}

/**
 * Flame Combo Aura Top Banner
 */
function drawComboAuraBanner(ctx, width, streak) {
  ctx.save();
  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;

  const text = `🔥 FLAME COMBO: ${streak} CLEAN REPS (1.5x XP MULTIPLIER)`;
  const fontSize = Math.max(12, Math.round(width * 0.015));
  ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  const metrics = ctx.measureText(text);
  const boxW = metrics.width + 24;
  const boxH = fontSize + 16;
  const x = (width - boxW) / 2;
  const y = 48;

  ctx.beginPath();
  ctx.roundRect(x, y, boxW, boxH, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#18181B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, y + boxH / 2);
  ctx.restore();
}

function drawFloatingBadge(ctx, x, y, text, color) {
  ctx.save();
  const fontSize = Math.max(13, Math.round(ctx.canvas.width * 0.015));
  ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  const metrics = ctx.measureText(text);
  const paddingX = 10;
  const boxW = metrics.width + paddingX * 2;
  const boxH = fontSize + 10;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, w, h, r = 8) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

export default React.memo(PoseCanvas);


