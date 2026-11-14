
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export interface User {
  uuid: string;
  email: string;
  id_mhs: number;
  nim: string;
  nama_mahasiswa: string;
  kelas: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Menyediakan state login ke seluruh aplikasi
export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // Ambil user dari localStorage saat aplikasi dibuka
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  // Ambil token dari localStorage saat aplikasi dibuka
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );

  // Simpan user & token setelah login berhasil
  const login = (userData: User, jwtToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);

    setUser(userData);
    setToken(jwtToken);
  };

  // Hapus user & token saat logout
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        // Dianggap login jika token & user tersedia
        isAuthenticated: Boolean(token && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk mengakses AuthContext dari komponen
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Pastikan dipakai di dalam AuthProvider
  if (!context) {
    throw new Error(
      'useAuth harus digunakan di dalam AuthProvider'
    );
  }

  return context;
};
