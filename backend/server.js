import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
const port = process.env.PORT || 5000;
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import cors from 'cors';
import path from 'path';


connectDB();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => {
  res.send('Server is ready');
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});