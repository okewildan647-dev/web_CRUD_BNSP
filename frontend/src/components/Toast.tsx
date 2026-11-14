import { useEffect } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  type: ToastType
  message: string
  onClose: () => void
}

export default function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose, message])

  const isError = type === 'error'

  return (
    <div
      role="alert"
      className={`fixed right-4 top-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-white shadow-xl animate-[toast-in_0.25s_ease-out] ${
        isError ? 'bg-red-600' : 'bg-emerald-600'
      }`}
    >
      {isError ? (
        <XCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}
      <p className="text-sm font-medium leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-0.5 shrink-0 rounded-md p-0.5 transition-colors hover:bg-white/20"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  )
}
