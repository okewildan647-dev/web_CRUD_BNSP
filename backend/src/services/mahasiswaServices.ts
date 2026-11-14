
import { db } from '../config/database.js';
import type { MahasiswaInput } from '../types/mahasiswa.js';

export const getAllMahasiswa = async () => {
  const result = await db.query(
    'SELECT * FROM public.mahasiswa ORDER BY id ASC'
  );

  return result.rows;
};

export const getMahasiswaById = async (id: number) => {
  const result = await db.query(
    'SELECT * FROM public.mahasiswa WHERE id = $1',
    [id]
  );

  return result.rows[0] ?? null;
};

export const createMahasiswa = async (data: MahasiswaInput) => {
  const result = await db.query(
    `INSERT INTO public.mahasiswa
    (nim, nama_mahasiswa, jenis_kelamin, tempat_lahir,
     tanggal_lahir, kelas, alamat, nama_ibu_kandung,
     no_hp_orang_tua, keterangan)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.nim,
      data.nama_mahasiswa,
      data.jenis_kelamin,
      data.tempat_lahir,
      data.tanggal_lahir,
      data.kelas,
      data.alamat,
      data.nama_ibu_kandung,
      data.no_hp_orang_tua,
      data.keterangan ?? null
    ]
  );

  return result.rows[0];
};

export const updateMahasiswa = async (
  id: number,
  data: MahasiswaInput
) => {
  const result = await db.query(
    `UPDATE public.mahasiswa SET
      nim = $1,
      nama_mahasiswa = $2,
      jenis_kelamin = $3,
      tempat_lahir = $4,
      tanggal_lahir = $5,
      kelas = $6,
      alamat = $7,
      nama_ibu_kandung = $8,
      no_hp_orang_tua = $9,
      keterangan = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *`,
    [
      data.nim,
      data.nama_mahasiswa,
      data.jenis_kelamin,
      data.tempat_lahir,
      data.tanggal_lahir,
      data.kelas,
      data.alamat,
      data.nama_ibu_kandung,
      data.no_hp_orang_tua,
      data.keterangan ?? null,
      id
    ]
  );

  return result.rows[0] ?? null;
};

export const deleteMahasiswa = async (id: number) => {
  const result = await db.query(
    'DELETE FROM public.mahasiswa WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rows[0] ?? null;
};
