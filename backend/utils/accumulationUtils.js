import PlanExecution from "../models/planExecutionModel.js";
import { normalizeDateMeta } from "./dateUtils.js";

/**
 * Accumulate daily execution data into weekly summary
 * Called after a daily execution is created/updated
 */
export async function accumulateDailyToWeekly(dailyExecution) {
  try {
    const meta = normalizeDateMeta(dailyExecution.date, "WEEK");

    // Use month from dailyExecution if available, otherwise from meta
    // This ensures we match the WEEK execution that was created with the same month
    const month = dailyExecution.month || meta.month;

    // Find all daily executions in this week
    const dailyExecutions = await PlanExecution.find({
      type: "DAY",
      year: meta.year,
      month: month,
      week: meta.week,
      createdBy : dailyExecution.createdBy,
    });

    // Calculate totals
    const totals = dailyExecutions.reduce(
      (acc, day) => {
        acc.IncomeActual += day.IncomeActual || 0;
        
        acc.biddingActual.totalBidAmount += day.biddingActual?.totalBidAmount || 0;
        acc.biddingActual.offeredJobAmount += day.biddingActual?.offeredJobAmount || 0;
        acc.biddingActual.offeredTotalBudget += day.biddingActual?.offeredTotalBudget || 0;
        
        acc.realguyActual.postsNumber += day.realguyActual?.postsNumber || 0;
        acc.realguyActual.callNumber += day.realguyActual?.callNumber || 0;
        acc.realguyActual.acquiredPeopleAmount += day.realguyActual?.acquiredPeopleAmount || 0;
        
        acc.qualificationActual.major += day.qualificationActual?.major || 0;
        acc.qualificationActual.english += day.qualificationActual?.english || 0;
        
        return acc;
      },
      {
        IncomeActual: 0,
        biddingActual: { totalBidAmount: 0, offeredJobAmount: 0, offeredTotalBudget: 0 },
        realguyActual: { postsNumber: 0, callNumber: 0, acquiredPeopleAmount: 0 },
        qualificationActual: { major: 0, english: 0, },
      }
    );

    // Update weekly summary - include month to match how WEEK executions are stored
    const weeklyExecution = await PlanExecution.findOneAndUpdate(
      {
        type: "WEEK",
        year: meta.year,
        month: month,
        week: meta.week,
        createdBy : dailyExecution.createdBy,
      },
      {
        $set: {
          IncomeActual: totals.IncomeActual,
          biddingActual: totals.biddingActual,
          realguyActual: totals.realguyActual,
          qualificationActual: totals.qualificationActual,
        },
      },
      { new: true }
    );

    if (!weeklyExecution) {
      console.warn(`WEEK execution not found for year: ${meta.year}, month: ${month}, week: ${meta.week}. Weekly summary may not exist yet.`);
      return null;
    }

    console.log(`Accumulated daily data into weekly summary for week ${meta.week} of month ${month}, year ${meta.year}`);
    return weeklyExecution;
  } catch (err) {
    console.error("Error accumulating daily to weekly:", err.message);
    throw err;
  }
}

/**
 * Accumulate weekly execution data into monthly summary
 * Called after a weekly execution is updated (from daily accumulation)
 */
