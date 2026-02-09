import { StudentDashboardService } from "../service/student.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const dashboardService = new StudentDashboardService();

export const getOverview = async (req, res, next) => {
  try {
    const { term, session } = req.query;
    // req.userId and req.role come from the authenticate middleware
    const { userId, role } = req;

    let targetId = userId;
    
    // Parent logic: Parents view a specific student's data
    if (role === 'parent') {
      targetId = req.query.studentId; 
      if (!targetId) {
        return res.status(400).json(errorResponse(400, "Student ID is required for parent view."));
      }
    }

    const currentTerm = term || "First"; 
    const currentSession = session || "2025/2026";

    const dashboard = await dashboardService.getDashboardData(targetId, currentTerm, currentSession);
    
    return res.status(200).json(
      successResponse(200, "Dashboard data loaded.", dashboard)
    );
  } catch (error) {
    // Instead of just returning, we pass it to next(error) 
    // so the global error handler we built can log it properly.
    next(error);
  }
};