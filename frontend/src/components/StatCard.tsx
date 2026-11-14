import type { LucideIcon } from 'lucide-react'

type StatColor = 'blue' | 'emerald' | 'pink' | 'amber' | 'violet' | 'cyan'

const colorMap: Record<StatColor, { bg: string; text: string; accent: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', accent: 'from-blue-500 to-blue-600' },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    accent: 'from-emerald-500 to-emerald-600',
  },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', accent: 'from-pink-500 to-pink-600' },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    accent: 'from-amber-500 to-amber-600',
  },
  violet: {
    bg: 'bg-violet-100',
    text: 'text-violet-600',
    accent: 'from-violet-500 to-violet-600',
  },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', accent: 'from-cyan-500 to-cyan-600' },
}

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: StatColor
  loading?: boolean
  subtitle?: string
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading = false,
  subtitle,
}: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-800">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} text-white shadow-lg transition-transform group-hover:scale-105`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}
