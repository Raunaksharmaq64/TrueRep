/**
 * AI & Kinematics Engine Module Exports
 */

export { KinematicsMath } from './KinematicsMath.js';
export { PushUpFSM } from './PushUpFSM.js';
export { SquatFSM } from './SquatFSM.js';
export { JumpingJackFSM } from './JumpingJackFSM.js';
export { ExerciseClassifier } from './ExerciseClassifier.js';
export { ViewpointLockoutEngine } from './ViewpointLockoutEngine.js';
export { getPoseLandmarker } from './PoseLandmarkerService.js';

// Master Prompt 1 Modular Subsystems
export { BodyBoundingBox } from './framing/BodyBoundingBox.js';
export { FramingSmoother } from './framing/FramingSmoother.js';
export { AutoFramingEngine } from './framing/AutoFramingEngine.js';

export { BodyVisibilityChecker, VISIBILITY_ISSUES } from './readiness/BodyVisibilityChecker.js';
export { LandmarkConfidence, CONFIDENCE_LEVELS } from './readiness/LandmarkConfidence.js';
export { ReadinessEngine, READINESS_STATES } from './readiness/ReadinessEngine.js';

export { EXERCISE_CONFIGS, ExerciseConfigManager } from './exercise/ExerciseConfig.js';
export { FormScoringEngine } from './form/FormScoringEngine.js';
export { FeedbackEngine } from './feedback/FeedbackEngine.js';
export { GroundPlaneTracker } from './depth/GroundPlaneTracker.js';

