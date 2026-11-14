import { Router } from 'express';
import {
  login,
  getMe,
  dashboard,
} from '../controllers/authController.js';

import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Publik: login untuk mendapatkan token
router.post('/login', login);
// Terproteksi: wajib menyertakan token Bearer
router.get('/me', authenticateToken, getMe);
router.get('/dashboard', authenticateToken, dashboard);

export default router;