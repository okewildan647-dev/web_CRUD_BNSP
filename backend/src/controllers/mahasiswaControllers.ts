
import type { Request, Response } from 'express';

import {
  getAllMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa
} from '../services/mahasiswaServices.js';

const validId = (id: unknown): id is string =>
  typeof id === 'string' &&
  /^\d+$/.test(id) &&
  Number(id) > 0;

const validateInput = (body: any) => {
  const requiredFields = [
    'nim',
    'nama_mahasiswa',
    'jenis_kelamin',
    'tempat_lahir',
    'tanggal_lahir',
    'kelas',
    'alamat',
    'nama_ibu_kandung',
    'no_hp_orang_tua'
  ];

  for (const field of requiredFields) {
    if (
      typeof body?.[field] !== 'string' ||
      !body[field].trim()
    ) {
      return `Field ${field} wajib diisi dengan teks.`;
    }
  }

  if (!['L', 'P'].includes(body.jenis_kelamin)) {
    return 'Jenis kelamin harus L atau P.';
  }

  if (Number.isNaN(Date.parse(body.tanggal_lahir))) {
    return 'Format tanggal lahir tidak valid.';
  }

  if (
    body.keterangan !== undefined &&
    body.keterangan !== null &&
    typeof body.keterangan !== 'string'
  ) {
    return 'Keterangan harus berupa teks.';
  }

  return null;
};

export const getMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getAllMahasiswa();

    res.status(200).json({
      success: true,
      message: 'Data mahasiswa berhasil diambil.',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data mahasiswa.'
    });
  }
};

export const getMahasiswaDetail = async (
  req: Request,
  res: Response
) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mahasiswa tidak valid.'
      });
    }

    const data = await getMahasiswaById(Number(req.params.id));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Mahasiswa tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail mahasiswa berhasil diambil.',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail mahasiswa.'
    });
  }
};

export const addMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    const validationError = validateInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const data = await createMahasiswa(req.body);

    return res.status(201).json({
      success: true,
      message: 'Mahasiswa berhasil ditambahkan.',
      data
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'NIM sudah terdaftar.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan mahasiswa.'
    });
  }
};

export const editMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mahasiswa tidak valid.'
      });
    }

    const validationError = validateInput(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const data = await updateMahasiswa(
      Number(req.params.id),
      req.body
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Mahasiswa tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data mahasiswa berhasil diperbarui.',
      data
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'NIM sudah digunakan mahasiswa lain.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data mahasiswa.'
    });
  }
};

export const removeMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mahasiswa tidak valid.'
      });
    }

    const data = await deleteMahasiswa(Number(req.params.id));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Mahasiswa tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mahasiswa berhasil dihapus.',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus mahasiswa.'
    });
  }
};
