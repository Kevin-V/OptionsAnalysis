'use client'
import { useState, useMemo } from 'react'
import type { RankedStrategy, ExperienceLevel, ExplainResponse, StrategyLeg } from '@/lib/types'

interface SlimContract {
  strike: number
  type: 'call' | 'put'
  bid: number
  ask: number
  iv?: number
}

interface Props {
  strategy: RankedStrategy
  symbol: string
  underlyingPrice: number
  ivRank: number
  experienceLevel: ExperienceLevel
  callStrikes: number[]
  putStrikes: number[]
  contracts: SlimContract[]
  selectedExpiry?: string
}

function midPrice(c: SlimContract): number {
  return (c.bid + c.ask) / 2
}

function findContract(contracts: SlimContract[], type: 'call' | 'put', strike: number): SlimContract | undefined {
  return contracts.find(c => c.type === type && c.strike === strike)
}

function daysToExpiry(expiry: string): number {
  if (!expiry) return 30
  // Strip any "(LEAP)" or "(longer)" annotations
  const clean = expiry.replace(/\s*\(.*\)/, '')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(clean + 'T16:00:00')
  if (isNaN(exp.getTime())) return 30
  const days = Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, days)
}

/** Approximate delta using simplified Black-Scholes with actual DTE */
function estimateDelta(type: 'call' | 'put', strike: number, underlyingPrice: number, iv: number = 0.3, dte: number = 30): number {
  const timeYears = Math.max(1, dte) / 365
  const sqrtT = Math.sqrt(timeYears)
  const moneyness = Math.log(underlyingPrice / strike)
  const d1 = moneyness / (iv * sqrtT) + 0.5 * iv * sqrtT
  const callDelta = 1 / (1 + Math.exp(-1.7 * d1))
  return type === 'call' ? callDelta : callDelta - 1
}

/** Get IV from contract data, or estimate from bid/ask */
function getIV(c: SlimContract, underlyingPrice: number): number {
  if (c.iv && c.iv > 0.01) return c.iv
  const mid = midPrice(c)
  if (mid <= 0 || underlyingPrice <= 0) return 0.3
  const timeYears = 30 / 365
  const approxIV = (mid / underlyingPrice) / Math.sqrt(timeYears / (2 * Math.PI))
  return Math.max(0.05, Math.min(2.0, approxIV))
}

function getLegDelta(leg: StrategyLeg, contracts: SlimContract[], underlyingPrice: number, expiry: string): number | null {
  if (leg.type === 'stock') return null
  const c = findContract(contracts, leg.type, leg.strike)
  const iv = c ? getIV(c, underlyingPrice) : 0.3
  const dte = daysToExpiry(expiry || leg.expiry)
  return estimateDelta(leg.type, leg.strike, underlyingPrice, iv, dte)
}

