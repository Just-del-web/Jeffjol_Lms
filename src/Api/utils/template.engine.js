import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from "../logging/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderTemplate = async (templateName, data = {}) => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.template.js`);
    
    const templateUrl = pathToFileURL(templatePath).href;

    const module = await import(templateUrl);
    
    const template = module.default; 
    
    return template(data);

  } catch (error) {
    logger.error(`Failed to render email template ${templateName}: ${error.message}`);
    throw new Error(`Failed to render email template ${templateName}: ${error.message}`);
  }
};

export default renderTemplate;