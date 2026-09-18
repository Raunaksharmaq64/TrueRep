/**
 * verify_precision_90.js
 * Precision & Accuracy Test Suite: Verifies >90% scoring, peak depth recording,
 * sagittal side-view immunity, and athletic tempo responsiveness.
 */

import { PushUpFSM, SquatFSM, JumpingJackFSM, KinematicsMath } from './ai/index.js';

console.log('================================================================');
console.log('🎯 TrueRep >90% Accuracy & Biomechanical Precision Test Suite');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// -----------------------------------------------------------------------------
// Mathematically Exact Landmark Generators
// -----------------------------------------------------------------------------

function generatePushUpFrame({ elbowAngle = 160, shoulderY = 0.50 }) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 }));

  const rad = (elbowAngle * Math.PI) / 180;
  const elbow = { x: 0.40, y: shoulderY + 0.15, z: 0, visibility: 0.98 };
  const shoulder = {
    x: elbow.x - 0.15 * Math.cos(rad / 2),
    y: elbow.y - 0.15 * Math.sin(rad / 2),
    z: 0,
    visibility: 0.98
  };
  const wrist = {
    x: elbow.x - 0.15 * Math.cos(rad / 2),
    y: elbow.y + 0.15 * Math.sin(rad / 2),
    z: 0,
    visibility: 0.98
  };

  // Right arm (dominant)
  landmarks[12] = shoulder;
  landmarks[14] = elbow;
  landmarks[16] = wrist;

  // Left arm (symmetrical matching)
  landmarks[11] = { x: shoulder.x - 0.05, y: shoulder.y, z: 0, visibility: 0.98 };
  landmarks[13] = { x: elbow.x - 0.05, y: elbow.y, z: 0, visibility: 0.98 };
  landmarks[15] = { x: wrist.x - 0.05, y: wrist.y, z: 0, visibility: 0.98 };

  // Horizontal plank line: hip, knee, ankle
  landmarks[23] = { x: 0.65, y: shoulder.y + 0.03, z: 0, visibility: 0.98 };
  landmarks[24] = { x: 0.65, y: shoulder.y + 0.03, z: 0, visibility: 0.98 };
  landmarks[25] = { x: 0.78, y: shoulder.y + 0.05, z: 0, visibility: 0.95 };
  landmarks[26] = { x: 0.78, y: shoulder.y + 0.05, z: 0, visibility: 0.95 };
  landmarks[27] = { x: 0.90, y: shoulder.y + 0.06, z: 0, visibility: 0.95 };
  landmarks[28] = { x: 0.90, y: shoulder.y + 0.06, z: 0, visibility: 0.95 };

  return landmarks;
}

function generateSquatFrame({ kneeAngle = 165, hipY = 0.45, isSideView = false }) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 }));

  const shoulderOffset = isSideView ? 0.02 : 0.14;
  const hipOffset = isSideView ? 0.015 : 0.10;

  const rad = (kneeAngle * Math.PI) / 180;
  const knee = { x: 0.50, y: 0.70, z: 0, visibility: 0.98 };
  const ankle = { x: 0.50, y: 0.95, z: 0, visibility: 0.98 };
  const hip = {
    x: knee.x + 0.25 * Math.sin(Math.PI - rad),
    y: knee.y - 0.25 * Math.cos(Math.PI - rad),
    z: 0,
    visibility: 0.98
  };

  // Shoulder upright above hip
  landmarks[11] = { x: hip.x - shoulderOffset, y: hip.y - 0.32, z: 0, visibility: 0.98 };
  landmarks[12] = { x: hip.x + shoulderOffset, y: hip.y - 0.32, z: 0, visibility: 0.98 };

  // Hips
  landmarks[23] = { x: hip.x - hipOffset, y: hip.y, z: 0, visibility: 0.98 };
  landmarks[24] = { x: hip.x + hipOffset, y: hip.y, z: 0, visibility: 0.98 };

  // Knees
  const kneeSpacing = isSideView ? 0.015 : 0.20;
  landmarks[25] = { x: knee.x - kneeSpacing / 2, y: knee.y, z: 0, visibility: 0.98 };
  landmarks[26] = { x: knee.x + kneeSpacing / 2, y: knee.y, z: 0, visibility: 0.98 };

  // Ankles
  const ankleSpacing = isSideView ? 0.015 : 0.22;
  landmarks[27] = { x: ankle.x - ankleSpacing / 2, y: ankle.y, z: 0, visibility: 0.98 };
  landmarks[28] = { x: ankle.x + ankleSpacing / 2, y: ankle.y, z: 0, visibility: 0.98 };

  return landmarks;
}

