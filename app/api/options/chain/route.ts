import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/lib/data'
import { computeSignals } from '@/lib/engine/signals'
import { rankStrategies } from '@/lib/engine/ranker'

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol')

  if (!symbol || symbol.trim().length === 0) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  const experienceLevel = (request.nextUrl.searchParams.get('level') ?? 'beginner') as
    'beginner' | 'intermediate' | 'advanced'

  try {
    const provider = getDataProvider()
    const chain = await provider.getChain(symbol.toUpperCase())
    const signals = computeSignals(chain)
    const topStrategies = rankStrategies(chain, signals, experienceLevel)

    return NextResponse.json({
      symbol: chain.symbol,
      underlyingPrice: chain.underlyingPrice,
      ivRank: chain.ivRank,
      putCallRatio: chain.putCallRatio,
      expiryDates: chain.expiryDates,
      signals,
      topStrategies,
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
