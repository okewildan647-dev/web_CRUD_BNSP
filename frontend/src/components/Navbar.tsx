import { useLocation } from 'react-router-dom'
import { Home, Menu } from 'lucide-react'

interface NavbarProps {
  onMenuClick: () => void
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] === 'dashboard') return 'Dashboard'
  if (segments[0] === 'mahasiswa') {
    if (segments.length === 1) return 'Data Mahasiswa'
    if (segments[1] === 'tambah') return 'Tambah Mahasiswa'
    if (segments[2] === 'edit') return 'Edit Mahasiswa'
    return 'Detail Mahasiswa'
  }
  return 'SIM Mahasiswa'
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation()
  const title = getPageTitle(location.pathname)
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Buka menu navigasi"
          >
            <Menu size={22} />
          </button>
          <div className="hidden items-center gap-2 text-sm text-slate-400 md:flex">
            <Home size={16} />
            <span className="font-medium text-slate-500">SIM Mahasiswa</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">{title}</span>
          </div>
          <h2 className="truncate text-base font-bold text-slate-800 md:hidden">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 md:block">
            {today}
          </span>
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">
                Administrator
              </p>
              <p className="text-xs text-slate-400">Admin SIM</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-md">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