function generateJumpingJackFrame({ armAngle = 30, stanceRatio = 1.0 }) {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.95 }));

  const shoulderDist = 0.18;
  const ankleDist = shoulderDist * stanceRatio;

  // Shoulders (11, 12)
  landmarks[11] = { x: 0.5 - shoulderDist / 2, y: 0.35, z: 0, visibility: 0.98 };
  landmarks[12] = { x: 0.5 + shoulderDist / 2, y: 0.35, z: 0, visibility: 0.98 };

  // Hips (23, 24)
  landmarks[23] = { x: 0.5 - shoulderDist * 0.4, y: 0.55, z: 0, visibility: 0.98 };
  landmarks[24] = { x: 0.5 + shoulderDist * 0.4, y: 0.55, z: 0, visibility: 0.98 };

  // Ankles (27, 28)
  landmarks[27] = { x: 0.5 - ankleDist / 2, y: 0.90, z: 0, visibility: 0.98 };
  landmarks[28] = { x: 0.5 + ankleDist / 2, y: 0.90, z: 0, visibility: 0.98 };

  // Wrists (15, 16): elevation determined by armAngle
  const armLen = 0.28;
  const rad = (armAngle * Math.PI) / 180;
  const wristY = landmarks[11].y + Math.cos(rad) * armLen;
  const wristOffset = Math.sin(rad) * armLen;

  landmarks[15] = { x: landmarks[11].x - wristOffset, y: wristY, z: 0, visibility: 0.98 };
  landmarks[16] = { x: landmarks[12].x + wristOffset, y: wristY, z: 0, visibility: 0.98 };

  return landmarks;
}

// Stream multiple frames to emulate 30 FPS video camera
function streamFrames(fsm, frameGenerator, config, count = 3) {
  let result = null;
  for (let i = 0; i < count; i++) {
    result = fsm.processFrame(frameGenerator(config));
  }
  return result;
}

// =============================================================================
// SUITE 1: PushUpFSM Precision & Lockout Depth Scoring (>90%)
// =============================================================================
console.log('Test Suite 1: PushUpFSM Accuracy & Peak Depth Evaluation');
{
  const pushUpFSM = new PushUpFSM();
  pushUpFSM.reset();

  const originalNow = performance.now;
  let simulatedTime = 1000;
  performance.now = () => simulatedTime;

  // 1. Enter Lockout (elbow 160°)
  streamFrames(pushUpFSM, generatePushUpFrame, { elbowAngle: 160, shoulderY: 0.45 }, 3);
  assert(pushUpFSM.state === 'START_LOCKOUT', `Locks out into START_LOCKOUT (State: ${pushUpFSM.state})`);

  // 2. Descend with realistic trajectory (130°)
  simulatedTime += 150;
  streamFrames(pushUpFSM, generatePushUpFrame, { elbowAngle: 130, shoulderY: 0.52 }, 3);
  assert(pushUpFSM.state === 'DESCENDING', `Initiates flexion into DESCENDING (State: ${pushUpFSM.state})`);

  // 3. Deep depth (80° Olympic depth)
  simulatedTime += 250;
  streamFrames(pushUpFSM, generatePushUpFrame, { elbowAngle: 80, shoulderY: 0.65 }, 3);
  assert(pushUpFSM.state === 'IN_DEPTH', `Registers depth at 80° (State: ${pushUpFSM.state})`);
  assert(pushUpFSM.minElbowAngleDuringRep <= 85, `Tracks minimum elbow angle during rep (Min: ${pushUpFSM.minElbowAngleDuringRep}°)`);

  // 4. Ascend back up (115°)
  simulatedTime += 200;
  streamFrames(pushUpFSM, generatePushUpFrame, { elbowAngle: 115, shoulderY: 0.55 }, 3);
  assert(pushUpFSM.state === 'ASCENDING', `Transitions to ASCENDING (State: ${pushUpFSM.state})`);

  // 5. Complete rep at full lockout (160°)
  simulatedTime += 300;
  const completeResult = streamFrames(pushUpFSM, generatePushUpFrame, { elbowAngle: 160, shoulderY: 0.45 }, 3);
  assert(completeResult.reps === 1, `Rep count incremented to 1 (Reps: ${completeResult.reps})`);
  assert(completeResult.formScore >= 95, `Awarded high precision score for clean rep (Score: ${completeResult.formScore}%)`);
  
  const lastRep = pushUpFSM.repHistory[0];
  assert(lastRep && lastRep.score >= 95, `Rep history recorded high accuracy score (History Score: ${lastRep?.score}%)`);
  assert(lastRep && lastRep.elbowAngle <= 85, `Rep history recorded peak depth angle, NOT lockout angle (Recorded: ${lastRep?.elbowAngle}°)`);

  performance.now = originalNow;
}

