// generateMatchups.cjs
// Enhanced script producing fully numeric matchup guidance per strict schema.

const fs = require('fs');
const path = require('path');

const stylePath = path.join(__dirname, 'styleStats.json');
const outputPath = path.join(__dirname, 'matchupData.json');

const styles = JSON.parse(fs.readFileSync(stylePath, 'utf8'));

// Parse numeric from a possible string range "0.285 - 0.74"
function parseRange(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parts = val.split('-').map(p => parseFloat(p.trim()));
    return Math.min(...parts.filter(p => !isNaN(p)));
  }
  return null;
}

function maxAttackRange(style) {
  const m = style.moves;
  return Math.max(
    m.punch?.attack_range_studs ?? 0,
    m.right_kick?.attack_range_studs ?? 0,
    m.left_kick?.attack_range_studs ?? 0
  );
}
function fastestDelay(style) {
  const m = style.moves;
  const delays = [
    m.punch?.delay_seconds,
    m.right_kick?.delay_seconds,
    m.left_kick?.delay_seconds,
    typeof m.block?.delay_seconds === 'string' ? parseRange(m.block.delay_seconds) : m.block?.delay_seconds
  ].filter(d => d != null);
  return Math.min(...delays);
}
function maxMobility(style) {
  const m = style.moves;
  return Math.max(
    m.right_kick?.walk_speed_studs_per_second ?? 0,
    m.left_kick?.walk_speed_studs_per_second ?? 0,
    m.punch?.walk_speed_studs_per_second ?? 0
  );
}
function blockStats(style) {
  const blk = style.moves.block;
  const guardBreak = blk?.guard_break_duration_seconds ?? 0;
  const postDelay = typeof blk?.post_block_attack_delay_seconds === 'string'
    ? parseRange(blk.post_block_attack_delay_seconds)
    : blk?.post_block_attack_delay_seconds ?? 0;
  const guardVuln = blk?.guard_break_vulnerability_seconds ?? 0;
  return { guardBreak, postDelay, guardVuln };
}

function add(arr, txt) { arr.push(txt); }

const matchup = {};
styles.forEach(a => {
  matchup[a.name] = {};
  styles.forEach(b => {
    if (a.name === b.name) return;

    const aRange = maxAttackRange(a);
    const bRange = maxAttackRange(b);
    const aFast = fastestDelay(a);
    const bFast = fastestDelay(b);
    const aMob = maxMobility(a);
    const bMob = maxMobility(b);
    const aBlk = blockStats(a);
    const bBlk = blockStats(b);

    const strengths = [];
    const weaknesses = [];
    const tactics = [];

    // 1. Range advantage
    if (aRange > bRange) {
      add(strengths, `Longer attack range (${aRange} studs vs ${bRange} studs)`);
      add(weaknesses, `Shorter range (${bRange} studs)`);
      add(tactics, `Use long‑range kicks/punches to keep distance`);
    } else if (aRange < bRange) {
      add(strengths, `Shorter attack range (${aRange} studs) – can close gap faster`);
      add(weaknesses, `Longer range opponent (${bRange} studs)`);
      add(tactics, `Close quickly with fast punches (delay ${aFast}s) then chase with kicks`);
    }

    // 2. Speed advantage (fastest attack delay)
    if (aFast < bFast) {
      add(strengths, `Faster fastest attack delay (${aFast}s vs ${bFast}s)`);
      add(weaknesses, `Opponent attacks faster (${bFast}s)`);
      add(tactics, `Pressure opponent; interrupt with quick attacks`);
    } else if (aFast > bFast) {
      add(strengths, `Opponent slower – play defensively and look for counter‑attack windows`);
      add(weaknesses, `Slower attack delay (${aFast}s)`);
      add(tactics, `Guard and wait for opponent to overextend before countering`);
    }

    // 3. Mobility advantage (walk speed during attacks)
    if (aMob > bMob) {
      add(strengths, `Higher walk speed during attacks (${aMob} studs/s vs ${bMob})`);
      add(weaknesses, `Slower mobility (${bMob} studs/s)`);
      add(tactics, `Kite opponent whose chase speed is lower`);
    } else if (aMob < bMob) {
      add(strengths, `Opponent higher walk speed during attacks (${bMob} studs/s)`);
      add(weaknesses, `Slower mobility (${aMob} studs/s)`);
      add(tactics, `Feint to force opponent to chase and punish their miss`);
    }

    // 4. Guard break duration (shorter is better for defender)
    if (aBlk.guardBreak < bBlk.guardBreak) {
      add(strengths, `Recover from guard break faster (${aBlk.guardBreak}s vs ${bBlk.guardBreak}s)`);
      add(weaknesses, `Opponent suffers longer guard break (${bBlk.guardBreak}s)`);
      add(tactics, `After a successful block, strike immediately`);
    } else if (aBlk.guardBreak > bBlk.guardBreak) {
      add(strengths, `Opponent takes longer to recover from guard break (${bBlk.guardBreak}s)`);
      add(weaknesses, `Longer guard break (${aBlk.guardBreak}s)`);
      add(tactics, `Punish opponent when their guard breaks`);
    }
    // 5. Post‑block attack delay (smaller = quicker retaliation)
    if (aBlk.postDelay < bBlk.postDelay) {
      add(strengths, `Faster post‑block attack delay (${aBlk.postDelay}s vs ${bBlk.postDelay}s)`);
      add(weaknesses, `Opponent slower to counter after block (${bBlk.postDelay}s)`);
      add(tactics, `Chain attacks right after blocking`);
    } else if (aBlk.postDelay > bBlk.postDelay) {
      add(strengths, `Opponent can retaliate quicker after block (${bBlk.postDelay}s)`);
      add(weaknesses, `Slower post‑block attack delay (${aBlk.postDelay}s)`);
    }
    // 6. Guard break vulnerability (lower = harder to break guard)
    if (aBlk.guardVuln < bBlk.guardVuln) {
      add(strengths, `Lower guard‑break vulnerability (${aBlk.guardVuln}s)`);
      add(weaknesses, `Opponent easier to guard‑break (${bBlk.guardVuln}s)`);
    } else if (aBlk.guardVuln > bBlk.guardVuln) {
      add(strengths, `Opponent easier to guard‑break (${bBlk.guardVuln}s)`);
      add(weaknesses, `Higher guard‑break vulnerability (${aBlk.guardVuln}s)`);
    }

    // Trim to required limits
    const my_strengths = strengths.slice(0, 3);
    const their_weaknesses = weaknesses.slice(0, 3);
    const tacticsArr = tactics.slice(0, 4);

    // Determine win condition based on primary advantage hierarchy
    let win_condition = 'Play defensively and counter';
    if (aRange > bRange) win_condition = 'Maintain distance and kite';
    else if (aFast < bFast) win_condition = 'Apply pressure and interrupt';
    else if (aMob > bMob) win_condition = 'Kite using superior mobility';
    else if (aBlk.guardBreak < bBlk.guardBreak) win_condition = 'Punish guard breaks quickly';

    matchup[a.name][b.name] = {
      win_condition,
      my_strengths,
      their_weaknesses,
      tactics: tacticsArr
    };
  });
});

fs.writeFileSync(outputPath, JSON.stringify(matchup, null, 2), 'utf8');
console.log('Regenerated matchup data at', outputPath);
