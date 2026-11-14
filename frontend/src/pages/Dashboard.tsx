import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Database,
  Eye,
  LayoutDashboard,
  Mars,
  Plus,
  RefreshCw,
  School,
  UserPlus,
  Users,
  Venus,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { getAllMahasiswa } from '../services/mahasiswaService'
import type { Mahasiswa } from '../types/mahasiswa'
import { formatTanggal, getInitials } from '../utils/format'

export default function Dashboard() {
  const [data, setData] = useState<Mahasiswa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAllMahasiswa()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data mahasiswa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const total = data.length
  const totalLakiLaki = useMemo(
    () => data.filter((m) => m.jenis_kelamin === 'L').length,
    [data]
  )
  const totalPerempuan = useMemo(
    () => data.filter((m) => m.jenis_kelamin === 'P').length,
    [data]
  )
  const totalKelas = useMemo(
    () => new Set(data.map((m) => m.kelas)).size,
    [data]
  )

  const recent = useMemo(
    () => [...data].sort((a, b) => b.id - a.id).slice(0, 5),
    [data]
  )

  const perKelas = useMemo(() => {
    const counts = new Map<string, number>()
    data.forEach((m) => counts.set(m.kelas, (counts.get(m.kelas) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [data])

  const maxKelasCount = perKelas.length > 0 ? perKelas[0][1] : 0

  const genderPercent = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
            <LayoutDashboard size={14} />
            Ringkasan Sistem
          </div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang di Sistem Informasi Mahasiswa. Berikut ringkasan
            data mahasiswa terkini.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Link
            to="/mahasiswa"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-700"
          >
            <Users size={18} />
            Kelola Data Mahasiswa
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/mahasiswa/tambah"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
          >
            <UserPlus size={18} />
            Tambah Mahasiswa
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Database size={30} className="text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-800">
            Gagal Memuat Data
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Mahasiswa"
              value={total}
              icon={Users}
              color="blue"
              loading={loading}
              subtitle="Seluruh data terdaftar"
            />
            <StatCard
              title="Mahasiswa Laki-laki"
              value={totalLakiLaki}
              icon={Mars}
              color="cyan"
              loading={loading}
              subtitle={`${genderPercent(totalLakiLaki)}% dari total`}
            />
            <StatCard
              title="Mahasiswa Perempuan"
              value={totalPerempuan}
              icon={Venus}
              color="pink"
              loading={loading}
              subtitle={`${genderPercent(totalPerempuan)}% dari total`}
            />
            <StatCard
              title="Jumlah Kelas"
              value={totalKelas}
              icon={School}
              color="violet"
              loading={loading}
              subtitle="Kelas aktif terdaftar"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6 lg:col-span-3">
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <ClipboardList size={20} className="text-blue-600" />
                  Distribusi Mahasiswa per Kelas
                </h2>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {totalKelas} kelas
                </span>
              </div>

              {loading ? (
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : perKelas.length === 0 ? (
                <div className="mt-8 text-center text-sm text-slate-400">
                  Belum ada data mahasiswa untuk ditampilkan.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {perKelas.map(([kelas, count]) => (
                    <div key={kelas}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">{kelas}</span>
                        <span className="text-slate-400">
                          {count} mahasiswa
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                          style={{
                            width: `${Math.max(4, (count / maxKelasCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6 lg:col-span-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Users size={20} className="text-blue-600" />
                Komposisi Gender
              </h2>

              {loading ? (
                <div className="mt-5 space-y-4">
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Mars size={16} className="text-cyan-600" />
                        Laki-laki
                      </span>
                      <span className="text-slate-400">
                        {totalLakiLaki} ({genderPercent(totalLakiLaki)}%)
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500"
                        style={{ width: `${genderPercent(totalLakiLaki)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <Venus size={16} className="text-pink-600" />
                        Perempuan
                      </span>
                      <span className="text-slate-400">
                        {totalPerempuan} ({genderPercent(totalPerempuan)}%)
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-500"
                        style={{ width: `${genderPercent(totalPerempuan)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200/70">
                    <p className="text-xs leading-relaxed text-slate-500">
                      Statistik di atas dihitung langsung dari data API{' '}
                      <span className="font-mono">GET /api/mahasiswa</span>{' '}
                      yang terhubung ke database PostgreSQL.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Users size={20} className="text-blue-600" />
                Mahasiswa Terbaru
              </h2>
              <Link
                to="/mahasiswa"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Lihat Semua
                <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-4 text-center">
                <p className="text-sm text-slate-500">
                  Belum ada data mahasiswa yang terdaftar.
                </p>
                <Link
                  to="/mahasiswa/tambah"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Tambah Mahasiswa Pertama
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Mahasiswa
                      </th>
                      <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        NIM
                      </th>
                      <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Kelas
                      </th>
                      <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Jenis Kelamin
                      </th>
                      <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Tanggal Lahir
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recent.map((m) => (
                      <tr key={m.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {getInitials(m.nama_mahasiswa)}
                            </div>
                            <span className="font-medium text-slate-800">
                              {m.nama_mahasiswa}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-blue-700">
                          {m.nim}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {m.kelas}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {m.jenis_kelamin === 'L' ? (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                              Laki-laki
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-700 ring-1 ring-inset ring-pink-200">
                              Perempuan
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {formatTanggal(m.tanggal_lahir)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/mahasiswa/${m.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye size={14} />
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
