import StudentProfile from '../models/student_profile.model.js';
import { errorResponse } from '../utils/helper.js';

export const verifyPayerRelationship = async (req, res, next) => {
  try {
    const uploaderId = req.userId;
    const { role } = req;
    
    if (role === 'student') {
      req.body.studentId = uploaderId; 
      return next();
    }

    if (role === 'parent') {
      const { studentId } = req.body;
      if (!studentId) return res.status(400).json(errorResponse(400, "Student ID is required."));

      const isLinked = await StudentProfile.findOne({ 
        user: studentId, 
        parents: uploaderId 
      });

      if (!isLinked) {
        return res.status(403).json(errorResponse(403, "Access Denied: You are not linked to this student."));
      }
      return next();
    }

    next();
  } catch (error) {
    return res.status(500).json(errorResponse(500, "Security check failed."));
  }
};