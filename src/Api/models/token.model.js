import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  token: {
    type: String,
    required: true,
    index: true 
  },
  sig: { 
    type: String, 
    required: true 
  }, 
  intent: {
    type: String,
    required: true,
    enum: ["password-reset", "email-verification", "refresh-token"]
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

tokenSchema.index({ userId: 1, intent: 1 });

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model("Token", tokenSchema);
export default Token;