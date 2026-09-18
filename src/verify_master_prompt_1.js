/**
 * verify_master_prompt_1.js
 * Automated Verification Suite for Master Prompt 1:
 * "Low-Friction, High-Accuracy AI Exercise Camera & Form Analysis System"
 */

import {
  LandmarkConfidence,
  CONFIDENCE_LEVELS,
  BodyVisibilityChecker,
  VISIBILITY_ISSUES,
  ReadinessEngine,
  READINESS_STATES,
  BodyBoundingBox,
  FramingSmoother,
  AutoFramingEngine,
  ExerciseConfigManager,
  FormScoringEngine,
  FeedbackEngine
} from './ai/index.js';

console.log('================================================================');
console.log('🚀 TrueRep Master Prompt 1 Subsystems Verification Suite');
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
// Test 1: LandmarkConfidence
// -----------------------------------------------------------------------------
console.log('Test 1: Landmark Confidence Tiers');
{
  const conf = new LandmarkConfidence();
  assert(conf.getConfidenceTier({ visibility: 0.95 }) === CONFIDENCE_LEVELS.EXCELLENT, '0.95 is Excellent');
  assert(conf.getConfidenceTier({ visibility: 0.78 }) === CONFIDENCE_LEVELS.GOOD, '0.78 is Good');
  assert(conf.getConfidenceTier({ visibility: 0.55 }) === CONFIDENCE_LEVELS.UNCERTAIN, '0.55 is Uncertain');
  assert(conf.getConfidenceTier({ visibility: 0.32 }) === CONFIDENCE_LEVELS.UNRELIABLE, '0.32 is Unreliable');

  const testLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.90 }));
  testLandmarks[28] = { x: 0.5, y: 0.9, visibility: 0.30 }; // Ankle unreliable
  const assessment = conf.assessLandmarks(testLandmarks, [11, 12, 23, 24, 25, 26, 27, 28]);
  assert(!assessment.isReliable && assessment.degradedIndices.includes(28), 'Flags unreliable joint without false deduction');
}

// -----------------------------------------------------------------------------
// Test 2: BodyVisibilityChecker
// -----------------------------------------------------------------------------
console.log('\nTest 2: Body Visibility & Hardware Boundary Validation');
{
  const checker = new BodyVisibilityChecker();

  // 1. Too Close (body height > 88%)
  const closeLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  closeLandmarks[0] = { x: 0.5, y: 0.05 }; // Nose at top
  closeLandmarks[28] = { x: 0.5, y: 0.97 }; // Ankle at bottom -> height = 0.92
  let res = checker.checkVisibility(closeLandmarks, { exercise: 'squat' });
  assert(res.issue === VISIBILITY_ISSUES.TOO_CLOSE, 'Detects too close', `Instruction: ${res.instruction}`);

  // 2. Feet Missing (ankle visibility low or clipped)
  const feetMissingLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  feetMissingLandmarks[0] = { x: 0.5, y: 0.20 };
  feetMissingLandmarks[27] = { x: 0.45, y: 0.99, visibility: 0.15 };
  feetMissingLandmarks[28] = { x: 0.55, y: 0.99, visibility: 0.15 };
  res = checker.checkVisibility(feetMissingLandmarks, { exercise: 'squat' });
  assert(res.issue === VISIBILITY_ISSUES.FEET_MISSING, 'Detects clipped feet with human instruction', `Instruction: ${res.instruction}`);

  // 3. Fully Satisfied
  const goodLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  goodLandmarks[0] = { x: 0.5, y: 0.18, visibility: 0.99 };
  goodLandmarks[27] = { x: 0.45, y: 0.85, visibility: 0.95 };
  goodLandmarks[28] = { x: 0.55, y: 0.85, visibility: 0.95 };
  res = checker.checkVisibility(goodLandmarks, { exercise: 'squat' });
  assert(res.isSatisfied, 'Valid full-body framing satisfies visibility gate');
}

