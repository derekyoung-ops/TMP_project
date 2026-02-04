/**
 * Aggregates work logs by group and member using DB users + groups.
 * Includes both real_time and add_time in the aggregation.
 *
 * @param {Array} workLogs - WorkLog[]; WorkLog.member is hubstaff_id (string/number)
 *                           WorkLog fields: real_time, add_time (string), date, note
 * @param {Array} users - User[]; user.hubstaff_id + user.group (ObjectId)
 * @param {Array} groups - Group[]; group._id + group.name
 * @returns {Object} result[groupId][memberId] = {
 *   memberId, name, groupId, groupName, userId,
 *   totalRealTime, totalAddTime, totalTime, totalLogs,
 *   formattedRealTime, formattedAddTime, formattedTotalTime
 * }
 */
export function aggregateWorkLogs(workLogs = [], users = [], groups = []) {
  const result = {};

  // groupId -> groupName map
  const groupNameById = new Map();
  if (Array.isArray(groups)) {
    for (const g of groups) {
      const id = g?._id != null ? String(g._id) : (g?.id != null ? String(g.id) : null);
      if (!id) continue;
      const name = g?.name ?? g?.groupName ?? g?.title ?? "";
      groupNameById.set(id, name);
    }
  }

  // hubstaff_id -> user meta map
  const userMetaByHubstaffId = new Map();
  if (Array.isArray(users)) {
    for (const u of users) {
      const hubId = u?.hubstaff_id != null ? String(u.hubstaff_id) : null;
      if (!hubId) continue;

      const groupId = u?.group != null ? String(u.group) : null;

      userMetaByHubstaffId.set(hubId, {
        name: u?.name || "Unknown",
        groupId,
        groupName: groupId ? (groupNameById.get(groupId) || "") : "",
        userId: u?._id != null ? String(u._id) : null,
      });
    }
  }

  // Helper function to convert seconds to formatted time string
  const formatSeconds = (seconds) => {
    const totalSeconds = Math.abs(Number(seconds) || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // aggregate logs
  for (const log of workLogs || []) {
    const memberId = log?.member != null ? String(log.member) : "";
    if (!memberId) continue;

    const meta = userMetaByHubstaffId.get(memberId);
    if (!meta?.groupId) continue;

    const groupId = meta.groupId;

    // Initialize group and member if not exists
    if (!result[groupId]) result[groupId] = {};
    if (!result[groupId][memberId]) {
      result[groupId][memberId] = {
        memberId,                 // hubstaff_id
        name: meta.name,
        groupId,
        groupName: meta.groupName, // ✅ DB name (if groups provided)
        userId: meta.userId,
        totalRealTime: 0,         // Actual working time in seconds
        totalAddTime: 0,          // Added/manual time in seconds
        totalTime: 0,             // Combined total
        totalLogs: 0,             // Number of work log entries
      };
    }

    // ✅ Aggregate real_time (actual working time)
    const realTime = Number(log?.real_time || 0);
    result[groupId][memberId].totalRealTime += realTime;

    // ✅ Aggregate add_time (manually added time)
    // add_time is stored as string in DB, convert to number
    const addTime = Number(log?.add_time || 0);
    result[groupId][memberId].totalAddTime += addTime;

    // ✅ Calculate combined total
    result[groupId][memberId].totalTime += (realTime + addTime);

    // ✅ Count number of logs
    result[groupId][memberId].totalLogs += 1;
  }

  // ✅ Format all time values for display
  for (const groupId in result) {
    for (const memberId in result[groupId]) {
      const member = result[groupId][memberId];
      
      member.formattedRealTime = formatSeconds(member.totalRealTime);
      member.formattedAddTime = formatSeconds(member.totalAddTime);
      member.formattedTotalTime = formatSeconds(member.totalTime);
    }
  }

  return result;
}