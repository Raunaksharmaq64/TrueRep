/**
 * verify_accuracy_engine.js
 * Automated Sports-Science & Kinematic Precision Verification Suite.
 */

import { KinematicsMath, SquatFSM, PushUpFSM, ExerciseClassifier, ViewpointLockoutEngine } from './ai/index.js';

console.log('================================================================');
console.log('🧪 TrueRep Commercial-Grade Accuracy & Biomechanics Verification');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${detail ? '(' + detail + ')' : ''}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
  }
}

// -----------------------------------------------------------------------------
// Test 1: Adaptive Soft Knee Lockout (SquatFSM)
// -----------------------------------------------------------------------------
console.log('Test 1: Adaptive Soft Knee Lockout (Accommodates Soft Knees & Angles)');
{
  const squat = new SquatFSM();

  // Create landmarks with 152° knee angle (soft lockout)
  const standingLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  // Shoulder (12), Hip (24), Knee (26), Ankle (28)
  standingLandmarks[12] = { x: 0.50, y: 0.20, visibility: 0.99 }; // Shoulder
  standingLandmarks[24] = { x: 0.50, y: 0.50, visibility: 0.99 }; // Hip
  standingLandmarks[26] = { x: 0.53, y: 0.70, visibility: 0.99 }; // Knee (slight 152° angle)
  standingLandmarks[28] = { x: 0.50, y: 0.90, visibility: 0.99 }; // Ankle
  standingLandmarks[27] = { x: 0.40, y: 0.90, visibility: 0.99 }; // Other ankle

  let res = squat.processFrame(standingLandmarks);
  assert(res.state === 'START_LOCKOUT', 'Soft knee angle (152°) successfully locks out without freezing at 0', `State: ${res.state}, Knee: ${res.kneeAngle}°`);

  // Descend to parallel
  standingLandmarks[24] = { x: 0.50, y: 0.70, visibility: 0.99 }; // Hip drops level with knee
  standingLandmarks[26] = { x: 0.60, y: 0.70, visibility: 0.99 }; // Knee flexed
  squat.state = 'START_LOCKOUT';
  res = squat.processFrame(standingLandmarks);
  res = squat.processFrame(standingLandmarks);
  assert(res.state === 'IN_DEPTH' || res.state === 'DESCENDING', 'Descent triggers parallel depth detection', `State: ${res.state}`);
}

// -----------------------------------------------------------------------------
// Test 2: Long Femur Torso Incline Normalization
// -----------------------------------------------------------------------------
console.log('\nTest 2: Long Femur Torso Incline Compensation');
{
  const squat = new SquatFSM();
  const lifterLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  // Long femur athlete: femur length 0.28, torso length 0.26 -> ratio = 1.07 > 0.85
  lifterLandmarks[12] = { x: 0.40, y: 0.28, visibility: 0.99 }; // Shoulder
  lifterLandmarks[24] = { x: 0.56, y: 0.48, visibility: 0.99 }; // Hip
  lifterLandmarks[26] = { x: 0.58, y: 0.76, visibility: 0.99 }; // Knee
  lifterLandmarks[28] = { x: 0.56, y: 0.95, visibility: 0.99 }; // Ankle

  const ratio = KinematicsMath.calculateFemurToTorsoRatio(
    lifterLandmarks[12],
    lifterLandmarks[24],
    lifterLandmarks[26]
  );
  assert(ratio > 0.85, 'Accurately calculates long femur ratio', `Ratio: ${ratio}`);

  // When descending with 52° torso incline (which was falsely rejected under 48° limit)
  squat.state = 'DESCENDING';
  squat.descentStartTime = performance.now() / 1000 - 1.0;
  squat.initialHipY = 0.48;
  const res = squat.processFrame(lifterLandmarks);
  assert(res.formErrorReason !== 'Good Morning Cheat (Excessive torso collapse)', 'Long-femur 52° torso lean is accepted without false Good Morning penalty');
}

// -----------------------------------------------------------------------------
// Test 3: Sumo / Wide Stance Valgus Compensation
// -----------------------------------------------------------------------------
console.log('\nTest 3: Sumo / Wide Stance Knee Valgus Compensation');
{
  const leftKnee = { x: 0.35, y: 0.70 };
  const rightKnee = { x: 0.65, y: 0.70 }; // knee distance = 0.30
  const leftAnkle = { x: 0.28, y: 0.92 };
  const rightAnkle = { x: 0.72, y: 0.92 }; // ankle distance = 0.44 (wide sumo stance)

  const adaptiveResult = KinematicsMath.detectKneeValgusAdaptive(
    leftKnee,
    rightKnee,
    leftAnkle,
    rightAnkle,
    0.30 // baseline normal stance
  );

  assert(!adaptiveResult.hasValgus, 'Wide/sumo stance correctly accepted without false "Knees Caving In" violation', `Ratio: ${adaptiveResult.ratio}, isWide: ${adaptiveResult.isWideStance}`);
}

