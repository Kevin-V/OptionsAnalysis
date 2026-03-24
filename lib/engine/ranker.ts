import type { OptionsChain, ChainSignals, RankedStrategy, ExperienceLevel } from '@/lib/types'
import { STRATEGIES } from './strategies'
import { probabilityOfProfit, breakEvenPrices } from './calculator'

const LEVEL_ORDER: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']

function levelIndex(level: ExperienceLevel): number {
  return LEVEL_ORDER.indexOf(level)
}

export function rankStrategies(
  chain: OptionsChain,
  signals: ChainSignals,
  experienceLevel: ExperienceLevel
): RankedStrategy[] {
  const userLevelIndex = levelIndex(experienceLevel)

  const scored = STRATEGIES
    .filter(s => levelIndex(s.minExperienceLevel) <= userLevelIndex)
    .map(strategy => {
      let score = 0
      const matchedSignals: string[] = []

      if (strategy.signals.ivEnvironment && strategy.signals.ivEnvironment === signals.ivEnvironment) {
        score += strategy.weight
        matchedSignals.push(
          signals.ivEnvironment === 'high'
            ? 'High IV → sell premium'
            : signals.ivEnvironment === 'low'
            ? 'Low IV → buy premium'
            : 'Neutral IV'
        )
      }

      if (strategy.signals.trend && strategy.signals.trend === signals.trend) {
        score += strategy.weight * 0.5
        matchedSignals.push(`${signals.trend} trend`)
      }

      if (strategy.signals.sentiment && strategy.signals.sentiment === signals.sentiment) {
        score += strategy.weight * 0.3
        matchedSignals.push(`${signals.sentiment} sentiment (P/C ratio: ${signals.putCallRatio.toFixed(2)})`)
      }

      // Normalize to 0–100
      const maxPossible = strategy.weight * 1.8
      const confidenceScore = Math.min(100, Math.round((score / maxPossible) * 100))

      const placeholderContracts = chain.contracts.length > 0 ? chain.contracts.slice(0, 2) : []

      const pop = placeholderContracts.length > 0
        ? probabilityOfProfit(strategy.id, placeholderContracts)
        : 50

      const bePs = placeholderContracts.length > 0
        ? breakEvenPrices(strategy.id, placeholderContracts)
        : [chain.underlyingPrice]

      return {
        strategy,
        confidenceScore,
        matchedSignals: matchedSignals.length > 0 ? matchedSignals : ['General market fit'],
        probabilityOfProfit: pop,
        breakEvenPrices: bePs,
      } as RankedStrategy
    })
    .filter(r => r.confidenceScore > 0)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 3)

  return scored
}
