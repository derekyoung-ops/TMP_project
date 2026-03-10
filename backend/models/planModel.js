import mongoose, { Schema } from "mongoose";

const planSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["MONTH", "WEEK", "DAY"],
    required: true,
    index: true,
  },

  // 🔐 Identity fields
  year: Number,
  month: Number,        // 1–12
  weekOfMonth: Number,  // 1–5
  date: Date,           // for DAY

  parentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    default: null,
  },

  // 1️⃣ Income Plan
  IncomePlan: {
    amount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "Paypal" },  // e.g., "Paypal", "Payoneer", etc.
  },
  ExpenditurePlan: {
    amount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "Paypal" },  // e.g., "Paypal", "Payoneer", etc.
  },

  // 2️⃣ Bidding Plan
  biddingPlan: {
    totalBidAmount: { type: Number, default: 0 },
    AccountForBid: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
    offeredJobAmount: { type: Number, default: 0 },
    offeredTotalBudget: { type: Number, default: 0 },
  },

  // 3️⃣ Acquisition Plan
  realguyPlan: {
    postsNumber: { type: Number, default: 0 },
    callNumber: { type: Number, default: 0 },
    acquiredPeopleAmount: { type: Number, default: 0 },
  },

  // 4️⃣ Qualification Enhancement Plan
  qualificationPlan: {
    majorHours: { type: Number, default: 0 },
    englishHours: { type: Number, default: 0 },
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  del_flag: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
