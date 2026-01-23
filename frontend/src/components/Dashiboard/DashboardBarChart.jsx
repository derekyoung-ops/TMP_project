import * as React from "react";
import {
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

import { aggregateWorkLogs } from "@/utils/aggregateWorkLogs";
import { formatTime, GROUP_COLORS, memberColor } from "../../utils/chartUtils";

export default function DashboardBarChart({
  workLogs = [],
  filter = "group",
}) {
  const [order, setOrder] = React.useState("desc");

  function firstName(name = "") {
    return name.split(" ")[0];
  }

  if (!Array.isArray(workLogs) || workLogs.length === 0) {
    return <Box textAlign="center">No data</Box>;
  }

  const grouped = aggregateWorkLogs(workLogs);
  let rows = [];

  /* ================= GROUP VIEW ================= */
  if (filter === "group") {
    Object.entries(grouped).forEach(([groupId, members]) => {
      const memberList = Object.values(members);

      const totalSeconds = memberList.reduce(
        (sum, m) => sum + Number(m.totalTime || 0),
        0
      );

      const avgSeconds =
        memberList.length > 0
          ? Math.floor(totalSeconds / memberList.length)
          : 0;

      if (avgSeconds > 0) {
        rows.push({
          label: `Group ${groupId}`,
          value: avgSeconds, // ✅ AVERAGE seconds
          group: groupId,
        });
      }
    });
  }

  /* ================= MEMBER VIEW ================= */
  if (filter === "individual") {
    Object.values(grouped).forEach((members) => {
      Object.values(members).forEach((m) => {
        if (m.totalTime > 0) {
          rows.push({
            label: firstName(m.name),
            value: Number(m.totalTime),
            memberId: m.memberId
          });
        }
      });
    });
  }

  if (rows.length === 0) {
    return <Box textAlign="center">No working time</Box>;
  }

  /* ================= SORT ================= */
  rows.sort((a, b) =>
    order === "asc" ? a.value - b.value : b.value - a.value
  );

  return (
    <Box>
      <BarChart
        height={520}
        margin={{ top: 60, bottom: 90, left: 80, right: 30 }}
        xAxis={[
          {
            data: rows.map((r) => r.label),
            scaleType: "band",
          },
        ]}
        yAxis={[
          {
            label: "Working Time",
            min: 0,
            valueFormatter: (v) => `${Math.floor(v / 3600)}h`
          },
        ]}
        series={[
          {
            label: "Working Time",
            data: rows.map((r) => r.value),
            valueFormatter: (v) => formatTime(v),
            barLabel: ({ value }) => formatTime(value),
            barLabelPosition: "top",
            colors : filter === "group"
                ? rows.map((r) => GROUP_COLORS[r.group])
                : rows.map((r) => memberColor(r.memberId))
          },
        ]}
        slotProps={{
          barLabel: {
            style: {
              fill: "#57e676",
              fontSize: `${filter === "group" ? 22 : 14}`,
              fontWeight: 700,
              pointerEvents: "none",
            },
          },
        }}
        sx={{
           
        }}
      />

      {/* SORT SWITCH */}
      <Stack direction="row" justifyContent="center" mt={2}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={order}
          onChange={(_, v) => v && setOrder(v)}
        >
          <ToggleButton value="desc">DESCENDING</ToggleButton>
          <ToggleButton value="asc">ASCENDING</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
}
