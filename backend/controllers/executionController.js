import PlanExecution from "../models/planExecutionModel.js";
import { normalizeDateMeta } from "../utils/dateUtils.js";
import {
  triggerAccumulationCascade,
  accumulateWeeklyToMonthly,
  accumulateMonthlyToQuarterly,
  accumulateQuarterlyToYearly
} from "../utils/accumulationUtils.js";
import Group from "../models/groupModel.js";
import User from "../models/userModel.js";

export const createPlanExecution = async (req, res) => {
  try {
    const { date, type, createdBy, ...payload } = req.body;

    if (!date || !type) {
      return res.status(400).json({ message: "date and type are required" });
    }

    // Handle typo: creatdBy -> createdBy, or use req.user if available
    const userId = createdBy || req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "createdBy is required" });
    }

    const meta = normalizeDateMeta(date, type);

    // Normalize payload data: convert strings to numbers, handle empty strings
    const normalizedPayload = { ...payload };

    // Convert IncomeActual to number
    if (normalizedPayload.IncomeActual !== undefined) {
      normalizedPayload.IncomeActual = normalizedPayload.IncomeActual === '' ? 0 : Number(normalizedPayload.IncomeActual) || 0;
    }

    // Normalize biddingActual
    if (normalizedPayload.biddingActual) {
      normalizedPayload.biddingActual = {
        totalBidAmount: normalizedPayload.biddingActual.totalBidAmount === '' ? 0 : Number(normalizedPayload.biddingActual.totalBidAmount) || 0,
        offeredJobAmount: normalizedPayload.biddingActual.offeredJobAmount === '' ? 0 : Number(normalizedPayload.biddingActual.offeredJobAmount) || 0,
        offeredTotalBudget: normalizedPayload.biddingActual.offeredTotalBudget === '' ? 0 : Number(normalizedPayload.biddingActual.offeredTotalBudget) || 0,
      };
    }

    // Normalize realguyActual
    if (normalizedPayload.realguyActual) {
      normalizedPayload.realguyActual = {
        postsNumber: normalizedPayload.realguyActual.postsNumber === '' ? 0 : Number(normalizedPayload.realguyActual.postsNumber) || 0,
        callNumber: normalizedPayload.realguyActual.callNumber === '' ? 0 : Number(normalizedPayload.realguyActual.callNumber) || 0,
        acquiredPeopleAmount: normalizedPayload.realguyActual.acquiredPeopleAmount === '' ? 0 : Number(normalizedPayload.realguyActual.acquiredPeopleAmount) || 0,
      };
    }

    // Normalize qualificationActual: handle majorHours/englishHours -> major/english
    if (normalizedPayload.qualificationActual) {
      normalizedPayload.qualificationActual = {
        major: normalizedPayload.qualificationActual.majorHours || normalizedPayload.qualificationActual.major || '',
        english: normalizedPayload.qualificationActual.englishHours || normalizedPayload.qualificationActual.english || '',
      };
    }

    // Build uniqueness query based on type
    let uniqueQuery = { type };
    let executionData = {
      date: meta.date,
      type,
      createdBy: userId,
      ...normalizedPayload,
    };

    switch (type) {
      case "YEAR":
        uniqueQuery.year = meta.year;
        uniqueQuery.createdBy = createdBy;
        executionData.year = meta.year;
        // Don't include quarter, month, week for YEAR type
        break;
      case "QUARTER":
        uniqueQuery.year = meta.year;
        uniqueQuery.quarter = meta.quarter;
        uniqueQuery.createdBy = createdBy;
        executionData.year = meta.year;
        executionData.quarter = meta.quarter;
        // Don't include month, week for QUARTER type
        break;
      case "MONTH":
        uniqueQuery.year = meta.year;
        uniqueQuery.month = meta.month;
        uniqueQuery.createdBy = createdBy;
        executionData.year = meta.year;
        executionData.month = meta.month;
        executionData.quarter = meta.quarter; // Include quarter for aggregation
        // Don't include week for MONTH type
        break;
      case "WEEK":
        uniqueQuery.year = meta.year;
        uniqueQuery.week = meta.week;
        uniqueQuery.createdBy = createdBy;
        executionData.year = meta.year;
        executionData.week = meta.week;
        executionData.month = meta.month; // Include month for aggregation
        executionData.quarter = meta.quarter; // Include quarter for aggregation
        break;
      case "DAY":
        uniqueQuery.year = meta.year;
        uniqueQuery.week = meta.week;
        uniqueQuery.date = meta.date;
        uniqueQuery.createdBy = createdBy;
        executionData.year = meta.year;
        executionData.week = meta.week;
        executionData.date = meta.date;
        executionData.month = meta.month; // Include month for aggregation
        executionData.quarter = meta.quarter; // Include quarter for aggregation
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    // Check for duplicates
    const existing = await PlanExecution.findOne(uniqueQuery);

    if (existing) {
      return res.status(409).json({
        message: `${type} execution already exists for this period`,
      });
    }

    // Create execution
    const execution = await PlanExecution.create(executionData);

    // Trigger accumulation cascade if this is a daily execution
    if (type === "DAY") {
      try {
        await triggerAccumulationCascade(execution);
      } catch (accErr) {
        console.error("Accumulation error:", accErr.message);
        // Don't fail the response, just log the error
      }
    }

    res.status(201).json(execution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePlanExecution = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const execution = await PlanExecution.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!execution) {
      return res.status(404).json({ message: "Execution not found" });
    }

    // Trigger accumulation to next level based on execution type
    // Each level only accumulates to its immediate parent
    try {
      switch (execution.type) {
        case "DAY":
          // Daily → Weekly only
          await triggerAccumulationCascade(execution);
          break;
        case "WEEK":
          // Weekly → Monthly only
          await accumulateWeeklyToMonthly(execution);
          break;
        case "MONTH":
          // Monthly → Quarterly only
          await accumulateMonthlyToQuarterly(execution);
          break;
        case "QUARTER":
          // Quarterly → Yearly only
          await accumulateQuarterlyToYearly(execution);
          break;
        // YEAR has no parent, so no accumulation needed
      }
    } catch (accErr) {
      console.error("Accumulation error:", accErr.message);
      // Don't fail the response, just log the error
    }

    res.json(execution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPlanExecutionByDate = async (req, res) => {
  try {
    const { date, type, year, month, weekOfMonth, createdBy } = req.query;

    if (!date || !type) {
      return res.status(400).json({ message: "date and type required" });
    }

    const meta = normalizeDateMeta(date, type);

    let query;
    let result;

    switch (type) {
      // 🔹 DAY → load ALL days of the same week
      case "DAY":
        query = {
          type: "DAY",
          year: meta.year,
          week: meta.week,
          createdBy: createdBy
        };

        result = await PlanExecution.find(query).sort({ date: 1 });
        break;

      // 🔹 WEEK → single week record
      // Use weekOfMonth from query if provided, otherwise calculate from date
      case "WEEK":
        const weekYear = year ? parseInt(year) : meta.year;
        const weekMonth = month ? parseInt(month) : meta.month;
        const week = weekOfMonth ? parseInt(weekOfMonth) : meta.week;

        query = {
          type: "WEEK",
          year: weekYear,
          month: weekMonth,
          week: week,
          createdBy: createdBy,
        };

        result = await PlanExecution.findOne(query);
        break;

      // 🔹 MONTH → single month record
      case "MONTH":
        query = {
          type: "MONTH",
          year: meta.year,
          month: meta.month,
          createdBy: createdBy,
        };

        result = await PlanExecution.findOne(query);
        break;

      // 🔹 QUARTER → single quarter record
      case "QUARTER":
        query = {
          type: "QUARTER",
          year: meta.year,
          quarter: meta.quarter,
          createdBy: createdBy,
        };

        result = await PlanExecution.findOne(query);
        break;

      // 🔹 YEAR → single year record
      case "YEAR":
        query = {
          type: "YEAR",
          year: meta.year,
          createdBy: createdBy,
        };

        result = await PlanExecution.findOne(query);
        break;

      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    res.json(result || (type === "DAY" ? [] : null));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGroupExecution = async (req, res) => {
  try {
    const { groupId, date, type, year, month, weekOfMonth } = req.query;

    if (!groupId || !date || !type) {
      return res.status(400).json({ message: "groupId, date, and type are required" });
    }

    const meta = normalizeDateMeta(date, type);

    /* =========================
       1️⃣ GET GROUP MEMBERS
       ========================= */
    const members = await User.find({ group: groupId }).select("_id name");

    const memberIds = members.map(m => m._id);
    /* =========================
    2️⃣ BUILD QUERY
    ========================= */
    let query = {
      type,
      createdBy: { $in: memberIds }
    };

    switch (type) {
      case "DAY":
        query.year = meta.year;
        query.week = meta.week;
        query.date = meta.date;
        break;

      case "WEEK":
        const weekYear = year ? parseInt(year) : meta.year;
        const weekMonth = month ? parseInt(month) : meta.month;
        const week = weekOfMonth ? parseInt(weekOfMonth) : meta.week;
        query.year = weekYear;
        query.month = weekMonth;
        query.week = week;

        break;

      case "MONTH":
        query.year = meta.year;
        query.month = month ? parseInt(month) : meta.month;
        break;

      case "YEAR":
        query.year = meta.year;
        break;

      default:
        return res.status(400).json({ message: "Invalid type" });
    }
    /* =========================
    4️⃣ FETCH EXECUTIONS
    ========================= */
    const executions = await PlanExecution.find(query).lean();

    /* =========================
    5️⃣ MAP MEMBER → EXECUTION
    ========================= */
    const memberExecutions = members.map(member => {
      const execution =
        executions.find(e => e.createdBy.equals(member._id)) || null;

      return {
        userId: member._id,
        name: member.name,
        execution
      };
    });

    /* =========================
    6️⃣ GROUP TOTAL SUMMARY
    ========================= */
    const groupTotal = {
      income: 0,
      totalBidAmount: 0,
      offeredJobAmount: 0,
      offeredTotalBudget: 0,
      postsNumber: 0,
      callNumber: 0,
      acquiredPeopleAmount: 0,
      major: 0,
      english: 0
    };

    executions.forEach(exe => {
      if (!exe) return;

      groupTotal.income += exe.IncomeActual || 0;

      groupTotal.totalBidAmount +=
        exe.biddingActual?.totalBidAmount || 0;

      const offeredJobs = exe.biddingActual?.offeredJobAmount || 0;
      groupTotal.offeredJobAmount += offeredJobs;

      if (offeredJobs > 0) {
        groupTotal.offeredTotalBudget +=
          exe.biddingActual?.offeredTotalBudget || 0;
      }

      groupTotal.acquiredPeopleAmount +=
        exe.realguyActual?.acquiredPeopleAmount || 0;
      groupTotal.callNumber +=
        exe.realguyActual?.callNumber || 0;

      groupTotal.major +=
        exe.qualificationActual?.major || 0;
      groupTotal.english +=
        exe.qualificationActual?.english || 0;

    });
    /* =========================
       GET GROUP
       ========================= */
    const group = await Group.findById(groupId).select("name manager");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    /* =========================
    8️⃣ RESPONSE (UI READY)
    ========================= */
    res.json({
      meta: {
        type,
        year: meta.year,
        month: meta.month,
        week: meta.week,
        date,
        group: group
      },
      members: memberExecutions,
      groupTotal
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};