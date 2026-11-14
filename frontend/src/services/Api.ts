
import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: sisipkan token Bearer otomatis di setiap request
api.interceptors.request.use((config) => {
  // Ambil token yang disimpan saat login
  const token = localStorage.getItem('token');

  // Tambahkan header Authorization jika token ada
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
