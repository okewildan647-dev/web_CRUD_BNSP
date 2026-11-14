
import { useEffect, useState } from 'react'
import { getAllMahasiswa } from '../services/mahasiswaService'
import type { Mahasiswa } from '../types/mahasiswa'

function MahasiswaPage() {
  const [data, setData] = useState<Mahasiswa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await getAllMahasiswa()
      setData(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data mahasiswa.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = data.filter((m) =>
    `${m.nim} ${m.nama_mahasiswa} ${m.kelas}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '24px', color: '#1e293b' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
          Data Mahasiswa
        </h1>
        <p style={{ color: '#64748b', marginTop: '6px' }}>
          Daftar seluruh mahasiswa yang tersimpan di database.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '10px' }}>
          <p style={{ color: '#64748b' }}>Total Mahasiswa</p>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {data.length}
          </h2>
        </div>

        <button
          onClick={fetchData}
          style={{
            padding: '12px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Refresh Data
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari NIM, nama, atau kelas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      />

      {loading ? (
        <p>Memuat data mahasiswa...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
            }}
          >
            <thead style={{ background: '#e2e8f0' }}>
              <tr>
                {['No', 'NIM', 'Nama Mahasiswa', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Kelas', 'Alamat'].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: '14px',
                      textAlign: 'left',
                      borderBottom: '1px solid #cbd5e1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((m, index) => (
                <tr key={m.id}>
                  {[
                    index + 1,
                    m.nim,
                    m.nama_mahasiswa,
                    m.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    m.tempat_lahir,
                    m.tanggal_lahir,
                    m.kelas,
                    m.alamat,
                  ].map((value, i) => (
                    <td
                      key={i}
                      style={{
                        padding: '14px',
                        borderBottom: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center' }}>
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '16px', color: '#64748b' }}>
        Menampilkan {filteredData.length} dari {data.length} mahasiswa.
      </p>
    </div>
  )
}

export default MahasiswaPage

