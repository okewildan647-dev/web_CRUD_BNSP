
import type { Request, Response } from 'express';
import { loginUser } from '../services/authService.js';
import { generateToken } from '../utils/token.js';

// Handler login: validasi input -> cek database -> buat token -> kirim response
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validasi input: email & password wajib string tidak kosong
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
      return;
    }

    // Memeriksa akun di PostgreSQL
    const user = await loginUser(email, password);

    // Email tidak ditemukan atau password salah (pesan disamakan)
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
      return;
    }

    // Membuat token JWT dari uuid & email user
    const token = generateToken({
      uuid: user.uuid,
      email: user.email,
    });

    // Response sukses: data user + token
    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Error tak terduga (mis. koneksi database)
    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};

// Mengembalikan identitas user dari token yang sudah diverifikasi middleware
export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Identitas ini sudah diperiksa oleh authMiddleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Pengguna belum terautentikasi.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('GetMe error:', error);

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
    });
  }
};


// Contoh endpoint terproteksi: hanya bisa diakses dengan token valid
export const dashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // req.user diisi oleh authMiddleware jika token valid
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