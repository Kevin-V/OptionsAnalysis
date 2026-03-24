import type { OptionsChain, ChainSignals } from '@/lib/types'

export function computeSignals(chain: OptionsChain): ChainSignals {
  const ivEnvironment =
    chain.ivRank > 50 ? 'high' :
    chain.ivRank < 30 ? 'low' :
    'neutral'

  const sentiment =
    chain.putCallRatio > 1.2 ? 'bearish' :
    chain.putCallRatio < 0.8 ? 'bullish' :
    'neutral'

  // Default trend to neutral — no historical price data from chain alone
  const trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'

  const today = new Date()
  const nearestExpiry = chain.expiryDates
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  const daysToNearestExpiry = nearestExpiry
    ? Math.ceil((nearestExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const hasWeeklyOptions = daysToNearestExpiry <= 7

  return {
    ivRank: chain.ivRank,
    ivEnvironment,
    trend,
    putCallRatio: chain.putCallRatio,
    sentiment,
    hasWeeklyOptions,
    daysToNearestExpiry,
  }
}
