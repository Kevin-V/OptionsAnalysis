import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai'
import type { ExplainRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  const aiProvider = request.headers.get('x-ai-provider') ?? process.env.AI_PROVIDER ?? 'claude'
  const apiKey = request.headers.get('x-api-key') ?? ''

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required. Add it in Settings.' }, { status: 401 })
  }

  let body: ExplainRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.symbol || !body.strategy || !body.experienceLevel) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const provider = getAIProvider(aiProvider, apiKey)
    const result = await provider.explain(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI explain error:', error)
    return NextResponse.json({ error: 'Explanation unavailable' }, { status: 503 })
  }
}
