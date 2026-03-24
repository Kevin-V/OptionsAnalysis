import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/lib/data'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? ''
  if (query.length < 1) return NextResponse.json([])

  try {
    const provider = getDataProvider()
    const results = await provider.searchSymbol(query)
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
