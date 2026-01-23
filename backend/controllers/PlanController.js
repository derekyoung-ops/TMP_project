import Plan from "../models/planModel.js";
import PlanExecution from "../models/planExecutionModel.js";
import { normalizeDateMeta } from "../utils/dateUtils.js";

/* CREATE */
export const createPlan = async (req, res) => {
  try {
    const data = req.body;
    const { type } = data;

    if (!type) {
      return res.status(400).json({ message: "Plan type is required" });
    }

    
    
    /* =========================
    1️⃣ PREVENT DUPLICATES
    ========================= */
    
    let duplicateQuery = { type };
    
    if (type === "MONTH") {

      if (!data.year || !data.month) {
        throw new Error("Year and month are required for MONTH plan");
      }

      duplicateQuery.year = data.year;
      duplicateQuery.month = data.month;
    }

    if (type === "WEEK") {
      if (!data.year || !data.month || !data.weekOfMonth) {
        throw new Error("Year, month, weekOfMonth are required for WEEK plan");
      }

      duplicateQuery.year = data.year;
      duplicateQuery.month = data.month;
      duplicateQuery.weekOfMonth = data.weekOfMonth;
    }

    if (type === "DAY") {
      if (!data.date) {
        throw new Error("Date is required for DAY plan");
      }

      duplicateQuery.date = data.date;
    }

    const existingPlan = await Plan.findOne(duplicateQuery);
    if (existingPlan) {
      return res.status(409).json({
        message: `${type} plan already exists`,
      });
    }

    /* =========================
       2️⃣ FEASIBILITY CHECKS
       ========================= */

    if (type === "WEEK") {
      const parentMonth = await Plan.findOne({
        type: "MONTH",
        year: data.year,
        month: data.month,
      });

      if (!parentMonth) {
        return res.status(400).json({
          message: "Cannot create WEEK plan without MONTH plan",
        });
      }

      data.parentPlanId = parentMonth._id;
    }

    if (type === "DAY") {
      const targetDate = new Date(data.date);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      const firstDayOfMonth = new Date(year, targetDate.getMonth(), 1);
      const weekOfMonth = Math.ceil(
        (targetDate.getDate() + firstDayOfMonth.getDay()) / 7
      );

      const parentWeek = await Plan.findOne({
        type: "WEEK",
        year,
        month,
        weekOfMonth,
      });

      if (!parentWeek) {
        return res.status(400).json({
          message: "Cannot create DAY plan without WEEK plan",
        });
      }

      data.year = year;
      data.month = month;
      data.weekOfMonth = weekOfMonth;
      data.parentPlanId = parentWeek._id;
    }

    /* =========================
       3️⃣ CREATE PLAN
       ========================= */

    const plan = await Plan.create(data);

    /* =========================
       4️⃣ CREATE SUMMARY EXECUTION DOCS
       ========================= */

    const createdBy = data.createdBy;

    if (type === "MONTH") {
      // Create MONTH, QUARTER, and YEAR execution summary docs
      const monthDate = new Date(data.year, data.month - 1, 1);
      
      // Monthly execution summary
      await createExecutionSummaryIfNotExists({
        date: monthDate,
        type: "MONTH",
        createdBy
      });

      // Quarterly execution summary
      await createExecutionSummaryIfNotExists({
        date: monthDate,
        type: "QUARTER",
        createdBy
      });

      // Yearly execution summary
      await createExecutionSummaryIfNotExists({
        date: monthDate,
        type: "YEAR",
        createdBy
      });
    }

    if (type === "WEEK") {
      // Create WEEK execution summary doc with year, month, and weekOfMonth
      const firstDayOfMonth = new Date(data.year, data.month - 1, 1);
      const weekStartDay = (data.weekOfMonth - 1) * 7 + 1;
      const weekDate = new Date(data.year, data.month - 1, weekStartDay);

      await createExecutionSummaryIfNotExists({
        date: weekDate,
        type: "WEEK",
        year: data.year,
        month: data.month,
        weekOfMonth: data.weekOfMonth,
        createdBy
      });
    }

    // DAY plans don't create execution summaries

    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* UPDATE */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow changing type or date-related fields
    const protectedFields = ['type', 'year', 'month', 'weekOfMonth', 'date', 'quarter', 'createdBy', 'parentPlanId'];
    protectedFields.forEach(field => delete updateData[field]);

    const plan = await Plan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET BY DATE */
export const getPlanByDate = async (req, res) => {
  try {
    const { type, date, year, month, weekOfMonth } = req.query;

    if (!type) {
      return res.status(400).json({ message: "type is required" });
    }

    /* =========================
       MONTH
       ========================= */
    if (type === "MONTH") {
      if (!year || !month) {
        return res.status(400).json({
          message: "year and month are required for MONTH type",
        });
      }

      const monthPlan = await Plan.findOne({
        type: "MONTH",
        year: parseInt(year),
        month: parseInt(month),
      });

      return res.json(monthPlan || null);
    }

    /* =========================
       WEEK
       ========================= */
    if (type === "WEEK") {
      if (!year || !month || !weekOfMonth) {
        return res.status(400).json({
          message: "year, month and weekOfMonth are required for WEEK type",
        });
      }

      const weekPlan = await Plan.findOne({
        type: "WEEK",
        year: parseInt(year),
        month: parseInt(month),
        weekOfMonth: parseInt(weekOfMonth),
      });

      return res.json(weekPlan || null);
    }

    /* =========================
       DAY → return ALL days in that week
       ========================= */
    if (type === "DAY") {
      if (!date) {
        return res.status(400).json({
          message: "date is required for DAY type",
        });
      }

      const targetDate = new Date(date);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      // calculate week of month
      const firstDayOfMonth = new Date(year, targetDate.getMonth(), 1);
      const weekOfMonth = Math.ceil(
        (targetDate.getDate() + firstDayOfMonth.getDay()) / 7
      );

      // get ALL daily plans in this week
      const dailyPlans = await Plan.find({
        type: "DAY",
        year,
        month,
        weekOfMonth,
      }).sort({ date: 1 });

      return res.json(dailyPlans);
    }

    return res.status(400).json({ message: "Invalid type" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   HELPER: Create Execution Summary If Not Exists
   ========================= */
async function createExecutionSummaryIfNotExists({ date, type, year, month, weekOfMonth, createdBy }) {
  try {
    const meta = normalizeDateMeta(date, type);

    // Build uniqueness query based on type
    let query = { type };
    let executionData = {
      date: meta.date,
      type,
      createdBy,
      // Initialize with zeros
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
        major: 0,
        english: 0,
      }
    };

    switch (type) {
      case "YEAR":
        query.year = meta.year;
        executionData.year = meta.year;
        // Don't include quarter, month, week for YEAR type
        break;
      case "QUARTER":
        query.year = meta.year;
        query.quarter = meta.quarter;
        executionData.year = meta.year;
        executionData.quarter = meta.quarter;
        // Don't include month, week for QUARTER type
        break;
      case "MONTH":
        query.year = meta.year;
        query.month = meta.month;
        executionData.year = meta.year;
        executionData.month = meta.month;
        executionData.quarter = meta.quarter; // Include quarter for aggregation
        // Don't include week for MONTH type
        break;
      case "WEEK":
        // For WEEK, use the provided year, month, and weekOfMonth
        query.year = year;
        query.month = month;
        query.week = weekOfMonth; // Store weekOfMonth in the 'week' field
        executionData.year = year;
        executionData.month = month;
        executionData.week = weekOfMonth;
        executionData.quarter = meta.quarter; // Include quarter for aggregation
        break;
      default:
        throw new Error(`Invalid type for summary creation: ${type}`);
    }

    // Check if already exists
    const existing = await PlanExecution.findOne(query);

    if (existing) {
      console.log(`${type} execution summary already exists, skipping creation`);
      return existing;
    }

    const execution = await PlanExecution.create(executionData);
    console.log(`Created ${type} execution summary:`, execution._id);
    return execution;

  } catch (err) {
    console.error(`Error creating ${type} execution summary:`, err.message);
    throw err;
  }
}