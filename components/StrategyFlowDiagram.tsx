'use client'

interface FlowStep {
  step: number
  title: string
  description: string
  icon: string
}

interface Outcome {
  label: string
  description: string
  color: 'green' | 'red' | 'blue'
}

interface Props {
  strategyName: string
  steps: FlowStep[]
  outcomes: Outcome[]
}

const OUTCOME_COLORS = {
  green: 'border-green-300 bg-green-50 text-green-800',
  red: 'border-red-300 bg-red-50 text-red-800',
  blue: 'border-blue-300 bg-blue-50 text-blue-800',
}

export function StrategyFlowDiagram({ strategyName, steps, outcomes }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <h4 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-gray-500">
        How {strategyName} Works
      </h4>

      {/* Steps flow */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, i) => (
          <div key={step.step} className="flex flex-1 flex-col items-center sm:flex-row">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm border border-gray-200">
                {step.icon}
              </div>
              <div className="mt-2 max-w-[140px]">
                <p className="text-xs font-bold text-blue-700">Step {step.step}</p>
                <p className="text-xs font-semibold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{step.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <>
                <div className="hidden sm:block sm:mx-2 sm:mt-6 text-gray-300 text-xl">&rarr;</div>
                <div className="block sm:hidden my-1 text-gray-300 text-xl text-center">&darr;</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Outcomes */}
      {outcomes.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
            What Can Happen
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {outcomes.map(outcome => (
              <div
                key={outcome.label}
                className={`rounded-lg border-2 p-3 ${OUTCOME_COLORS[outcome.color]}`}
              >
                <p className="text-sm font-bold">{outcome.label}</p>
                <p className="mt-1 text-xs">{outcome.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
