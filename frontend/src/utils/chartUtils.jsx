// ============================================================
// chartUtils.js
// ============================================================

// ✅ Fixed GROUP_COLORS: use a dynamic function that always returns
//    a stable color for any groupId (not just hardcoded indices)
const GROUP_PALETTE = [
  "#1976D2", // blue
  "#7B1FA2", // purple
  "#00897B", // teal
  "#F57C00", // orange
  "#C62828", // red
  "#2E7D32", // green
  "#5D4037", // brown
  "#00ACC1", // cyan
  "#E91E63", // pink
  "#6D4C41", // dark brown
];

/**
 * Returns a stable color for a given groupId string.
 * Uses a simple hash so the same groupId always maps to the same color.
 */
export function getGroupColor(groupId) {
  if (!groupId) return "#888";
  const str = String(groupId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GROUP_PALETTE.length;
  return GROUP_PALETTE[index];
}

// Legacy export — kept for backward compat but now uses the hash function
export const GROUP_COLORS = new Proxy(
  {},
  {
    get(_, groupId) {
      return getGroupColor(groupId);
    },
  }
);

// ============================================================
// MEMBER colors — stable per memberId
// ============================================================
const MEMBER_PALETTE = [
  "#42A5F5", // light blue
  "#AB47BC", // light purple
  "#66BB6A", // light green
  "#FFA726", // light orange
  "#EF5350", // light red
  "#26A69A", // light teal
  "#78909C", // blue grey
  "#EC407A", // light pink
  "#8D6E63", // light brown
  "#5C6BC0", // indigo
  "#FFEE58", // yellow
  "#29B6F6", // sky blue
  "#D4E157", // light lime
  "#FF7043", // deep orange
  "#9CCC65", // light green 2
];

/**
 * Returns a stable color for any memberId (hubstaff_id or ObjectId string).
 */
export function memberColor(memberId) {
  if (!memberId) return "#888";
  const str = String(memberId);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MEMBER_PALETTE.length;
  return MEMBER_PALETTE[index];
}

// ============================================================
// TIME FORMATTING
// ============================================================

/**
 * Formats seconds → "Xh Ym" or "Ym Xs" or just "Xs"
 */
export function formatTime(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "0s";
  const s = Math.max(0, Math.floor(Number(totalSeconds)));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}