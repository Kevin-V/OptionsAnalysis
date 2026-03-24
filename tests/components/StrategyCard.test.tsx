import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StrategyCard } from '@/components/StrategyCard'
import type { RankedStrategy } from '@/lib/types'

const mockStrategy: RankedStrategy = {
  strategy: {
    id: 'covered-call',
    name: 'Covered Call',
    description: 'Sell an OTM call against stock you own.',
    signals: { ivEnvironment: 'high', trend: 'bullish' },
    weight: 10,
    minExperienceLevel: 'beginner',
  },
  confidenceScore: 80,
  matchedSignals: ['High IV → sell premium', 'bullish trend'],
  probabilityOfProfit: 75,
  breakEvenPrices: [170.5],
}

describe('StrategyCard', () => {
  it('renders strategy name', () => {
    render(<StrategyCard strategy={mockStrategy} symbol="AAPL" underlyingPrice={175} ivRank={70} experienceLevel="beginner" />)
    expect(screen.getByText('Covered Call')).toBeInTheDocument()
  })

  it('renders PoP and break-even', () => {
    render(<StrategyCard strategy={mockStrategy} symbol="AAPL" underlyingPrice={175} ivRank={70} experienceLevel="beginner" />)
    expect(screen.getByText(/75\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/\$170\.50/)).toBeInTheDocument()
  })

  it('shows error when no API key on expand click', () => {
    render(<StrategyCard strategy={mockStrategy} symbol="AAPL" underlyingPrice={175} ivRank={70} experienceLevel="beginner" />)
    fireEvent.click(screen.getByText(/Why this strategy/i))
    expect(screen.getByText(/Explanation unavailable/i)).toBeInTheDocument()
  })
})
