
import bcrypt from 'bcrypt';
import { db } from '../config/database.js';

// Data user lengkap dari database (termasuk hash password)
interface LoginUser {
  uuid: string;
  email: string;
  password: string;
  id_mhs: number;
  nim: string;
  nama_mahasiswa: string;
  kelas: string;
}

// Data user yang dikembalikan ke controller (tanpa password)
export interface AuthenticatedUser {
  uuid: string;
  email: string;
  id_mhs: number;
  nim: string;
  nama_mahasiswa: string;
  kelas: string;
}

// Memverifikasi kredensial user ke PostgreSQL
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthenticatedUser | null> => {
  // Cari akun + data mahasiswa via JOIN (email case-insensitive, akun tidak soft-delete)
  const result = await db.query<LoginUser>(
    `
    SELECT
      u.uuid::text AS uuid,
      u.email,
      u.password,
      u.id_mhs,
      m.nim,
      m.nama_mahasiswa,
      m.kelas
    FROM public.users u
    INNER JOIN public.mahasiswa m
      ON u.id_mhs = m.id
    WHERE LOWER(u.email) = LOWER($1)
      AND u.deleted_at IS NULL
    LIMIT 1
    `,
    [email.trim()]
  );

  const user = result.rows[0];

  // Jika email tidak ditemukan
  if (!user) {
    return null;
  }

  // Bandingkan password form dengan hash bcrypt di database
  const passwordValid = await bcrypt.compare(
    password,
    user.password
  );

  // Password salah
  if (!passwordValid) {
    return null;
  }

  // Mengembalikan data pengguna tanpa password
  return {
    uuid: user.uuid,
    email: user.email,
    id_mhs: user.id_mhs,
    nim: user.nim,
    nama_mahasiswa: user.nama_mahasiswa,
    kelas: user.kelas,
  };
};
