import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import config from '../config/secret.config.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_KEY,
  api_secret: config.CLOUDINARY_SECRET,
});

const storage = multer.memoryStorage();

export const uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `jeffjol_lms/${folder}`, 
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const receiptUpload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for payment proof!'), false);
    }
  }
});

export const academicContentUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  return await cloudinary.uploader.destroy(publicId);
};

export { cloudinary };