export async function accumulateWeeklyToMonthly(weeklyExecution) {
  try {
    // Use stored year and month from weekly execution instead of recalculating from date
    // This ensures we match the actual stored values, avoiding timezone/date calculation issues
    const year = weeklyExecution.year;
    const month = weeklyExecution.month;

    if (!year || !month) {
      throw new Error(`Weekly execution missing year or month fields. Year: ${year}, Month: ${month}`);
    }

    // Find all weekly executions in this month
    const weeklyExecutions = await PlanExecution.find({
      type: "WEEK",
      year: year,
      month: month,
      createdBy: weeklyExecution.createdBy,
    });

    // Calculate totals
    const totals = weeklyExecutions.reduce(
      (acc, week) => {
        acc.IncomeActual += week.IncomeActual || 0;
        
        acc.biddingActual.totalBidAmount += week.biddingActual?.totalBidAmount || 0;
        acc.biddingActual.offeredJobAmount += week.biddingActual?.offeredJobAmount || 0;
        acc.biddingActual.offeredTotalBudget += week.biddingActual?.offeredTotalBudget || 0;
        
        acc.realguyActual.postsNumber += week.realguyActual?.postsNumber || 0;
        acc.realguyActual.callNumber += week.realguyActual?.callNumber || 0;
        acc.realguyActual.acquiredPeopleAmount += week.realguyActual?.acquiredPeopleAmount || 0;
        
        acc.qualificationActual.major += week.qualificationActual?.major || 0;
        acc.qualificationActual.english += week.qualificationActual?.english || 0;

        return acc;
      },
      {
        IncomeActual: 0,
        biddingActual: { totalBidAmount: 0, offeredJobAmount: 0, offeredTotalBudget: 0 },
        realguyActual: { postsNumber: 0, callNumber: 0, acquiredPeopleAmount: 0 },
        qualificationActual: { major: 0, english: 0, },
      }
    );

    // Calculate quarter from month
    const quarter = Math.ceil(month / 3);

    // Check if monthly execution exists, create if it doesn't
    let monthlyExecution = await PlanExecution.findOne({
      type: "MONTH",
      year: year,
      month: month,
      createdBy: weeklyExecution.createdBy,
    });

    if (!monthlyExecution) {
      // Create monthly execution if it doesn't exist
      const monthDate = new Date(year, month - 1, 1);
      monthlyExecution = await PlanExecution.create({
        date: monthDate,
        type: "MONTH",
        year: year,
        month: month,
        quarter: quarter,
        createdBy: weeklyExecution.createdBy, // Use createdBy from weekly execution
        IncomeActual: 0,
        biddingActual: {
          totalBidAmount: 0,
          offeredJobAmount: 0,
          offeredTotalBudget: 0,
        },
        realguyActual: {
          postsNumber: 0,
          callNumber: 0,
          acquiredPeopleAmount: 0,
        },
        qualificationActual: {
          major: '',
          english: '',
        },
      });
      console.log(`Created missing monthly execution for ${meta.month}/${meta.year}`);
    }

    // Update monthly summary
    monthlyExecution = await PlanExecution.findOneAndUpdate(
      {
        type: "MONTH",
        year: year,
        month: month,
        createdBy: weeklyExecution.createdBy,
      },
      {
        $set: {
          IncomeActual: totals.IncomeActual,
          biddingActual: totals.biddingActual,
          realguyActual: totals.realguyActual,
          qualificationActual: totals.qualificationActual,
        },
      },
      { new: true }
    );

    console.log(`Accumulated weekly data into monthly summary for ${month}/${year}`);
    
    // Do NOT cascade further - monthly accumulation should only happen when monthly execution is updated
    return monthlyExecution;
  } catch (err) {
    console.error("Error accumulating weekly to monthly:", err.message);
    throw err;
  }
}

/**
 * Accumulate monthly execution data into quarterly summary
 */
