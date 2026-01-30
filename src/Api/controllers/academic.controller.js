import { AcademicService } from "../services/academic.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const academicService = new AcademicService();


export const uploadMaterial = async (req, res) => {
  try {
    const material = await academicService.uploadAcademicMaterial(req.userId, req.body, req.file);
    return res.status(201).json(successResponse(201, "Material uploaded and transcribed.", material));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};


export const getMyLibrary = async (req, res) => {
  try {
    const { currentClass } = req.user.profile;
    const materials = await academicService.getStudentMaterials(currentClass, req.query.subject);
    return res.status(200).json(successResponse(200, "Library fetched.", materials));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};


export const readNoteContent = async (req, res) => {
  try {
    const note = await academicService.getNoteForReading(req.params.id);
    if (!note) return res.status(404).json(errorResponse(404, "Note not found."));
    
    return res.status(200).json(successResponse(200, "Note text loaded.", note));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};


export const updateMaterial = async (req, res) => {
  try {
    const updated = await academicService.updateMaterialContent(req.params.id, req.userId, req.body);
    return res.status(200).json(successResponse(200, "Content updated successfully.", updated));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};