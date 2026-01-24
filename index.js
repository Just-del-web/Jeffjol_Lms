import 'dotenv/config';
import app from './app.js';
import connectDB from './src/Api/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 LMS Server initialized on port ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
  });
});
