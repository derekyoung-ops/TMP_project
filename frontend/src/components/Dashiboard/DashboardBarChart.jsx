import * as React from "react";
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography, Paper } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import StarIcon from "@mui/icons-material/Star";

import { aggregateWorkLogs } from "@/utils/aggregateWorkLogs";
import { formatTime, getGroupColor, memberColor } from "../../utils/chartUtils";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import { useGetGroupsQuery } from "../../slices/group/groupApiSlice";
import { useAddTimeToMemberMutation } from "../../slices/workingtime/worklogApiSlice";
import { useGetExecutionPercentagesQuery } from "../../slices/execution/executionApiSlice";
import Addtimedialog from "./Addtimedialog";

function firstName(name = "") {
  return (name || "").trim().split(/\s+/)[0] || "Member";
}

function DashboardBarChart({ workLogs = [], filter = "group" }) {
  const [order, setOrder] = React.useState("desc");
  const [addTimeDialogOpen, setAddTimeDialogOpen] = React.useState(false);
  const [selectedMemberForDialog, setSelectedMemberForDialog] = React.useState(null);
  const [setStandardTimeDialogOpen, setSetStandardTimeDialogOpen] = React.useState(false);

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
            const execData = executionPercentageByUserId.get(memberId) || {
              percentage: 0,
              planIncome: 0,
              actualIncome: 0,
            };

            // 🎯 Assume base standard time is 12 hours (43200 seconds) per day
            // Adjust based on execution percentage
            const baseStandardTime = 43200; // 12 hours
            const dynamicStandardTime = calculateDynamicStandardTime(baseStandardTime, execData.percentage);

            // 🎯 Check if member exceeded standard time
            const exceededStandard = seconds > dynamicStandardTime;

            out.push({
              label: firstName(displayName),
              value: seconds,
              memberId: m?.memberId,
              groupId: m?.groupId,
              executionPercentage: execData.percentage,
              dynamicStandardTime: dynamicStandardTime,
              exceededStandard: exceededStandard,
              planIncome: execData.planIncome,
              actualIncome: execData.actualIncome,
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

    const series = sortedRows.map((row, index) => {
      // Only place the value at this bar's index, null everywhere else
      const data = sortedRows.map((_, i) => (i === index ? row.value : null));

      const color = filter === "group"
        ? getGroupColor(row.groupId)
        : memberColor(row.memberId);

      return {
        label: row.label,
        data,
        color,
        stack: "single",
        valueFormatter: (v) => (v != null ? formatTime(v) : ""),
      };
    });

    return { labels, series };
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
        legend={{ hidden: true }}
        slotProps={{
          barLabel: {
            style: {
              fill: "#0f766e",
              fontSize: filter === "group" ? 22 : 14,
              fontWeight: 700,
              pointerEvents: "none",
            },
          },
        }}
        tooltip={{
          trigger: "item",
        }}
        slots={{
          itemContent: (props) => {
            // Find the corresponding row data based on the dataIndex
            const dataIndex = props?.dataIndex;
            if (dataIndex == null || dataIndex < 0 || dataIndex >= sortedRows.length) return null;
            
            const rowData = sortedRows[dataIndex];
            if (!rowData) return null;

            return (
              <Paper
                elevation={3}
                sx={{
                  padding: "12px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.primary">
                  {rowData.label}
                </Typography>
                <Typography variant="body2" fontSize="13px" color="text.secondary">
                  <strong>Working Time:</strong> {formatTime(rowData.value)}
                </Typography>
                {filter === "individual" && (
                  <>
                    <Typography variant="body2" fontSize="13px" color="text.secondary" mt={0.5}>
                      <strong>Standard Time:</strong> {formatTime(rowData.dynamicStandardTime)}
                    </Typography>
                    <Typography variant="body2" fontSize="13px" color="text.secondary" mt={0.5}>
                      <strong>Performance:</strong> {rowData.executionPercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" fontSize="13px" color="text.secondary" mt={0.5}>
                      <strong>Actual Income:</strong> {rowData.actualIncome.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" fontSize="13px" color="text.secondary" mt={0.5}>
                      <strong>Plan Income:</strong> {rowData.planIncome.toLocaleString()}
                    </Typography>
                  </>
                )}
              </Paper>
            );
          },
        }}
      />

      {/* Custom Legend */}
      <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mt={2} mb={1}>
        {sortedRows.map((row, i) => {
          const color = filter === "group"
            ? getGroupColor(row.groupId)
            : memberColor(row.memberId);
          return (
            <Tooltip
              key={i}
              title={
                filter === "individual"
                  ? `Performance: ${row.executionPercentage}% | Actual: ${row.actualIncome} | Plan: ${row.planIncome}`
                  : ""
              }
            >
              <Box display="flex" alignItems="center" gap={0.5}>
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
                {filter === "individual" && row.exceededStandard && (
                  <StarIcon
                    sx={{
                      width: 14,
                      height: 14,
                      color: "#ffc107",
                      marginLeft: "4px",
                    }}
                  />
                )}
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
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setAddTimeDialogOpen(true)}
          >
            Add time
          </Button>
          <Button variant="outlined" size="small">
            Set Standard Time
          </Button>
        </Box>
        {usersLoading && (
          <Typography variant="caption" color="text.secondary">
            Loading users…
          </Typography>
        )}
        {usersError && (
          <Typography variant="caption" color="error">
            Users failed to load
          </Typography>
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
      />
    </Box>
  );
}

export default React.memo(DashboardBarChart);