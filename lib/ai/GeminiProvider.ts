import { GoogleGenerativeAI } from '@google/generative-ai'
import type { IAIProvider } from './IAIProvider'
import type { ExplainRequest, ExplainResponse } from '@/lib/types'

const LEVEL_INSTRUCTIONS = {
  beginner: 'Explain in plain English. Use simple analogies and avoid jargon. Assume the user has never traded options before.',
  intermediate: 'Assume familiarity with calls, puts, and basic greeks. Mention delta, theta, and vega impact where relevant.',
  advanced: 'Be concise and technical. Include greeks, adjustment techniques, and risk/reward nuances.',
}

export class GeminiProvider implements IAIProvider {
  private client = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY ?? '')

  async explain(request: ExplainRequest): Promise<ExplainResponse> {
    const { symbol, underlyingPrice, ivRank, strategy, experienceLevel } = request
    const levelInstruction = LEVEL_INSTRUCTIONS[experienceLevel]

    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an options trading educator. A user is looking at ${symbol} (price: $${underlyingPrice}, IV Rank: ${ivRank}/100).

The rules engine recommends: **${strategy.strategy.name}**
Matched signals: ${strategy.matchedSignals.join(', ')}
Confidence: ${strategy.confidenceScore}/100
Probability of profit: ${strategy.probabilityOfProfit.toFixed(1)}%
Break-even price(s): ${strategy.breakEvenPrices.map(p => '$' + p.toFixed(2)).join(' / ')}

${levelInstruction}

Respond in JSON with this exact shape:
{
  "explanation": "2-4 sentence explanation of why this strategy fits right now",
  "keyRisks": ["risk 1", "risk 2", "risk 3"],
  "idealConditions": "one sentence describing when this strategy works best"
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(jsonMatch?.[0] ?? '{}')
      return {
        explanation: parsed.explanation ?? '',
        keyRisks: parsed.keyRisks ?? [],
        idealConditions: parsed.idealConditions ?? '',
      }
    } catch {
      return {
        explanation: text,
        keyRisks: [],
        idealConditions: '',
      }
    }
  }
}
