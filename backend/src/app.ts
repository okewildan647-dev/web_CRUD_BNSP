
import express from 'express';
import cors from 'cors';
import mahasiswaRoutes from './routes/mahasiswaRoutes.js';
import authRoutes from './routes/authRoutes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API Mahasiswa berjalan!'
  });
});

// Routes CRUD mahasiswa
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/auth', authRoutes);