function calcPoP(strategyId: string, legs: StrategyLeg[], contracts: SlimContract[], underlyingPrice: number, dte: number): number {
  const clamp = (v: number, lo: number, hi: number) => Math.round(Math.max(lo, Math.min(hi, v)))

  switch (strategyId) {
    case 'covered-call':
    case 'cash-secured-put': {
      const short = legs.find(l => l.action === 'sell' && l.type !== 'stock')
      if (!short) return 50
      const c = findContract(contracts, short.type, short.strike)
      const iv = c ? getIV(c, underlyingPrice) : 0.3
      const delta = estimateDelta(short.type, short.strike, underlyingPrice, iv, dte)
      return clamp((1 - Math.abs(delta)) * 100, 10, 90)
    }
    case 'bull-put-spread': {
      const short = legs.find(l => l.action === 'sell')
      if (!short) return 50
      const c = findContract(contracts, short.type, short.strike)
      const iv = c ? getIV(c, underlyingPrice) : 0.3
      const delta = estimateDelta(short.type, short.strike, underlyingPrice, iv, dte)
      return clamp((1 - Math.abs(delta)) * 100, 20, 85)
    }
    case 'bear-call-spread': {
      const short = legs.find(l => l.action === 'sell')
      if (!short) return 50
      const c = findContract(contracts, short.type, short.strike)
      const iv = c ? getIV(c, underlyingPrice) : 0.3
      const delta = estimateDelta(short.type, short.strike, underlyingPrice, iv, dte)
      return clamp((1 - Math.abs(delta)) * 100, 20, 85)
    }
    case 'bull-call-spread': {
      const longLeg = legs.find(l => l.action === 'buy' && l.type === 'call')
      const shortLeg = legs.find(l => l.action === 'sell' && l.type === 'call')
      if (!longLeg) return 50
      const cLong = findContract(contracts, 'call', longLeg.strike)
      const ivLong = cLong ? getIV(cLong, underlyingPrice) : 0.3
      const longDelta = Math.abs(estimateDelta('call', longLeg.strike, underlyingPrice, ivLong, dte))
      if (!shortLeg) return clamp(longDelta * 100, 10, 90)
      const cShort = findContract(contracts, 'call', shortLeg.strike)
      const ivShort = cShort ? getIV(cShort, underlyingPrice) : 0.3
      const shortDelta = Math.abs(estimateDelta('call', shortLeg.strike, underlyingPrice, ivShort, dte))
      const netDebit = longLeg.premium - shortLeg.premium
      const spreadWidth = shortLeg.strike - longLeg.strike
      const pop = spreadWidth > 0
        ? longDelta - (netDebit / spreadWidth) * (longDelta - shortDelta)
        : longDelta
      return clamp(pop * 100, 10, 90)
    }
    case 'bear-put-spread': {
      const longLeg = legs.find(l => l.action === 'buy' && l.type === 'put')
      const shortLeg = legs.find(l => l.action === 'sell' && l.type === 'put')
      if (!longLeg) return 50
      const cLong = findContract(contracts, 'put', longLeg.strike)
      const ivLong = cLong ? getIV(cLong, underlyingPrice) : 0.3
      const longDelta = Math.abs(estimateDelta('put', longLeg.strike, underlyingPrice, ivLong, dte))
      if (!shortLeg) return clamp(longDelta * 100, 10, 90)
      const cShort = findContract(contracts, 'put', shortLeg.strike)
      const ivShort = cShort ? getIV(cShort, underlyingPrice) : 0.3
      const shortDelta = Math.abs(estimateDelta('put', shortLeg.strike, underlyingPrice, ivShort, dte))
      const netDebit = longLeg.premium - shortLeg.premium
      const spreadWidth = longLeg.strike - shortLeg.strike
      const pop = spreadWidth > 0
        ? longDelta - (netDebit / spreadWidth) * (longDelta - shortDelta)
        : longDelta
      return clamp(pop * 100, 10, 90)
    }
    case 'iron-condor': {
      const shortPut = legs.find(l => l.action === 'sell' && l.type === 'put')
      const shortCall = legs.find(l => l.action === 'sell' && l.type === 'call')
      if (!shortPut || !shortCall) return 50
      const cP = findContract(contracts, 'put', shortPut.strike)
      const cC = findContract(contracts, 'call', shortCall.strike)
      const ivP = cP ? getIV(cP, underlyingPrice) : 0.3
      const ivC = cC ? getIV(cC, underlyingPrice) : 0.3
      const dP = Math.abs(estimateDelta('put', shortPut.strike, underlyingPrice, ivP, dte))
      const dC = Math.abs(estimateDelta('call', shortCall.strike, underlyingPrice, ivC, dte))
      return clamp(((1 - dP) + (1 - dC) - 1) * 100, 10, 90)
    }
    case 'long-call': {
      const call = legs.find(l => l.type === 'call')
      if (!call) return 50
      const be = call.strike + call.premium
      const c = findContract(contracts, 'call', call.strike)
      const iv = c ? getIV(c, underlyingPrice) : 0.3
      const delta = estimateDelta('call', be, underlyingPrice, iv, dte)
      return clamp(Math.abs(delta) * 100, 5, 90)
    }
    case 'long-put': {
      const put = legs.find(l => l.type === 'put')
      if (!put) return 50
      const be = put.strike - put.premium
      const c = findContract(contracts, 'put', put.strike)
      const iv = c ? getIV(c, underlyingPrice) : 0.3
      const delta = estimateDelta('put', be, underlyingPrice, iv, dte)
      return clamp(Math.abs(delta) * 100, 5, 90)
    }
    case 'straddle': {
      const call = legs.find(l => l.type === 'call')
      const put = legs.find(l => l.type === 'put')
      if (!call || !put) return 50
      const total = call.premium + put.premium
      const cC = findContract(contracts, 'call', call.strike)
      const iv = cC ? getIV(cC, underlyingPrice) : 0.3
      const dUp = Math.abs(estimateDelta('call', call.strike + total, underlyingPrice, iv, dte))
      const dDown = Math.abs(estimateDelta('put', put.strike - total, underlyingPrice, iv, dte))
      return clamp((dUp + dDown) * 100, 10, 90)
    }
    default:
      return 50
  }
}

