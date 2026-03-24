import type { OptionContract, StrategyLeg } from '@/lib/types'

function midPrice(c: OptionContract): number {
  return (c.bid + c.ask) / 2
}

function nearestStrike(contracts: OptionContract[], target: number): OptionContract | undefined {
  return contracts.reduce<OptionContract | undefined>((best, c) => {
    if (!best) return c
    return Math.abs(c.strike - target) < Math.abs(best.strike - target) ? c : best
  }, undefined)
}

function callsByStrike(contracts: OptionContract[]): OptionContract[] {
  return contracts.filter(c => c.type === 'call').sort((a, b) => a.strike - b.strike)
}

function putsByStrike(contracts: OptionContract[]): OptionContract[] {
  return contracts.filter(c => c.type === 'put').sort((a, b) => a.strike - b.strike)
}

function toLeg(c: OptionContract, action: 'buy' | 'sell', qty: number = 1): StrategyLeg {
  return {
    type: c.type,
    action,
    strike: c.strike,
    expiry: c.expiry,
    premium: midPrice(c),
    quantity: qty,
  }
}

export interface LegSelection {
  legs: StrategyLeg[]
  contracts: OptionContract[]  // raw contracts for calculator
  netCreditDebit: number       // positive = credit, negative = debit
}

export function selectLegs(
  strategyId: string,
  allContracts: OptionContract[],
  underlyingPrice: number
): LegSelection | null {
  const calls = callsByStrike(allContracts)
  const puts = putsByStrike(allContracts)

  if (calls.length === 0 && puts.length === 0) return null

  switch (strategyId) {
    case 'covered-call': {
      // Sell OTM call ~5% above current price
      const target = underlyingPrice * 1.05
      const shortCall = nearestStrike(calls.filter(c => c.strike > underlyingPrice), target)
      if (!shortCall) return null
      const premium = midPrice(shortCall)
      return {
        legs: [
          { type: 'stock', action: 'buy', strike: underlyingPrice, expiry: '', premium: underlyingPrice, quantity: 100 },
          toLeg(shortCall, 'sell'),
        ],
        contracts: [shortCall],
        netCreditDebit: premium,
      }
    }

    case 'cash-secured-put': {
      // Sell OTM put ~5% below current price
      const target = underlyingPrice * 0.95
      const shortPut = nearestStrike(puts.filter(c => c.strike < underlyingPrice), target)
      if (!shortPut) return null
      const premium = midPrice(shortPut)
      return {
        legs: [toLeg(shortPut, 'sell')],
        contracts: [shortPut],
        netCreditDebit: premium,
      }
    }

    case 'iron-condor': {
      // Sell OTM put (~5% below) + buy further OTM put (~10% below)
      // Sell OTM call (~5% above) + buy further OTM call (~10% above)
      const otmPuts = puts.filter(c => c.strike < underlyingPrice)
      const otmCalls = calls.filter(c => c.strike > underlyingPrice)
      if (otmPuts.length < 2 || otmCalls.length < 2) return null

      const shortPut = nearestStrike(otmPuts, underlyingPrice * 0.95)!
      const longPut = nearestStrike(otmPuts.filter(c => c.strike < shortPut.strike), underlyingPrice * 0.90)
      const shortCall = nearestStrike(otmCalls, underlyingPrice * 1.05)!
      const longCall = nearestStrike(otmCalls.filter(c => c.strike > shortCall.strike), underlyingPrice * 1.10)

      if (!longPut || !longCall) return null

      const credit = midPrice(shortPut) + midPrice(shortCall) - midPrice(longPut) - midPrice(longCall)
      return {
        legs: [
          toLeg(longPut, 'buy'),
          toLeg(shortPut, 'sell'),
          toLeg(shortCall, 'sell'),
          toLeg(longCall, 'buy'),
        ],
        contracts: [shortPut, shortCall, longPut, longCall],
        netCreditDebit: credit,
      }
    }

    case 'bull-call-spread': {
      // Buy ATM call, sell OTM call ~5% above
      const longCall = nearestStrike(calls, underlyingPrice)
      const shortCall = nearestStrike(calls.filter(c => c.strike > underlyingPrice * 1.03), underlyingPrice * 1.05)
      if (!longCall || !shortCall || longCall.strike >= shortCall.strike) return null

      const debit = midPrice(longCall) - midPrice(shortCall)
      return {
        legs: [toLeg(longCall, 'buy'), toLeg(shortCall, 'sell')],
        contracts: [longCall, shortCall],
        netCreditDebit: -debit,
      }
    }

    case 'bear-put-spread': {
      // Buy ATM put, sell OTM put ~5% below
      const longPut = nearestStrike(puts, underlyingPrice)
      const shortPut = nearestStrike(puts.filter(c => c.strike < underlyingPrice * 0.97), underlyingPrice * 0.95)
      if (!longPut || !shortPut || shortPut.strike >= longPut.strike) return null

      const debit = midPrice(longPut) - midPrice(shortPut)
      return {
        legs: [toLeg(longPut, 'buy'), toLeg(shortPut, 'sell')],
        contracts: [longPut, shortPut],
        netCreditDebit: -debit,
      }
    }

    case 'long-call': {
      // Buy slightly OTM call
      const call = nearestStrike(calls, underlyingPrice * 1.02)
      if (!call) return null
      return {
        legs: [toLeg(call, 'buy')],
        contracts: [call],
        netCreditDebit: -midPrice(call),
      }
    }

    case 'long-put': {
      // Buy slightly OTM put
      const put = nearestStrike(puts, underlyingPrice * 0.98)
      if (!put) return null
      return {
        legs: [toLeg(put, 'buy')],
        contracts: [put],
        netCreditDebit: -midPrice(put),
      }
    }

    case 'butterfly': {
      // Buy 1 ITM call, sell 2 ATM calls, buy 1 OTM call
      const atmCall = nearestStrike(calls, underlyingPrice)
      if (!atmCall) return null
      const lowerCalls = calls.filter(c => c.strike < atmCall.strike)
      const upperCalls = calls.filter(c => c.strike > atmCall.strike)
      const itm = nearestStrike(lowerCalls, underlyingPrice * 0.97)
      const otm = nearestStrike(upperCalls, underlyingPrice * 1.03)
      if (!itm || !otm) return null

      const debit = midPrice(itm) + midPrice(otm) - 2 * midPrice(atmCall)
      return {
        legs: [toLeg(itm, 'buy'), toLeg(atmCall, 'sell', 2), toLeg(otm, 'buy')],
        contracts: [itm, atmCall, otm],
        netCreditDebit: -debit,
      }
    }

    case 'protective-put': {
      // Own stock + buy OTM put ~5% below
      const put = nearestStrike(puts.filter(c => c.strike < underlyingPrice), underlyingPrice * 0.95)
      if (!put) return null
      return {
        legs: [
          { type: 'stock', action: 'buy', strike: underlyingPrice, expiry: '', premium: underlyingPrice, quantity: 100 },
          toLeg(put, 'buy'),
        ],
        contracts: [put],
        netCreditDebit: -midPrice(put),
      }
    }

    case 'straddle': {
      // Buy ATM call + ATM put
      const call = nearestStrike(calls, underlyingPrice)
      const put = nearestStrike(puts, underlyingPrice)
      if (!call || !put) return null
      const debit = midPrice(call) + midPrice(put)
      return {
        legs: [toLeg(call, 'buy'), toLeg(put, 'buy')],
        contracts: [call, put],
        netCreditDebit: -debit,
      }
    }

    default:
      return null
  }
}
