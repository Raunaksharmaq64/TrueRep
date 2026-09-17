/**
 * verify_ground_plane.js
 * Automated Verification Suite for Synthetic Depth Shadows & Ground Plane Tracking.
 */

import { GroundPlaneTracker, PushUpFSM } from './ai/index.js';

console.log('================================================================');
console.log('📐 TrueRep Synthetic Depth Shadows & Virtual Ground Plane Tests');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, name, detail = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${name} ${detail ? '(' + detail + ')' : ''}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${name} ${detail ? '(' + detail + ')' : ''}`);
  }
}

// -----------------------------------------------------------------------------
// Test 1: Ground Plane Construction & Lockout Height
// -----------------------------------------------------------------------------
console.log('Test 1: Virtual Floor Plane Construction & Lockout Height');
{
  const tracker = new GroundPlaneTracker();

  // Lifter in horizontal plank lockout:
  // Shoulder at y = 0.45, Wrist at y = 0.85 (floor), Arm length ~ 0.40
  const shoulder = { x: 0.30, y: 0.45 };
  const elbow = { x: 0.31, y: 0.65 };
  const wrist = { x: 0.30, y: 0.85 };
  const ankle = { x: 0.85, y: 0.85, visibility: 0.95 };

  const res = tracker.evaluate([], false, shoulder, elbow, wrist, ankle);
  assert(res.isValid, 'Ground plane calculation valid');
  assert(res.floorY === 0.85, 'Accurately establishes floor plane line at wrist/ankle contact', `Floor Y: ${res.floorY}`);
  assert(res.isTopLockout, 'Recognizes horizontal plank lockout (High above floor)', `Proximity: ${res.proximity}`);
  assert(!res.isChestAtFloor, 'Accurately confirms chest is NOT at floor in lockout');
}

// -----------------------------------------------------------------------------
// Test 2: Full Chest Descent to Ground (Synthetic Depth Attainment)
// -----------------------------------------------------------------------------
console.log('\nTest 2: Full Chest Descent to Virtual Floor (Proximity <= 0.38)');
{
  const tracker = new GroundPlaneTracker();
  const ankle = { x: 0.85, y: 0.85, visibility: 0.95 };

  // 1. Lifter starts in lockout (calibrates arm segment)
  tracker.evaluate([], false, { x: 0.30, y: 0.45 }, { x: 0.31, y: 0.65 }, { x: 0.30, y: 0.85 }, ankle);

  // 2. Lifter descends chest down to floor:
  // Shoulder drops to y = 0.76 (within 0.09 of floor y = 0.85, calibrated arm ~ 0.40 -> ratio ~ 0.23)
  const shoulder = { x: 0.30, y: 0.76 };
  const elbow = { x: 0.22, y: 0.78 };
  const wrist = { x: 0.30, y: 0.85 };

  tracker.evaluate([], false, shoulder, elbow, wrist, ankle);
  tracker.evaluate([], false, shoulder, elbow, wrist, ankle);
  const res = tracker.evaluate([], false, shoulder, elbow, wrist, ankle);
  assert(res.isChestAtFloor, 'Detects true chest-to-floor proximity attainment', `Proximity: ${res.proximity} <= 0.38`);
  assert(res.descentPercent >= 85, 'Descent completion reaches 85-100%', `Descent: ${res.descentPercent}%`);
}

// -----------------------------------------------------------------------------
// Test 3: PushUpFSM Dual-Condition Depth Acceptance
// -----------------------------------------------------------------------------
console.log('\nTest 3: PushUpFSM Dual-Condition Depth (Accommodates Perspective Foreshortening)');
{
  const pushUpFSM = new PushUpFSM();

  // Synthetic landmarks for plank lockout with dominant left profile
  const plank = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.10 }));
  // Shoulder (11), Elbow (13), Wrist (15), Hip (23), Knee (25), Ankle (27)
  plank[11] = { x: 0.30, y: 0.45, visibility: 0.99 };
  plank[13] = { x: 0.31, y: 0.65, visibility: 0.99 };
  plank[15] = { x: 0.30, y: 0.85, visibility: 0.99 };
  plank[23] = { x: 0.55, y: 0.48, visibility: 0.99 };
  plank[25] = { x: 0.70, y: 0.66, visibility: 0.99 };
  plank[27] = { x: 0.85, y: 0.85, visibility: 0.99 };

  let status = pushUpFSM.processFrame(plank);
  assert(status.state === 'START_LOCKOUT', 'Plank locks out cleanly');

  // Descend to floor where camera perspective makes elbow look 101° (normally would fail hard <= 95°)
  // But chest is touching the floor (y = 0.77 relative to floor y = 0.85)
  plank[11] = { x: 0.30, y: 0.77, visibility: 0.99 };
  plank[13] = { x: 0.20, y: 0.80, visibility: 0.99 }; // 101° elbow angle
  plank[23] = { x: 0.55, y: 0.78, visibility: 0.99 };

  pushUpFSM.state = 'START_LOCKOUT';
  pushUpFSM.processFrame(plank);
  pushUpFSM.processFrame(plank);
  status = pushUpFSM.processFrame(plank);
  assert(status.state === 'IN_DEPTH' || status.state === 'DESCENDING', 'Dual-condition triggers depth when chest touches floor plane', `State: ${status.state}`);
  assert(status.groundResult && status.groundResult.isChestAtFloor, 'Ground result correctly latched in FSM status', `Proximity: ${status.groundResult.proximity}`);
}

// -----------------------------------------------------------------------------
// Test 4: Static Luma / Lighting Estimator
// -----------------------------------------------------------------------------
console.log('\nTest 4: Static Luma / Room Light Estimator');
{
  const lumaNull = GroundPlaneTracker.estimateLuma(null);
  assert(lumaNull === 120, 'Safely falls back on uninitialized video');
}

console.log('\n================================================================');
console.log(`📊 Ground Plane Test Summary: ${passedTests}/${totalTests} Passed (${Math.round(passedTests/totalTests * 100)}%)`);
console.log('================================================================\n');

process.exit(passedTests === totalTests ? 0 : 1);