function calcBreakEven(strategyId: string, legs: StrategyLeg[], net: number): number[] {
  switch (strategyId) {
    case 'long-call': {
      const call = legs.find(l => l.type === 'call')
      return call ? [call.strike + call.premium] : [0]
    }
    case 'long-put': {
      const put = legs.find(l => l.type === 'put')
      return put ? [put.strike - put.premium] : [0]
    }
    case 'bull-call-spread': {
      const longLeg = legs.find(l => l.action === 'buy' && l.type === 'call')
      return longLeg ? [longLeg.strike + Math.abs(net)] : [0]
    }
    case 'bear-put-spread': {
      const longLeg = legs.find(l => l.action === 'buy' && l.type === 'put')
      return longLeg ? [longLeg.strike - Math.abs(net)] : [0]
    }
    case 'bull-put-spread': {
      const shortLeg = legs.find(l => l.action === 'sell')
      return shortLeg ? [shortLeg.strike - Math.abs(net)] : [0]
    }
    case 'bear-call-spread': {
      const shortLeg = legs.find(l => l.action === 'sell')
      return shortLeg ? [shortLeg.strike + Math.abs(net)] : [0]
    }
    case 'covered-call': {
      const shortCall = legs.find(l => l.action === 'sell' && l.type === 'call')
      return shortCall ? [shortCall.strike - shortCall.premium] : [0]
    }
    case 'cash-secured-put': {
      const shortPut = legs.find(l => l.action === 'sell')
      return shortPut ? [shortPut.strike - shortPut.premium] : [0]
    }
    case 'iron-condor': {
      const shortPut = legs.find(l => l.action === 'sell' && l.type === 'put')
      const shortCall = legs.find(l => l.action === 'sell' && l.type === 'call')
      if (!shortPut || !shortCall) return [0]
      const credit = Math.abs(net)
      return [shortPut.strike - credit, shortCall.strike + credit]
    }
    case 'straddle': {
      const call = legs.find(l => l.type === 'call')
      const put = legs.find(l => l.type === 'put')
      if (!call || !put) return [0]
      const total = call.premium + put.premium
      return [call.strike - total, call.strike + total]
    }
    default:
      return legs.length > 0 ? [legs[0].strike] : [0]
  }
}

