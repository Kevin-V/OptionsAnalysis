import { describe, it, expect } from 'vitest'
import { probabilityOfProfit, breakEvenPrices } from '@/lib/engine/calculator'
import type { OptionContract } from '@/lib/types'

const callContract = (strike: number, delta: number, bid: number, ask: number): OptionContract => ({
  strike,
  expiry: '2024-01-19',
  type: 'call',
  bid,
  ask,
  last: (bid + ask) / 2,
  volume: 100,
  openInterest: 500,
  impliedVolatility: 0.3,
  delta,
  gamma: 0.02,
  theta: -0.05,
  vega: 0.1,
})

const putContract = (strike: number, delta: number, bid: number, ask: number): OptionContract => ({
  ...callContract(strike, delta, bid, ask),
  type: 'put',
  delta: -Math.abs(delta),
})

describe('probabilityOfProfit', () => {
  it('estimates PoP for a short call using delta approximation', () => {
    const shortCall = callContract(180, 0.3, 1.5, 1.6)
    // PoP ≈ 1 - |delta| = 1 - 0.3 = 0.7 = 70%
    expect(probabilityOfProfit('covered-call', [shortCall])).toBeCloseTo(70, 0)
  })

  it('estimates PoP for a short put', () => {
    const shortPut = putContract(170, -0.25, 1.0, 1.1)
    // PoP ≈ 1 - |delta| = 1 - 0.25 = 0.75 = 75%
    expect(probabilityOfProfit('cash-secured-put', [shortPut])).toBeCloseTo(75, 0)
  })
})

describe('breakEvenPrices', () => {
  it('calculates break-even for long call: strike + premium', () => {
    const call = callContract(180, 0.5, 3.0, 3.2)
    // mid premium = 3.1, break-even = 180 + 3.1 = 183.1
    const result = breakEvenPrices('long-call', [call])
    expect(result[0]).toBeCloseTo(183.1, 1)
  })

  it('calculates break-even for long put: strike - premium', () => {
    const put = putContract(170, -0.5, 2.8, 3.0)
    // mid premium = 2.9, break-even = 170 - 2.9 = 167.1
    const result = breakEvenPrices('long-put', [put])
    expect(result[0]).toBeCloseTo(167.1, 1)
  })

  it('calculates break-even for bull call spread', () => {
    const longCall = callContract(175, 0.55, 4.0, 4.2)
    const shortCall = callContract(185, 0.25, 1.5, 1.6)
    // net debit = 4.1 - 1.55 = 2.55, break-even = 175 + 2.55 = 177.55
    const result = breakEvenPrices('bull-call-spread', [longCall, shortCall])
    expect(result[0]).toBeCloseTo(177.55, 1)
  })
})
