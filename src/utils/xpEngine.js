/**
 * TRUEREP MATHEMATICAL XP & LEVELING & RANK PROGRESSION ENGINE
 * 
 * Equations:
 * 1. XP = ROUND(((TUT_sec * 2) + (Reps * 10)) * Form * Intensity * StreakMultiplier)
 * 2. Level(XP) = floor((XP / 100)^(1 / 1.6)) + 1
 * 3. XP_forLevel(L) = ceil(100 * (L - 1)^1.6)
 * 4. Rep Tokens Earned = floor(XP * 0.10)
 */

/**
 * Calculates current level from total XP
 * @param {number} totalXp 
 * @returns {number} Level (1+)
 */
export function calculateLevelFromXP(totalXp = 0) {
  const xp = Math.max(0, Number(totalXp) || 0);
  if (xp === 0) return 1;
  const level = Math.floor(Math.pow(xp / 100.0, 1.0 / 1.6)) + 1;
  return Math.max(1, level);
}

/**
 * Calculates exact total XP required to reach a specific level
 * @param {number} level 
 * @returns {number} Required total XP
 */
export function calculateXPForLevel(level = 1) {
  const lvl = Math.max(1, Number(level) || 1);
  if (lvl <= 1) return 0;
  return Math.ceil(100.0 * Math.pow(lvl - 1, 1.6));
}

/**
 * Computes full leveling progress breakdown for UI progress bars & cards
 * @param {number} totalXp 
 * @param {number|null} overrideLevel 
 * @returns {Object} { currentLevel, nextLevel, currentLevelXp, nextLevelXp, xpInLevel, xpNeededForNext, progressPercent }
 */
export function getLevelProgress(totalXp = 0, overrideLevel = null) {
  const xp = Math.max(0, Number(totalXp) || 0);
  const calculatedLevel = calculateLevelFromXP(xp);
  const targetLevel = overrideLevel ? Math.max(1, Number(overrideLevel) || 1) : calculatedLevel;
  const currentLevel = Math.max(calculatedLevel, targetLevel);
  const nextLevel = currentLevel + 1;

  const currentLevelXp = calculateXPForLevel(currentLevel);
  const nextLevelXp = calculateXPForLevel(nextLevel);

  const effectiveXp = Math.max(xp, currentLevelXp);
  const xpInLevel = effectiveXp - currentLevelXp;
  const xpNeededForNext = Math.max(1, nextLevelXp - currentLevelXp);
  const progressPercent = Math.min(100, Math.max(0, Math.floor((xpInLevel / xpNeededForNext) * 100)));

  return {
    totalXp: effectiveXp,
    currentLevel,
    nextLevel,
    currentLevelXp,
    nextLevelXp,
    xpInLevel,
    xpNeededForNext,
    progressPercent
  };
}


/**
 * Computes workout session XP and Rep Token rewards
 * @param {Object} session 
 * @returns {Object} { xpEarned, tokensEarned, streakMultiplier, breakdown }
 */
export function calculateWorkoutXP(session = {}) {
  const tutSeconds = Math.max(0, Number(session.tutSeconds || session.total_tut_seconds) || 0);
  const reps = Math.max(0, Number(session.reps || session.total_reps) || 0);
  const formScore = Math.min(1.0, Math.max(0.0, Number(session.formScore || session.avg_form_score) || 0.90));
  const intensity = Math.max(0.5, Number(session.intensityMultiplier) || 1.0);
  const streakDays = Math.max(0, Number(session.streakDays) || 0);

  // Streak Multiplier: min(1.50, 1.0 + (streakDays * 0.05))
  const streakMultiplier = Math.min(1.50, 1.00 + (streakDays * 0.05));

  // Base XP = ((TUT * 2) + (reps * 10)) * formScore * intensity * streakMultiplier
  const rawXp = ((tutSeconds * 2) + (reps * 10)) * formScore * intensity * streakMultiplier;
  const xpEarned = Math.round(rawXp);
  const tokensEarned = Math.floor(xpEarned * 0.10);

  return {
    xpEarned,
    tokensEarned,
    streakMultiplier: Number(streakMultiplier.toFixed(2)),
    breakdown: {
      tutXp: tutSeconds * 2,
      repsXp: reps * 10,
      formScore: Number(formScore.toFixed(3)),
      intensity
    }
  };
}

/**
 * Derives Rank Tier name and Rank Rating (RR) from MMR score
 * @param {number} mmr 
 * @param {string|null} overrideRankTier
 * @returns {Object} { rankTier, rrRating, badgeColor }
 */
