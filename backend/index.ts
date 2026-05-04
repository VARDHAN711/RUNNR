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

// 3. FRONTEND SERVING
// On Render, __dirname in a compiled file might point to backend/dist
// We ensure we point correctly to the frontend/dist folder
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// 4. CATCH-ALL ROUTE
// This must be the VERY LAST route
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 5. MongoDB connection + server start
// Render provides the PORT environment variable as a string; we cast to Number
const PORT = Number(process.env.PORT) || 10000;

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    /**
     * CRITICAL FOR RENDER:
     * We bind to '0.0.0.0' so the service is reachable externally.
     * Without this, the health check may fail and cause a "Timed Out" error.
     */
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Runnr API running on port ${PORT}`);
      console.log(`📡 Binding to 0.0.0.0 for external access`);
    });
  })
  .catch((err: any) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });