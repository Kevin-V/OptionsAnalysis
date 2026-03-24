'use client'
import { useState } from 'react'
import type { RankedStrategy, ExperienceLevel, ExplainResponse } from '@/lib/types'

interface Props {
  strategy: RankedStrategy
  symbol: string
  underlyingPrice: number
  ivRank: number
  experienceLevel: ExperienceLevel
}

export function StrategyCard({ strategy, symbol, underlyingPrice, ivRank, experienceLevel }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleExpand() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (explanation) return

    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, underlyingPrice, ivRank, strategy, experienceLevel }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setExplanation(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{strategy.strategy.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{strategy.strategy.description}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {strategy.confidenceScore}% match
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {strategy.matchedSignals.map(signal => (
          <span key={signal} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">
            {signal}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-500">Probability of Profit</p>
          <p className="text-lg font-bold text-gray-900">{strategy.probabilityOfProfit.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Break-even Price{strategy.breakEvenPrices.length > 1 ? 's' : ''}</p>
          <p className="text-lg font-bold text-gray-900">
            {strategy.breakEvenPrices.map(p => `$${p.toFixed(2)}`).join(' / ')}
          </p>
        </div>
      </div>

      <button
        onClick={handleExpand}
        className="mt-4 flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <span>Why this strategy?</span>
        <span>{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm">
          {loading && <p className="text-gray-500">Loading explanation...</p>}
          {error && <p className="text-gray-400 italic">Explanation unavailable</p>}
          {explanation && (
            <>
              <p className="text-gray-700">{explanation.explanation}</p>
              {explanation.keyRisks.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-gray-900">Key risks:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-gray-600">
                    {explanation.keyRisks.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              )}
              {explanation.idealConditions && (
                <p className="mt-3 text-gray-600">
                  <span className="font-medium text-gray-900">Ideal when: </span>
                  {explanation.idealConditions}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
