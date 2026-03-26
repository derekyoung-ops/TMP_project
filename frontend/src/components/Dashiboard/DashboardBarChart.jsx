import * as React from "react";
import { Box, Button, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

import { aggregateWorkLogs } from "@/utils/aggregateWorkLogs";
import { formatTime, getGroupColor, memberColor } from "../../utils/chartUtils";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import { useGetGroupsQuery } from "../../slices/group/groupApiSlice";
import { useAddTimeToMemberMutation } from "../../slices/workingtime/worklogApiSlice";
import { useGetExecutionPercentagesQuery } from "../../slices/execution/executionApiSlice";
import Addtimedialog from "./Addtimedialog";
import { Star } from "lucide-react";
import { useSelector } from "react-redux";
import { MEMBER_META } from "../../utils/memberMeta"; // adjust path as needed

function firstName(name = "") {
  return (name || "").trim().split(/\s+/)[0] || "Member";
}

function DashboardBarChart({ workLogs = [], filter = "group", onDateChange, currentDateProp }) {
  const { userInfo } = useSelector((state) => state.auth);
  const [order, setOrder] = React.useState("desc");
  const [addTimeDialogOpen, setAddTimeDialogOpen] = React.useState(false);
  const [selectedMemberForDialog, setSelectedMemberForDialog] = React.useState(null);
  const [setStandardTimeDialogOpen, setSetStandardTimeDialogOpen] = React.useState(false);

  const currentDate = React.useMemo(() => currentDateProp ?? new Date(), [currentDateProp]);

  const formattedDate = React.useMemo(() => {
    const d = currentDateProp ?? new Date();
    return d.toISOString().split("T")[0];
  }, [currentDateProp]);

  const handlePrevDate = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange?.(d);
  };

  const handleNextDate = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange?.(d);
  };

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery();

  const {
    data: groups = [],
  } = useGetGroupsQuery();

  function getPreviousMonthYear() {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return {
      year: prev.getFullYear(),
      month: prev.getMonth() + 1, // 1–12
    };
  }

  const { year, month } = getPreviousMonthYear();

  const [addTimeToMember, { isLoading: addTimeLoading }] = useAddTimeToMemberMutation();

  const {
    data: executionPercentages = [],
    isLoading: executionPercentagesLoading,
    error: executionPercentagesError,
  } = useGetExecutionPercentagesQuery({ year, month });

  const userNameById = React.useMemo(() => {
    const map = new Map();
    if (Array.isArray(users)) {
      for (const u of users) {
        const id = u?._id ?? u?.id;
        if (id) map.set(String(id), u?.name ?? u?.fullName ?? "");
      }
    }
    return map;
  }, [users]);

  // 🎯 Create a map of userId -> execution percentage data
  const executionPercentageByUserId = React.useMemo(() => {
    const map = new Map();
    if (Array.isArray(executionPercentages)) {
      for (const exec of executionPercentages) {
        const userId = exec?.userId ? String(exec.userId) : "";
        if (userId) {
          map.set(userId, {
            percentage: exec.percentage || 0,
            planIncome: exec.planIncome || 0,
            actualIncome: exec.actualIncome || 0,
          });
        }
      }
    }
    return map;
  }, [executionPercentages]);

  // 🎯 Calculate dynamic standard time based on execution percentage
  const calculateDynamicStandardTime = (baseStandardTimeSeconds, percentage) => {
    const baseHours = baseStandardTimeSeconds / 3600;

    if (percentage < 30) {
      // Below 30%: increase by 3.5 hours
      return (baseHours + 3.5) * 3600;
    } else if (percentage < 70) {
      // Below 70%: increase by 1.5 hours
      return (baseHours + 1.5) * 3600;
    }
    // 70% or above: keep base standard time
    return baseStandardTimeSeconds;
  };

  const rows = React.useMemo(() => {
    if (!Array.isArray(workLogs) || workLogs.length === 0) return [];

    const grouped = aggregateWorkLogs(workLogs, users, groups);
    const out = [];

    if (filter === "group") {
      Object.entries(grouped).forEach(([groupId, members]) => {
        const memberList = Object.values(members);
        const totalSeconds = memberList.reduce((sum, m) => sum + Number(m?.totalTime || 0), 0);
        const avgSeconds = memberList.length ? Math.floor(totalSeconds / memberList.length) : 0;
        const groupName = memberList[0]?.groupName || `Group ${String(groupId).slice(-4)}`;

        if (avgSeconds > 0) {
          out.push({
            label: `${groupName} Group`,
            value: avgSeconds,
            groupId,
          });
        }
      });
    }

    if (filter === "individual") {
      Object.values(grouped).forEach((members) => {
        Object.values(members).forEach((m) => {
          const seconds = Number(m?.totalTime || 0);
          if (seconds > 0) {
            const memberId = m?.memberId ? String(m.memberId) : "";
            const apiName = memberId ? userNameById.get(memberId) : "";
            const displayName = apiName || m?.name || "Member";

            // 🎯 Get execution percentage for this member
            // const execData = executionPercentageByUserId.get(memberId) || {
            //   percentage: 0,
            //   planIncome: 0,
            //   actualIncome: 0,
            // };

            // 🎯 Assume base standard time is 8 hours (28800 seconds) per day
            // Adjust based on execution percentage
            // const baseStandardTime = 43200; // 8 hours
            // const dynamicStandardTime = calculateDynamicStandardTime(baseStandardTime, execData.percentage);

            // ✅ Get limitTime from MEMBER_META instead of calculating dynamically
            const meta = MEMBER_META[memberId];
            const limitTimeSeconds = meta?.limitTime != null
              ? meta.limitTime * 3600
              : null; // fallback to 8h if not defined

            // No limit = treat as exceeded (green)
            const exceededStandard = limitTimeSeconds != null
              ? seconds > limitTimeSeconds
              : true;  // ← no limit always green

            out.push({
              label: firstName(displayName),
              value: seconds,
              memberId: m?.memberId,
              groupId: m?.groupId,
              // executionPercentage: execData.percentage,
              dynamicStandardTime: limitTimeSeconds,
              exceededStandard: exceededStandard,
              // planIncome: execData.planIncome,
              // actualIncome: execData.actualIncome,
              addTime: Number(m?.totalAddTime || 0),
            });
          }
        });
      });
    }

    return out;
  }, [workLogs, filter, userNameById, users, groups, executionPercentageByUserId]);

  const sortedRows = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return [...rows].sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value));
  }, [rows, order]);

  // ✅ KEY FIX: MUI X BarChart applies color per SERIES, not per bar.
  // To get different colors per bar, each bar must be its own series
  // with a sparse data array (nulls everywhere except its own index).

  const { labels, series } = React.useMemo(() => {
    const labels = sortedRows.map((r) => r.label);

    if (filter === "group") {
      // Keep existing per-color logic for group view
      const series = sortedRows.map((row, index) => {
        const data = sortedRows.map((_, i) => (i === index ? row.value : null));
        return {
          label: undefined,
          data,
          color: getGroupColor(row.groupId),
          stack: "single",
          valueFormatter: (v) => (v != null ? formatTime(v) : ""),
          barLabel: ({ value }) => (value != null ? formatTime(value) : ""),
          barLabelPlacement: "outside",
        };
      });
      return { labels, series };
    }

    // Individual view: one unified base series + one add_time series
    const baseSeries = {
      label: undefined,
      data: sortedRows.map((r) => r.value - r.addTime),
      color: "#4f52e6",
      stack: "single",
      valueFormatter: (v) => (v != null ? formatTime(v) : ""),
      barLabel: ({ value, dataIndex }) => {
        const row = sortedRows[dataIndex];
        if (!row) return "";
        return (row.addTime > 0) ? "" : (value != null ? formatTime(value) : "");
      },
      barLabelPlacement: "outside",
    };

    const addTimeSeries = {
      label: undefined,
      data: sortedRows.map((r) => (r.addTime > 0 ? r.addTime : null)),
      color: "#16def9",
      stack: "single",
      valueFormatter: (v) => (v != null ? `+${formatTime(v)}` : ""),
      barLabel: ({ value, dataIndex }) => {
        const row = sortedRows[dataIndex];
        if (!row || value == null) return "";
        return `${formatTime(row.value)}`;
      },
      barLabelPlacement: "outside",
    };

    return { labels, series: [baseSeries, addTimeSeries] };
    // const series = sortedRows.map((row, index) => {
    //   // Only place the value at this bar's index, null everywhere else
    //   const data = sortedRows.map((_, i) => (i === index ? row.value : null));

    //   const color = filter === "group"
    //     ? getGroupColor(row.groupId)
    //     : memberColor(row.memberId);

    //   return {
    //     label: undefined,
    //     data,
    //     color,
    //     // ✅ stack all series into the same stack group
    //     // Since each series only has one non-null value, they don't actually
    //     // stack on top of each other — they just overlap at full bar width
    //     stack: "single",
    //     valueFormatter: (v) => (v != null ? formatTime(v) : ""),
    //     barLabel: ({ value }) => (value != null ? formatTime(value) : ""),
    //     barLabelPlacement: "outside",
    //   };
    // });

    // return { labels, series };
  }, [sortedRows, filter]);

  const yMax = React.useMemo(() => {
    if (!sortedRows.length) return undefined;
    const maxValue = sortedRows.reduce((m, r) => Math.max(m, Number(r.value || 0)), 0);
    const headroom = Math.max(Math.ceil(maxValue * 0.15), 3600); // 15% or 1 hour
    return maxValue + headroom;
  }, [sortedRows]);

  // Empty states
  if (!Array.isArray(workLogs) || workLogs.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" fontWeight={700}>No data</Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting the date range.
        </Typography>
      </Box>
    );
  }

  if (sortedRows.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" fontWeight={700}>No working time</Typography>
        <Typography variant="body2" color="text.secondary">
          No positive hours found in this range.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <BarChart
        height={520}
        width={1500}
        margin={{ top: 90, bottom: 90, left: 80, right: 30 }}
        xAxis={[{ data: labels, scaleType: "band", categoryGapRatio: 0.35, barGapRatio: 0.2 }]}
        yAxis={[
          {
            label: "Working Time",
            min: 0,
            max: yMax,
            valueFormatter: (v) => `${Math.floor(v / 3600)}h`,
          },
        ]}
        series={series}
        legend={{ hidden: true }} // Hide default legend, we use custom one below
        slotProps={{
          barLabel: {
            style: {
              fill: "#0f766e",
              fontSize: filter === "group" ? 22 : 14,
              fontWeight: 700,
              pointerEvents: "none",
              // transform: "translateY(10px)",
            },
          },
        }}
      />

      {/* Custom Legend */}
      <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={2} mb={1}>
        {sortedRows.map((row, i) => {
          const color = filter === "group"
            ? getGroupColor(row.groupId)
            : memberColor(row.memberId);

          const exceeded = filter === "individual" && row.exceededStandard;
          const borderColor = exceeded ? "#22c55e" : "#ef4444"; // green : red

          return (
            <Tooltip
              key={i}
              // title={
              //   filter === "individual"
              //     ? `Performance: ${row.executionPercentage}% | Actual: ${row.actualIncome} | Plan: ${row.planIncome}`
              //     : ""
              // }
              title={
                filter === "individual"
                  ? (() => {
                    const meta = MEMBER_META[row.memberId];
                    const limitTime = meta?.limitTime;
                    return limitTime != null
                      ? `Time Limit: ${limitTime}h`
                      : "No time limit";
                  })()
                  : ""
              }
            >
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={
                  filter === "individual"
                    ? {
                      border: `2px solid ${borderColor}`,
                      borderRadius: "20px",
                      px: 1,
                      py: 0.3,
                      boxShadow: exceeded
                        ? "0 0 6px 1px rgba(34,197,94,0.5)"   // green glow
                        : "0 0 6px 1px rgba(239,68,68,0.5)",  // red glow
                      animation: "pulse-border 2s ease-in-out infinite",
                    }
                    : {}
                }
              >
                <Box sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "2px",
                  backgroundColor: color,
                }} />
                <Typography variant="caption" color="text.secondary">
                  {row.label}
                </Typography>

                {/* 🎯 Show star for members who exceeded standard time */}
                {/* {filter === "individual" && row.exceededStandard && (
                  <Star
                    sx={{
                      width: 14,
                      height: 14,
                      color: "#ffc107",
                      marginLeft: "4px",
                    }}
                  />
                )} */}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Sort Toggle */}
      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center" mt={2}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={order}
          onChange={(_, v) => v && setOrder(v)}
        >
          <ToggleButton value="desc">DESCENDING</ToggleButton>
          <ToggleButton value="asc">ASCENDING</ToggleButton>
        </ToggleButtonGroup>

        {/* Date Navigator - centered */}
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePrevDate}
            sx={{ minWidth: 36, px: 1, borderRadius: "8px" }}
          >
            ‹
          </Button>

          <TextField
            type="date"
            size="small"
            value={formattedDate}
            onChange={(e) => {
              if (e.target.value) onDateChange?.(new Date(e.target.value));
            }}
            sx={{
              width: 150,
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            variant="outlined"
            size="small"
            onClick={handleNextDate}
            sx={{ minWidth: 36, px: 1, borderRadius: "8px" }}
          >
            ›
          </Button>
        </Box>

        {userInfo?.role === 'admin' && (
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setAddTimeDialogOpen(true)}
              disabled={addTimeLoading}>
              Add time
            </Button>
            <Button variant="outlined" size="small">
              Set Standard Time
            </Button>
          </Box>
        )}

        {usersLoading && (
          <Typography variant="caption" color="text.secondary">Loading users…</Typography>
        )}
        {usersError && (
          <Typography variant="caption" color="error">Users failed to load</Typography>
        )}
      </Stack>

      {/* Add Time Dialog */}
      <Addtimedialog
        open={addTimeDialogOpen}
        onClose={() => {
          setAddTimeDialogOpen(false);
          setSelectedMemberForDialog(null);
        }}
        selectedMemberId={selectedMemberForDialog}
        initialDate={formattedDate}
      />
    </Box>
  );
}

<style>{`
  @keyframes pulse-border {
    0%   { box-shadow: 0 0 4px 1px currentColor; opacity: 1; }
    50%  { box-shadow: 0 0 10px 3px currentColor; opacity: 0.7; }
    100% { box-shadow: 0 0 4px 1px currentColor; opacity: 1; }
  }
`}</style>

export default React.memo(DashboardBarChart);