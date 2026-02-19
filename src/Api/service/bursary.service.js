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
    
    const history = await Payment.find({ student: studentId, term, session })
      .sort({ createdAt: -1 });

    const totalPaid = history
      .filter(p => p.status === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    const billedAmount = feeConfig ? feeConfig.amount : 0;
    const balance = billedAmount - totalPaid;

    return {
      studentId: profile.studentId,
      totalBilled: billedAmount, 
      totalPaid: totalPaid,     
      totalBalance: balance < 0 ? 0 : balance, 
      history: history,        
      isCleared: balance <= 0
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