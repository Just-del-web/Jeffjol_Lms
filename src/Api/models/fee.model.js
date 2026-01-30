import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, default: "Termly School Fees" },
    targetClass: {
      type: String,
      enum: ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3", "ALL"],
      required: true,
    },
    amount: { type: Number, required: true }, 
    term: { type: String, enum: ["First", "Second", "Third"], required: true },
    session: { type: String, required: true }, 

    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

feeSchema.index({ targetClass: 1, term: 1, session: 1 }, { unique: true });

export const Fee = mongoose.model("Fee", feeSchema);
