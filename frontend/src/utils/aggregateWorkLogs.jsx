import { MEMBER_META } from "./memberMeta";

export function aggregateWorkLogs(workLogs = []) {
  const result = {};

  workLogs.forEach((log) => {
    const memberId = String(log.member); // normalize
    const meta = MEMBER_META[memberId];

    if (!meta) return;

    const group = Number(meta.group);
    const name = meta.name;

    if (!result[group]) {
      result[group] = {};
    }

    if (!result[group][memberId]) {
      result[group][memberId] = {
        memberId,
        name,
        group,          // ✅ ALWAYS set here
        totalTime: 0,
      };
    }

    result[group][memberId].totalTime += Number(
      log.real_time || 0
    );
  });
  return result;
}