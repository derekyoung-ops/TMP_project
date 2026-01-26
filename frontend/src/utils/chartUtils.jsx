export const GROUP_COLORS = {
  1: "#6489ad",
  2: "#9c27b0",
  3: "#ef6c00",
  4: "#2e7d32",
  5: "#d32f2f",
};

export function memberColor(memberId) {
  const colors = [
    "#4b76a0",
    "#9c27b0",
    "#ef6c00",
    "#2e7d32",
    "#d32f2f",
    "#0288d1",
    "#7b1fa2",
    "#c2185b",
    "#388e3c",
    "#f57c00",
  ];

  const index = Math.abs(Number(memberId)) % colors.length;
  return colors[index];
}

export function formatTime(seconds = 0) {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const totalMinutes = Math.floor(safeSeconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h}h ${m}m`;
}
