import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reference: { type: String, unique: true, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  purpose: { type: String, default: 'Tuition' },
  paidAt: Date
});

export const Payment = mongoose.model('Payment', paymentSchema);