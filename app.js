import express from 'express';
import cors from 'cors';
import mainRouter from './index.routes.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Routes Delegation
app.use('/api', mainRouter);

// Basic Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'LMS Backend Active' });
});

// Export the app instance for index.js
export default app;