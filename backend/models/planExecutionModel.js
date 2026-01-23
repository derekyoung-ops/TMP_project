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
      major: String,
      english: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/* 🔐 Prevent duplicates - sparse index to handle null values */
PlanExecutionSchema.index(
  { type : 1, year: 1, quarter: 1, month: 1, week: 1, date: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("PlanExecution", PlanExecutionSchema);