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
  legs: [
    { type: 'stock', action: 'buy', strike: 175, expiry: '', premium: 175, quantity: 100 },
    { type: 'call', action: 'sell', strike: 185, expiry: '2025-04-18', premium: 3.50, quantity: 1 },
  ],
  netCreditDebit: 3.50,
}

const defaultProps = {
  strategy: mockStrategy,
  symbol: 'AAPL',
  underlyingPrice: 175,
  ivRank: 70,
  experienceLevel: 'beginner' as const,
  callStrikes: [170, 175, 180, 185, 190],
  putStrikes: [160, 165, 170, 175, 180],
  contracts: [
    { strike: 185, type: 'call' as const, bid: 3.20, ask: 3.80 },
    { strike: 180, type: 'call' as const, bid: 5.00, ask: 5.60 },
    { strike: 190, type: 'call' as const, bid: 1.50, ask: 2.00 },
  ],
}

describe('StrategyCard', () => {
  it('renders strategy name', () => {
    render(<StrategyCard {...defaultProps} />)
    expect(screen.getByText('Covered Call')).toBeInTheDocument()
  })

  it('renders PoP and break-even', () => {
    render(<StrategyCard {...defaultProps} />)
    expect(screen.getByText(/75\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/\$170\.50/)).toBeInTheDocument()
  })

  it('shows error when no API key on expand click', () => {
    render(<StrategyCard {...defaultProps} />)
    fireEvent.click(screen.getByText(/Why this strategy/i))
    expect(screen.getByText(/API key|Explanation unavailable|localStorage/i)).toBeInTheDocument()
  })
})
