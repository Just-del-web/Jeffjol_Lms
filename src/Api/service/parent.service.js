import { User } from '../models/user.model.js';
import { Result } from '../models/result.model.js';
import { Payment } from '../models/payment.model.js';

export const getParentDashboardData = async (parentId) => {
  
  const children = await User.find({ parent: parentId }).lean();
  
  if (!children || children.length === 0) {
    throw new Error('No children linked to this parent account');
  }

  const familyData = await Promise.all(children.map(async (child) => {
    const [results, payments] = await Promise.all([
      Result.find({ student: child._id }).sort({ createdAt: -1 }).limit(5),
      Payment.find({ student: child._id }).sort({ createdAt: -1 }).limit(5)
    ]);

    return {
      _id: child._id,
      firstName: child.firstName,
      lastName: child.lastName,
      currentClass: child.currentClass || "SS1",
      email: child.email,
      academicHistory: results,
      financialHistory: payments,
      performanceAverage: results.length > 0 
        ? (results.reduce((acc, curr) => acc + curr.totalScore, 0) / results.length).toFixed(1) 
        : "N/A"
    };
  }));

  return familyData;
};