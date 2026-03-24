import yahooFinance from 'yahoo-finance2'
import type { IOptionsDataProvider } from './IOptionsDataProvider'
import type { OptionsChain, OptionContract, SymbolSearchResult } from '@/lib/types'

export class YahooFinanceProvider implements IOptionsDataProvider {
  async searchSymbol(query: string): Promise<SymbolSearchResult[]> {
    try {
      const results = await yahooFinance.search(query)
      return (results.quotes ?? [])
        .filter((q): q is typeof q & { symbol: string } => 'symbol' in q && !!q.symbol)
        .slice(0, 8)
        .map(q => ({
          symbol: q.symbol,
          name: ('longname' in q ? q.longname : undefined) ?? ('shortname' in q ? q.shortname : undefined) ?? q.symbol,
        }))
    } catch {
      return []
    }
  }

  async getChain(symbol: string): Promise<OptionsChain> {
    const [quote, optionsData] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.options(symbol),
    ])

    if (!quote || !quote.regularMarketPrice) {
      throw new Error(`Symbol not found: ${symbol}`)
    }

    const underlyingPrice = quote.regularMarketPrice

    const contracts: OptionContract[] = []
    const expiryDates: string[] = []

    for (const expiry of optionsData.expirationDates ?? []) {
      const expiryStr = new Date(expiry).toISOString().split('T')[0]
      expiryDates.push(expiryStr)
    }

    const optionChain = optionsData.options?.[0]
    if (optionChain) {
      for (const call of optionChain.calls ?? []) {
        contracts.push({
          strike: call.strike ?? 0,
          expiry: expiryDates[0] ?? '',
          type: 'call',
          bid: call.bid ?? 0,
          ask: call.ask ?? 0,
          last: call.lastPrice ?? 0,
          volume: call.volume ?? 0,
          openInterest: call.openInterest ?? 0,
          impliedVolatility: call.impliedVolatility ?? 0,
          delta: call.delta ?? 0,
          gamma: call.gamma ?? 0,
          theta: call.theta ?? 0,
          vega: call.vega ?? 0,
        })
      }
      for (const put of optionChain.puts ?? []) {
        contracts.push({
          strike: put.strike ?? 0,
          expiry: expiryDates[0] ?? '',
          type: 'put',
          bid: put.bid ?? 0,
          ask: put.ask ?? 0,
          last: put.lastPrice ?? 0,
          volume: put.volume ?? 0,
          openInterest: put.openInterest ?? 0,
          impliedVolatility: put.impliedVolatility ?? 0,
          delta: put.delta ?? 0,
          gamma: put.gamma ?? 0,
          theta: put.theta ?? 0,
          vega: put.vega ?? 0,
        })
      }
    }

    const totalPutOI = contracts.filter(c => c.type === 'put').reduce((s, c) => s + c.openInterest, 0)
    const totalCallOI = contracts.filter(c => c.type === 'call').reduce((s, c) => s + c.openInterest, 0)
    const putCallRatio = totalCallOI > 0 ? totalPutOI / totalCallOI : 1

    const currentIV = contracts[0]?.impliedVolatility ?? 0.3
    const ivRank = Math.min(100, Math.round(currentIV * 200))

    return {
      symbol: symbol.toUpperCase(),
      underlyingPrice,
      ivRank,
      ivPercentile: ivRank,
      putCallRatio,
      expiryDates,
      contracts,
    }
  }
}
