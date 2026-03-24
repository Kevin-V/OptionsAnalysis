import type { OptionsChain, SymbolSearchResult } from '@/lib/types'

export interface IOptionsDataProvider {
  getChain(symbol: string): Promise<OptionsChain>
  searchSymbol(query: string): Promise<SymbolSearchResult[]>
}
