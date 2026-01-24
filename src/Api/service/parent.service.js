import { User } from '../models/User.js';
import { Result } from '../models/Result.js';
import { Payment } from '../models/Payment.js';

export const getChildAcademicSummary = async (parentId) => {
  const child = await User.findOne({ parentId });
  if (!child) throw new Error('No child linked to this parent account');

  const [results, payments] = await Promise.all([
    Result.find({ student: child._id }).sort({ uploadedAt: -1 }),
    Payment.find({ student: child._id }).sort({ createdAt: -1 })
  ]);

  return {
    childProfile: { name: child.name, email: child.email },
    academicHistory: results,
    financialHistory: payments
  };
};