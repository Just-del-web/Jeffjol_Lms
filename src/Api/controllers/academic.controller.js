import { AcademicService } from "../services/academic.service.js";
import { EngagementService } from "../services/engagement.service.js"; 
import { successResponse, errorResponse } from "../utils/helper.js";

const academicService = new AcademicService();
const engagementService = new EngagementService();


export const uploadMaterial = async (req, res, next) => {
  try {
    // Pass the buffer to the service where Tesseract lives
    const material = await academicService.uploadAcademicMaterial(
      req.userId,
      req.body,
      req.file
    );

    return res.status(201).json(
      successResponse(201, "Material uploaded and OCR processing complete.", material)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * STUDENT: Get Library (Grid View)
 */
export const getMyLibrary = async (req, res, next) => {
  try {
    // Note: req.user.profile is populated by your authenticate middleware
    const currentClass = req.user.profile?.currentClass || "SS1";
    
    const materials = await academicService.getStudentMaterials(
      currentClass, 
      req.query.subject
    );

    return res.status(200).json(
      successResponse(200, "Library fetched successfully.", materials)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * STUDENT: Read Note Content (Note Reader)
 */
export const readNoteContent = async (req, res, next) => {
  try {
    const note = await academicService.getNoteForReading(req.params.id);
    
    if (!note) {
      return res.status(404).json(errorResponse(404, "Note not found."));
    }

    // Log the action for engagement analytics
    engagementService.logStudentAction(
      req.userId,
      "read_note",
      note._id,
      note.subject
    ).catch(err => console.error("Logging failed:", err.message));

    return res.status(200).json(
      successResponse(200, "Content loaded for reader.", note)
    );
  } catch (error) {
    next(error);
  }
};


export const updateMaterial = async (req, res, next) => {
  try {
    const updated = await academicService.updateMaterialContent(
      req.params.id,
      req.userId,
      req.body
    );
    return res.status(200).json(
      successResponse(200, "Note content updated successfully.", updated)
    );
  } catch (error) {
    next(error);
  }
};