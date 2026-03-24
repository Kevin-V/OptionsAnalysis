import { describe, it, expect } from 'vitest'
import { computeSignals } from '@/lib/engine/signals'
import type { OptionsChain } from '@/lib/types'

const baseChain: OptionsChain = {
  symbol: 'AAPL',
  underlyingPrice: 175,
  ivRank: 70,
  ivPercentile: 70,
  putCallRatio: 0.9,
  expiryDates: ['2024-01-19', '2024-01-26'],
  contracts: [],
}

describe('computeSignals', () => {
  it('returns high ivEnvironment when ivRank > 50', () => {
    const signals = computeSignals({ ...baseChain, ivRank: 70 })
    expect(signals.ivEnvironment).toBe('high')
  })

  it('returns low ivEnvironment when ivRank < 30', () => {
    const signals = computeSignals({ ...baseChain, ivRank: 20 })
    expect(signals.ivEnvironment).toBe('low')
  })

  it('returns neutral ivEnvironment when ivRank is 30–50', () => {
    const signals = computeSignals({ ...baseChain, ivRank: 40 })
    expect(signals.ivEnvironment).toBe('neutral')
  })

  it('returns bearish sentiment when putCallRatio > 1.2', () => {
    const signals = computeSignals({ ...baseChain, putCallRatio: 1.5 })
    expect(signals.sentiment).toBe('bearish')
  })

  it('returns bullish sentiment when putCallRatio < 0.8', () => {
    const signals = computeSignals({ ...baseChain, putCallRatio: 0.6 })
    expect(signals.sentiment).toBe('bullish')
  })

  it('returns neutral sentiment when putCallRatio is 0.8–1.2', () => {
    const signals = computeSignals({ ...baseChain, putCallRatio: 1.0 })
    expect(signals.sentiment).toBe('neutral')
  })

  it('detects weekly options when expiry within 7 days', () => {
    const today = new Date()
    const in5Days = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
    const expiry = in5Days.toISOString().split('T')[0]
    const signals = computeSignals({ ...baseChain, expiryDates: [expiry] })
    expect(signals.hasWeeklyOptions).toBe(true)
  })
})