export function getRankTierFromMMR(mmr = 1000, overrideRankTier = null) {
  const rating = Math.max(100, Math.round(Number(mmr) || 1000));
  const rrRating = rating % 100;

  let rankTier = overrideRankTier || 'Bronze I';
  let badgeColor = 'text-amber-500';

  if (!overrideRankTier) {
    if (rating < 850) { rankTier = 'Iron III'; badgeColor = 'text-slate-400'; }
    else if (rating < 950) { rankTier = 'Iron I'; badgeColor = 'text-slate-400'; }
    else if (rating < 1050) { rankTier = 'Bronze I'; badgeColor = 'text-amber-600'; }
    else if (rating < 1150) { rankTier = 'Bronze II'; badgeColor = 'text-amber-500'; }
    else if (rating < 1250) { rankTier = 'Silver I'; badgeColor = 'text-cyan-300'; }
    else if (rating < 1350) { rankTier = 'Silver II'; badgeColor = 'text-cyan-400'; }
    else if (rating < 1450) { rankTier = 'Gold I'; badgeColor = 'text-yellow-400'; }
    else if (rating < 1600) { rankTier = 'Gold II'; badgeColor = 'text-[#EAB308]'; }
    else if (rating < 1800) { rankTier = 'Platinum I'; badgeColor = 'text-emerald-400'; }
    else if (rating < 2000) { rankTier = 'Diamond I'; badgeColor = 'text-indigo-400'; }
    else { rankTier = 'TrueRep Titan'; badgeColor = 'text-purple-400'; }
  } else {
    const tierLower = String(overrideRankTier).toLowerCase();
    if (tierLower.includes('iron')) badgeColor = 'text-slate-400';
    else if (tierLower.includes('bronze')) badgeColor = 'text-amber-600';
    else if (tierLower.includes('silver')) badgeColor = 'text-cyan-300';
    else if (tierLower.includes('gold')) badgeColor = 'text-yellow-400';
    else if (tierLower.includes('plat')) badgeColor = 'text-emerald-400';
    else if (tierLower.includes('diamond')) badgeColor = 'text-indigo-400';
    else if (tierLower.includes('titan')) badgeColor = 'text-purple-400';
  }

  return {
    rankTier,
    rrRating,
    badgeColor
  };
}

/**
 * Processes duel result to update MMR, Rank Rating (RR), Leveling, and XP
 * @param {Object} currentProfile 
 * @param {Object} currentStats 
 * @param {Object} duelResult { isWin, userReps, opponentReps, tutSeconds, avgFormScore }
 * @returns {Object} Updated profile stats + boolean flags (didLevelUp, didRankUp)
 */
export function processDuelReward(currentProfile = {}, currentStats = {}, duelResult = {}) {
  const oldTotalXp = Number(currentProfile.total_xp || 0);
  const oldLevel = calculateLevelFromXP(oldTotalXp);
  const oldMMR = Number(currentStats.mmr_rating || currentProfile.mmr_rating || 1000);
  const oldTierInfo = getRankTierFromMMR(oldMMR);

  // Calculate XP from workout session in duel
  const { xpEarned, tokensEarned } = calculateWorkoutXP({
    tutSeconds: duelResult.tutSeconds || 60,
    reps: duelResult.userReps || 0,
    formScore: duelResult.avgFormScore || 0.90,
    streakDays: currentProfile.streak_days || 0
  });

  // Calculate MMR Delta
  const isWin = Boolean(duelResult.isWin);
  const repMargin = (duelResult.userReps || 0) - (duelResult.opponentReps || 0);
  const marginBonus = isWin ? Math.min(15, Math.max(0, repMargin * 2)) : -Math.min(10, Math.max(0, -repMargin));

  const baseMmrChange = isWin ? 25 : -18;
  const formFactor = 0.8 + ((duelResult.avgFormScore || 0.9) * 0.4);
  const deltaMMR = Math.round((baseMmrChange * formFactor) + marginBonus);

  const newMMR = Math.max(100, oldMMR + deltaMMR);
  const newTotalXp = oldTotalXp + xpEarned;
  const newLevel = calculateLevelFromXP(newTotalXp);
  const newTokens = (currentProfile.rep_tokens || 100) + tokensEarned;

  const newTierInfo = getRankTierFromMMR(newMMR);

  const didLevelUp = newLevel > oldLevel;
  const didRankUp = newMMR > oldMMR && newTierInfo.rankTier !== oldTierInfo.rankTier;
  const didRankDown = newMMR < oldMMR && newTierInfo.rankTier !== oldTierInfo.rankTier;

  return {
    xpEarned,
    tokensEarned,
    deltaMMR,
    newMMR,
    newTotalXp,
    oldLevel,
    newLevel,
    oldTier: oldTierInfo.rankTier,
    newTier: newTierInfo.rankTier,
    newRR: newTierInfo.rrRating,
    didLevelUp,
    didRankUp,
    didRankDown
  };
}
