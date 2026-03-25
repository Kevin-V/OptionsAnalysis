interface Props {
  symbol: string
  underlyingPrice: number
  ivRank: number
  putCallRatio: number
  expiryDates: string[]
  earningsDate?: string
  dividendDate?: string
  dividendYield?: number
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T12:00:00')
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ChainSummary({ symbol, underlyingPrice, ivRank, putCallRatio, expiryDates, earningsDate, dividendDate, dividendYield }: Props) {
  const ivLabel = ivRank > 50 ? 'High' : ivRank < 30 ? 'Low' : 'Neutral'
  const ivColor = ivRank > 50 ? 'text-red-600' : ivRank < 30 ? 'text-green-600' : 'text-yellow-600'

  const earningsDays = earningsDate ? daysUntil(earningsDate) : null
  const dividendDays = dividendDate ? daysUntil(dividendDate) : null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">{symbol}</h2>
      <div className="mt-3 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-lg font-semibold text-gray-900">${underlyingPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">IV Rank</p>
          <p className={`text-lg font-semibold ${ivColor}`}>{ivRank}/100 ({ivLabel})</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Put/Call Ratio</p>
          <p className="text-lg font-semibold text-gray-900">{putCallRatio.toFixed(2)}</p>
        </div>
      </div>

      {/* Earnings & Dividend row */}
      {(earningsDate || dividendDate) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {earningsDate && earningsDays !== null && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              earningsDays >= 0 && earningsDays <= 7
                ? 'bg-red-50 border border-red-200'
                : earningsDays >= 0 && earningsDays <= 30
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <span className="text-base">📊</span>
              <div>
                <span className={`font-medium ${
                  earningsDays >= 0 && earningsDays <= 7 ? 'text-red-700' : earningsDays >= 0 && earningsDays <= 30 ? 'text-amber-700' : 'text-gray-700'
                }`}>
                  Earnings: {formatDate(earningsDate)}
                </span>
                <span className={`ml-1.5 text-xs ${
                  earningsDays >= 0 && earningsDays <= 7 ? 'text-red-500' : earningsDays >= 0 && earningsDays <= 30 ? 'text-amber-500' : 'text-gray-500'
                }`}>
                  {earningsDays < 0 ? `${Math.abs(earningsDays)}d ago` : earningsDays === 0 ? 'Today!' : `in ${earningsDays}d`}
                </span>
              </div>
            </div>
          )}

          {dividendDate && dividendDays !== null && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              dividendDays >= 0 && dividendDays <= 7
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <span className="text-base">💰</span>
              <div>
                <span className={`font-medium ${dividendDays >= 0 && dividendDays <= 7 ? 'text-blue-700' : 'text-gray-700'}`}>
                  Ex-Div: {formatDate(dividendDate)}
                </span>
                <span className={`ml-1.5 text-xs ${dividendDays >= 0 && dividendDays <= 7 ? 'text-blue-500' : 'text-gray-500'}`}>
                  {dividendDays < 0 ? `${Math.abs(dividendDays)}d ago` : dividendDays === 0 ? 'Today!' : `in ${dividendDays}d`}
                </span>
                {dividendYield !== undefined && dividendYield > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">({(dividendYield * 100).toFixed(1)}% yield)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning if earnings is within selected expiry window */}
      {earningsDate && earningsDays !== null && earningsDays > 0 && earningsDays <= 30 && (
        <p className="mt-2 text-xs text-amber-600">
          ⚠️ Earnings within 30 days — expect elevated IV and potential IV crush after the report. Factor this into strategy selection.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        {expiryDates.length} expiry dates available &middot; nearest: {expiryDates[0] ?? 'N/A'}
      </p>
    </div>
  )
}
