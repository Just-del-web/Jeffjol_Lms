import { Content } from "../models/content.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import Tesseract from "tesseract.js";
import logger from "../logging/logger.js";

const academicLogger = logger.child({ service: "ACADEMIC_SERVICE" });

export class AcademicService {
  async uploadAcademicMaterial(teacherId, data, file) {
    let uploadResult = {};
    let extractedText = "";

    if (file) {
      const resourceType = data.contentType === "video" ? "video" : "raw";
      uploadResult = await uploadToCloudinary(
        file.buffer,
        "academic_materials",
        resourceType,
      );

      if (data.isScannedNote === "true" && file.mimetype.startsWith("image/")) {
        academicLogger.info("Initiating Tesseract OCR scanning...");
        const {
          data: { text },
        } = await Tesseract.recognize(file.buffer, "eng");

        extractedText = text.replace(/\n\s*\n/g, "\n").trim();
      }
    }

    return await Content.create({
      ...data,
      uploadedBy: teacherId,
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      rawText: extractedText,
    });
  }

  async updateMaterialContent(contentId, teacherId, updateData) {
    return await Content.findOneAndUpdate(
      { _id: contentId, uploadedBy: teacherId },
      { $set: updateData },
      { new: true },
    );
  }

  async getNoteForReading(contentId) {
    return await Content.findById(contentId)
      .populate("uploadedBy", "firstName lastName")
      .lean();
  }

  async getStudentMaterials(className, subject = null) {
    const query = { targetClass: className };
    if (subject) query.subject = subject;

    return await Content.find(query)
      .populate("uploadedBy", "firstName lastName")
      .select("-rawText")
      .sort({ createdAt: -1 });
  }

  async getTeacherMaterials(teacherId) {
    return await Content.find({ uploadedBy: teacherId }).sort({
      createdAt: -1,
    });
  }

  async scheduleLiveClass(teacherId, classData) {
    return await Content.create({
      ...classData,
      contentType: "live_class",
      uploadedBy: teacherId,
    });
  }
}
