
import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

// Data yang dimasukkan ke dalam token saat login
interface TokenPayload {
  uuid: string;
  email: string;
}

// Mengambil JWT_SECRET dari file .env (wajib ada)
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  // Hentikan proses jika secret belum dikonfigurasi
  if (!secret) {
    throw new Error('JWT_SECRET belum diatur di file .env');
  }

  return secret;
};

// Membuat token JWT
export const generateToken = (user: TokenPayload): string => {
  // Masa berlaku token, default 1 hari
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'];

  // Payload berisi email, subject berisi uuid user
  return jwt.sign(
    { email: user.email },
    getJwtSecret(),
    {
      subject: user.uuid,
      expiresIn,
    }
  );
};

// Memverifikasi token JWT
export const verifyToken = (token: string): JwtPayload => {
  // Cek tanda tangan + masa berlaku token
  const decoded = jwt.verify(token, getJwtSecret());

  // Token valid harus berupa objek payload
  if (typeof decoded === 'string') {
    throw new Error('Token tidak valid');
  }

  return decoded;
};
