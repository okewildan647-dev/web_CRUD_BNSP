import { useState, type ChangeEvent, type FormEvent } from 'react'
import { AlertTriangle, Loader2, Save } from 'lucide-react'
import type { Mahasiswa, MahasiswaInput } from '../types/mahasiswa'

interface FormState {
  nim: string
  nama_mahasiswa: string
  jenis_kelamin: '' | 'L' | 'P'
  tempat_lahir: string
  tanggal_lahir: string
  kelas: string
  alamat: string
  nama_ibu_kandung: string
  no_hp_orang_tua: string
  keterangan: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

interface MahasiswaFormProps {
  mode: 'create' | 'edit'
  initialData?: Mahasiswa
  existingNims: string[]
  onSubmit: (input: MahasiswaInput) => Promise<void>
  onCancel: () => void
}

const emptyForm: FormState = {
  nim: '',
  nama_mahasiswa: '',
  jenis_kelamin: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  kelas: '',
  alamat: '',
  nama_ibu_kandung: '',
  no_hp_orang_tua: '',
  keterangan: '',
}

function createInitialState(initialData?: Mahasiswa): FormState {
  if (!initialData) return emptyForm
  return {
    nim: initialData.nim,
    nama_mahasiswa: initialData.nama_mahasiswa,
    jenis_kelamin: initialData.jenis_kelamin,
    tempat_lahir: initialData.tempat_lahir,
    tanggal_lahir: initialData.tanggal_lahir.slice(0, 10),
    kelas: initialData.kelas,
    alamat: initialData.alamat,
    nama_ibu_kandung: initialData.nama_ibu_kandung,
    no_hp_orang_tua: initialData.no_hp_orang_tua,
    keterangan: initialData.keterangan ?? '',
  }
}

function validate(
  form: FormState,
  existingNims: string[],
  currentNim: string
): FormErrors {
  const errors: FormErrors = {}

  const nim = form.nim.trim()
  if (!nim) errors.nim = 'NIM wajib diisi.'
  else if (!/^\d{5,15}$/.test(nim))
    errors.nim = 'NIM hanya boleh berisi angka (5-15 digit).'
  else if (nim !== currentNim && existingNims.includes(nim))
    errors.nim = 'NIM sudah terdaftar untuk mahasiswa lain.'

  const nama = form.nama_mahasiswa.trim()
  if (!nama) errors.nama_mahasiswa = 'Nama mahasiswa wajib diisi.'
  else if (nama.length < 3) errors.nama_mahasiswa = 'Nama minimal 3 karakter.'

  if (!form.jenis_kelamin) errors.jenis_kelamin = 'Pilih jenis kelamin.'

  if (!form.tempat_lahir.trim()) errors.tempat_lahir = 'Tempat lahir wajib diisi.'

  if (!form.tanggal_lahir) errors.tanggal_lahir = 'Tanggal lahir wajib diisi.'
  else {
    const date = new Date(form.tanggal_lahir)
    if (Number.isNaN(date.getTime())) errors.tanggal_lahir = 'Tanggal lahir tidak valid.'
    else if (date.getTime() > Date.now())
      errors.tanggal_lahir = 'Tanggal lahir tidak boleh di masa depan.'
  }

  if (!form.kelas.trim()) errors.kelas = 'Kelas wajib diisi.'

  const alamat = form.alamat.trim()
  if (!alamat) errors.alamat = 'Alamat wajib diisi.'
  else if (alamat.length < 5) errors.alamat = 'Alamat minimal 5 karakter.'

  const ibu = form.nama_ibu_kandung.trim()
  if (!ibu) errors.nama_ibu_kandung = 'Nama ibu kandung wajib diisi.'
  else if (ibu.length < 3) errors.nama_ibu_kandung = 'Nama ibu kandung minimal 3 karakter.'

  const hp = form.no_hp_orang_tua.trim()
  if (!hp) errors.no_hp_orang_tua = 'Nomor HP orang tua wajib diisi.'
  else if (!/^08\d{8,11}$/.test(hp))
    errors.no_hp_orang_tua =
      "Nomor HP harus diawali '08' dengan panjang total 10-13 digit."

  return errors
}

const sectionClass = 'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6'
const sectionTitleClass =
  'flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700'
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700'
const errorTextClass = 'mt-1.5 text-xs font-medium text-red-600'

export default function MahasiswaForm({
  mode,
  initialData,
  existingNims,
  onSubmit,
  onCancel,
}: MahasiswaFormProps) {
  const [form, setForm] = useState<FormState>(() => createInitialState(initialData))
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isEdit = mode === 'edit'
  const currentNim = isEdit ? initialData?.nim ?? '' : ''

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
    }`

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'nim' || name === 'no_hp_orang_tua' ? value.replace(/\s/g, '') : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError(null)
  }

  const runValidation = (): FormErrors => validate(form, existingNims, currentNim)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = runValidation()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setApiError(null)
      return
    }

    const payload: MahasiswaInput = {
      nim: form.nim.trim(),
      nama_mahasiswa: form.nama_mahasiswa.trim(),
      jenis_kelamin: form.jenis_kelamin as 'L' | 'P',
      tempat_lahir: form.tempat_lahir.trim(),
      tanggal_lahir: form.tanggal_lahir,
      kelas: form.kelas.trim(),
      alamat: form.alamat.trim(),
      nama_ibu_kandung: form.nama_ibu_kandung.trim(),
      no_hp_orang_tua: form.no_hp_orang_tua.trim(),
      keterangan: form.keterangan.trim() === '' ? null : form.keterangan.trim(),
    }

    setSubmitting(true)
    setApiError(null)
    try {
      await onSubmit(payload)
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {apiError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Gagal menyimpan data</p>
            <p className="mt-0.5 leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Data Pribadi</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nim" className={labelClass}>
              NIM <span className="text-red-500">*</span>
            </label>
            <input
              id="nim"
              name="nim"
              type="text"
              inputMode="numeric"
              value={form.nim}
              onChange={handleChange}
              placeholder="Contoh: 2021001234"
              className={inputClass(Boolean(errors.nim))}
              disabled={submitting}
            />
            {errors.nim && <p className={errorTextClass}>{errors.nim}</p>}
          </div>

          <div>
            <label htmlFor="nama_mahasiswa" className={labelClass}>
              Nama Mahasiswa <span className="text-red-500">*</span>
            </label>
            <input
              id="nama_mahasiswa"
              name="nama_mahasiswa"
              type="text"
              value={form.nama_mahasiswa}
              onChange={handleChange}
              placeholder="Nama lengkap mahasiswa"
              className={inputClass(Boolean(errors.nama_mahasiswa))}
              disabled={submitting}
            />
            {errors.nama_mahasiswa && (
              <p className={errorTextClass}>{errors.nama_mahasiswa}</p>
            )}
          </div>

          <div>
            <label htmlFor="jenis_kelamin" className={labelClass}>
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select
              id="jenis_kelamin"
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
              className={inputClass(Boolean(errors.jenis_kelamin))}
              disabled={submitting}
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="L">L - Laki-laki</option>
              <option value="P">P - Perempuan</option>
            </select>
            {errors.jenis_kelamin && (
              <p className={errorTextClass}>{errors.jenis_kelamin}</p>
            )}
          </div>

          <div>
            <label htmlFor="tempat_lahir" className={labelClass}>
              Tempat Lahir <span className="text-red-500">*</span>
            </label>
            <input
              id="tempat_lahir"
              name="tempat_lahir"
              type="text"
              value={form.tempat_lahir}
              onChange={handleChange}
              placeholder="Contoh: Bandung"
              className={inputClass(Boolean(errors.tempat_lahir))}
              disabled={submitting}
            />
            {errors.tempat_lahir && (
              <p className={errorTextClass}>{errors.tempat_lahir}</p>
            )}
          </div>

          <div>
            <label htmlFor="tanggal_lahir" className={labelClass}>
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input
              id="tanggal_lahir"
              name="tanggal_lahir"
              type="date"
              max={today}
              value={form.tanggal_lahir}
              onChange={handleChange}
              className={inputClass(Boolean(errors.tanggal_lahir))}
              disabled={submitting}
            />
            {errors.tanggal_lahir && (
              <p className={errorTextClass}>{errors.tanggal_lahir}</p>
            )}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Data Akademik &amp; Alamat</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="kelas" className={labelClass}>
              Kelas <span className="text-red-500">*</span>
            </label>
            <input
              id="kelas"
              name="kelas"
              type="text"
              value={form.kelas}
              onChange={handleChange}
              placeholder="Contoh: TI-3A"
              className={inputClass(Boolean(errors.kelas))}
              disabled={submitting}
            />
            {errors.kelas && <p className={errorTextClass}>{errors.kelas}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="alamat" className={labelClass}>
              Alamat <span className="text-red-500">*</span>
            </label>
            <textarea
              id="alamat"
              name="alamat"
              rows={3}
              value={form.alamat}
              onChange={handleChange}
              placeholder="Alamat lengkap tempat tinggal"
              className={`${inputClass(Boolean(errors.alamat))} resize-y`}
              disabled={submitting}
            />
            {errors.alamat && <p className={errorTextClass}>{errors.alamat}</p>}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Data Orang Tua &amp; Keterangan</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nama_ibu_kandung" className={labelClass}>
              Nama Ibu Kandung <span className="text-red-500">*</span>
            </label>
            <input
              id="nama_ibu_kandung"
              name="nama_ibu_kandung"
              type="text"
              value={form.nama_ibu_kandung}
              onChange={handleChange}
              placeholder="Nama lengkap ibu kandung"
              className={inputClass(Boolean(errors.nama_ibu_kandung))}
              disabled={submitting}
            />
            {errors.nama_ibu_kandung && (
              <p className={errorTextClass}>{errors.nama_ibu_kandung}</p>
            )}
          </div>

          <div>
            <label htmlFor="no_hp_orang_tua" className={labelClass}>
              Nomor HP Orang Tua <span className="text-red-500">*</span>
            </label>
            <input
              id="no_hp_orang_tua"
              name="no_hp_orang_tua"
              type="tel"
              inputMode="numeric"
              value={form.no_hp_orang_tua}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              className={inputClass(Boolean(errors.no_hp_orang_tua))}
              disabled={submitting}
            />
            {errors.no_hp_orang_tua && (
              <p className={errorTextClass}>{errors.no_hp_orang_tua}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="keterangan" className={labelClass}>
              Keterangan <span className="text-slate-400">(opsional)</span>
            </label>
            <textarea
              id="keterangan"
              name="keterangan"
              rows={3}
              value={form.keterangan}
              onChange={handleChange}
              placeholder="Catatan tambahan mengenai mahasiswa (boleh dikosongkan)"
              className={`${inputClass(false)} resize-y`}
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {submitting
            ? 'Menyimpan...'
            : isEdit
              ? 'Simpan Perubahan'
              : 'Simpan Data Mahasiswa'}
        </button>
      </div>
    </form>
  )
}
