import { YahooFinanceProvider } from './YahooFinanceProvider'
import type { IOptionsDataProvider } from './IOptionsDataProvider'

export function getDataProvider(): IOptionsDataProvider {
  const provider = process.env.DATA_PROVIDER ?? 'yahoo'
  switch (provider) {
    case 'yahoo':
    default:
      return new YahooFinanceProvider()
    // Future: case 'tradier': return new TradierProvider()
  }
}

export type { IOptionsDataProvider }
