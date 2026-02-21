import { Content } from "../models/content.model.js";
import { uploadToCloudinary, cloudinary } from "../utils/cloudinary.util.js";
import Tesseract from "tesseract.js";
import logger from "../logging/logger.js";

const academicLogger = logger.child({ service: "ACADEMIC_SERVICE" });

export class AcademicService {
  async uploadAcademicMaterial(teacherId, data, file) {
    let uploadResult = {};
    let extractedText = "";

    if (file) {
      if (data.isScannedNote === "true" && file.mimetype.startsWith("image/")) {
        try {
          academicLogger.info("Initiating OCR scanning for: " + data.title);
          
          const result = await Tesseract.recognize(file.buffer, "eng", {
            logger: m => console.log(`[OCR PROGRESS] ${m.status}: ${Math.round(m.progress * 100)}%`)
          });

          extractedText = result.data.text.replace(/\n\s*\n/g, "\n").trim();
          academicLogger.info("OCR scan complete. Length: " + extractedText.length);
        } catch (ocrErr) {
          academicLogger.error("OCR Engine Error: " + ocrErr.message);
        }
      }

      uploadResult = await uploadToCloudinary(file.buffer, "academic_materials", "auto");
    }

    return await Content.create({
      title: data.title,
      subject: data.subject,
      targetClass: data.targetClass,
      contentType: data.contentType, 
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      uploadedBy: teacherId,
      isScannedNote: data.isScannedNote === "true",
      rawText: extractedText || "No text could be extracted from this image.",
    });
  }
  async deleteMaterial(contentId, teacherId) {
    const material = await Content.findOne({ _id: contentId, uploadedBy: teacherId });
    if (!material) throw new Error("MATERIAL_NOT_FOUND");

    if (material.cloudinaryId) {
      await cloudinary.uploader.destroy(material.cloudinaryId);
    }

    return await Content.findByIdAndDelete(contentId);
  }

  async getStudentMaterials(className, subject = null) {
    const query = { targetClass: className };
    if (subject) query.subject = subject;

    return await Content.find(query)
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 });
  }

  async getTeacherMaterials(teacherId) {
    return await Content.find({ uploadedBy: teacherId }).sort({ createdAt: -1 });
  }

  async getNoteForReading(contentId) {
    return await Content.findById(contentId)
      .populate("uploadedBy", "firstName lastName")
      .lean();
  }
}