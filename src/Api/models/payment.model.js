import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    feeType: {
      type: String,
      enum: ["Tuition", "Exam Fee", "Uniform", "Other"],
      default: "Tuition",
    },

    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash", "POS"],
      required: true,
    },
    transactionReference: { type: String, unique: true },
    proofOfPayment: { type: String },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    term: { type: String, required: true },
    session: { type: String, required: true },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);
