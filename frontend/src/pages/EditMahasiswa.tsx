import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, RefreshCw, UserRound } from 'lucide-react'
import MahasiswaForm from '../components/MahasiswaForm'
import Loading from '../components/Loading'
import {
  getAllMahasiswa,
  getMahasiswaById,
  updateMahasiswa,
} from '../services/mahasiswaService'
import type { Mahasiswa, MahasiswaInput } from '../types/mahasiswa'

export default function EditMahasiswa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null)
  const [nimList, setNimList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id || !/^\d+$/.test(id)) {
      setError('ID mahasiswa tidak valid.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const detail = await getMahasiswaById(id)
      setMahasiswa(detail)
      try {
        const all = await getAllMahasiswa()
        setNimList(all.filter((m) => m.id !== detail.id).map((m) => m.nim))
      } catch {
        setNimList([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data mahasiswa.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSubmit = async (input: MahasiswaInput) => {
    if (!mahasiswa) return
    await updateMahasiswa(mahasiswa.id, input)
    navigate('/mahasiswa', {
      state: {
        notif: {
          type: 'success' as const,
          message: `Data mahasiswa ${input.nama_mahasiswa} (NIM ${input.nim}) berhasil diperbarui.`,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <Loading text="Memuat data mahasiswa..." />
      </div>
    )
  }

  if (error || !mahasiswa) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70 sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <UserRound size={30} className="text-red-600" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-800">
          Data Tidak Dapat Dimuat
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {error ?? 'Mahasiswa tidak ditemukan.'}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/mahasiswa"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
          >
            <ArrowLeft size={16} />
            Kembali ke Data Mahasiswa
          </Link>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            <Pencil size={14} />
            Formulir Perubahan Data
          </div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Edit Mahasiswa
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Perbarui data{' '}
            <span className="font-semibold text-slate-700">
              {mahasiswa.nama_mahasiswa}
            </span>{' '}
            (NIM{' '}
            <span className="font-mono font-semibold text-slate-700">
              {mahasiswa.nim}
            </span>
            ).
          </p>
        </div>
        <Link
          to={`/mahasiswa/${mahasiswa.id}`}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          <ArrowLeft size={16} />
          Lihat Detail
        </Link>
      </div>

      <div className="max-w-3xl">
        <MahasiswaForm
          mode="edit"
          initialData={mahasiswa}
          existingNims={nimList}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/mahasiswa/${mahasiswa.id}`)}
        />
      </div>
    </div>
  )
}
