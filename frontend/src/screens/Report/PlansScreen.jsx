import React, { useState } from 'react'
import MonthlyPlans from '../../components/plan/MonthlyPlan'
import WeeklyPlans from '../../components/plan/WeeklyPlan'
import { Box, Divider } from '@mui/material'
import DailyPlan from '../../components/plan/DailyPlan'
import CreatePlanDialog from '../../components/plan/CreatePlanDialog'
import CreateExecutionDialog from '../../components/plan/ExecutionPlanDialog'

const PlansScreen = () => {
  const [openPlanDialog, setOpenPlanDialog] = useState(false);
  const [openExcutionDialog, setOpenExcutionDialog] = useState(false);
  const [executionDay, setExecutionDay] = useState("")
  const [type, setType] = useState("")

  const openDialog = () => setOpenPlanDialog(true);
  const closeDialog = () => setOpenPlanDialog(false);
  const closeExcutionDialog = () => setOpenExcutionDialog(false);

  const getPlanTimeMeta = (type) => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1–12 

    if (type === "MONTH") {
      return { year, month };
    }

    if (type === "WEEK") {
      const firstDayOfMonth = new Date(year, now.getMonth(), 1);
      const weekOfMonth = Math.ceil((now.getDate() + firstDayOfMonth.getDay()) / 7);
      return { year, month, weekOfMonth };
    }

    if (type === "DAY") {
      return {
        date: now.toISOString().split("T")[0], // YYYY-MM-DD 
      };
    }

    return {};
  }

  const makePlanTimeMeta = (type) => {
    const now = new Date();

    if (type === "MONTH") {
      const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      return {
        year: next.getFullYear(),
        month: next.getMonth() + 1, // 1–12
      };
    }

    if (type === "WEEK") {
      // move to next week
      const next = new Date(now);
      next.setDate(now.getDate() + 7);

      const year = next.getFullYear();
      const month = next.getMonth() + 1;

      const firstDayOfMonth = new Date(year, next.getMonth(), 1);
      const weekOfMonth = Math.ceil(
        (next.getDate() + firstDayOfMonth.getDay()) / 7
      );

      return { year, month, weekOfMonth };
    }

    if (type === "DAY") {
      const next = new Date(now);
      next.setDate(now.getDate() + 1);

      return {
        date: next.toISOString().split("T")[0], // YYYY-MM-DD
      };
    }

    return {};
  };

  return (
    <>
      <div style={{ width: "100vw" }}>
        <MonthlyPlans
          openPlanDialog={openDialog}
          setType={setType}
          makePlanTimeMeta={makePlanTimeMeta}
          getPlanTimeMeta={getPlanTimeMeta}
          type={type}
        />
        <Divider sx={{ my: 3 }} />
        <WeeklyPlans
          openPlanDialog={openDialog}
          setType={setType}
          makePlanTimeMeta={makePlanTimeMeta}
          getPlanTimeMeta={getPlanTimeMeta}
          type={type}
        />
        <Divider sx={{ my: 3 }} />
        <DailyPlan
          setOpenExcutionDialog={setOpenExcutionDialog}
          openPlanDialog={openDialog}
          setType={setType}
          makePlanTimeMeta={makePlanTimeMeta}
          getPlanTimeMeta={getPlanTimeMeta}
          type={type}
          setExecutionDay = {setExecutionDay}
        />
        <CreatePlanDialog
          open={openPlanDialog}
          onClose={closeDialog}
          type={type}
          makePlanTimeMeta={makePlanTimeMeta}
          getPlanTimeMeta={getPlanTimeMeta}
        />
        <CreateExecutionDialog 
          open={openExcutionDialog}
          onClose={closeExcutionDialog}
          type={type}
          executionDay={executionDay}
        />
      </div>
    </>
  )
}

export default PlansScreen