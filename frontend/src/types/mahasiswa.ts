export interface Mahasiswa {
  id: number
  nim: string
  nama_mahasiswa: string
  jenis_kelamin: 'L' | 'P'
  tempat_lahir: string
  tanggal_lahir: string
  kelas: string
  alamat: string
  nama_ibu_kandung: string
  no_hp_orang_tua: string
  keterangan: string | null
}

export interface MahasiswaInput {
  nim: string
  nama_mahasiswa: string
  jenis_kelamin: 'L' | 'P' | 'G'
  tempat_lahir: string
  tanggal_lahir: string
  kelas: string
  alamat: string
  nama_ibu_kandung: string
  no_hp_orang_tua: string
  keterangan?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
