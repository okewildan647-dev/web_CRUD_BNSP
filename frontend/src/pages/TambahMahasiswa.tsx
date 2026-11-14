
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMahasiswa } from '../services/mahasiswaService'
import type { MahasiswaInput } from '../types/mahasiswa'

function TambahMahasiswa() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<MahasiswaInput>({
    nim: '',
    nama_mahasiswa: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    kelas: '',
    alamat: '',
    nama_ibu_kandung: '',
    no_hp_orang_tua: '',
    keterangan: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createMahasiswa(form)
      alert('Data mahasiswa berhasil ditambahkan!')
      navigate('/mahasiswa')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan data mahasiswa.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'nim', label: 'NIM', type: 'text' },
    { name: 'nama_mahasiswa', label: 'Nama Mahasiswa', type: 'text' },
    { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text' },
    { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date' },
    { name: 'kelas', label: 'Kelas', type: 'text' },
    { name: 'nama_ibu_kandung', label: 'Nama Ibu Kandung', type: 'text' },
    { name: 'no_hp_orang_tua', label: 'No. HP Orang Tua', type: 'tel' },
  ]

  return (
    <div style={{ maxWidth: '850px', padding: '24px', color: '#1e293b' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        Tambah Mahasiswa
      </h1>
      <p style={{ color: '#64748b', margin: '8px 0 24px' }}>
        Lengkapi formulir berikut untuk menambahkan data mahasiswa.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
          }}
        >
          {fields.map((field) => (
            <label key={field.name} style={{ display: 'grid', gap: '8px' }}>
              <span>{field.label} *</span>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof MahasiswaInput] ?? ''}
                onChange={handleChange}
                required
                style={{
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                }}
              />
            </label>
          ))}

          <label style={{ display: 'grid', gap: '8px' }}>
            Jenis Kelamin *
            <select
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
              style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: '8px', gridColumn: '1 / -1' }}>
            Alamat *
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              required
              rows={3}
              style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', gridColumn: '1 / -1' }}>
            Keterangan
            <textarea
              name="keterangan"
              value={form.keterangan ?? ''}
              onChange={handleChange}
              rows={3}
              style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            />
          </label>
        </div>

        {error && (
          <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Mahasiswa'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/mahasiswa')}
            style={{
              padding: '12px 24px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

export default TambahMahasiswa
