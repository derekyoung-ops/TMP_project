// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Stack
// } from "@mui/material";

// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";

// import DashboardBarChart from "./DashboardBarChart.jsx";
// import DigitalClock from "./DigitalClock.jsx";
// import { useGetWorkLogsQuery } from "../../slices/workingtime/worklogApiSlice.js";

// const Dashboard = () => {
//   const [filter, setFilter] = useState("group");
//   const [fromDate, setFromDate] = useState(dayjs());
//   const [toDate, setToDate] = useState(dayjs());

//   const getLogQuery = {
//     fromDate: fromDate ? fromDate.format("YYYY-MM-DD") : null,
//     toDate: toDate ? toDate.format("YYYY-MM-DD") : null,
//   }

//   const { data: workLogs = {},
//           isLoading: workLogsLoading,
//           error: workLogsError,
//   } = useGetWorkLogsQuery(getLogQuery);

//   return (
//     <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
//       {/* Title + Clock */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//         mx={3}
//       >
//         <Typography variant="h4" fontWeight={800} color="primary">
//           Team Activity
//         </Typography>
//         <DigitalClock />
//       </Box>

//       {/* Filters */}
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <Stack direction="row" spacing={2} alignItems="center" mb={3}>
//           <FormControl size="small" sx={{ minWidth: 160 }}>
//             <InputLabel>View</InputLabel>
//             <Select
//               value={filter}
//               label="View"
//               onChange={(e) => setFilter(e.target.value)}
//             >
//               <MenuItem value="group">Group</MenuItem>
//               <MenuItem value="individual">Individual</MenuItem>
//             </Select>
//           </FormControl>

//           <DatePicker
//             label="From"
//             value={fromDate}
//             onChange={(newValue) => setFromDate(newValue)}
//             slotProps={{ textField: { size: "small" } }}
//           />

//           <DatePicker
//             label="To"
//             value={toDate}
//             onChange={(newValue) => setToDate(newValue)}
//             slotProps={{ textField: { size: "small" } }}
//           />
//         </Stack>
//       </LocalizationProvider>

//       {/* Chart */}
//       <DashboardBarChart
//         filter={filter}
//         workLogs={workLogs}
//       />

//     </Box>
//   );
// };

// export default Dashboard;

import React, { useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  Chip,
  Divider,
  Skeleton,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import DashboardBarChart from "./DashboardBarChart.jsx";
import DigitalClock from "./DigitalClock.jsx";
import { useGetWorkLogsQuery } from "../../slices/workingtime/worklogApiSlice.js";

const Dashboard = () => {
  const [filter, setFilter] = useState("group");
  const [fromDate, setFromDate] = useState(dayjs().startOf("month"));
  const [toDate, setToDate] = useState(dayjs());

  // Stable handlers (minor, but helps when children are memoized)
  const onFilterChange = useCallback((e) => setFilter(e.target.value), []);
  const onFromChange = useCallback((v) => setFromDate(v), []);
  const onToChange = useCallback((v) => setToDate(v), []);

  // ✅ Memoize query object so RTK Query doesn't get a new object each render
  const getLogQuery = useMemo(
    () => ({
      fromDate: fromDate ? fromDate.format("YYYY-MM-DD") : null,
      toDate: toDate ? toDate.format("YYYY-MM-DD") : null,
    }),
    [fromDate, toDate]
  );

  const {
    data: workLogs = [],
    isLoading: workLogsLoading,
    error: workLogsError,
  } = useGetWorkLogsQuery(getLogQuery);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 3,
        width: "100%",
      }}
    >
      {/* Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          mb: 2.5,
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.12), rgba(156,39,176,0.08))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
              Team Activity
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              <Chip
                size="small"
                label={filter === "group" ? "Group view" : "Individual view"}
              />
              <Chip
                size="small"
                label={`${getLogQuery.fromDate} → ${getLogQuery.toDate}`}
                variant="outlined"
              />
            </Stack>
          </Box>

          {/* Keep clock isolated; make sure DigitalClock uses internal state only */}
          <DigitalClock />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Filters */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>View</InputLabel>
              <Select value={filter} label="View" onChange={onFilterChange}>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="individual">Individual</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="From"
              value={fromDate}
              onChange={onFromChange}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <DatePicker
              label="To"
              value={toDate}
              onChange={onToChange}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </Stack>
        </LocalizationProvider>
      </Paper>

      {/* Chart Card */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        }}
      >
        {workLogsLoading ? (
          <Skeleton variant="rounded" height={560} />
        ) : workLogsError ? (
          <Typography color="error">
            Failed to load work logs.
          </Typography>
        ) : (
          <DashboardBarChart filter={filter} workLogs={workLogs} />
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
