import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, AlertTriangle, Sparkles, Flame, Maximize2, Minimize2, FlipHorizontal } from 'lucide-react';
import { getPoseLandmarker, PushUpFSM, SquatFSM, JumpingJackFSM } from '../../ai';
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

export default function PoseCanvas({
  exercise = 'pushup', // 'pushup' | 'squat' | 'jumpingjack'
  isExpanded = false,
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

  // FSM Instances
  const pushUpFSM = useRef(new PushUpFSM());
  const squatFSM = useRef(new SquatFSM());
  const jumpingJackFSM = useRef(new JumpingJackFSM());
  const landmarkerRef = useRef(null);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(Date.now());
  const lastDispatchedRepRef = useRef(-1);
  const lastDispatchedStateRef = useRef('');
  const lastTelemetryTimeRef = useRef(0);

  // Transient visual particle / alert states for canvas rendering
  const floatingEffectsRef = useRef([]);

  // Reset FSM on exercise change
  useEffect(() => {
    pushUpFSM.current.reset();
    squatFSM.current.reset();
    jumpingJackFSM.current.reset();
    floatingEffectsRef.current = [];
  }, [exercise]);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingModel(true);

    try {
      if (!landmarkerRef.current) {
        landmarkerRef.current = await getPoseLandmarker();
      }
      setIsLoadingModel(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraActive(true);
        };
      }
    } catch (err) {
      console.error('Camera or Model error:', err);
      setIsLoadingModel(false);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser.'
          : 'Could not access camera or load AI model. Please retry.'
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
  }, []);

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

    let lastVideoTime = -1;

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

        // FPS calculation
        frameCountRef.current++;
        const now = Date.now();
        if (now - fpsTimerRef.current >= 1000) {
          setCurrentFps(frameCountRef.current);
          frameCountRef.current = 0;
          fpsTimerRef.current = now;
        }

        // Run Pose Inference
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const poseResult = landmarker.detectForVideo(video, performance.now());

          ctx.clearRect(0, 0, width, height);

          if (poseResult.landmarks && poseResult.landmarks.length > 0) {
            const landmarks = poseResult.landmarks[0];

            // Select active FSM
            let activeFSM = pushUpFSM.current;
            if (exercise === 'squat') activeFSM = squatFSM.current;
            if (exercise === 'jumpingjack') activeFSM = jumpingJackFSM.current;

            const evalResult = activeFSM.processFrame(landmarks);

            // Trigger Audio & Visual alerts
            if (evalResult.repIncremented) {
              audioAlerts.playValidRepChime();
              floatingEffectsRef.current.push({
                text: `+1 VALID ${exercise.toUpperCase()}`,
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
              audioAlerts.playDepthDing();
            }

            // Real-time voice coaching on posture state transitions
            if (onVoiceFeedback && evalResult.state !== lastDispatchedStateRef.current) {
              if (evalResult.state === 'START_LOCKOUT') {
                onVoiceFeedback('Position locked. Descend now!');
              } else if (evalResult.state === 'IN_DEPTH') {
                onVoiceFeedback(exercise === 'pushup' ? 'Depth reached! Push up!' : 'Parallel reached! Stand up!');
              }
            }

            // Sync rep count only on actual change (decoupling React re-renders)
            if (onRepUpdate && evalResult.reps !== lastDispatchedRepRef.current) {
              lastDispatchedRepRef.current = evalResult.reps;
              onRepUpdate(evalResult.reps);
            }

            // Throttle React state telemetry:
            // 1. Immediately on rep change, fault, or state transition
            // 2. Otherwise throttled every 150ms to update progress bars without React re-render thrashing
            const shouldDispatch =
              evalResult.repIncremented ||
              evalResult.repFaultOccurred ||
              evalResult.state !== lastDispatchedStateRef.current ||
              now - lastTelemetryTimeRef.current >= 150;

            if (onTelemetryUpdate && shouldDispatch) {
              lastDispatchedStateRef.current = evalResult.state;
              lastTelemetryTimeRef.current = now;
              onTelemetryUpdate(evalResult);
            }

            // Draw Skeleton (mirrored coordinate math dynamically aligned with video!)
            drawCyberpunkSkeleton(ctx, landmarks, width, height, evalResult, exercise, isMirroredRef.current);

            // Draw AR guide alignment check when getting ready in starting position
            if (
              evalResult.state === 'IDLE' ||
              evalResult.state === 'START_LOCKOUT' ||
              evalResult.state === 'CLOSED_POSITION'
            ) {
              drawGhostSilhouetteGuide(ctx, width, height, true);
            }
          } else {
            // Draw Ghost Silhouette guide when waiting for user to step in frame
            drawGhostSilhouetteGuide(ctx, width, height, false);
          }

          // Render active floating particles & banners
          renderFloatingEffects(ctx, width, floatingEffectsRef.current);
        }
      }

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
    <div className="relative w-full h-full min-h-[420px] bg-[#02050c] rounded-2xl border border-slate-800/80 flex items-center justify-center overflow-hidden group">
      {/* Video element (uncropped full-sensor feed) */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-contain ${
          isMirrored ? 'scale-x-[-1]' : ''
        } ${isCameraActive ? 'opacity-85' : 'hidden'}`}
      />

      {/* Decoupled Canvas overlay (unmirrored context: text renders crisp and readable left-to-right) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-contain ${
          isCameraActive ? 'z-10' : 'hidden'
        }`}
      />

      {/* Inactive background pattern */}
      {!isCameraActive && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a25_1px,transparent_1px),linear-gradient(to_bottom,#0f172a25_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      )}

      {/* Camera Off Placeholder & Controls */}
      {!isCameraActive && (
        <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#081326] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
            <Camera className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              AI Pose Vision Camera
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Offline-ready BlazePose 3D with Irreversible Error Latching & Bilateral Anti-Cheat.
            </p>
          </div>

          {cameraError && (
            <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}

          <button
            onClick={startCamera}
            disabled={isLoadingModel}
            className="px-6 py-3 rounded-full bg-[#0070F3] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
          >
            {isLoadingModel ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Loading Local Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Start AI Camera</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Live Tactical HUD Badges */}
      {isCameraActive && (
        <>
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="bg-[#050914]/90 border border-slate-700/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-400 backdrop-blur-md">
              33 LANDMARKS • {currentFps} FPS
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setIsMirrored(prev => !prev)}
              title={isMirrored ? 'Mirror / Selfie View is ON (Click to unmirror)' : 'Mirror / Selfie View is OFF (Click to mirror)'}
              className={`p-2 rounded-lg border backdrop-blur-md transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isMirrored 
                  ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-300' 
                  : 'bg-[#050914]/90 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-[10px] uppercase font-mono">{isMirrored ? 'Mirrored' : 'Normal'}</span>
            </button>
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                title={isExpanded ? 'Normal view' : 'Expand full-height camera'}
                className="p-2 rounded-lg bg-[#050914]/90 border border-slate-700/80 text-cyan-400 hover:text-white backdrop-blur-md transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={toggleFacingMode}
              title="Switch camera"
              className="p-2 rounded-lg bg-[#050914]/90 border border-slate-700/80 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={stopCamera}
              title="Stop camera"
              className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:text-rose-100 backdrop-blur-md transition-colors"
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
 */
function drawCyberpunkSkeleton(ctx, landmarks, width, height, evalResult, exercise, isMirrored = false) {
  const isFormValid = evalResult.isFormValid;
  const inDepth = evalResult.state === 'IN_DEPTH' || evalResult.state === 'AT_PEAK';
  const isCombo = evalResult.isComboActive;

  // Coordinate mapping helper:
  // If video is mirrored via scale-x-[-1], we map X mathematically so the canvas stays unmirrored and all text stays 100% readable!
  const getX = (pt) => (isMirrored ? (1.0 - pt.x) * width : pt.x * width);
  const getY = (pt) => pt.y * height;

  // Dynamic theme color
  let boneColor = '#00d2ff'; // Cyan default
  let jointFill = '#ffffff';

  if (!isFormValid) {
    boneColor = '#ef4444'; // Red fault
  } else if (inDepth) {
    boneColor = '#10b981'; // Emerald green depth
  } else if (isCombo) {
    boneColor = '#f59e0b'; // Gold / Flame combo
  }

  // Draw Bones
  ctx.save();
  ctx.lineWidth = isCombo ? 4 : 3;
  ctx.strokeStyle = boneColor;
  ctx.shadowColor = boneColor;
  ctx.shadowBlur = isCombo ? 18 : 10;
  ctx.lineCap = 'round';

  for (const [i, j] of POSE_CONNECTIONS) {
    const p1 = landmarks[i];
    const p2 = landmarks[j];

    if (
      p1 &&
      p2 &&
      (p1.visibility === undefined || p1.visibility > 0.25) &&
      (p2.visibility === undefined || p2.visibility > 0.25)
    ) {
      ctx.beginPath();
      ctx.moveTo(getX(p1), getY(p1));
      ctx.lineTo(getX(p2), getY(p2));
      ctx.stroke();
    }
  }

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

  // Draw Joints
  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i];
    if (pt && (pt.visibility === undefined || pt.visibility > 0.25)) {
      const x = getX(pt);
      const y = getY(pt);

      ctx.beginPath();
      ctx.arc(x, y, isCombo ? 5.5 : 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = jointFill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = boneColor;
      ctx.stroke();
    }
  }

  // Active vertex joints for visual guidance
  const isRight = evalResult.dominantProfile === 'right';
  const elbowPt = landmarks[isRight ? 14 : 13];
  const kneePt = landmarks[isRight ? 26 : 25];
  const hipPt = landmarks[isRight ? 24 : 23];

  if (exercise === 'pushup' && elbowPt && evalResult.elbowAngle) {
    const isAtDepth = evalResult.elbowAngle <= 102;
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
 * AR Holographic Ghost Silhouette Guide
 */
function drawGhostSilhouetteGuide(ctx, width, height, isAligned) {
  ctx.save();
  ctx.strokeStyle = isAligned ? 'rgba(16, 185, 129, 0.6)' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);

  const boxW = width * 0.55;
  const boxH = height * 0.75;
  const boxX = (width - boxW) / 2;
  const boxY = (height - boxH) / 2;

  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Guide message
  ctx.setLineDash([]);
  const titleSize = Math.max(14, Math.round(width * 0.018));
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${titleSize}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ALIGN BODY INSIDE AR GUIDE', width / 2, boxY + titleSize + 12);
  const subSize = Math.max(11, Math.round(width * 0.013));
  ctx.font = `${subSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Step back until body is fully framed', width / 2, boxY + titleSize + subSize + 22);

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
    ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
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
  ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
  const metrics = ctx.measureText(text);
  const boxW = metrics.width + 24;
  const boxH = fontSize + 16;
  const x = (width - boxW) / 2;
  const y = 48;

  ctx.beginPath();
  ctx.roundRect(x, y, boxW, boxH, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#03060d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, y + boxH / 2);
  ctx.restore();
}

function drawFloatingBadge(ctx, x, y, text, color) {
  ctx.save();
  const fontSize = Math.max(13, Math.round(ctx.canvas.width * 0.015));
  ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
  const metrics = ctx.measureText(text);
  const paddingX = 10;
  const boxW = metrics.width + paddingX * 2;
  const boxH = fontSize + 10;

  ctx.fillStyle = 'rgba(4, 7, 17, 0.92)';
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
