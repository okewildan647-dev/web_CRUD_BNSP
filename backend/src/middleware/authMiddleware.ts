
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token.js';

// Menambahkan informasi pengguna ke Request Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        uuid: string;
        email: string;
      };
    }
  }
}

// Middleware: cek header Authorization Bearer lalu verifikasi token JWT
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Header wajib ada dan berformat "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
      });
      return;
    }

    // Ambil token setelah kata "Bearer "
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Format token tidak valid.',
      });
      return;
    }

    // Verifikasi tanda tangan & masa berlaku token
    const decoded = verifyToken(token);

    const uuid = decoded.sub;
    const email = decoded.email;

    // Pastikan isi token sesuai yang diharapkan
    if (typeof uuid !== 'string' || typeof email !== 'string') {
      res.status(401).json({
        success: false,
        message: 'Informasi token tidak valid.',
      });
      return;
    }

    // Simpan identitas pengguna ke request untuk dipakai controller
    req.user = { uuid, email };

    // Lanjut ke handler berikutnya
    next();
  } catch {
    // Token rusak, dipalsukan, atau sudah kedaluwarsa
    res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    });
  }
};



// Contoh handler dashboard (sama seperti di authController)
export const dashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // req.user diisi oleh authenticateToken
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Anda belum login.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Selamat datang di Dashboard Mahasiswa.',
      data: {
        uuid: req.user.uuid,
        email: req.user.email,
        status: 'Terverifikasi menggunakan token JWT',
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};