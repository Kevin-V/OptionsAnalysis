import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/lib/data'
import { computeSignals } from '@/lib/engine/signals'
import { rankStrategies, buildSingleStrategy } from '@/lib/engine/ranker'

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol')

  if (!symbol || symbol.trim().length === 0) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  const experienceLevel = (request.nextUrl.searchParams.get('level') ?? 'beginner') as
    'beginner' | 'intermediate' | 'advanced'
  const expiry = request.nextUrl.searchParams.get('expiry') ?? undefined
  const forcedStrategy = request.nextUrl.searchParams.get('strategy') ?? undefined

  try {
    const provider = getDataProvider()
    const chain = await provider.getChain(symbol.toUpperCase(), expiry)
    const signals = computeSignals(chain)

    let topStrategies
    if (forcedStrategy) {
      const result = buildSingleStrategy(forcedStrategy, chain, signals)
      topStrategies = result ? [result] : []
    } else {
      topStrategies = rankStrategies(chain, signals, experienceLevel)
    }

    // Build available strikes for call and put dropdowns
    const callStrikes = [...new Set(chain.contracts.filter(c => c.type === 'call').map(c => c.strike))].sort((a, b) => a - b)
    const putStrikes = [...new Set(chain.contracts.filter(c => c.type === 'put').map(c => c.strike))].sort((a, b) => a - b)

    // Slim contracts for client-side strike recalculation (bid/ask/strike/type only)
    const contractsSlim = chain.contracts.map(c => ({
      strike: c.strike,
      type: c.type,
      bid: c.bid,
      ask: c.ask,
      iv: c.impliedVolatility,
    }))

    return NextResponse.json({
      symbol: chain.symbol,
      underlyingPrice: chain.underlyingPrice,
      ivRank: chain.ivRank,
      putCallRatio: chain.putCallRatio,
      expiryDates: chain.expiryDates,
      earningsDate: chain.earningsDate,
      dividendDate: chain.dividendDate,
      dividendYield: chain.dividendYield,
      signals,
      topStrategies,
      callStrikes,
      putStrikes,
      contracts: contractsSlim,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.includes('Symbol not found') || message.includes('No fundamentals')) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 400 })
    }
    console.error('Options chain error:', error)
    return NextResponse.json({ error: 'Unable to fetch options data' }, { status: 500 })
  }
}
