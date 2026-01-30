import StudentProfile from '../models/student_profile.js';
import { User } from '../models/user.model.js';
import logger from '../logging/logger.js';

const relLogger = logger.child({ service: "RELATIONSHIP_SERVICE" });

export class RelationshipService {
 
  async linkStudentToParent(parentId, admissionNumber, dob) {

    const profile = await StudentProfile.findOne({ admissionNumber })
      .populate('user', 'firstName lastName dateOfBirth');

    if (!profile) throw new Error("STUDENT_NOT_FOUND");

    // 2. Simple verification (e.g., checking Date of Birth)
    const studentDob = profile.user.dateOfBirth.toISOString().split('T')[0];
    if (studentDob !== dob) {
      throw new Error("VERIFICATION_FAILED_INVALID_DOB");
    }

    if (profile.parents.includes(parentId)) {
      throw new Error("ALREADY_LINKED");
    }

    profile.parents.push(parentId);
    await profile.save();

    await User.findByIdAndUpdate(parentId, {
      $addToSet: { children: profile.user._id }
    });

    relLogger.info(`Parent ${parentId} successfully linked to Student ${profile.user._id}`);
    return { success: true, studentName: `${profile.user.firstName} ${profile.user.lastName}` };
  }

  async getMyChildren(parentId) {
    const parent = await User.findById(parentId).populate({
      path: 'children',
      select: 'firstName lastName email role',
      populate: { path: 'profile', select: 'currentClass classArm isClearedForExams' }
    });
    return parent.children;
  }
}