interface Props {
  symbol: string
  underlyingPrice: number
  ivRank: number
  putCallRatio: number
  expiryDates: string[]
}

export function ChainSummary({ symbol, underlyingPrice, ivRank, putCallRatio, expiryDates }: Props) {
  const ivLabel = ivRank > 50 ? 'High' : ivRank < 30 ? 'Low' : 'Neutral'
  const ivColor = ivRank > 50 ? 'text-red-600' : ivRank < 30 ? 'text-green-600' : 'text-yellow-600'

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
      <p className="mt-3 text-xs text-gray-400">
        {expiryDates.length} expiry dates available &middot; nearest: {expiryDates[0] ?? 'N/A'}
      </p>
    </div>
  )
}
