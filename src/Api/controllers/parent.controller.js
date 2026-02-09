import * as parentService from "../service/parent.service.js";
import { successResponse } from "../utils/helper.js";


export const getMyChildrenDashboard = async (req, res, next) => {
  try {
    const parentId = req.userId; 
    
    const data = await parentService.getParentDashboardData(parentId);

    return res.status(200).json(
      successResponse(200, "Family records retrieved successfully.", data)
    );
  } catch (error) {
    next(error);
  }
};

export const getChildrenList = async (req, res, next) => {
  try {
    const children = await User.find({ parent: req.userId, role: 'student' })
      .select('firstName lastName currentClass profilePicture')
      .lean();

    return res.status(200).json(successResponse(200, "Children list fetched.", children));
  } catch (error) {
    next(error);
  }
};