// ==========================================
// KARATEHUB — TypeScript Type Definitions
// ==========================================

/**
 * A stat value may be a number (e.g. 0.285), a string range (e.g. "0.285 - 0.74"),
 * or a boolean flag (e.g. custom_hit_reaction: true).
 */
export type StatValue = number | string | boolean;

export type MoveStats = Record<string, StatValue | undefined>;


export interface StyleMoves {
  punch?: MoveStats;
  right_kick?: MoveStats;
  left_kick?: MoveStats;
  block?: MoveStats;
  [key: string]: MoveStats | undefined;
}

export interface StyleData {
  name: string;
  /** Archetype label, e.g. "Counter-Offensive", "Offensive", "Defensive" */
  type?: string;
  description: string;
  /** Optional path/URL to a square or portrait style icon shown on cards */
  image?: string;
  /** Optional path/URL to a wide banner image shown on the detail page header */
  imageBanner?: string;
  moves: StyleMoves;
}

// Human-readable labels for stat keys
export const STAT_LABELS: Record<string, string> = {
  attack_range_studs:            'Attack Range',
  cooldown_seconds:              'Cooldown',
  delay_seconds:                 'Startup Delay',
  length_seconds:                'Active Frames',
  walk_speed_studs_per_second:   'Walk Speed (During)',
  animation_speed_multiplier:    'Anim. Speed Mult.',
  guard_break_duration_seconds:  'Guard Break Duration',
  guard_break_duration_multiplier:'Guard Break Mult.',
  guard_break_vulnerability_seconds: 'Vulnerability Window',
  guard_recovery_delay_seconds:  'Guard Recovery Delay',
  parry_attack_delay_seconds:    'Parry Attack Delay',
  post_block_attack_delay_seconds:'Post-Block Delay',
  stun_length_seconds:           'Stun Duration',
  // New fields from expanded dataset
  custom_hit_reaction:           'Custom Hit Reaction',
  block_recharge_multiplier:     'Block Recharge Mult.',
  minimum_block_length_seconds:  'Min. Block Length',
  walk_speed_recovery_seconds:   'Walk Speed Recovery',
};

// Human-readable labels for move names
export const MOVE_LABELS: Record<string, string> = {
  punch:      'Punch',
  right_kick: 'Right Kick',
  left_kick:  'Left Kick',
  block:      'Block / Guard',
};

// For a given stat key, whether LOWER is better (used in comparison highlighting).
// Keys not listed here default to "higher is better".
export const LOWER_IS_BETTER: Record<string, boolean> = {
  cooldown_seconds:                  true,
  delay_seconds:                     true,
  guard_break_vulnerability_seconds: true,
  guard_recovery_delay_seconds:      true,
  parry_attack_delay_seconds:        true,
  post_block_attack_delay_seconds:   true,
  minimum_block_length_seconds:      true,
  walk_speed_recovery_seconds:       true,
  guard_break_duration_seconds:      false, // higher = harder guard to break
  stun_length_seconds:               false, // higher stun = better for the blocker
};

/**
 * Format a stat value for display.
 * - boolean  → "Yes" / "No"
 * - string   → rendered as-is (e.g. "0.285 - 0.74")
 * - number   → formatted with units based on the stat key
 */
export function formatStatValue(key: string, value: StatValue): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string')  return value;

  // Multiplier fields
  if (
    key === 'animation_speed_multiplier' ||
    key === 'guard_break_duration_multiplier' ||
    key === 'block_recharge_multiplier'
  ) {
    return `×${value.toFixed(3)}`;
  }

  // Stud-unit fields
  if (key === 'attack_range_studs') return `${value} studs`;
  if (key === 'walk_speed_studs_per_second') return `${value} studs/s`;

  // Everything else is seconds
  return `${value.toFixed(3)}s`;
}

// ==========================================
// MATCHUP DATA TYPES
// ==========================================

export interface MatchupEntry {
  win_condition: string;
  my_strengths: string[];
  their_weaknesses: string[];
  tactics: string[];
}

/** Nested lookup: MatchupData[StyleName][OpponentName] = MatchupEntry */
export type MatchupData = Record<string, Record<string, MatchupEntry>>;
