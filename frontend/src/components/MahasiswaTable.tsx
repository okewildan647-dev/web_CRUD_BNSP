import type { Mahasiswa } from '../types/mahasiswa'
import { Eye, Pencil, Trash2, Users } from 'lucide-react'
import { formatTanggal } from '../utils/format'

interface MahasiswaTableProps {
  data: Mahasiswa[]
  startIndex: number
  loading: boolean
  emptyTitle: string
  emptyDescription: string
  onDetail: (mahasiswa: Mahasiswa) => void
  onEdit: (mahasiswa: Mahasiswa) => void
  onDelete: (mahasiswa: Mahasiswa) => void
}

const headers = [
  'No.',
  'NIM',
  'Nama Mahasiswa',
  'Jenis Kelamin',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Kelas',
  'Alamat',
  'Nama Ibu Kandung',
  'No. HP Orang Tua',
  'Keterangan',
  'Aksi',
]

function GenderBadge({ jenis }: { jenis: 'L' | 'P' }) {
  return jenis === 'L' ? (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
      Laki-laki
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-700 ring-1 ring-inset ring-pink-200">
      Perempuan
    </span>
  )
}

function ActionButtons({
  mahasiswa,
  onDetail,
  onEdit,
  onDelete,
  compact = false,
}: {
  mahasiswa: Mahasiswa
  onDetail: (m: Mahasiswa) => void
  onEdit: (m: Mahasiswa) => void
  onDelete: (m: Mahasiswa) => void
  compact?: boolean
}) {
  const base = compact
    ? 'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors'
    : 'rounded-lg p-2 transition-colors'

  return (
    <div className={compact ? 'flex gap-2' : 'flex items-center gap-1'}>
      <button
        type="button"
        onClick={() => onDetail(mahasiswa)}
        title="Lihat detail"
        aria-label={`Lihat detail ${mahasiswa.nama_mahasiswa}`}
        className={`${base} bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700`}
      >
        <Eye size={16} />
        {compact && 'Detail'}
      </button>
      <button
        type="button"
        onClick={() => onEdit(mahasiswa)}
        title="Edit data"
        aria-label={`Edit data ${mahasiswa.nama_mahasiswa}`}
        className={`${base} bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700`}
      >
        <Pencil size={16} />
        {compact && 'Edit'}
      </button>
      <button
        type="button"
        onClick={() => onDelete(mahasiswa)}
        title="Hapus data"
        aria-label={`Hapus data ${mahasiswa.nama_mahasiswa}`}
        className={`${base} bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700`}
      >
        <Trash2 size={16} />
        {compact && 'Hapus'}
      </button>
    </div>
  )
}

function TableSkeleton() {
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50">
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-slate-100">
                {headers.map((h, cellIndex) => (
                  <td key={h} className="px-4 py-4">
                    <div
                      className="h-4 animate-pulse rounded bg-slate-100"
                      style={{ width: `${45 + ((rowIndex + cellIndex) % 4) * 15}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl bg-slate-100 ring-1 ring-slate-200/70"
          />
        ))}
      </div>
    </>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Users size={32} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}

export default function MahasiswaTable({
  data,
  startIndex,
  loading,
  emptyTitle,
  emptyDescription,
  onDetail,
  onEdit,
  onDelete,
}: MahasiswaTableProps) {
  if (loading) return <TableSkeleton />
  if (data.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl ring-1 ring-slate-200/70 md:block">
        <table className="w-full min-w-[1150px] text-left text-sm">
          <thead>
            <tr className="bg-slate-50">
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((mahasiswa, index) => (
              <tr
                key={mahasiswa.id}
                className="bg-white transition-colors hover:bg-slate-50/70"
              >
                <td className="px-4 py-3.5 text-center text-sm text-slate-400">
                  {startIndex + index + 1}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-blue-700">
                  {mahasiswa.nim}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-800">
                  {mahasiswa.nama_mahasiswa}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <GenderBadge jenis={mahasiswa.jenis_kelamin} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {mahasiswa.tempat_lahir}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {formatTanggal(mahasiswa.tanggal_lahir)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {mahasiswa.kelas}
                  </span>
                </td>
                <td className="max-w-[180px] truncate px-4 py-3.5 text-slate-600" title={mahasiswa.alamat}>
                  {mahasiswa.alamat}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {mahasiswa.nama_ibu_kandung}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {mahasiswa.no_hp_orang_tua}
                </td>
                <td
                  className="max-w-[160px] truncate px-4 py-3.5 text-slate-500"
                  title={mahasiswa.keterangan ?? undefined}
                >
                  {mahasiswa.keterangan ?? '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <ActionButtons
                    mahasiswa={mahasiswa}
                    onDetail={onDetail}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {data.map((mahasiswa, index) => (
          <div
            key={mahasiswa.id}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  #{startIndex + index + 1} &middot; NIM {mahasiswa.nim}
                </p>
                <h3 className="mt-0.5 truncate text-base font-bold text-slate-800">
                  {mahasiswa.nama_mahasiswa}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <GenderBadge jenis={mahasiswa.jenis_kelamin} />
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {mahasiswa.kelas}
                  </span>
                </div>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-400">Tempat Lahir</dt>
                <dd className="font-medium text-slate-700">{mahasiswa.tempat_lahir}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-400">Tanggal Lahir</dt>
                <dd className="font-medium text-slate-700">
                  {formatTanggal(mahasiswa.tanggal_lahir)}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-400">Alamat</dt>
                <dd className="font-medium text-slate-700">{mahasiswa.alamat}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-400">Nama Ibu Kandung</dt>
                <dd className="font-medium text-slate-700">{mahasiswa.nama_ibu_kandung}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-400">No. HP Orang Tua</dt>
                <dd className="font-medium text-slate-700">{mahasiswa.no_hp_orang_tua}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-32 shrink-0 text-slate-400">Keterangan</dt>
                <dd className="font-medium text-slate-700">{mahasiswa.keterangan ?? '-'}</dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <ActionButtons
                mahasiswa={mahasiswa}
                onDetail={onDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                compact
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
