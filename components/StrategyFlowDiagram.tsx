'use client'

interface FlowStep {
  step: number
  title: string
  description: string
  icon: string
  detail?: string
}

interface Outcome {
  label: string
  description: string
  color: 'green' | 'red' | 'blue'
  pnl?: string
}

interface KeyTerm {
  term: string
  definition: string
}

interface ExampleTrade {
  title: string
  lines: string[]
}

interface Props {
  strategyName: string
  steps: FlowStep[]
  outcomes: Outcome[]
  keyTerms?: KeyTerm[]
  example?: ExampleTrade
  maxProfit?: string
  maxLoss?: string
  breakEven?: string
  riskLevel?: 'Low' | 'Medium' | 'High'
}

const OUTCOME_COLORS = {
  green: 'border-green-300 bg-green-50 text-green-800',
  red: 'border-red-300 bg-red-50 text-red-800',
  blue: 'border-blue-300 bg-blue-50 text-blue-800',
}

const RISK_COLORS = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
}

export function StrategyFlowDiagram({ strategyName, steps, outcomes, keyTerms, example, maxProfit, maxLoss, breakEven, riskLevel }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          How {strategyName} Works
        </h4>
        {riskLevel && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${RISK_COLORS[riskLevel]}`}>
            {riskLevel} Risk
          </span>
        )}
      </div>

      {/* Example trade box */}
      {example && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">{example.title}</p>
          <div className="space-y-1">
            {example.lines.map((line, i) => (
              <p key={i} className="text-sm text-blue-900">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Steps flow */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.step}>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm border border-gray-200 flex-shrink-0">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-6 bg-gray-300 my-1" />
                )}
              </div>
              <div className="pt-1 pb-3 min-w-0">
                <p className="text-xs font-bold text-blue-700">Step {step.step}</p>
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-sm text-gray-600">{step.description}</p>
                {step.detail && (
                  <p className="mt-1 text-xs text-gray-500 italic">{step.detail}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profit / Loss / Break-even summary */}
      {(maxProfit || maxLoss || breakEven) && (
        <div className="grid grid-cols-3 gap-3">
          {maxProfit && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Max Profit</p>
              <p className="mt-1 text-sm font-bold text-green-800">{maxProfit}</p>
            </div>
          )}
          {maxLoss && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Max Loss</p>
              <p className="mt-1 text-sm font-bold text-red-800">{maxLoss}</p>
            </div>
          )}
          {breakEven && (
            <div className="rounded-lg bg-gray-100 border border-gray-200 p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Break-even</p>
              <p className="mt-1 text-sm font-bold text-gray-800">{breakEven}</p>
            </div>
          )}
        </div>
      )}

      {/* Outcomes */}
      {outcomes.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            What Can Happen
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {outcomes.map(outcome => (
              <div
                key={outcome.label}
                className={`rounded-lg border-2 p-4 ${OUTCOME_COLORS[outcome.color]}`}
              >
                <p className="text-sm font-bold">{outcome.label}</p>
                <p className="mt-1 text-xs">{outcome.description}</p>
                {outcome.pnl && (
                  <p className="mt-2 text-xs font-bold">{outcome.pnl}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Terms */}
      {keyTerms && keyTerms.length > 0 && (
        <div className="rounded-lg bg-white border border-gray-200 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Key Terms</p>
          <dl className="space-y-2">
            {keyTerms.map(kt => (
              <div key={kt.term}>
                <dt className="text-xs font-bold text-gray-900">{kt.term}</dt>
                <dd className="text-xs text-gray-600">{kt.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
