import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack
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
  const [fromDate, setFromDate] = useState(dayjs());
  const [toDate, setToDate] = useState(dayjs());

  const getLogQuery = {
    fromDate: fromDate ? fromDate.format("YYYY-MM-DD") : null,
    toDate: toDate ? toDate.format("YYYY-MM-DD") : null,
  }

  const { data: workLogs = {},
          isLoading: workLogsLoading,
          error: workLogsError,
  } = useGetWorkLogsQuery(getLogQuery);

  return (
    <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
      {/* Title + Clock */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        mx={3}
      >
        <Typography variant="h4" fontWeight={800} color="primary">
          Team Activity
        </Typography>
        <DigitalClock />
      </Box>

      {/* Filters */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={filter}
              label="View"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="group">Group</MenuItem>
              <MenuItem value="individual">Individual</MenuItem>
            </Select>
          </FormControl>

          <DatePicker
            label="From"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            slotProps={{ textField: { size: "small" } }}
          />

          <DatePicker
            label="To"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            slotProps={{ textField: { size: "small" } }}
          />
        </Stack>
      </LocalizationProvider>

      {/* Chart */}
      <DashboardBarChart
        filter={filter}
        workLogs={workLogs}
      />

    </Box>
  );
};

export default Dashboard;
