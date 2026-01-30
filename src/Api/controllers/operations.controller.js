import { OperationsService } from "../services/operations.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const opsService = new OperationsService();

/**
 * --- TEACHER: RECORD GRADES ---
 */
export const enterGrades = async (req, res) => {
  try {
    const grade = await opsService.recordGrade(req.userId, req.body);
    return res.status(200).json(successResponse(200, "Grade recorded successfully.", grade));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};

/**
 * --- ADMIN: PROMOTE CLASS ---
 */
export const promoteStudents = async (req, res) => {
  try {
    const { fromClass, toClass } = req.body;
    if (!fromClass || !toClass) return res.status(400).json(errorResponse(400, "Both source and target classes are required."));

    const result = await opsService.promoteClass(fromClass, toClass);
    return res.status(200).json(successResponse(200, `${result.modifiedCount} students promoted to ${toClass}.`));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};

/**
 * --- ADMIN: UPDATE USER STATUS ---
 * Used to suspend, withdraw, or reactivate a student/staff
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json(errorResponse(400, "User ID and Status are required."));
    }

    const updatedProfile = await opsService.toggleUserStatus(userId, status);
    
    if (!updatedProfile) {
      return res.status(404).json(errorResponse(404, "Student profile not found."));
    }

    return res.status(200).json(
      successResponse(200, `User status successfully updated to ${status}.`, updatedProfile)
    );
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};