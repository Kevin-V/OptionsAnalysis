import { ClaudeProvider } from './ClaudeProvider'
import { GeminiProvider } from './GeminiProvider'
import type { IAIProvider } from './IAIProvider'

export function getAIProvider(): IAIProvider {
  const provider = process.env.AI_PROVIDER ?? 'claude'
  switch (provider) {
    case 'gemini': return new GeminiProvider()
    case 'claude':
    default:
      return new ClaudeProvider()
  }
}

export type { IAIProvider }