export function StrategyCard({ strategy, symbol, underlyingPrice, ivRank, experienceLevel, callStrikes, putStrikes, contracts, selectedExpiry }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track user-chosen strikes per leg index
  const [customStrikes, setCustomStrikes] = useState<Record<number, number>>({})

  // Compute adjusted legs, net credit/debit, PoP, and break-even when user changes strikes
  const { adjustedLegs, adjustedNet, adjustedPoP, adjustedBreakEven } = useMemo(() => {
    if (Object.keys(customStrikes).length === 0 || !strategy.legs?.length) {
      return {
        adjustedLegs: strategy.legs,
        adjustedNet: strategy.netCreditDebit,
        adjustedPoP: strategy.probabilityOfProfit,
        adjustedBreakEven: strategy.breakEvenPrices,
      }
    }

    const newLegs: StrategyLeg[] = strategy.legs.map((leg, i) => {
      if (leg.type === 'stock') return leg
      const newStrike = customStrikes[i] ?? leg.strike
      const contract = findContract(contracts, leg.type, newStrike)
      const premium = contract ? midPrice(contract) : leg.premium
      return { ...leg, strike: newStrike, premium }
    })

    // Recalculate net credit/debit
    let net = 0
    for (const leg of newLegs) {
      if (leg.type === 'stock') continue
      const sign = leg.action === 'sell' ? 1 : -1
      net += sign * leg.premium * leg.quantity
    }

    // Use expiry from first option leg, or the selected expiry prop
    const expiry = selectedExpiry || newLegs.find(l => l.type !== 'stock')?.expiry || ''
    const dte = daysToExpiry(expiry)
    const pop = calcPoP(strategy.strategy.id, newLegs, contracts, underlyingPrice, dte)
    const be = calcBreakEven(strategy.strategy.id, newLegs, net)

    return { adjustedLegs: newLegs, adjustedNet: net, adjustedPoP: pop, adjustedBreakEven: be }
  }, [customStrikes, strategy.legs, strategy.netCreditDebit, strategy.probabilityOfProfit, strategy.breakEvenPrices, strategy.strategy.id, contracts, underlyingPrice, selectedExpiry])

  function handleStrikeChange(legIndex: number, newStrike: number) {
    setCustomStrikes(prev => ({ ...prev, [legIndex]: newStrike }))
  }

  function getStrikesForLeg(leg: StrategyLeg): number[] {
    if (leg.type === 'stock') return []
    return leg.type === 'call' ? callStrikes : putStrikes
  }

  async function handleExpand() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (explanation) return

    setLoading(true)
    setError(null)
    try {
      const aiProvider = localStorage.getItem('aiProvider') ?? 'claude'
      const apiKey = aiProvider === 'gemini'
        ? localStorage.getItem('geminiApiKey') ?? ''
        : localStorage.getItem('anthropicApiKey') ?? ''

      if (!apiKey) {
        setError('No API key found. Click the gear icon (top-right) to add your API key.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ai-provider': aiProvider,
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ symbol, underlyingPrice, ivRank, strategy, experienceLevel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Explanation failed')
        setLoading(false)
        return
      }
      setExplanation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Explanation unavailable')
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
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            strategy.confidenceScore >= 50
              ? 'bg-blue-50 text-blue-700'
              : strategy.confidenceScore > 0
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {strategy.confidenceScore}% match
          </span>
        </div>
      </div>

      {strategy.confidenceScore <= 20 && (
        <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          This strategy doesn&apos;t strongly match current market conditions. Consider auto-suggest for better-fitting strategies.
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {strategy.matchedSignals.map(signal => (
          <span key={signal} className={`rounded-full px-2.5 py-0.5 text-xs ${
            signal === 'General market fit' ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'
          }`}>
            {signal}
          </span>
        ))}
      </div>

      {adjustedLegs && adjustedLegs.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Trade Setup</p>
          <div className="space-y-1.5">
            {adjustedLegs.map((leg, i) => {
              const strikes = getStrikesForLeg(leg)
              const currentStrike = customStrikes[i] ?? leg.strike
              const delta = getLegDelta(leg, contracts, underlyingPrice, selectedExpiry || '')

              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                      leg.action === 'buy' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {leg.action.toUpperCase()}
                    </span>
                    {leg.type === 'stock' ? (
                      <span className="text-gray-700">100 shares</span>
                    ) : strikes.length > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <select
                          value={currentStrike}
                          onChange={e => handleStrikeChange(i, Number(e.target.value))}
                          className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {strikes.map(s => (
                            <option key={s} value={s}>${s.toFixed(0)}</option>
                          ))}
                        </select>
                        <span className="text-gray-500">{leg.type}</span>
                        {leg.quantity > 1 && <span className="text-gray-400 text-xs">x{leg.quantity}</span>}
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        {leg.quantity > 1 ? leg.quantity + 'x ' : ''}${leg.strike.toFixed(0)} {leg.type}
                      </span>
                    )}
                    {delta !== null && (
                      <span className="text-xs text-gray-400 tabular-nums" title="Delta">
                        {delta >= 0 ? '\u0394' : '\u0394'}{delta.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 tabular-nums">
                    ${leg.premium.toFixed(2)}{leg.type !== 'stock' ? '/share' : ''}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-2">
            <span className="text-xs font-medium text-gray-500">
              {adjustedNet >= 0 ? 'Net Credit' : 'Net Debit'}
            </span>
            <span className={`text-sm font-bold ${adjustedNet >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ${Math.abs(adjustedNet).toFixed(2)}/share (${(Math.abs(adjustedNet) * 100).toFixed(0)} total)
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-500">Probability of Profit</p>
          <p className="text-lg font-bold text-gray-900">{adjustedPoP.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Break-even Price{adjustedBreakEven.length > 1 ? 's' : ''}</p>
          <p className="text-lg font-bold text-gray-900">
            {adjustedBreakEven.map(p => `$${p.toFixed(2)}`).join(' / ')}
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
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
