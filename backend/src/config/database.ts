
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const testConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');

    console.log('PostgreSQL berhasil terhubung!');
    console.log('Waktu database:', result.rows[0].now);
  } catch (error) {
    console.error('Koneksi PostgreSQL gagal:', error);
    process.exit(1);
  }
};
