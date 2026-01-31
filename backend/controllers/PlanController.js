import Plan from "../models/planModel.js";
import PlanExecution from "../models/planExecutionModel.js";
import { normalizeDateMeta } from "../utils/dateUtils.js";
import User from "../models/userModel.js";
import Group from "../models/groupModel.js";

/* CREATE */
export const createPlan = async (req, res) => {
  try {
    const data = req.body;
    const { type, createdBy } = data;

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
      duplicateQuery.createdBy = createdBy
    }

    if (type === "WEEK") {
      if (!data.year || !data.month || !data.weekOfMonth) {
        throw new Error("Year, month, weekOfMonth are required for WEEK plan");
      }

      duplicateQuery.year = data.year;
      duplicateQuery.month = data.month;
      duplicateQuery.weekOfMonth = data.weekOfMonth;
      duplicateQuery.createdBy = createdBy

    }

    if (type === "DAY") {
      if (!data.date) {
        throw new Error("Date is required for DAY plan");
      }

      duplicateQuery.date = data.date;
      duplicateQuery.createdBy = createdBy

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
        createdBy: createdBy,
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
        createdBy: createdBy,
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
    if (type === "MONTH") {
      // Create MONTH, QUARTER, and YEAR execution summary docs
      const monthDate = new Date(data.year, data.month - 1, 1);

      // Monthly execution summary
      await createExecutionSummaryIfNotExists({
        date: monthDate,
        type: "MONTH",
        createdBy: createdBy
      });

      // Quarterly execution summary
      await createExecutionSummaryIfNotExists({
        date: monthDate,
        type: "QUARTER",
        createdBy: createdBy
      });

      // Yearly execution summary
      await createExecutionSummaryIfNotExists({
        date: monthDate,
        type: "YEAR",
        createdBy: createdBy
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
        createdBy: createdBy
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
    const { type, date, year, month, weekOfMonth, createdBy } = req.query;

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
        createdBy: createdBy,
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
        createdBy: createdBy,
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
        createdBy: createdBy,
      }).sort({ date: 1 });

      return res.json(dailyPlans);
    }

    return res.status(400).json({ message: "Invalid type" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGroupPlanByDate = async (req, res) => {
  try {
    const { type, year, month, weekOfMonth, date, groupId } = req.query;

    if (!type || !groupId) {
      return res.status(400).json({ message: "type and groupId are required" });
    }

    /* =========================
       1️⃣ GET GROUP MEMBERS
       ========================= */
    const members = await User.find({ group: groupId }).select("_id name");

    const memberIds = members.map(m => m._id);

    /* =========================
       2️⃣ BUILD PLAN QUERY
       ========================= */
    const query = {
      type,
      createdBy: { $in: memberIds }
    };

    if (type === "WEEK") {
      if (!year || !month || !weekOfMonth) {
        return res.status(400).json({ message: "year, month, weekOfMonth required" });
      }
      query.year = parseInt(year);
      query.month = parseInt(month);
      query.weekOfMonth = parseInt(weekOfMonth);
    }

    // if (type === "DAY") {
    //   if (!date) {
    //     return res.status(400).json({ message: "date required" });
    //   }

    //   const targetDate = new Date(date);
    //   query.year = targetDate.getFullYear();
    //   query.month = targetDate.getMonth() + 1;

    //   const firstDay = new Date(query.year, targetDate.getMonth(), 1);
    //   query.weekOfMonth = Math.ceil(
    //     (targetDate.getDate() + firstDay.getDay()) / 7
    //   );
    // }

    /* =========================
       3️⃣ FETCH ALL PLANS
       ========================= */
    const plans = await Plan.find(query);

    /* =========================
       4️⃣ MAP MEMBER → PLAN
       ========================= */
    const memberPlans = members.map(member => {
      const plan = plans.find(p => p.createdBy.equals(member._id)) || null;
      return {
        userId: member._id,
        name: member.name,
        plan
      };
    });

    /* =========================
    5️⃣ GROUP TOTAL SUMMARY
    ========================= */
    const groupTotal = {
      income: 0,
      totalBidAmount: 0,
      offeredJobAmount: 0,
      offeredTotalBudget: 0,
      postsNumber: 0,
      callNumber: 0,
      acquiredPeopleAmount: 0,
      majorHours: 0,
      englishHours: 0,
    };

    plans.forEach(plan => {
      if (!plan) return;

      // 1️⃣ Income
      groupTotal.income += plan.IncomePlan || 0;

      // 2️⃣ Offered jobs
      groupTotal.totalBidAmount += plan.biddingPlan?.totalBidAmount || 0;
      const offeredJobs = plan.biddingPlan?.offeredJobAmount || 0;
      groupTotal.offeredJobAmount += offeredJobs;

      // 3️⃣ Offered total budget (only if jobs exist)
      if (offeredJobs > 0) {
        groupTotal.offeredTotalBudget +=
          plan.biddingPlan?.offeredTotalBudget || 0;
      }

      // 4️⃣ Acquired people
      groupTotal.acquiredPeopleAmount +=
        plan.realguyPlan?.acquiredPeopleAmount || 0;
      groupTotal.callNumber += plan.realguyPlan.callNumber || 0;
      groupTotal.postsNumber += plan.realguyPlan.postsNumber || 0;

      groupTotal.majorHours += plan.qualificationPlan.majorHours || 0;
      groupTotal.englishHours += plan.qualificationPlan.englishHours || 0;
      
    });

    /* =========================
       GET GROUP
       ========================= */
    const group = await Group.findById(groupId).select("name manager");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    /* =========================
       6️⃣ RESPONSE
       ========================= */
    res.json({
      meta: { type, year, month, weekOfMonth, date, group },
      members: memberPlans,
      groupTotal
    });

  } catch (err) {
    console.error(err);
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
        query.createdBy = createdBy;
        executionData.year = meta.year;
        // Don't include quarter, month, week for YEAR type
        break;
      case "QUARTER":
        query.year = meta.year;
        query.quarter = meta.quarter;
        query.createdBy = createdBy;
        executionData.year = meta.year;
        executionData.quarter = meta.quarter;
        // Don't include month, week for QUARTER type
        break;
      case "MONTH":
        query.year = meta.year;
        query.month = meta.month;
        query.createdBy = createdBy;
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
        query.createdBy = createdBy;
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