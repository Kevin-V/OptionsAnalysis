import type { ExplainRequest, ExplainResponse } from '@/lib/types'

export interface IAIProvider {
  explain(request: ExplainRequest): Promise<ExplainResponse>
}
