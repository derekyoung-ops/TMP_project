import mongoose from "mongoose";

const PlanExecutionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    type: {
      type: String,
      enum: ["YEAR", "QUARTER", "MONTH", "WEEK", "DAY"],
      required: true,
    },

    year: Number,
    quarter: Number,
    month: Number,
    week: Number,

    // 1️⃣ Income Actual
    IncomeActual: {
      type: Number,
      default: 0,
    },
    
    // 2️⃣ Bidding Actual
    biddingActual: {
      totalBidAmount: { type: Number, default: 0 },
      offeredJobAmount: { type: Number, default: 0 },
      offeredTotalBudget: { type: Number, default: 0 },
    },

    // 3️⃣ Acquisition Actual
    realguyActual: {
      postsNumber: { type: Number, default: 0 },
      callNumber: { type: Number, default: 0 },
      acquiredPeopleAmount: { type: Number, default: 0 },
    },

    qualificationActual: {
      major: { type: Number, default: 0 },
      english: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlanExecution", PlanExecutionSchema);