import fs from 'fs/promises';
import path from 'path';
import config from '../config.js';

export const saveFileLocally = async (file, folder = 'lessons') => {
  const targetDir = path.join(config.UPLOAD_DIR, folder);
  
  // Ensure directory exists
  await fs.mkdir(targetDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(targetDir, fileName);

  // Move file from temp to local upload dir
  await fs.writeFile(filePath, file.data);
 
  return `/uploads/${folder}/${fileName}`;
};