
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import Mahasiswa from './pages/Mahasiswa'
import TambahMahasiswa from './pages/TambahMahasiswa'
import EditMahasiswa from './pages/EditMahasiswa'
import DetailMahasiswa from './pages/DetailMahasiswa'
import Login from './pages/login'

import { useAuth } from './context/AuthContext'

function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200/70">
      <p className="text-5xl font-extrabold text-blue-600">404</p>
      <h1 className="mt-4 text-xl font-bold text-slate-800">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Halaman yang Anda tuju tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
      >
        <ArrowLeft size={18} />
        Kembali ke Dashboard
      </Link>
    </div>
  )
}

export default function App() {
  // Status login dari AuthContext (berdasarkan localStorage)
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Jika sudah login, halaman login dialihkan ke dashboard */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      {/* Route terproteksi: wajib login, jika tidak dialihkan ke /login */}
      <Route
        element={
          isAuthenticated
            ? <AdminLayout />
            : <Navigate to="/login" replace />
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mahasiswa" element={<Mahasiswa />} />
        <Route path="/mahasiswa/tambah" element={<TambahMahasiswa />} />
        <Route path="/mahasiswa/:id" element={<DetailMahasiswa />} />
        <Route path="/mahasiswa/:id/edit" element={<EditMahasiswa />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
