/**
 * TRUEREP 3-TIER COMPETITIVE SCORE & MATCHMAKING ENGINE
 * 
 * Scores:
 * 1. AFS (Age-Fitness Score): Normalizes demographic baseline (Age, Weight, Height, Goal)
 * 2. MMR (Matchmaking Rating): Elo skill rating used for lobby pairing
 * 3. RR (Rank Rating & Tier): Competitive ladder placement (Iron to TrueRep Titan)
 */

/**
 * Calculates the initial 3 scores (AFS, MMR, RR) from user health biometrics
 * @param {Object} healthData 
 * @returns {Object} { afs_score, mmr_rating, rr_rating, rank_tier, breakdown }
 */
export function calculateThreeScores(healthData = {}) {
  const age = Number(healthData.age || healthData.age_years) || 24;
  const weightKg = Number(healthData.weight_kg) || 70.0;
  const heightCm = Number(healthData.height_cm) || 175.0;
  const goal = healthData.fitness_goal || 'Athletic Performance';

  // 1. Age Factor: K_age = 1.0 + 0.008 * (max(0, Age - 25))^1.15
  const ageDelta = Math.max(0, age - 25);
  const kAge = 1.0 + (0.008 * Math.pow(ageDelta, 1.15));

  // 2. BMI / Weight Factor: BMI = kg / (m^2). K_bmi = BMI / 22.5 clamped [0.85, 1.30]
  const heightM = heightCm / 100.0;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 22.5;
  const rawBmiFactor = bmi / 22.5;
  const kBmi = Math.min(1.30, Math.max(0.85, rawBmiFactor));

  // 3. Goal Factor
  let kGoal = 1.0;
  if (goal.includes('Hypertrophy') || goal.includes('Strength')) kGoal = 1.04;
  else if (goal.includes('Endurance')) kGoal = 0.98;
  else if (goal.includes('Fat Loss')) kGoal = 1.02;

  // Calculate Base AFS
  const rawAfs = 100.00 * kAge * kBmi * kGoal;
  const afs_score = Number(rawAfs.toFixed(2));

  // Calculate MMR (Baseline MMR = AFS * 10 rounded)
  const mmr_rating = Math.round(afs_score * 10);

  // Calculate RR (Rank Rating = MMR % 100)
  const rr_rating = mmr_rating % 100;

  // Determine Rank Tier
  let rank_tier = 'Bronze I';
  if (mmr_rating < 850) rank_tier = 'Iron III';
  else if (mmr_rating < 950) rank_tier = 'Iron I';
  else if (mmr_rating < 1050) rank_tier = 'Bronze I';
  else if (mmr_rating < 1150) rank_tier = 'Bronze II';
  else if (mmr_rating < 1250) rank_tier = 'Silver I';
  else if (mmr_rating < 1350) rank_tier = 'Silver II';
  else if (mmr_rating < 1450) rank_tier = 'Gold I';
  else if (mmr_rating < 1600) rank_tier = 'Gold II';
  else if (mmr_rating < 1800) rank_tier = 'Platinum I';
  else if (mmr_rating < 2000) rank_tier = 'Diamond I';
  else rank_tier = 'TrueRep Titan';

  return {
    afs_score,
    mmr_rating,
    rr_rating,
    rank_tier,
    breakdown: {
      ageFactor: kAge.toFixed(3),
      bmiFactor: kBmi.toFixed(3),
      bmi: bmi.toFixed(1),
      goalMultiplier: kGoal.toFixed(2)
    }
  };
}

/**
 * Calculates Composite Match Score (CMS) between two athletes (0 - 100)
 * Higher CMS = closer demographic & skill parity for fair matchmaking
 */
export function calculateCompositeMatchScore(playerA, playerB) {
  const mmrA = Number(playerA.mmr_rating || playerA.elo || 1000);
  const mmrB = Number(playerB.mmr_rating || playerB.elo || 1000);
  const afsA = Number(playerA.afs_score || 100);
  const afsB = Number(playerB.afs_score || 100);

  const mmrDiff = Math.abs(mmrA - mmrB);
  const afsDiff = Math.abs(afsA - afsB);

  // Penalty formula
  const penalty = (mmrDiff * 0.4) + (afsDiff * 1.5);
  const cms = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  return cms;
}

/**
 * Lobby Random Matchmaking Algorithm
 * Filters available lobby candidates within skill window and returns best match
 */
export function matchmakeLobby(userStats, availableRivals, mmrTolerance = 250) {
  const userMmr = Number(userStats?.mmr_rating || userStats?.elo || 1000);
  const userAfs = Number(userStats?.afs_score || 100);

  const candidates = availableRivals.map((rival) => {
    const rivalMmr = Number(rival.mmr_rating || rival.elo || 1000);
    const rivalAfs = Number(rival.afs_score || 100);
    const mmrDiff = Math.abs(userMmr - rivalMmr);
    const afsDiff = Math.abs(userAfs - rivalAfs);
    const cms = calculateCompositeMatchScore({ mmr_rating: userMmr, afs_score: userAfs }, rival);

    return {
      ...rival,
      mmrDiff,
      afsDiff,
      cms,
      inSkillRange: mmrDiff <= mmrTolerance
    };
  });

  // Sort candidates by highest CMS score
  candidates.sort((a, b) => b.cms - a.cms);

  const bestMatch = candidates[0] || null;

  return {
    bestMatch,
    candidates,
    lobbyRange: {
      minMmr: userMmr - mmrTolerance,
      maxMmr: userMmr + mmrTolerance
    }
  };
}