export async function accumulateMonthlyToQuarterly(monthlyExecution) {
  try {
    // Use stored year and quarter from monthly execution instead of recalculating from date
    const year = monthlyExecution.year;
    const quarter = monthlyExecution.quarter;

    if (!year || !quarter) {
      throw new Error(`Monthly execution missing year or quarter fields. Year: ${year}, Quarter: ${quarter}`);
    }

    // Find all monthly executions in this quarter
    const monthlyExecutions = await PlanExecution.find({
      type: "MONTH",
      year: year,
      quarter: quarter,
    });

    // Calculate totals
    const totals = monthlyExecutions.reduce(
      (acc, month) => {
        acc.IncomeActual += month.IncomeActual || 0;
        
        acc.biddingActual.totalBidAmount += month.biddingActual?.totalBidAmount || 0;
        acc.biddingActual.offeredJobAmount += month.biddingActual?.offeredJobAmount || 0;
        acc.biddingActual.offeredTotalBudget += month.biddingActual?.offeredTotalBudget || 0;
        
        acc.realguyActual.postsNumber += month.realguyActual?.postsNumber || 0;
        acc.realguyActual.callNumber += month.realguyActual?.callNumber || 0;
        acc.realguyActual.acquiredPeopleAmount += month.realguyActual?.acquiredPeopleAmount || 0;
        
        acc.qualificationActual.major += month.qualificationActual?.major || 0;
        acc.qualificationActual.english += month.qualificationActual?.english || 0;

        return acc;
      },
      {
        IncomeActual: 0,
        biddingActual: { totalBidAmount: 0, offeredJobAmount: 0, offeredTotalBudget: 0 },
        realguyActual: { postsNumber: 0, callNumber: 0, acquiredPeopleAmount: 0 },
        qualificationActual: { major: 0, english: 0, },
      }
    );

    // Check if quarterly execution exists, create if it doesn't
    let quarterlyExecution = await PlanExecution.findOne({
      type: "QUARTER",
      year: year,
      quarter: quarter,
    });

    if (!quarterlyExecution) {
      // Create quarterly execution if it doesn't exist
      const quarterDate = new Date(year, (quarter - 1) * 3, 1);
      quarterlyExecution = await PlanExecution.create({
        date: quarterDate,
        type: "QUARTER",
        year: year,
        quarter: quarter,
        createdBy: monthlyExecution.createdBy, // Use createdBy from monthly execution
        IncomeActual: 0,
        biddingActual: {
          totalBidAmount: 0,
          offeredJobAmount: 0,
          offeredTotalBudget: 0,
        },
        realguyActual: {
          postsNumber: 0,
          callNumber: 0,
          acquiredPeopleAmount: 0,
        },
        qualificationActual: {
          major: '',
          english: '',
        },
      });
      console.log(`Created missing quarterly execution for Q${quarter} ${year}`);
    }

    // Update quarterly summary
    quarterlyExecution = await PlanExecution.findOneAndUpdate(
      {
        type: "QUARTER",
        year: year,
        quarter: quarter,
        createdBy: monthlyExecution.createdBy,
      },
      {
        $set: {
          IncomeActual: totals.IncomeActual,
          biddingActual: totals.biddingActual,
          realguyActual: totals.realguyActual,
          qualificationActual: totals.qualificationActual,
        },
      },
      { new: true }
    );

    console.log(`Accumulated monthly data into quarterly summary for Q${quarter} ${year}`);
    
    // Do NOT cascade further - quarterly accumulation should only happen when quarterly execution is updated
    return quarterlyExecution;
  } catch (err) {
    console.error("Error accumulating monthly to quarterly:", err.message);
    throw err;
  }
}

/**
 * Accumulate quarterly execution data into yearly summary
 */
