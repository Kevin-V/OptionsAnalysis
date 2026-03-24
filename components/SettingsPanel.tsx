'use client'
import { useState, useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: Props) {
  const [aiProvider, setAiProvider] = useState('claude')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setAiProvider(localStorage.getItem('aiProvider') ?? 'claude')
    setAnthropicKey(localStorage.getItem('anthropicApiKey') ?? '')
    setGeminiKey(localStorage.getItem('geminiApiKey') ?? '')
  }, [isOpen])

  function handleSave() {
    localStorage.setItem('aiProvider', aiProvider)
    localStorage.setItem('anthropicApiKey', anthropicKey)
    localStorage.setItem('geminiApiKey', geminiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">AI Provider</label>
            <select
              value={aiProvider}
              onChange={e => setAiProvider(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Gemini (Google)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Anthropic API Key</label>
            <input
              type="password"
              value={anthropicKey}
              onChange={e => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Required if using Claude as AI provider</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Google Gemini API Key</label>
            <input
              type="password"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AI..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Required if using Gemini as AI provider</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">Keys are stored locally in your browser only.</p>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
