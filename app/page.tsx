'use client'
import { useState, useEffect } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { ExperienceToggle } from '@/components/ExperienceToggle'
import { ExpirySelector } from '@/components/ExpirySelector'
import { StrategyPicker } from '@/components/StrategyPicker'
import { ChainSummary } from '@/components/ChainSummary'
import { StrategyCard } from '@/components/StrategyCard'
import { SettingsPanel } from '@/components/SettingsPanel'
import type { ExperienceLevel, RankedStrategy } from '@/lib/types'

interface SlimContract {
  strike: number
  type: 'call' | 'put'
  bid: number
  ask: number
  iv?: number
}

interface AnalysisResult {
  symbol: string
  underlyingPrice: number
  ivRank: number
  putCallRatio: number
  expiryDates: string[]
  earningsDate?: string
  dividendDate?: string
  dividendYield?: number
  topStrategies: RankedStrategy[]
  callStrikes: number[]
  putStrikes: number[]
  contracts: SlimContract[]
}

export default function Home() {
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedExpiry, setSelectedExpiry] = useState<string>('')
  const [currentSymbol, setCurrentSymbol] = useState<string>('')
  const [selectedStrategy, setSelectedStrategy] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem('experienceLevel') as ExperienceLevel | null
    if (saved) setExperienceLevel(saved)
  }, [])

  function handleLevelChange(level: ExperienceLevel) {
    setExperienceLevel(level)
    localStorage.setItem('experienceLevel', level)
    if (currentSymbol) {
      // Re-analyze with the new level — need to pass level directly since state update is async
      reAnalyzeWithLevel(level)
    }
  }

  async function reAnalyzeWithLevel(level: ExperienceLevel) {
    setLoading(true)
    setError(null)
    try {
      let url = `/api/options/chain?symbol=${encodeURIComponent(currentSymbol)}&level=${level}`
      if (selectedExpiry) url += `&expiry=${encodeURIComponent(selectedExpiry)}`
      if (selectedStrategy) url += `&strategy=${encodeURIComponent(selectedStrategy)}`
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) setResult(data)
    } catch {
      // keep existing results on error
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze(symbol: string, expiry?: string, strategy?: string) {
    setLoading(true)
    setError(null)
    setResult(null)
    setCurrentSymbol(symbol)

    const strat = strategy ?? selectedStrategy
    try {
      let url = `/api/options/chain?symbol=${encodeURIComponent(symbol)}&level=${experienceLevel}`
      if (expiry) url += `&expiry=${encodeURIComponent(expiry)}`
      if (strat) url += `&strategy=${encodeURIComponent(strat)}`

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      // Default to an expiry ~30 days out for meaningful premiums
      if (!expiry && data.expiryDates?.length > 0) {
        const now = Date.now()
        const target = now + 30 * 24 * 60 * 60 * 1000
        const dates: string[] = data.expiryDates
        const best = dates.reduce((pick, d) => {
          return Math.abs(new Date(d + 'T12:00:00').getTime() - target) < Math.abs(new Date(pick + 'T12:00:00').getTime() - target) ? d : pick
        })
        setSelectedExpiry(best)
        // Re-fetch with the better expiry (must be an exact date from the list)
        let reUrl = `/api/options/chain?symbol=${encodeURIComponent(symbol)}&level=${experienceLevel}&expiry=${encodeURIComponent(best)}`
        if (strat) reUrl += `&strategy=${encodeURIComponent(strat)}`
        const reRes = await fetch(reUrl)
        const reData = await reRes.json()
        if (reRes.ok) {
          setResult(reData)
          return
        }
      }
      setResult(data)
    } catch {
      setError('Unable to fetch options data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleExpiryChange(expiry: string) {
    setSelectedExpiry(expiry)
    if (currentSymbol) handleAnalyze(currentSymbol, expiry)
  }

  function handleStrategyChange(strategyId: string) {
    setSelectedStrategy(strategyId)
    if (currentSymbol) handleAnalyze(currentSymbol, selectedExpiry || undefined, strategyId)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Settings gear icon */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Settings — add your API key"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Options Strategy Analyzer</h1>
          <p className="mt-3 text-lg text-gray-500">
            Enter a stock ticker to get ranked options strategy suggestions with AI-powered explanations.
          </p>
          <div className="mt-2 flex gap-4 justify-center">
            <a href="/learn" className="text-sm text-blue-600 hover:underline">
              Strategy Library &rarr;
            </a>
            <a href="/glossary" className="text-sm text-blue-600 hover:underline">
              Glossary &rarr;
            </a>
          </div>
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
              earningsDate={result.earningsDate}
              dividendDate={result.dividendDate}
              dividendYield={result.dividendYield}
            />

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {result.expiryDates.length > 0 && (
                <ExpirySelector
                  expiryDates={result.expiryDates}
                  selected={selectedExpiry}
                  onChange={handleExpiryChange}
                />
              )}
              <StrategyPicker
                selected={selectedStrategy}
                onChange={handleStrategyChange}
              />
            </div>

            <h2 className="mt-6 text-lg font-semibold text-gray-900">
              {selectedStrategy ? 'Strategy Analysis' : 'Suggested Strategies'}
            </h2>
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
                  callStrikes={result.callStrikes}
                  putStrikes={result.putStrikes}
                  contracts={result.contracts}
                  selectedExpiry={selectedExpiry}
                />
              ))
            )}
          </div>
        )}
      </div>
    </main>
  )
}
