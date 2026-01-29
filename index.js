import 'dotenv/config';
import app from './app.js';
import connectDB from './src/Api/config/db.js';
import logger from './src/Api/logging/logger.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
   logger.info(`🚀 LMS Server initialized on port ${PORT}`);
   logger.info(`🔗 Local URL: http://localhost:${PORT}`);
  });
});