// =============================================================================
// SUITE 2: SquatFSM Precision & Side-View Valgus Immunity
// =============================================================================
console.log('\nTest Suite 2: SquatFSM Accuracy & Sagittal Side-Profile Immunity');
{
  const squatFSM = new SquatFSM();
  squatFSM.reset();

  const originalNow = performance.now;
  let simulatedTime = 1000;
  performance.now = () => simulatedTime;

  // 1. Lockout from side profile (knee 165°)
  streamFrames(squatFSM, generateSquatFrame, { kneeAngle: 165, isSideView: true }, 3);
  assert(squatFSM.state === 'START_LOCKOUT', `Standing lockout detected in side view (State: ${squatFSM.state})`);

  // 2. Descend in side view (130°)
  simulatedTime += 200;
  streamFrames(squatFSM, generateSquatFrame, { kneeAngle: 130, isSideView: true }, 3);
  assert(squatFSM.state === 'DESCENDING', `Descent active in side view (State: ${squatFSM.state})`);
  assert(squatFSM.isFormValidInCurrentRep === true, 'Side view does NOT falsely trigger Knee Valgus penalty');

  // 3. Deep Olympic squat in side view (80°)
  simulatedTime += 300;
  streamFrames(squatFSM, generateSquatFrame, { kneeAngle: 80, isSideView: true }, 3);
  assert(squatFSM.state === 'IN_DEPTH', `Depth confirmed in side view (State: ${squatFSM.state})`);
  assert(squatFSM.minKneeAngleDuringRep <= 85, `Peak knee flexion recorded (Min: ${squatFSM.minKneeAngleDuringRep}°)`);

  // 4. Ascend (115°)
  simulatedTime += 250;
  streamFrames(squatFSM, generateSquatFrame, { kneeAngle: 115, isSideView: true }, 3);
  assert(squatFSM.state === 'ASCENDING', `Ascending out of hole (State: ${squatFSM.state})`);

  // 5. Stand up to lockout (165°)
  simulatedTime += 300;
  const finalResult = streamFrames(squatFSM, generateSquatFrame, { kneeAngle: 165, isSideView: true }, 3);
  assert(finalResult.reps === 1, `Squat completed in side view (Reps: ${finalResult.reps})`);
  assert(finalResult.formScore >= 95, `Olympic depth awarded top score (Score: ${finalResult.formScore}%)`);

  const repRecord = squatFSM.repHistory[0];
  assert(repRecord && repRecord.score >= 95, `Recorded history score >= 95% (History Score: ${repRecord?.score}%)`);
  assert(repRecord && repRecord.kneeAngle <= 85, `Recorded true peak knee depth, NOT standing angle (Recorded: ${repRecord?.kneeAngle}°)`);

  performance.now = originalNow;
}

// =============================================================================
// SUITE 3: JumpingJackFSM Accuracy & Dynamic Scoring
// =============================================================================
console.log('\nTest Suite 3: JumpingJackFSM Athletic Tempo & Scoring');
{
  const jjFSM = new JumpingJackFSM();
  jjFSM.reset();

  const originalNow = performance.now;
  let simulatedTime = 1000;
  performance.now = () => simulatedTime;

  // 1. Closed position (arms down, feet together)
  streamFrames(jjFSM, generateJumpingJackFrame, { armAngle: 30, stanceRatio: 1.0 }, 2);
  assert(jjFSM.state === 'CLOSED_POSITION', `Initial closed stance detected (State: ${jjFSM.state})`);

  // 2. Jump Open (arms overhead, feet wide)
  simulatedTime += 200;
  streamFrames(jjFSM, generateJumpingJackFrame, { armAngle: 90, stanceRatio: 1.15 }, 2);
  assert(jjFSM.state === 'OPENING', `Transitions to OPENING (State: ${jjFSM.state})`);

  // Peak open: wrists overhead, arms 165°, stance 1.35
  simulatedTime += 200;
  streamFrames(jjFSM, generateJumpingJackFrame, { armAngle: 165, stanceRatio: 1.35 }, 2);
  assert(jjFSM.state === 'AT_PEAK', `Peak jump reached with natural 1.35 stance (State: ${jjFSM.state})`);
  assert(jjFSM.maxArmAngleDuringRep >= 160, `Peak arm angle recorded (Max: ${jjFSM.maxArmAngleDuringRep}°)`);

  // 3. Return to closed position
  simulatedTime += 200;
  streamFrames(jjFSM, generateJumpingJackFrame, { armAngle: 85, stanceRatio: 1.15 }, 2);
  assert(jjFSM.state === 'CLOSING', `Transitions to CLOSING (State: ${jjFSM.state})`);

  simulatedTime += 250;
  const result = streamFrames(jjFSM, generateJumpingJackFrame, { armAngle: 32, stanceRatio: 1.0 }, 2);
  assert(result.reps === 1, `Rep registered cleanly (Reps: ${result.reps})`);
  assert(result.formScore >= 95, `Clean jump receives high form score (Score: ${result.formScore}%)`);

  const jjRecord = jjFSM.repHistory[0];
  assert(jjRecord && jjRecord.score >= 95, `Rep history has high score (History: ${jjRecord?.score}%)`);
  assert(jjRecord && jjRecord.armAngle >= 160, `Rep history records peak overhead arm angle, NOT closed angle (Recorded: ${jjRecord?.armAngle}°)`);

  performance.now = originalNow;
}

console.log('\n================================================================');
console.log(`📊 Precision Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
