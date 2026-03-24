import type { OptionContract } from '@/lib/types'

function midPrice(contract: OptionContract): number {
  return (contract.bid + contract.ask) / 2
}

export function probabilityOfProfit(strategyId: string, contracts: OptionContract[]): number {
  const shortLeg = contracts[0]
  if (!shortLeg) return 50

  // PoP ≈ 1 - |delta| of the short strike, expressed as %
  return (1 - Math.abs(shortLeg.delta)) * 100
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
    default:
      return [contracts[0]?.strike ?? 0]
  }
}
