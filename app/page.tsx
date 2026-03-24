'use client'
import { useState, useEffect } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { ExperienceToggle } from '@/components/ExperienceToggle'
import { ChainSummary } from '@/components/ChainSummary'
import { StrategyCard } from '@/components/StrategyCard'
import type { ExperienceLevel, RankedStrategy } from '@/lib/types'

interface AnalysisResult {
  symbol: string
  underlyingPrice: number
  ivRank: number
  putCallRatio: number
  expiryDates: string[]
  topStrategies: RankedStrategy[]
}

export default function Home() {
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('experienceLevel') as ExperienceLevel | null
    if (saved) setExperienceLevel(saved)
  }, [])

  function handleLevelChange(level: ExperienceLevel) {
    setExperienceLevel(level)
    localStorage.setItem('experienceLevel', level)
  }

  async function handleAnalyze(symbol: string) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/options/chain?symbol=${encodeURIComponent(symbol)}&level=${experienceLevel}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      setResult(data)
    } catch {
      setError('Unable to fetch options data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Options Strategy Analyzer</h1>
          <p className="mt-3 text-lg text-gray-500">
            Enter a stock ticker to get ranked options strategy suggestions with AI-powered explanations.
          </p>
          <a href="/learn" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            New to options? Visit the Strategy Library &rarr;
          </a>
        </div>

        <div className="mb-6 flex justify-center">
          <ExperienceToggle value={experienceLevel} onChange={handleLevelChange} />
        </div>

        <div className="flex justify-center">
          <SearchBar onSelect={handleAnalyze} loading={loading} />
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-4">
            <ChainSummary
              symbol={result.symbol}
              underlyingPrice={result.underlyingPrice}
              ivRank={result.ivRank}
              putCallRatio={result.putCallRatio}
              expiryDates={result.expiryDates}
            />
            <h2 className="mt-6 text-lg font-semibold text-gray-900">Suggested Strategies</h2>
            {result.topStrategies.length === 0 ? (
              <p className="text-gray-500">No matching strategies found for current market conditions.</p>
            ) : (
              result.topStrategies.map(strategy => (
                <StrategyCard
                  key={strategy.strategy.id}
                  strategy={strategy}
                  symbol={result.symbol}
                  underlyingPrice={result.underlyingPrice}
                  ivRank={result.ivRank}
                  experienceLevel={experienceLevel}
                />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
