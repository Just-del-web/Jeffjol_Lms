import express from 'express';
import cors from 'cors';
import apiRouter from './src/Api/routes/index.route.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// // Routes Delegation
app.use("/v1", apiRouter);

// Basic Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'LMS Backend Active' });
});

// Export the app instance for index.js
export default app;