export async function accumulateQuarterlyToYearly(quarterlyExecution) {
  try {
    // Use stored year from quarterly execution instead of recalculating from date
    const year = quarterlyExecution.year;

    if (!year) {
      throw new Error(`Quarterly execution missing year field. Year: ${year}`);
    }

    // Find all quarterly executions in this year
    const quarterlyExecutions = await PlanExecution.find({
      type: "QUARTER",
      year: year,
      createdBy: quarterlyExecution.createdBy,
    });

    // Calculate totals
    const totals = quarterlyExecutions.reduce(
      (acc, quarter) => {
        acc.IncomeActual += quarter.IncomeActual || 0;
        
        acc.biddingActual.totalBidAmount += quarter.biddingActual?.totalBidAmount || 0;
        acc.biddingActual.offeredJobAmount += quarter.biddingActual?.offeredJobAmount || 0;
        acc.biddingActual.offeredTotalBudget += quarter.biddingActual?.offeredTotalBudget || 0;
        
        acc.realguyActual.postsNumber += quarter.realguyActual?.postsNumber || 0;
        acc.realguyActual.callNumber += quarter.realguyActual?.callNumber || 0;
        acc.realguyActual.acquiredPeopleAmount += quarter.realguyActual?.acquiredPeopleAmount || 0;
        
        acc.qualificationActual.major += quarter.qualificationActual?.major || 0;
        acc.qualificationActual.english += quarter.qualificationActual?.english || 0;
        
        return acc;
      },
      {
        IncomeActual: 0,
        biddingActual: { totalBidAmount: 0, offeredJobAmount: 0, offeredTotalBudget: 0 },
        realguyActual: { postsNumber: 0, callNumber: 0, acquiredPeopleAmount: 0 },
        qualificationActual: { major: 0, english: 0, },
      }
    );

    // Check if yearly execution exists, create if it doesn't
    let yearlyExecution = await PlanExecution.findOne({
      type: "YEAR",
      year: year,
      createdBy: quarterlyExecution.createdBy,
    });

    if (!yearlyExecution) {
      // Create yearly execution if it doesn't exist
      const yearDate = new Date(year, 0, 1);
      yearlyExecution = await PlanExecution.create({
        date: yearDate,
        type: "YEAR",
        year: year,
        createdBy: quarterlyExecution.createdBy, // Use createdBy from quarterly execution
        IncomeActual: 0,
        biddingActual: {
          totalBidAmount: 0,
          offeredJobAmount: 0,
          offeredTotalBudget: 0,
        },
        realguyActual: {
          postsNumber: 0,
          callNumber: 0,
          acquiredPeopleAmount: 0,
        },
        qualificationActual: {
          major: '',
          english: '',
        },
      });
      console.log(`Created missing yearly execution for ${year}`);
    }

    // Update yearly summary
    yearlyExecution = await PlanExecution.findOneAndUpdate(
      {
        type: "YEAR",
        year: year,
      },
      {
        $set: {
          IncomeActual: totals.IncomeActual,
          biddingActual: totals.biddingActual,
          realguyActual: totals.realguyActual,
          qualificationActual: totals.qualificationActual,
        },
      },
      { new: true }
    );

    console.log(`Accumulated quarterly data into yearly summary for ${year}`);
    return yearlyExecution;
  } catch (err) {
    console.error("Error accumulating quarterly to yearly:", err.message);
    throw err;
  }
}

/**
 * Trigger full accumulation cascade from daily execution
 * Daily → Weekly → Monthly → Quarterly → Yearly (all at once)
 * This is the ONLY place where cascading happens - other levels don't cascade
 */
export async function triggerAccumulationCascade(dailyExecution) {
  try {
    // Step 1: Accumulate daily → weekly
    const weeklyExecution = await accumulateDailyToWeekly(dailyExecution);
    
    if (!weeklyExecution) {
      console.warn("Weekly execution not found, accumulation stopped at weekly level");
      return;
    }

    // Step 2: Accumulate weekly → monthly
    const monthlyExecution = await accumulateWeeklyToMonthly(weeklyExecution);
    
    if (!monthlyExecution) {
      console.warn("Monthly execution not found, accumulation stopped at monthly level");
      return;
    }

    // Step 3: Accumulate monthly → quarterly
    const quarterlyExecution = await accumulateMonthlyToQuarterly(monthlyExecution);
    
    if (!quarterlyExecution) {
      console.warn("Quarterly execution not found, accumulation stopped at quarterly level");
      return;
    }

    // Step 4: Accumulate quarterly → yearly
    await accumulateQuarterlyToYearly(quarterlyExecution);

    console.log("Accumulation cascade completed: Daily → Weekly → Monthly → Quarterly → Yearly");
  } catch (err) {
    console.error("Error in accumulation cascade:", err.message);
    throw err;
  }
}