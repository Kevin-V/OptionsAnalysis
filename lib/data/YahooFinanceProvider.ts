import YahooFinance from 'yahoo-finance2'
import type { IOptionsDataProvider } from './IOptionsDataProvider'
import type { OptionsChain, OptionContract, SymbolSearchResult } from '@/lib/types'

export class YahooFinanceProvider implements IOptionsDataProvider {
  private yf = new YahooFinance()

  async searchSymbol(query: string): Promise<SymbolSearchResult[]> {
    try {
      const results = await this.yf.search(query) as any
      const quotes = results?.quotes ?? []
      return quotes
        .filter((q: any) => q?.symbol)
        .slice(0, 8)
        .map((q: any) => ({
          symbol: q.symbol,
          name: q.longname ?? q.shortname ?? q.symbol,
        }))
    } catch {
      return []
    }
  }

  async getChain(symbol: string, expiryDate?: string): Promise<OptionsChain> {
    const optionsOpts = expiryDate ? { date: new Date(expiryDate) } : undefined
    const [quote, optionsData] = await Promise.all([
      this.yf.quote(symbol) as any,
      (this.yf.options as any)(symbol, optionsOpts),
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

    const selectedExpiry = expiryDate ?? expiryDates[0] ?? ''
    const optionChain = optionsData.options?.[0]
    if (optionChain) {
      for (const call of optionChain.calls ?? []) {
        contracts.push({
          strike: call.strike ?? 0,
          expiry: selectedExpiry,
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
          expiry: selectedExpiry,
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
