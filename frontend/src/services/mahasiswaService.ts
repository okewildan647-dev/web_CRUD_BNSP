import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { ApiResponse, Mahasiswa, MahasiswaInput } from '../types/mahasiswa'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

type RawRecord = Record<string, unknown>

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

function asString(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

function normalizeMahasiswa(raw: RawRecord): Mahasiswa {
  return {
    id: Number(raw.id ?? 0),
    nim: asString(raw.nim),
    nama_mahasiswa: asString(raw.nama_mahasiswa),
    jenis_kelamin: raw.jenis_kelamin === 'P' ? 'P' : 'L',
    tempat_lahir: asString(raw.tempat_lahir),
    tanggal_lahir: asString(raw.tanggal_lahir).slice(0, 10),
    kelas: asString(raw.kelas),
    alamat: asString(raw.alamat),
    nama_ibu_kandung: asString(raw.nama_ibu_kandung),
    no_hp_orang_tua: asString(raw.no_hp_orang_tua),
    keterangan:
      typeof raw.keterangan === 'string' && raw.keterangan.trim() !== ''
        ? raw.keterangan
        : null,
  }
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: unknown } | undefined
    if (data && typeof data.message === 'string' && data.message !== '') {
      return data.message
    }
    if (err.code === 'ERR_NETWORK' || !err.response) {
      return 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000.'
    }
    return fallback
  }
  if (err instanceof Error && err.message !== '') return err.message
  return fallback
}

async function handleRequest<T>(
  action: () => Promise<AxiosResponse>,
  fallbackMessage: string
): Promise<T> {
  try {
    const res = await action()
    const body = res.data as ApiResponse<T> | null

    if (body && typeof body === 'object' && body.success === false) {
      throw new Error(body.message || fallbackMessage)
    }

    if (
      body &&
      typeof body === 'object' &&
      'data' in body &&
      body.data !== undefined
    ) {
      return body.data
    }

    throw new Error('Format response API tidak dikenali.')
  } catch (err) {
    throw new Error(extractErrorMessage(err, fallbackMessage))
  }
}

function buildPayload(input: MahasiswaInput): RawRecord {
  return {
    nim: input.nim.trim(),
    nama_mahasiswa: input.nama_mahasiswa.trim(),
    jenis_kelamin: input.jenis_kelamin,
    tempat_lahir: input.tempat_lahir.trim(),
    tanggal_lahir: input.tanggal_lahir,
    kelas: input.kelas.trim(),
    alamat: input.alamat.trim(),
    nama_ibu_kandung: input.nama_ibu_kandung.trim(),
    no_hp_orang_tua: input.no_hp_orang_tua.trim(),
    keterangan: input.keterangan?.trim() !== '' ? input.keterangan?.trim() : null,
  }
}

export async function getAllMahasiswa(): Promise<Mahasiswa[]> {
  const data = await handleRequest<unknown[]>(
    () => api.get('/mahasiswa'),
    'Gagal mengambil data mahasiswa.'
  )
  if (!Array.isArray(data)) return []
  return data.map((row) => normalizeMahasiswa(row as RawRecord))
}

export async function getMahasiswaById(
  id: number | string
): Promise<Mahasiswa> {
  const data = await handleRequest<RawRecord>(
    () => api.get(`/mahasiswa/${id}`),
    'Gagal mengambil detail mahasiswa.'
  )
  return normalizeMahasiswa(data)
}

export async function createMahasiswa(
  input: MahasiswaInput
): Promise<Mahasiswa> {
  const data = await handleRequest<RawRecord>(
    () => api.post('/mahasiswa', buildPayload(input)),
    'Gagal menambahkan mahasiswa.'
  )
  return normalizeMahasiswa(data)
}

export async function updateMahasiswa(
  id: number | string,
  input: MahasiswaInput
): Promise<Mahasiswa> {
  const data = await handleRequest<RawRecord>(
    () => api.put(`/mahasiswa/${id}`, buildPayload(input)),
    'Gagal memperbarui data mahasiswa.'
  )
  return normalizeMahasiswa(data)
}

export async function deleteMahasiswa(
  id: number | string
): Promise<Mahasiswa> {
  const data = await handleRequest<RawRecord>(
    () => api.delete(`/mahasiswa/${id}`),
    'Gagal menghapus mahasiswa.'
  )
  return normalizeMahasiswa(data)
}
