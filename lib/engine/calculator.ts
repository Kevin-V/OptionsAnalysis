import type { OptionContract } from '@/lib/types'

function midPrice(contract: OptionContract): number {
  return (contract.bid + contract.ask) / 2
}

/**
 * Approximate delta using a simplified Black-Scholes approach.
 * When Yahoo doesn't provide Greeks (delta=0 or undefined), we estimate
 * using the moneyness ratio and IV.
 */
function estimateDelta(contract: OptionContract, underlyingPrice: number): number {
  if (contract.delta && Math.abs(contract.delta) > 0.001) return contract.delta

  const iv = contract.impliedVolatility || 0.3
  // Approximate days to expiry (use 30 as default)
  const timeYears = 30 / 365

  // d1 approximation: ln(S/K) / (IV * sqrt(T)) + 0.5 * IV * sqrt(T)
  const sqrtT = Math.sqrt(timeYears)
  const moneyness = Math.log(underlyingPrice / contract.strike)
  const d1 = moneyness / (iv * sqrtT) + 0.5 * iv * sqrtT

  // Approximate N(d1) using a logistic function (close enough for our purposes)
  const callDelta = 1 / (1 + Math.exp(-1.7 * d1))

  return contract.type === 'call' ? callDelta : callDelta - 1
}

export function probabilityOfProfit(
  strategyId: string,
  contracts: OptionContract[],
  underlyingPrice?: number
): number {
  const price = underlyingPrice ?? contracts[0]?.strike ?? 100

  switch (strategyId) {
    case 'covered-call':
    case 'cash-secured-put': {
      // PoP ≈ 1 - |delta| of the short option
      const short = contracts[0]
      if (!short) return 50
      const delta = estimateDelta(short, price)
      return Math.round((1 - Math.abs(delta)) * 100)
    }

    case 'iron-condor': {
      // PoP ≈ (1 - |delta short put|) + (1 - |delta short call|) - 1
      // Simplified: credit received / spread width
      const [shortPut, shortCall] = contracts
      if (!shortPut || !shortCall) return 50
      const deltaPut = estimateDelta(shortPut, price)
      const deltaCall = estimateDelta(shortCall, price)
      const pop = (1 - Math.abs(deltaPut)) + (1 - Math.abs(deltaCall)) - 1
      return Math.round(Math.max(10, Math.min(90, pop * 100)))
    }

    case 'bull-call-spread': {
      // PoP ≈ delta of long call (chance stock is above lower strike at expiry)
      // minus a small adjustment for needing to cover the debit
      const [longCall, shortCall] = contracts
      if (!longCall) return 50
      const longDelta = estimateDelta(longCall, price)
      const shortDelta = shortCall ? estimateDelta(shortCall, price) : 0
      const netDebit = midPrice(longCall) - (shortCall ? midPrice(shortCall) : 0)
      const spreadWidth = shortCall ? shortCall.strike - longCall.strike : 0
      // Approximate: chance of being above break-even
      const pop = spreadWidth > 0
        ? Math.abs(longDelta) - (netDebit / spreadWidth) * (Math.abs(longDelta) - Math.abs(shortDelta))
        : Math.abs(longDelta)
      return Math.round(Math.max(10, Math.min(90, pop * 100)))
    }

    case 'bear-put-spread': {
      const [longPut, shortPut] = contracts
      if (!longPut) return 50
      const longDelta = estimateDelta(longPut, price)
      const shortDelta = shortPut ? estimateDelta(shortPut, price) : 0
      const netDebit = midPrice(longPut) - (shortPut ? midPrice(shortPut) : 0)
      const spreadWidth = shortPut ? longPut.strike - shortPut.strike : 0
      const pop = spreadWidth > 0
        ? Math.abs(longDelta) - (netDebit / spreadWidth) * (Math.abs(longDelta) - Math.abs(shortDelta))
        : Math.abs(longDelta)
      return Math.round(Math.max(10, Math.min(90, pop * 100)))
    }

    case 'long-call': {
      const [call] = contracts
      if (!call) return 50
      // PoP ≈ chance stock is above break-even (strike + premium)
      const be = call.strike + midPrice(call)
      const beContract = { ...call, strike: be }
      const delta = estimateDelta(beContract, price)
      return Math.round(Math.max(5, Math.min(90, Math.abs(delta) * 100)))
    }

    case 'long-put': {
      const [put] = contracts
      if (!put) return 50
      const be = put.strike - midPrice(put)
      const beContract = { ...put, strike: be }
      const delta = estimateDelta(beContract, price)
      return Math.round(Math.max(5, Math.min(90, Math.abs(delta) * 100)))
    }

    case 'straddle': {
      const [call, put] = contracts
      if (!call || !put) return 50
      const totalPremium = midPrice(call) + midPrice(put)
      // PoP = chance stock moves beyond strike ± total premium
      const beUp = { ...call, strike: call.strike + totalPremium }
      const beDown = { ...put, strike: put.strike - totalPremium }
      const deltaUp = estimateDelta(beUp, price)
      const deltaDown = estimateDelta(beDown, price)
      const pop = Math.abs(deltaUp) + Math.abs(deltaDown)
      return Math.round(Math.max(10, Math.min(90, pop * 100)))
    }

    case 'butterfly': {
      // Butterfly has low PoP, roughly 20-35%
      return 25
    }

    case 'bull-put-spread': {
      // PoP ≈ 1 - |delta of short put|
      const [shortPutBps] = contracts
      if (!shortPutBps) return 50
      const deltaBps = estimateDelta(shortPutBps, price)
      return Math.round(Math.max(20, Math.min(85, (1 - Math.abs(deltaBps)) * 100)))
    }

    case 'bear-call-spread': {
      // PoP ≈ 1 - delta of short call
      const [shortCallBcs] = contracts
      if (!shortCallBcs) return 50
      const deltaBcs = estimateDelta(shortCallBcs, price)
      return Math.round(Math.max(20, Math.min(85, (1 - Math.abs(deltaBcs)) * 100)))
    }

    case 'calendar-spread': {
      // Calendar spreads profit when stock stays near strike; moderate PoP ~45-55%
      return 50
    }

    case 'diagonal-spread': {
      // PMCC has similar PoP to covered call — high because you collect premium
      const short = contracts[1] // the OTM short call
      if (!short) return 60
      const delta = estimateDelta(short, price)
      return Math.round(Math.max(40, Math.min(85, (1 - Math.abs(delta)) * 100)))
    }

    case 'protective-put': {
      // Very high PoP since you profit if stock goes up at all past premium cost
      const [put] = contracts
      if (!put) return 75
      const premium = midPrice(put)
      const be = price + premium  // need stock above current price + put cost
      const beContract = { ...put, type: 'call' as const, strike: be }
      const delta = estimateDelta(beContract, price)
      return Math.round(Math.max(30, Math.min(90, (1 - Math.abs(delta)) * 100)))
    }

    default:
      return 50
  }
}

