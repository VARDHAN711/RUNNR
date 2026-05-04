import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import path from 'path';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import notificationRoutes from './routes/notificationRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. API Routes
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// 3. FRONTEND SERVING (Must be AFTER API routes but BEFORE 404)
// This serves the compiled React files from the dist folder
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// 4. CATCH-ALL ROUTE
// If a request doesn't match an API route or a static file, send index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

// 5. MongoDB connection + server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Listen on 0.0.0.0 for Render compatibility
    app.listen(PORT, () => {
      console.log(`🚀 Runnr API running on port ${PORT}`);
    });
  })
  .catch((err: any) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });