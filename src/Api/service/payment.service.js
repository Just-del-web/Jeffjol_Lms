import { Payment } from '../models/Payment.js';
import axios from 'axios';

export const verifyPayment = async (reference) => {
  const secretKey = process.env.PAYMENT_SECRET_KEY;
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` }
  });

  if (response.data.data.status === 'success') {
    return await Payment.findOneAndUpdate(
      { reference },
      { status: 'success', paidAt: new Date() },
      { new: true }
    );
  }
  throw new Error('Payment verification failed');
};