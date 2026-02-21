import { AcademicService } from "../service/academic.service.js";
import { EngagementService } from "../service/engagement.service.js"; 
import { successResponse, errorResponse } from "../utils/helper.js";
import StudentProfile from "../models/student_profile.model.js"; 

const academicService = new AcademicService();
const engagementService = new EngagementService();

export const uploadMaterial = async (req, res, next) => {
  try {
    // req.userId comes from authenticate middleware
    const material = await academicService.uploadAcademicMaterial(
      req.userId,
      req.body,
      req.file
    );

    return res.status(201).json(
      successResponse(201, "Material published and OCR complete.", material)
    );
  } catch (error) {
    next(error);
  }
};

export const getMyLibrary = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.userId });
    
    if (!profile) {
      return res.status(404).json(errorResponse(404, "Student profile not found."));
    }

    const materials = await academicService.getStudentMaterials(
      profile.currentClass, 
      req.query.subject
    );

    return res.status(200).json(
      successResponse(200, "Class Library synced successfully.", materials)
    );
  } catch (error) {
    next(error);
  }
};

export const readNoteContent = async (req, res, next) => {
  try {
    const note = await academicService.getNoteForReading(req.params.id);
    
    if (!note) {
      return res.status(404).json(errorResponse(404, "Material not found."));
    }

    if (req.user && req.user.role === 'student') {
      engagementService.logStudentAction(
        req.userId,
        "read_note",
        note._id,
        note.subject
      ).catch(err => console.error("Engagement Log Failed:", err.message));
    }

    return res.status(200).json(
      successResponse(200, "Content loaded.", note)
    );
  } catch (error) {
    next(error);
  }
};

export const getTeacherMaterials = async (req, res, next) => {
  try {
    const materials = await academicService.getTeacherMaterials(req.userId);
    return res.status(200).json(successResponse(200, "Publication history fetched.", materials));
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    await academicService.deleteMaterial(req.params.id, req.userId);
    
    return res.status(200).json(
      successResponse(200, "Material permanently removed from LMS and Storage.")
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
      successResponse(200, "Material updated.", updated)
    );
  } catch (error) {
    next(error);
  }
};