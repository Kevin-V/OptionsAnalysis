import { describe, it, expect } from 'vitest'
import { rankStrategies } from '@/lib/engine/ranker'
import type { ChainSignals, OptionsChain } from '@/lib/types'

const highIVBullishSignals: ChainSignals = {
  ivRank: 70,
  ivEnvironment: 'high',
  trend: 'bullish',
  putCallRatio: 0.7,
  sentiment: 'bullish',
  hasWeeklyOptions: false,
  daysToNearestExpiry: 30,
}

const mockChain: OptionsChain = {
  symbol: 'AAPL',
  underlyingPrice: 175,
  ivRank: 70,
  ivPercentile: 70,
  putCallRatio: 0.7,
  expiryDates: ['2024-01-19'],
  contracts: [],
}

describe('rankStrategies', () => {
  it('returns max 3 strategies', () => {
    const results = rankStrategies(mockChain, highIVBullishSignals, 'beginner')
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('filters out strategies above the experience level', () => {
    const results = rankStrategies(mockChain, highIVBullishSignals, 'beginner')
    results.forEach(r => {
      expect(['beginner']).toContain(r.strategy.minExperienceLevel)
    })
  })

  it('prefers high-IV sell-premium strategies when ivEnvironment is high and trend is bullish', () => {
    const results = rankStrategies(mockChain, highIVBullishSignals, 'intermediate')
    const ids = results.map(r => r.strategy.id)
    expect(ids.some(id => ['covered-call', 'cash-secured-put'].includes(id))).toBe(true)
  })

  it('assigns a confidence score between 0 and 100', () => {
    const results = rankStrategies(mockChain, highIVBullishSignals, 'intermediate')
    results.forEach(r => {
      expect(r.confidenceScore).toBeGreaterThanOrEqual(0)
      expect(r.confidenceScore).toBeLessThanOrEqual(100)
    })
  })

  it('includes matchedSignals as non-empty array for matched strategies', () => {
    const results = rankStrategies(mockChain, highIVBullishSignals, 'intermediate')
    results.forEach(r => {
      expect(r.matchedSignals.length).toBeGreaterThan(0)
    })
  })
})
