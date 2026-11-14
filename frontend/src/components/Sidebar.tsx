
import { NavLink, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  LayoutDashboard,
  UserPlus,
  Users,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface MenuItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const menuItems: MenuItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/mahasiswa', label: 'Data Mahasiswa', icon: Users, end: true },
  { to: '/mahasiswa/tambah', label: 'Tambah Mahasiswa', icon: UserPlus },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    const konfirmasi = window.confirm(
      'Apakah Anda yakin ingin keluar dari aplikasi?'
    )

    if (!konfirmasi) return

    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigasi"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-950/60">
            <GraduationCap size={24} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight">
              SIM Mahasiswa
            </p>
            <p className="truncate text-xs text-slate-400">
              Sistem Informasi Mahasiswa
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Utama
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800/80 px-4 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={20} />
            Logout
          </button>

          <div className="mt-4 flex items-center gap-2 px-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            SIM Mahasiswa v1.0
          </div>
        </div>
      </aside>
    </>
  )
}
