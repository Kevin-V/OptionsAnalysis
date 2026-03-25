'use client'

import { useState } from 'react'

const STRATEGY_GROUPS = [
  {
    label: 'Beginner',
    color: 'green',
    strategies: [
      { id: 'long-call', name: 'Long Call', tag: 'Bullish' },
      { id: 'long-put', name: 'Long Put', tag: 'Bearish' },
      { id: 'covered-call', name: 'Covered Call', tag: 'Income' },
      { id: 'cash-secured-put', name: 'Cash-Secured Put', tag: 'Income' },
      { id: 'protective-put', name: 'Protective Put', tag: 'Hedge' },
    ],
  },
  {
    label: 'Intermediate',
    color: 'blue',
    strategies: [
      { id: 'bull-call-spread', name: 'Bull Call Spread', tag: 'Bullish' },
      { id: 'bear-put-spread', name: 'Bear Put Spread', tag: 'Bearish' },
      { id: 'bull-put-spread', name: 'Bull Put Spread', tag: 'Bullish' },
      { id: 'bear-call-spread', name: 'Bear Call Spread', tag: 'Bearish' },
      { id: 'calendar-spread', name: 'Calendar Spread', tag: 'Neutral' },
      { id: 'diagonal-spread', name: 'PMCC / Diagonal', tag: 'Bullish' },
    ],
  },
  {
    label: 'Advanced',
    color: 'purple',
    strategies: [
      { id: 'iron-condor', name: 'Iron Condor', tag: 'Neutral' },
      { id: 'butterfly', name: 'Butterfly', tag: 'Neutral' },
      { id: 'straddle', name: 'Long Straddle', tag: 'Volatility' },
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  Bullish: 'text-green-600',
  Bearish: 'text-red-600',
  Income: 'text-blue-600',
  Hedge: 'text-amber-600',
  Neutral: 'text-gray-500',
  Volatility: 'text-purple-600',
}

const GROUP_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
}

interface Props {
  selected: string
  onChange: (strategyId: string) => void
}

const LEVEL_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const

export function StrategyPicker({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('All')

  const selectedName = selected
    ? STRATEGY_GROUPS.flatMap(g => g.strategies).find(s => s.id === selected)?.name ?? selected
    : 'Auto-suggest (top 3)'

  const visibleGroups = filter === 'All'
    ? STRATEGY_GROUPS
    : STRATEGY_GROUPS.filter(g => g.label === filter)

  function pick(id: string) {
    onChange(id)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="font-medium text-gray-500">Strategy:</span>
        <span>{selectedName}</span>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            {/* Level filter tabs */}
            <div className="mb-2 flex gap-1 rounded-lg bg-gray-100 p-0.5">
              {LEVEL_FILTERS.map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    filter === level
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <button
              onClick={() => pick('')}
              className={`mb-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                selected === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Auto-suggest (top 3)
            </button>

            <div className="space-y-3">
              {visibleGroups.map(group => {
                const colors = GROUP_COLORS[group.color]
                return (
                  <div key={group.label}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colors.badge}`}>
                        {group.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {group.strategies.map(s => (
                        <button
                          key={s.id}
                          onClick={() => pick(s.id)}
                          className={`rounded-lg border px-2.5 py-2 text-left text-sm transition-colors ${
                            selected === s.id
                              ? `${colors.bg} ${colors.border} font-medium`
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900 leading-tight">{s.name}</div>
                          <div className={`text-xs ${TAG_COLORS[s.tag] ?? 'text-gray-500'}`}>{s.tag}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
