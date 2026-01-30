import { Fee } from '../models/fee.model.js';
import { Payment } from '../models/payment.model.js';
import StudentProfile from '../models/student_profile.model.js';

export class BursaryService {

  async configureFee(data, adminId) {
    return await Fee.findOneAndUpdate(
      { targetClass: data.targetClass, term: data.term, session: data.session },
      { ...data, createdBy: adminId },
      { upsert: true, new: true }
    );
  }

  
  async getStudentBalance(studentId, term, session) {

    const profile = await StudentProfile.findOne({ user: studentId });
    if (!profile) throw new Error("STUDENT_NOT_FOUND");

    const feeConfig = await Fee.findOne({ 
      targetClass: profile.currentClass, 
      term, 
      session 
    });
    
    if (!feeConfig) return { totalOwed: 0, paid: 0, balance: 0 };

    const paymentSum = await Payment.aggregate([
      { $match: { student: studentId, term, session, status: 'verified' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalPaid = paymentSum[0]?.total || 0;
    const balance = feeConfig.amount - totalPaid;

    return {
      requiredFee: feeConfig.amount,
      totalPaid,
      balance: balance < 0 ? 0 : balance,
      isFullyPaid: balance <= 0
    };
  }


  async getClassFinancials(className, term, session) {
    const students = await StudentProfile.find({ currentClass: className })
      .populate('user', 'firstName lastName');

    const report = await Promise.all(students.map(async (s) => {
      const bal = await this.getStudentBalance(s.user._id, term, session);
      return {
        name: `${s.user.firstName} ${s.user.lastName}`,
        admissionNumber: s.admissionNumber,
        ...bal
      };
    }));

    return report;
  }
}