// -----------------------------------------------------------------------------
// Test 3: ReadinessEngine & Instant Motion Auto-Start
// -----------------------------------------------------------------------------
console.log('\nTest 3: Readiness State Machine & Instant Motion Auto-Start');
{
  const readiness = new ReadinessEngine();
  assert(readiness.state === READINESS_STATES.SEARCHING, 'Initial state is SEARCHING');

  const goodLandmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  goodLandmarks[0] = { x: 0.5, y: 0.18, visibility: 0.99 };
  goodLandmarks[24] = { x: 0.5, y: 0.50, visibility: 0.99 }; // Hip
  goodLandmarks[27] = { x: 0.45, y: 0.85, visibility: 0.95 };
  goodLandmarks[28] = { x: 0.55, y: 0.85, visibility: 0.95 };

  let res = readiness.processFrame(goodLandmarks, { exercise: 'squat' });
  assert(res.readinessScore >= 75, 'Computes high composite readiness score', `Score: ${res.readinessScore}%`);
  assert(readiness.state === READINESS_STATES.READY, 'Transitions to READY');

  // Test Instant Motion Auto-Start (Athlete immediately descends into squat)
  goodLandmarks[24] = { x: 0.5, y: 0.56, visibility: 0.99 }; // Hip drops > 0.05
  res = readiness.processFrame(goodLandmarks, { exercise: 'squat' });
  assert(readiness.state === READINESS_STATES.ACTIVE && res.isExercising, 'Instant motion auto-starts tracking without waiting for countdown');
}

// -----------------------------------------------------------------------------
// Test 4: Dynamic Digital Auto-Framing Engine
// -----------------------------------------------------------------------------
console.log('\nTest 4: Dynamic Digital Auto-Framing & Jitter Smoother');
{
  const framingEngine = new AutoFramingEngine();
  const landmarks = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  landmarks[0] = { x: 0.5, y: 0.25 }; // Nose
  landmarks[11] = { x: 0.4, y: 0.35 }; // Left Shoulder
  landmarks[12] = { x: 0.6, y: 0.35 }; // Right Shoulder
  landmarks[28] = { x: 0.5, y: 0.75 }; // Ankle

  const transform = framingEngine.computeFramingTransform(landmarks, 640, 480, 'squat');
  assert(transform.scale >= 1.0 && transform.scale <= 1.5, 'Computes comfortable digital zoom scale', `Scale: ${transform.scale}x`);
  assert(transform.box !== null && transform.box.isValid, 'Smooth bounding box maintains padding margins');
}

// -----------------------------------------------------------------------------
// Test 5: ExerciseConfigManager & FormScoringEngine
// -----------------------------------------------------------------------------
console.log('\nTest 5: Multi-Metric Biomechanical Scoring');
{
  const squatConfig = ExerciseConfigManager.getConfig('squat');
  assert(squatConfig.scoringWeights.depth === 0.35, 'ExerciseConfig loads correct depth weight (35%)');

  const repMetrics = {
    isOlympicDeep: true,
    isParallel: true,
    hasValgus: false,
    isCleanSpine: true,
    bilateralAsymmetry: false,
    duration: 1.2,
    confidence: 0.95
  };

  const scoreResult = FormScoringEngine.evaluateRep(repMetrics, 'squat');
  assert(scoreResult.overallScore >= 95, 'Deep clean squat awarded Elite overall score', `Score: ${scoreResult.overallScore}%, Rating: ${scoreResult.qualityRating}`);
  assert(scoreResult.breakdown.depth === 100, 'Olympic depth awarded 100%');
}

// -----------------------------------------------------------------------------
// Test 6: FeedbackEngine Anti-Jitter & Cooldown
// -----------------------------------------------------------------------------
console.log('\nTest 6: Anti-Jitter Feedback Persistence & Cooldown');
{
  const feedback = new FeedbackEngine({ persistenceFrames: 4, cooldownSeconds: 3.0 });

  // 1 frame fault should be suppressed by anti-jitter
  let res = feedback.processFeedback('valgus', 'Push knees out', true);
  assert(!res.shouldEmit, 'Anti-jitter suppresses single-frame posture noise');

  // 4 consecutive frames confirm the fault
  feedback.processFeedback('valgus', 'Push knees out', true);
  feedback.processFeedback('valgus', 'Push knees out', true);
  res = feedback.processFeedback('valgus', 'Push knees out', true);
  assert(res.shouldEmit, 'Persistent fault (>= 4 frames) successfully emits coaching cue', `Message: ${res.message}`);

  // Immediate subsequent frame must be suppressed by cooldown
  res = feedback.processFeedback('valgus', 'Push knees out', true);
  assert(!res.shouldEmit, 'Cooldown suppresses repeated audio/visual alert spam');

  // Occlusion tolerance (1-3 dropped frames)
  const occ1 = feedback.handleOcclusion(false);
  assert(occ1.isTolerated && !occ1.shouldPrompt, '1 dropped frame tolerated without interrupting athlete');
}

console.log('\n================================================================');
console.log(`📊 Master Prompt 1 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round(passedTests/totalTests * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
