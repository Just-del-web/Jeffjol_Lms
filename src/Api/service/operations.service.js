
import StudentProfile from '../models/student_profile.model.js';
import { Gradebook } from '../models/gradeBook.model.js';

export class OperationsService {
  
  async promoteClass(fromClass, toClass) {
    return await StudentProfile.updateMany(
      { currentClass: fromClass, status: 'active' },
      { 
        $set: { 
          currentClass: toClass, 
          isClearedForExams: false 
        } 
      }
    );
  }

  async recordGrade(teacherId, gradeData) {
    const { student, subject, term, session } = gradeData;
    
    const totalCA = (gradeData.testScore || 0) + 
                    (gradeData.assignmentScore || 0) + 
                    (gradeData.midTermScore || 0);

    return await Gradebook.findOneAndUpdate(
      { student, subject, term, session },
      { ...gradeData, teacher: teacherId, totalCA },
      { upsert: true, new: true }
    );
  }

  async toggleUserStatus(userId, status) {
    return await StudentProfile.findOneAndUpdate(
      { user: userId },
      { status },
      { new: true }
    );
  }
}