import mongoose, { Schema } from "mongoose";

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
      amount: { type: Number, default: 0 },
      paymentMethod: { type: String, default: "Paypal" },  // e.g., "Paypal", "Payoneer", etc.
    },

    Expenditure: {
      amount: { type: Number, default: 0 },
      paymentMethod: { type: String, default: "Paypal" },  // e.g., "Paypal", "Payoneer", etc.
    },
    
    // 2️⃣ Bidding Actual
    biddingActual: {
      totalBidAmount: { type: Number, default: 0 },
      AccountForBid: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
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