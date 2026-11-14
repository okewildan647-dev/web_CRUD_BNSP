
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Bentuk response dari POST /api/auth/login
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      uuid: string;
      email: string;
      id_mhs: number;
      nim: string;
      nama_mahasiswa: string;
      kelas: string;
    };
    token: string;
  };
}

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kirim kredensial ke backend
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`,
        { email, password }
      );

      // Jika login berhasil, simpan user & token lalu ke dashboard
      if (response.data.success) {
        login(
          response.data.data.user,
          response.data.data.token
        );
        // console.log(localStorage.token)
        navigate('/dashboard');
      }
    } catch (err) {
      // Tampilkan pesan error dari backend
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          'Login gagal. Periksa koneksi backend.'
        );
      } else {
        setError('Terjadi kesalahan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700">
            Login Mahasiswa
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Silakan masuk menggunakan akun Anda
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
