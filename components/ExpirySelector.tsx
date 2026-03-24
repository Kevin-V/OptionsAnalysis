'use client'

interface Props {
  expiryDates: string[]
  selected: string
  onChange: (expiry: string) => void
}

function formatExpiry(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${label} (${diffDays}d)`
}

export function ExpirySelector({ expiryDates, selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">Expiration</label>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {expiryDates.map(d => (
          <option key={d} value={d}>{formatExpiry(d)}</option>
        ))}
      </select>
    </div>
  )
}
