import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
const port = process.env.PORT || 5000;
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import realguyRoutes from './routes/realguyRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import planRoutes from './routes/planRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import worklogRoutes from './routes/worklogRoutes.js';

import cors from 'cors';
import path from 'path';


connectDB();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('http://192.168.10.116')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/realguys', realguyRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api/worklogs", worklogRoutes);

app.get('/', (req, res) => {
  res.send('Server is ready');
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});