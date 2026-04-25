// generateMatchups.js
// This script reads src/data/styleStats.json and generates a detailed matchup guide
// for every ordered pair of styles (A vs B) according to the strict protocol.

const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, 'styleStats.json');
const outputPath = path.join(__dirname, 'matchupData.json');

const styles = JSON.parse(fs.readFileSync(stylePath, 'utf8'));

// Helper to extract numeric value from possible string range "0.285 - 0.74"
function parseRange(str) {
  if (typeof str === 'number') return str;
  if (typeof str === 'string') {
    const parts = str.split('-').map(p => parseFloat(p.trim()));
    return Math.min(...parts.filter(v => !isNaN(v)));
  }
  return null;
}

function maxAttackRange(style) {
  const moves = style.moves;
  return Math.max(
    moves.punch?.attack_range_studs ?? 0,
    moves.right_kick?.attack_range_studs ?? 0,
    moves.left_kick?.attack_range_studs ?? 0
  );
}
function fastestDelay(style) {
  const moves = style.moves;
  const delays = [
    moves.punch?.delay_seconds,
    moves.right_kick?.delay_seconds,
    moves.left_kick?.delay_seconds,
    typeof moves.block?.delay_seconds === 'string' ? parseRange(moves.block.delay_seconds) : moves.block?.delay_seconds
  ].filter(d => d !== undefined && d !== null);
  return Math.min(...delays);
}
function maxMobility(style) {
  const moves = style.moves;
  return Math.max(
    moves.right_kick?.walk_speed_studs_per_second ?? 0,
    moves.left_kick?.walk_speed_studs_per_second ?? 0,
    moves.punch?.walk_speed_studs_per_second ?? 0
  );
}
function blockPenalty(style) {
  const blk = style.moves.block;
  const guardBreak = blk?.guard_break_duration_seconds ?? 0;
  const postDelay = typeof blk?.post_block_attack_delay_seconds === 'string'
    ? parseRange(blk.post_block_attack_delay_seconds)
    : blk?.post_block_attack_delay_seconds ?? 0;
  return { guardBreak, postDelay };
}

function compareNumbers(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

const matchup = {};

styles.forEach(a => {
  matchup[a.name] = {};
  styles.forEach(b => {
    if (a.name === b.name) return; // skip self
    // Core comparisons
    const aRange = maxAttackRange(a);
    const bRange = maxAttackRange(b);
    const aFast = fastestDelay(a);
    const bFast = fastestDelay(b);
    const aMob = maxMobility(a);
    const bMob = maxMobility(b);
    const aBlock = blockPenalty(a);
    const bBlock = blockPenalty(b);

    const strengths = [];
    const weaknesses = [];
    const tactics = [];

    // Range advantage
    if (aRange > bRange) {
      strengths.push(`Longer attack range (${aRange} studs vs ${bRange} studs)`);
      weaknesses.push(`Shorter range (${bRange} studs)`);
      tactics.push('Maintain distance and kite using long‑range attacks');
    } else if (aRange < bRange) {
      strengths.push(`Shorter range; can close quickly`);
      weaknesses.push(`Longer range opponent (${bRange} studs)`);
      tactics.push('Close the gap fast, use quick punches to punish');
    }

    // Speed advantage (fastest attack)
    if (aFast < bFast) {
      strengths.push(`Faster fastest attack delay (${aFast}s vs ${bFast}s)`);
      weaknesses.push(`Slower attack delay (${bFast}s)`);
      tactics.push('Apply pressure and interrupt opponent attacks');
    } else if (aFast > bFast) {
      strengths.push(`Slower attack delay, play defensively`);
      weaknesses.push(`Opponent attacks faster (${bFast}s)`);
      tactics.push('Guard and look for counter‑attack windows');
    }

    // Mobility advantage
    if (aMob > bMob) {
      strengths.push(`Higher walk speed during attacks (${aMob} studs/s vs ${bMob})`);
      weaknesses.push(`Slower mobility (${bMob} studs/s)`);
      tactics.push('Kite opponents whose chase speed is lower');
    } else if (aMob < bMob) {
      strengths.push('Slower mobility, rely on range/pressure');
      weaknesses.push(`Higher opponent mobility (${bMob} studs/s)`);
      tactics.push('Use feints to force opponent to over‑commit');
    }

    // Block trade analysis
    if (aBlock.guardBreak > bBlock.guardBreak) {
      strengths.push(`Opponent suffers longer guard break (${aBlock.guardBreak}s)`);
      weaknesses.push(`Your guard break is longer (${bBlock.guardBreak}s)`);
      tactics.push('Punish opponent when their guard breaks');
    } else if (aBlock.guardBreak < bBlock.guardBreak) {
      strengths.push('Your guard break is shorter, recover faster');
      weaknesses.push(`Opponent recovers quicker (${bBlock.guardBreak}s)`);
    }
    if (aBlock.postDelay < bBlock.postDelay) {
      strengths.push(`Recovers from block faster (${aBlock.postDelay}s vs ${bBlock.postDelay}s)`);
      tactics.push('Chain attacks after a successful block');
    } else if (aBlock.postDelay > bBlock.postDelay) {
      weaknesses.push(`Slower post‑block recovery (${aBlock.postDelay}s)`);
    }

    // Trim arrays to required lengths
    const my_strengths = strengths.slice(0, 3);
    const their_weaknesses = weaknesses.slice(0, 3);
    const tacticsArr = tactics.slice(0, 4);

    // Win condition summary
    const win_condition = aRange > bRange ? 'Maintain distance and kite' : (aFast < bFast ? 'Apply pressure and interrupt' : 'Play defensively and counter');

    matchup[a.name][b.name] = {
      win_condition,
      my_strengths,
      their_weaknesses,
      tactics: tacticsArr
    };
  });
});

fs.writeFileSync(outputPath, JSON.stringify(matchup, null, 2), 'utf8');
console.log('Matchup data generated at', outputPath);
