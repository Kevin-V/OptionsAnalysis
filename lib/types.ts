export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface OptionContract {
  strike: number
  expiry: string           // ISO date string e.g. "2024-01-19"
  type: 'call' | 'put'
  bid: number
  ask: number
  last: number
  volume: number
  openInterest: number
  impliedVolatility: number
  delta: number
  gamma: number
  theta: number
  vega: number
}

export interface OptionsChain {
  symbol: string
  underlyingPrice: number
  ivRank: number           // 0–100 percentile of current IV vs 52-week range
  ivPercentile: number
  putCallRatio: number
  expiryDates: string[]
  contracts: OptionContract[]
  earningsDate?: string    // ISO date of next earnings
  dividendDate?: string    // ISO date of next ex-dividend
  dividendYield?: number   // annual dividend yield as decimal (e.g. 0.025 = 2.5%)
}

export interface SymbolSearchResult {
  symbol: string
  name: string
}

export interface ChainSignals {
  ivRank: number
  ivEnvironment: 'high' | 'low' | 'neutral'
  trend: 'bullish' | 'bearish' | 'neutral'
  putCallRatio: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  hasWeeklyOptions: boolean
  daysToNearestExpiry: number
}

export interface StrategyDefinition {
  id: string
  name: string
  description: string
  signals: {
    ivEnvironment?: 'high' | 'low' | 'neutral'
    trend?: 'bullish' | 'bearish' | 'neutral'
    sentiment?: 'bullish' | 'bearish' | 'neutral'
  }
  weight: number
  minExperienceLevel: ExperienceLevel
}

export interface StrategyLeg {
  type: 'call' | 'put' | 'stock'
  action: 'buy' | 'sell'
  strike: number
  expiry: string
  premium: number              // mid-price per share
  quantity: number             // number of contracts (or 100 for stock)
}

export interface RankedStrategy {
  strategy: StrategyDefinition
  confidenceScore: number       // 0–100
  matchedSignals: string[]
  probabilityOfProfit: number   // 0–100 (%)
  breakEvenPrices: number[]     // one price for simple strategies, two for iron condor
  legs: StrategyLeg[]           // selected option legs
  netCreditDebit: number        // positive = credit, negative = debit (per share)
}

export interface ExplainRequest {
  symbol: string
  underlyingPrice: number
  ivRank: number
  strategy: RankedStrategy
  experienceLevel: ExperienceLevel
}

export interface ExplainResponse {
  explanation: string
  keyRisks: string[]
  idealConditions: string
}
