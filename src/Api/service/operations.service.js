
import StudentProfile from '../models/student_profile.model.js';
import { Gradebook } from '../models/gradeBook.model.js';
import { User } from '../models/user.model.js';

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
    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      { status },
      { new: true }
    );

    const isActive = status === 'active';
    
    await User.findByIdAndUpdate(userId, { 
      isActive: isActive,
      $inc: { tokenVersion: isActive ? 0 : 1 } 
    });

    return profile;
  }
}