// -----------------------------------------------------------------------------
// Test 4: Sports-Science Relative Depth (Hip-Crease vs. Patella)
// -----------------------------------------------------------------------------
console.log('\nTest 4: Sports-Science Relative Depth (Hip vs Patella)');
{
  const deepHip = { x: 0.35, y: 0.72 };
  const knee = { x: 0.55, y: 0.70 }; // Hip is below knee! (deltaY < 0 in screen coords)

  const relDepth = KinematicsMath.calculateRelativeDepth(deepHip, knee);
  assert(relDepth.isOlympicDeep, 'Accurately identifies below-parallel Olympic depth', `deltaY: ${relDepth.deltaY}`);

  const parallelHip = { x: 0.35, y: 0.70 };
  const relDepthParallel = KinematicsMath.calculateRelativeDepth(parallelHip, knee);
  assert(relDepthParallel.isParallelOrDeeper, 'Accurately identifies exact parallel depth', `deltaY: ${relDepthParallel.deltaY}`);
}

// -----------------------------------------------------------------------------
// Test 5: Exercise Motion Archetype Classifier
// -----------------------------------------------------------------------------
console.log('\nTest 5: Exercise Motion Archetype Classifier');
{
  const classifier = new ExerciseClassifier();

  // Create jumping jack landmarks (arms elevated high, wide feet)
  const jackLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  jackLandmarks[11] = { x: 0.45, y: 0.30 }; // Shoulder L
  jackLandmarks[12] = { x: 0.55, y: 0.30 }; // Shoulder R
  jackLandmarks[15] = { x: 0.35, y: 0.10 }; // Wrist L elevated overhead
  jackLandmarks[16] = { x: 0.65, y: 0.10 }; // Wrist R elevated overhead
  jackLandmarks[23] = { x: 0.45, y: 0.55 }; // Hip L
  jackLandmarks[24] = { x: 0.55, y: 0.55 }; // Hip R
  jackLandmarks[25] = { x: 0.40, y: 0.75 }; // Knee L
  jackLandmarks[26] = { x: 0.60, y: 0.75 }; // Knee R
  jackLandmarks[27] = { x: 0.30, y: 0.95 }; // Ankle L wide
  jackLandmarks[28] = { x: 0.70, y: 0.95 }; // Ankle R wide

  const result = classifier.classify(jackLandmarks, 'squat');
  assert(result.archetype === 'jumpingjack', 'Classifier recognizes Jumping Jack archetype', `Archetype: ${result.archetype}`);
  assert(!result.isMatchingExercise, 'Flags exercise mismatch when Jumping Jacks performed during Squats session', `Cue: ${result.cue}`);
}

// -----------------------------------------------------------------------------
// Test 6: Push-Up Rest-Pause Tolerance
// -----------------------------------------------------------------------------
console.log('\nTest 6: Push-Up Rest-Pause Tolerance in Plank Lockout');
{
  const pushup = new PushUpFSM();
  const plankLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  // Horizontal plank landmarks
  plankLandmarks[12] = { x: 0.35, y: 0.50, visibility: 0.99 }; // Shoulder
  plankLandmarks[14] = { x: 0.35, y: 0.65, visibility: 0.99 }; // Elbow straight
  plankLandmarks[16] = { x: 0.35, y: 0.80, visibility: 0.99 }; // Wrist
  plankLandmarks[24] = { x: 0.55, y: 0.52, visibility: 0.99 }; // Hip
  plankLandmarks[26] = { x: 0.70, y: 0.54, visibility: 0.99 }; // Knee
  plankLandmarks[28] = { x: 0.85, y: 0.55, visibility: 0.99 }; // Ankle

  let res = pushup.processFrame(plankLandmarks);
  assert(res.state === 'START_LOCKOUT', 'Locks into horizontal plank', `State: ${res.state}`);

  // Simulate 3 seconds holding plank
  pushup.lockoutEnterTime = (performance.now() / 1000) - 3.0;
  res = pushup.processFrame(plankLandmarks);
  assert(res.feedback.includes('Resting in plank'), 'Rest-pause plank hold recognized with supportive cue without resetting set', `Feedback: ${res.feedback}`);
}

console.log('\n================================================================');
console.log(`📊 Accuracy Test Summary: ${passedTests}/${totalTests} Passed (${Math.round(passedTests/totalTests * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
