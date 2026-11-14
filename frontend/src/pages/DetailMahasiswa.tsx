import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Heart,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  StickyNote,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import DeleteModal from '../components/DeleteModal'
import Loading from '../components/Loading'
import Toast, { type ToastType } from '../components/Toast'
import {
  deleteMahasiswa,
  getMahasiswaById,
} from '../services/mahasiswaService'
import type { Mahasiswa } from '../types/mahasiswa'
import { formatTanggal, getInitials } from '../utils/format'

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  )
}

export default function DetailMahasiswa() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null)

  const load = useCallback(async () => {
    if (!id || !/^\d+$/.test(id)) {
      setError('ID mahasiswa tidak valid.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getMahasiswaById(id)
      setMahasiswa(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil detail mahasiswa.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const handleDelete = async () => {
    if (!mahasiswa) return
    setDeleting(true)
    try {
      await deleteMahasiswa(mahasiswa.id)
      navigate('/mahasiswa', {
        state: {
          notif: {
            type: 'success' as const,
            message: `Data mahasiswa ${mahasiswa.nama_mahasiswa} (NIM ${mahasiswa.nim}) berhasil dihapus.`,
          },
        },
      })
    } catch (err) {
      setDeleteOpen(false)
      setDeleting(false)
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghapus mahasiswa.',
      })
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <Loading text="Memuat detail mahasiswa..." />
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
          Mahasiswa Tidak Ditemukan
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {error ?? 'Data mahasiswa yang Anda cari tidak tersedia.'}
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
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <Link
        to="/mahasiswa"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Kembali ke Data Mahasiswa
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg ring-4 ring-white/10">
                {getInitials(mahasiswa.nama_mahasiswa)}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold text-white">
                  {mahasiswa.nama_mahasiswa}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs font-semibold text-blue-100 ring-1 ring-inset ring-white/20">
                    NIM {mahasiswa.nim}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-blue-100 ring-1 ring-inset ring-white/20">
                    <GraduationCap size={14} />
                    {mahasiswa.kelas}
                  </span>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      mahasiswa.jenis_kelamin === 'L'
                        ? 'bg-blue-500/20 text-blue-100 ring-blue-400/30'
                        : 'bg-pink-500/20 text-pink-100 ring-pink-400/30'
                    }`}
                  >
                    {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-full gap-3 sm:w-auto">
              <Link
                to={`/mahasiswa/${mahasiswa.id}/edit`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-md transition-colors hover:bg-slate-100 sm:flex-none"
              >
                <Pencil size={16} />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/40 transition-colors hover:bg-red-700 sm:flex-none"
              >
                <Trash2 size={16} />
                Hapus
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
          <section>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              <UserRound size={18} className="text-blue-600" />
              Data Pribadi
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoField label="NIM" value={mahasiswa.nim} />
              <InfoField label="Nama Mahasiswa" value={mahasiswa.nama_mahasiswa} />
              <InfoField label="Jenis Kelamin" value={mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
              <InfoField label="Tempat Lahir" value={mahasiswa.tempat_lahir} />
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70">
                  <Calendar size={18} className="mt-0.5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tanggal Lahir
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatTanggal(mahasiswa.tanggal_lahir)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Alamat
                    </p>
                    <p className="mt-1 break-words text-sm font-medium leading-relaxed text-slate-800">
                      {mahasiswa.alamat}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              <Users size={18} className="text-blue-600" />
              Data Akademik &amp; Orang Tua
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoField label="Kelas" value={mahasiswa.kelas} />
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70 sm:col-span-2">
                <Heart size={18} className="mt-0.5 shrink-0 text-pink-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Nama Ibu Kandung
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {mahasiswa.nama_ibu_kandung}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70 sm:col-span-2">
                <Phone size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Nomor HP Orang Tua
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium text-slate-800">
                    {mahasiswa.no_hp_orang_tua}
                  </p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-inset ring-slate-200/70">
                  <StickyNote size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Keterangan
                    </p>
                    <p className="mt-1 break-words text-sm font-medium leading-relaxed text-slate-800">
                      {mahasiswa.keterangan ?? 'Tidak ada keterangan.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <DeleteModal
        mahasiswa={deleteOpen ? mahasiswa : null}
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
