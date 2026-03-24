import { ClaudeProvider } from './ClaudeProvider'
import { GeminiProvider } from './GeminiProvider'
import type { IAIProvider } from './IAIProvider'

export function getAIProvider(provider?: string, apiKey?: string): IAIProvider {
  const selected = provider ?? process.env.AI_PROVIDER ?? 'claude'
  switch (selected) {
    case 'gemini': return new GeminiProvider(apiKey)
    case 'claude':
    default:
      return new ClaudeProvider(apiKey)
  }
}

export type { IAIProvider }
