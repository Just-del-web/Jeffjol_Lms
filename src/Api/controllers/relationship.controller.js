import { RelationshipService } from "../service/relationship.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const relService = new RelationshipService();

export const linkChild = async (req, res) => {
  try {
    const { admissionNumber, dob } = req.body; // dob format: YYYY-MM-DD
    const parentId = req.userId;

    const result = await relService.linkStudentToParent(parentId, admissionNumber, dob);

    return res.status(200).json(
      successResponse(200, `Successfully linked to ${result.studentName}`, result)
    );
  } catch (error) {
    const status = error.message === "STUDENT_NOT_FOUND" ? 404 : 400;
    return res.status(status).json(errorResponse(status, error.message));
  }
};

export const getChildren = async (req, res) => {
  try {
    const children = await relService.getMyChildren(req.userId);
    return res.status(200).json(successResponse(200, "Children fetched", children));
  } catch (error) {
    return res.status(500).json(errorResponse(500, "Failed to fetch children."));
  }
};