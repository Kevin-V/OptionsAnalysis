'use client'
import { useState, useEffect, useRef } from 'react'
import type { SymbolSearchResult } from '@/lib/types'

interface Props {
  onSelect: (symbol: string) => void
  loading: boolean
}

export function SearchBar({ onSelect, loading }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SymbolSearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedRef = useRef(false)

  useEffect(() => {
    if (selectedRef.current) { selectedRef.current = false; return }
    if (query.length < 1) { setResults([]); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/options/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setShowDropdown(true)
    }, 300)
  }, [query])

  function handleSelect(symbol: string) {
    selectedRef.current = true
    setQuery(symbol)
    setResults([])
    setShowDropdown(false)
    onSelect(symbol)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      setShowDropdown(false)
      onSelect(query.trim().toUpperCase())
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Enter a stock symbol (e.g. AAPL)"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map(r => (
            <li
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <span className="font-mono font-medium text-gray-900">{r.symbol}</span>
              <span className="text-sm text-gray-500 truncate">{r.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