export function breakEvenPrices(strategyId: string, contracts: OptionContract[]): number[] {
  switch (strategyId) {
    case 'long-call': {
      const [call] = contracts
      return [call.strike + midPrice(call)]
    }
    case 'long-put': {
      const [put] = contracts
      return [put.strike - midPrice(put)]
    }
    case 'bull-call-spread': {
      const [longCall, shortCall] = contracts
      const netDebit = midPrice(longCall) - midPrice(shortCall)
      return [longCall.strike + netDebit]
    }
    case 'bear-put-spread': {
      const [longPut, shortPut] = contracts
      const netDebit = midPrice(longPut) - midPrice(shortPut)
      return [longPut.strike - netDebit]
    }
    case 'iron-condor': {
      const [shortPut, shortCall] = contracts
      const credit = midPrice(shortPut) + midPrice(shortCall)
      return [
        shortPut.strike - credit,
        shortCall.strike + credit,
      ]
    }
    case 'covered-call': {
      const [call] = contracts
      return [call.strike - midPrice(call)]
    }
    case 'cash-secured-put': {
      const [put] = contracts
      return [put.strike - midPrice(put)]
    }
    case 'straddle': {
      const [call, put] = contracts
      const totalPremium = midPrice(call) + midPrice(put)
      return [
        call.strike - totalPremium,
        call.strike + totalPremium,
      ]
    }
    case 'bull-put-spread': {
      const [shortPut, longPut] = contracts
      const credit = midPrice(shortPut) - midPrice(longPut)
      return [shortPut.strike - credit]
    }
    case 'bear-call-spread': {
      const [shortCall, longCall] = contracts
      const credit = midPrice(shortCall) - midPrice(longCall)
      return [shortCall.strike + credit]
    }
    case 'calendar-spread': {
      const [call] = contracts
      return [call.strike]
    }
    case 'diagonal-spread': {
      const [longCall, shortCall] = contracts
      // Break-even ≈ long call strike + net debit paid
      const netDebit = midPrice(longCall) * 2.5 - midPrice(shortCall)
      return [longCall.strike + netDebit]
    }
    default:
      return [contracts[0]?.strike ?? 0]
  }
}
