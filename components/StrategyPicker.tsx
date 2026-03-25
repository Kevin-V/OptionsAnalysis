'use client'

const ALL_STRATEGIES = [
  { id: '', name: 'Auto-suggest (top 3)' },
  { id: 'covered-call', name: 'Covered Call' },
  { id: 'cash-secured-put', name: 'Cash-Secured Put' },
  { id: 'iron-condor', name: 'Iron Condor' },
  { id: 'bull-call-spread', name: 'Bull Call Spread' },
  { id: 'bear-put-spread', name: 'Bear Put Spread' },
  { id: 'long-call', name: 'Long Call' },
  { id: 'long-put', name: 'Long Put' },
  { id: 'butterfly', name: 'Butterfly Spread' },
  { id: 'protective-put', name: 'Protective Put' },
  { id: 'straddle', name: 'Long Straddle' },
]

interface Props {
  selected: string
  onChange: (strategyId: string) => void
}

export function StrategyPicker({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">Strategy</label>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {ALL_STRATEGIES.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}
