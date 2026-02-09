import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from './src/Api/routes/index.route.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));

app.use(cookieParser()); 
app.use(express.json());

app.use("/api/v1", apiRouter);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'LMS Backend Active' });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} : ${err.message}`);
  console.error(err.stack);

  if (res.headersSent) {
    return next(err); 
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err.stack : "Something went wrong"
  });
});

export default app;