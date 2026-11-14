interface SpinnerProps {
  className?: string
}

export function Spinner({ className = 'h-5 w-5' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  )
}

interface LoadingProps {
  text?: string
  className?: string
}

export default function Loading({
  text = 'Memuat data...',
  className = '',
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-500 ${className}`}
    >
      <Spinner className="h-8 w-8 text-blue-600" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  )
}
