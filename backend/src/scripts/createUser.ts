
import bcrypt from 'bcrypt';
import { db } from '../config/database.js';

const createUser = async () => {
  try {
    const idMhs = 8; // Ganti dengan ID mahasiswa yang dipilih
    const email = 'admin@kampus.ac.id';
    const password = 'Admin12345';

    // Periksa apakah mahasiswa tersedia
    const mahasiswa = await db.query(
      'SELECT id FROM public.mahasiswa WHERE id = $1',
      [idMhs]
    );

    if (mahasiswa.rows.length === 0) {
      throw new Error('Data mahasiswa tidak ditemukan.');
    }

    // Periksa apakah email sudah digunakan
    const existingUser = await db.query(
      'SELECT uuid FROM public.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email sudah terdaftar.');
    }

    // Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan akun ke PostgreSQL
    await db.query(
      `INSERT INTO public.users (id_mhs, email, password)
       VALUES ($1, $2, $3)`,
      [idMhs, email, hashedPassword]
    );

    console.log('Akun berhasil dibuat!');
    console.log('Email:', email);
  } catch (error) {
    console.error('Gagal membuat akun:', error);
  } finally {
    await db.end();
  }
};

createUser();
