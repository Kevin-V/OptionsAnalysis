import Link from 'next/link'

const GLOSSARY = [
  {
    category: 'Options Basics',
    icon: '\uD83D\uDCDC',
    terms: [
      { term: 'Option', definition: 'A contract that gives you the right (but not the obligation) to buy or sell a stock at a specific price before a specific date. One contract covers 100 shares.', icon: '\uD83D\uDCDD' },
      { term: 'Call Option', definition: 'Gives you the right to BUY 100 shares at the strike price. You buy calls when you think the stock will go up.', icon: '\uD83D\uDCC8',
        visual: { type: 'diagram' as const, label: 'Call = Bet stock goes UP', colors: 'from-green-100 to-green-50 border-green-200 text-green-700' } },
      { term: 'Put Option', definition: 'Gives you the right to SELL 100 shares at the strike price. You buy puts when you think the stock will go down, or to protect shares you own.', icon: '\uD83D\uDCC9',
        visual: { type: 'diagram' as const, label: 'Put = Bet stock goes DOWN', colors: 'from-red-100 to-red-50 border-red-200 text-red-700' } },
      { term: 'Strike Price', definition: 'The price at which you can buy (call) or sell (put) the stock. For example, a $175 call lets you buy 100 shares at $175 each, no matter how high the stock goes.', icon: '\uD83C\uDFAF' },
      { term: 'Expiration Date', definition: 'The deadline for the option. After this date, the option no longer exists. Common timeframes: weekly, monthly (third Friday), or LEAPS (1-2 years out).', icon: '\uD83D\uDCC5' },
      { term: 'Premium', definition: 'The price you pay (or receive) for an option, quoted per share. A $3.00 premium costs $300 total (100 shares x $3.00). Think of it as the "ticket price" to participate.', icon: '\uD83D\uDCB0',
        visual: { type: 'math' as const, label: '$3.00/share \u00D7 100 shares = $300 total cost' } },
      { term: 'Contract', definition: 'One options contract represents 100 shares of the underlying stock. If you buy 1 call contract, you control 100 shares.', icon: '\uD83D\uDCE6',
        visual: { type: 'math' as const, label: '1 contract = 100 shares' } },
      { term: 'Underlying', definition: 'The stock that the option is based on. If you buy an AAPL call, AAPL is the underlying stock.', icon: '\uD83C\uDFE2' },
      { term: 'Exercise', definition: 'Using your option right \u2014 actually buying (call) or selling (put) the shares at the strike price. Most traders sell the option itself instead of exercising.', icon: '\u2705' },
      { term: 'Assignment', definition: 'When someone exercises their option against you. If you sold a call and the buyer exercises, you must sell your shares at the strike price.', icon: '\uD83D\uDCE9' },
    ],
  },
  {
    category: 'Money-ness',
    icon: '\uD83D\uDCB5',
    terms: [
      { term: 'In-the-Money (ITM)', definition: 'An option with real value right now. For calls: stock price is ABOVE the strike. For puts: stock price is BELOW the strike. Example: AAPL at $180, the $175 call is $5 in-the-money.', icon: '\uD83D\uDFE2',
        visual: { type: 'scale' as const, position: 'left' as const, labels: ['ITM \u2714\uFE0F', 'ATM', 'OTM'] } },
      { term: 'At-the-Money (ATM)', definition: 'When the strike price equals (or is very close to) the current stock price. Example: AAPL at $175, the $175 call is at-the-money.', icon: '\uD83D\uDFE1',
        visual: { type: 'scale' as const, position: 'center' as const, labels: ['ITM', 'ATM \u2714\uFE0F', 'OTM'] } },
      { term: 'Out-of-the-Money (OTM)', definition: 'An option with no real value yet. For calls: stock price is BELOW the strike. For puts: stock price is ABOVE the strike. Cheaper to buy, but less likely to profit.', icon: '\uD83D\uDD34',
        visual: { type: 'scale' as const, position: 'right' as const, labels: ['ITM', 'ATM', 'OTM \u2714\uFE0F'] } },
      { term: 'Intrinsic Value', definition: 'The real, exercisable value of an ITM option. For a $175 call with stock at $180, intrinsic value = $5. OTM options have zero intrinsic value.', icon: '\uD83D\uDC8E',
        visual: { type: 'math' as const, label: 'Stock $180 - Strike $175 = $5 intrinsic value' } },
      { term: 'Extrinsic Value (Time Value)', definition: 'The extra value beyond intrinsic value. Reflects the chance the option could become more valuable before expiry. This portion decreases every day (time decay).', icon: '\u23F3',
        visual: { type: 'decay' as const } },
    ],
  },
  {
    category: 'Buying vs. Selling Options',
    icon: '\u2194\uFE0F',
    terms: [
      { term: 'Long (Buy)', definition: 'Buying an option. You pay premium upfront and have the RIGHT to buy/sell stock. Your max loss is the premium paid. You want the stock to move in your favor.', icon: '\uD83D\uDCE5',
        visual: { type: 'comparison' as const, left: 'Pay premium', right: 'Get rights', leftColor: 'bg-red-100 text-red-700', rightColor: 'bg-green-100 text-green-700' } },
      { term: 'Short (Sell / Write)', definition: 'Selling an option. You collect premium upfront but have the OBLIGATION to buy/sell stock if assigned. You want the option to expire worthless so you keep the premium.', icon: '\uD83D\uDCE4',
        visual: { type: 'comparison' as const, left: 'Get premium', right: 'Take obligation', leftColor: 'bg-green-100 text-green-700', rightColor: 'bg-red-100 text-red-700' } },
      { term: 'Buy to Open', definition: 'Opening a new position by buying an option. This is how you start a long call or long put trade.', icon: '\uD83D\uDD13' },
      { term: 'Sell to Close', definition: 'Closing an existing long position by selling your option. This is how you take profit or cut losses on options you bought.', icon: '\uD83D\uDD12' },
      { term: 'Sell to Open', definition: 'Opening a new position by selling an option. This is how you start a covered call or cash-secured put trade.', icon: '\uD83D\uDD13' },
      { term: 'Buy to Close', definition: 'Closing an existing short position by buying back the option you sold. Use this to lock in profit or limit loss on options you sold.', icon: '\uD83D\uDD12' },
    ],
  },
  {
    category: 'Pricing & Value',
    icon: '\uD83C\uDFF7\uFE0F',
    terms: [
      { term: 'Bid', definition: 'The highest price a buyer is willing to pay for the option right now. When you sell, you get the bid price.', icon: '\uD83D\uDFE2',
        visual: { type: 'bidask' as const } },
      { term: 'Ask', definition: 'The lowest price a seller is willing to accept right now. When you buy, you pay the ask price.', icon: '\uD83D\uDD34' },
      { term: 'Bid-Ask Spread', definition: 'The difference between bid and ask. Tighter spreads (e.g., $3.00/$3.05) mean the option is actively traded. Wide spreads (e.g., $3.00/$3.50) mean it may be hard to get a fair price.', icon: '\u2194\uFE0F',
        visual: { type: 'spread' as const } },
      { term: 'Mid Price', definition: 'The midpoint between bid and ask. Often used as the "fair value" estimate. Example: bid $3.00, ask $3.20, mid = $3.10.', icon: '\u2696\uFE0F',
        visual: { type: 'math' as const, label: '($3.00 + $3.20) \u00F7 2 = $3.10 mid' } },
      { term: 'Volume', definition: 'How many contracts traded today. Higher volume = more active market, tighter spreads, easier to buy/sell at fair prices.', icon: '\uD83D\uDCCA' },
      { term: 'Open Interest', definition: 'Total number of outstanding contracts that haven\'t been closed. High open interest = more liquid option, easier to trade.', icon: '\uD83D\uDCCB' },
    ],
  },
  {
    category: 'Volatility',
    icon: '\uD83C\uDF0A',
    terms: [
      { term: 'Implied Volatility (IV)', definition: 'How much the market expects the stock to move in the future, baked into option prices. High IV = expensive options. Low IV = cheap options. Think of it as the "fear gauge."', icon: '\uD83D\uDCA8',
        visual: { type: 'meter' as const, level: 'high', label: 'High IV = Expensive Options' } },
      { term: 'IV Rank', definition: 'Where current IV sits compared to the past year, on a 0-100 scale. IV Rank of 80 means IV is higher than 80% of the past year. High IV Rank = good time to sell options.', icon: '\uD83D\uDCCF',
        visual: { type: 'ivrank' as const } },
      { term: 'IV Crush', definition: 'When IV drops sharply (usually after an event like earnings), all options lose value fast \u2014 even if you were right about direction. Common trap for beginners.', icon: '\uD83D\uDCA5',
        visual: { type: 'crush' as const } },
      { term: 'Historical Volatility', definition: 'How much the stock actually moved in the past. Compare to IV: if IV is much higher than historical, options may be overpriced.', icon: '\uD83D\uDCC9' },
    ],
  },
  {
    category: 'The Greeks',
    icon: '\uD83C\uDFDB\uFE0F',
    terms: [
      { term: 'Delta (\u0394)', definition: 'How much the option price changes when the stock moves $1. A delta of 0.50 means the option gains $0.50 for every $1 the stock moves. Also roughly estimates the probability of expiring ITM.', icon: '\u25B3',
        visual: { type: 'greek' as const, symbol: '\u0394', example: 'Stock +$1 \u2192 Option +$0.50', color: 'blue' } },
      { term: 'Theta (\u0398)', definition: 'How much value the option loses each day just from time passing. A theta of -0.05 means you lose $5 per contract per day. Time decay accelerates near expiration.', icon: '\u23F1\uFE0F',
        visual: { type: 'greek' as const, symbol: '\u0398', example: 'Each day \u2192 Option loses $5', color: 'red' } },
      { term: 'Vega (v)', definition: 'How much the option price changes when IV moves 1%. A vega of 0.10 means the option gains $0.10 if IV rises 1%. Important around earnings.', icon: '\uD83C\uDF0A',
        visual: { type: 'greek' as const, symbol: 'v', example: 'IV +1% \u2192 Option +$0.10', color: 'purple' } },
      { term: 'Gamma (\u0393)', definition: 'How fast delta changes as the stock moves. High gamma near ATM means delta shifts quickly \u2014 the option becomes much more sensitive to stock moves.', icon: '\u26A1',
        visual: { type: 'greek' as const, symbol: '\u0393', example: 'Measures delta acceleration', color: 'amber' } },
    ],
  },
  {
    category: 'Profit & Loss',
    icon: '\uD83D\uDCC0',
    terms: [
      { term: 'Break-even', definition: 'The stock price where you neither make nor lose money. For a long call: strike + premium paid. For a long put: strike - premium paid.', icon: '\u2696\uFE0F',
        visual: { type: 'breakeven' as const } },
      { term: 'Max Profit', definition: 'The most you can make on the trade. For buying options, this can be unlimited (calls) or very large (puts). For selling options, it\'s capped at the premium collected.', icon: '\uD83C\uDFC6' },
      { term: 'Max Loss', definition: 'The most you can lose. For buying options, it\'s always the premium paid. For selling naked options, losses can be unlimited \u2014 which is why beginners should avoid naked selling.', icon: '\uD83D\uDEE1\uFE0F' },
      { term: 'Probability of Profit (PoP)', definition: 'The estimated chance your trade makes money. Approximated by delta. A 70% PoP trade profits 7 out of 10 times, but the losses on the 3 may be larger.', icon: '\uD83C\uDFB2',
        visual: { type: 'pop' as const } },
      { term: 'Risk/Reward Ratio', definition: 'Max loss divided by max profit. A 1:3 ratio means you risk $1 to make $3. Lower ratio = better, but usually comes with lower probability.', icon: '\u2696\uFE0F',
        visual: { type: 'ratio' as const } },
      { term: 'Credit', definition: 'When you receive cash for entering a trade (selling options). The money is yours upfront. Max profit = credit received if options expire worthless.', icon: '\uD83D\uDFE2',
        visual: { type: 'comparison' as const, left: 'Cash IN', right: 'Obligation', leftColor: 'bg-green-100 text-green-700', rightColor: 'bg-gray-100 text-gray-600' } },
      { term: 'Debit', definition: 'When you pay cash to enter a trade (buying options). This is your cost and max loss. You need the stock to move to make money.', icon: '\uD83D\uDD34',
        visual: { type: 'comparison' as const, left: 'Cash OUT', right: 'Get rights', leftColor: 'bg-red-100 text-red-700', rightColor: 'bg-gray-100 text-gray-600' } },
    ],
  },
  {
    category: 'Spreads & Multi-Leg Strategies',
    icon: '\uD83E\uDDF1',
    terms: [
      { term: 'Spread', definition: 'A trade using two or more options at different strikes or expirations. Limits both your profit and loss. Examples: bull call spread, iron condor.', icon: '\uD83D\uDCCA',
        visual: { type: 'legs' as const, count: 2 } },
      { term: 'Vertical Spread', definition: 'Two options of the same type (both calls or both puts) at different strikes, same expiration. The most common spread type.', icon: '\u2195\uFE0F' },
      { term: 'Leg', definition: 'One individual option in a multi-option trade. A bull call spread has 2 legs. An iron condor has 4 legs.', icon: '\uD83E\uDDB5' },
      { term: 'Spread Width', definition: 'The dollar difference between the two strikes in a spread. Wider spreads = more potential profit but more risk. Example: $175/$180 = $5 wide.', icon: '\u2194\uFE0F',
        visual: { type: 'math' as const, label: '$180 - $175 = $5 wide' } },
      { term: 'Defined Risk', definition: 'A trade where your max loss is known before you enter. All spreads are defined risk. Naked selling is NOT defined risk.', icon: '\uD83D\uDD12' },
      { term: 'Roll', definition: 'Closing your current option and opening a new one at a different strike or expiry. Used to extend a trade, take partial profit, or adjust a losing position.', icon: '\uD83D\uDD04' },
    ],
  },
  {
    category: 'Market Direction',
    icon: '\uD83E\uDDED',
    terms: [
      { term: 'Bullish', definition: 'Expecting the stock to go UP. Bullish strategies: buy calls, sell puts, bull call spreads.', icon: '\uD83D\uDC02',
        visual: { type: 'diagram' as const, label: 'Stock goes UP = Profit', colors: 'from-green-100 to-green-50 border-green-200 text-green-700' } },
      { term: 'Bearish', definition: 'Expecting the stock to go DOWN. Bearish strategies: buy puts, sell calls, bear put spreads.', icon: '\uD83D\uDC3B',
        visual: { type: 'diagram' as const, label: 'Stock goes DOWN = Profit', colors: 'from-red-100 to-red-50 border-red-200 text-red-700' } },
      { term: 'Neutral', definition: 'Expecting the stock to stay roughly where it is. Neutral strategies: iron condors, butterflies, covered calls.', icon: '\u27A1\uFE0F',
        visual: { type: 'diagram' as const, label: 'Stock stays FLAT = Profit', colors: 'from-blue-100 to-blue-50 border-blue-200 text-blue-700' } },
      { term: 'Trend', definition: 'The general direction a stock has been moving. Uptrend = higher highs. Downtrend = lower lows. Sideways = range-bound.', icon: '\uD83D\uDCC8' },
      { term: 'Put/Call Ratio', definition: 'Total put volume or open interest divided by call volume/OI. Ratio above 1.0 = more bearish bets. Below 1.0 = more bullish bets. Used as a sentiment indicator.', icon: '\uD83D\uDCCA' },
    ],
  },
  {
    category: 'Common Pitfalls',
    icon: '\u26A0\uFE0F',
    terms: [
      { term: 'Naked Selling', definition: 'Selling options without owning the stock or having a protective option. Extremely risky \u2014 losses can be unlimited. Not recommended for beginners.', icon: '\uD83D\uDEA8',
        visual: { type: 'diagram' as const, label: 'DANGER: Unlimited loss possible', colors: 'from-red-200 to-red-100 border-red-300 text-red-800' } },
      { term: 'Early Assignment', definition: 'When the option buyer exercises before expiration. Most common with ITM short calls near ex-dividend dates. Usually not a disaster, but can be surprising.', icon: '\u26A1' },
      { term: 'Pin Risk', definition: 'When a stock closes right at a strike price at expiration. You don\'t know if you\'ll be assigned or not. Avoid by closing positions before expiration day.', icon: '\uD83D\uDCCC' },
      { term: 'Overtrading', definition: 'Making too many trades, often chasing losses. Each trade has costs (bid-ask spread, commissions). Fewer, higher-conviction trades usually perform better.', icon: '\uD83D\uDD04' },
      { term: 'Position Sizing', definition: 'How much of your portfolio to risk on one trade. A common rule: never risk more than 2-5% of your account on a single trade.', icon: '\uD83E\uDDEE',
        visual: { type: 'math' as const, label: 'Risk per trade: 2-5% of account' } },
    ],
  },
]

type Visual = {
  type: 'diagram' | 'math' | 'comparison' | 'scale' | 'decay' | 'bidask' | 'spread' | 'meter' | 'ivrank' | 'crush' | 'greek' | 'breakeven' | 'pop' | 'ratio' | 'legs'
  [key: string]: unknown
}

function TermVisual({ visual }: { visual: Visual }) {
  switch (visual.type) {
    case 'diagram':
      return (
        <div className={`mt-2 rounded-lg border bg-gradient-to-r p-2 text-center text-xs font-bold ${visual.colors}`}>
          {visual.label as string}
        </div>
      )

    case 'math':
      return (
        <div className="mt-2 rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-center font-mono text-xs text-gray-700">
          {visual.label as string}
        </div>
      )

    case 'comparison':
      return (
        <div className="mt-2 flex gap-2">
          <div className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-bold ${visual.leftColor}`}>
            {visual.left as string}
          </div>
          <div className="flex items-center text-gray-400">\u2192</div>
          <div className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-bold ${visual.rightColor}`}>
            {visual.right as string}
          </div>
        </div>
      )

    case 'scale':
      return (
        <div className="mt-2 flex gap-0.5">
          {(visual.labels as string[]).map((label, i) => (
            <div
              key={i}
              className={`flex-1 rounded px-2 py-1 text-center text-[10px] font-bold ${
                (visual.position === 'left' && i === 0) ||
                (visual.position === 'center' && i === 1) ||
                (visual.position === 'right' && i === 2)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      )

    case 'decay':
      return (
        <div className="mt-2 flex items-end gap-0.5 h-8">
          {[100, 95, 88, 78, 65, 48, 28, 8].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t from-amber-400 to-amber-200"
              style={{ height: `${h}%` }}
            />
          ))}
          <span className="ml-1 text-[10px] text-gray-400 self-end">\u2192 expiry</span>
        </div>
      )

    case 'bidask':
      return (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <div className="rounded bg-green-100 text-green-700 px-2 py-1 font-bold">Bid $3.00</div>
          <div className="flex-1 h-2 bg-gradient-to-r from-green-200 via-gray-200 to-red-200 rounded" />
          <div className="rounded bg-red-100 text-red-700 px-2 py-1 font-bold">Ask $3.20</div>
        </div>
      )

    case 'spread':
      return (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-green-600 font-bold">Tight</span>
            <div className="flex-1 flex gap-0.5">
              <div className="h-3 rounded bg-green-200" style={{ width: '48%' }} />
              <div className="h-3 rounded bg-green-200" style={{ width: '48%' }} />
            </div>
            <span className="text-gray-400">$0.05</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-red-600 font-bold">Wide</span>
            <div className="flex-1 flex gap-0.5">
              <div className="h-3 rounded bg-red-200" style={{ width: '35%' }} />
              <div className="h-3 rounded bg-red-200" style={{ width: '35%' }} />
            </div>
            <span className="text-gray-400">$0.50</span>
          </div>
        </div>
      )

    case 'meter':
      return (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Low IV</span>
            <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" style={{ width: '80%' }} />
            </div>
            <span className="text-[10px] text-gray-400">High IV</span>
          </div>
          <p className="text-center text-[10px] text-gray-500 mt-0.5">{visual.label as string}</p>
        </div>
      )

    case 'ivrank':
      return (
        <div className="mt-2">
          <div className="flex h-5 rounded-full overflow-hidden border border-gray-200">
            <div className="bg-green-200 flex items-center justify-center text-[9px] font-bold text-green-700" style={{ width: '30%' }}>0-30</div>
            <div className="bg-yellow-200 flex items-center justify-center text-[9px] font-bold text-yellow-700" style={{ width: '40%' }}>30-70</div>
            <div className="bg-red-200 flex items-center justify-center text-[9px] font-bold text-red-700" style={{ width: '30%' }}>70-100</div>
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
            <span>Buy premium</span>
            <span>Neutral</span>
            <span>Sell premium</span>
          </div>
        </div>
      )

    case 'crush':
      return (
        <div className="mt-2 flex items-center gap-1">
          <div className="flex items-end gap-0.5 h-7">
            <div className="w-3 rounded-t bg-amber-300" style={{ height: '40%' }} />
            <div className="w-3 rounded-t bg-amber-400" style={{ height: '70%' }} />
            <div className="w-3 rounded-t bg-red-400" style={{ height: '100%' }} />
          </div>
          <span className="text-red-500 text-sm font-bold">\uD83D\uDCA5</span>
          <div className="flex items-end gap-0.5 h-7">
            <div className="w-3 rounded-t bg-blue-200" style={{ height: '30%' }} />
            <div className="w-3 rounded-t bg-blue-200" style={{ height: '25%' }} />
            <div className="w-3 rounded-t bg-blue-100" style={{ height: '20%' }} />
          </div>
          <span className="text-[10px] text-gray-400 ml-1">Before \u2192 After earnings</span>
        </div>
      )

    case 'greek':
      return (
        <div className={`mt-2 flex items-center gap-2 rounded-lg border p-2 ${
          visual.color === 'blue' ? 'border-blue-200 bg-blue-50' :
          visual.color === 'red' ? 'border-red-200 bg-red-50' :
          visual.color === 'purple' ? 'border-purple-200 bg-purple-50' :
          'border-amber-200 bg-amber-50'
        }`}>
          <span className={`text-xl font-bold ${
            visual.color === 'blue' ? 'text-blue-600' :
            visual.color === 'red' ? 'text-red-600' :
            visual.color === 'purple' ? 'text-purple-600' :
            'text-amber-600'
          }`}>{visual.symbol as string}</span>
          <span className="text-xs text-gray-600">{visual.example as string}</span>
        </div>
      )

    case 'breakeven':
      return (
        <div className="mt-2 flex items-center gap-1 text-[10px]">
          <div className="flex-1 h-4 rounded-l bg-red-200 flex items-center justify-center text-red-600 font-bold">Loss zone</div>
          <div className="w-1 h-6 bg-gray-800 rounded" />
          <div className="flex-1 h-4 rounded-r bg-green-200 flex items-center justify-center text-green-600 font-bold">Profit zone</div>
        </div>
      )

    case 'pop':
      return (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-4 rounded-l bg-green-300" style={{ width: '70%' }} />
          <div className="h-4 rounded-r bg-red-300" style={{ width: '30%' }} />
          <span className="text-[10px] text-gray-500 ml-1">70% win / 30% lose</span>
        </div>
      )

    case 'ratio':
      return (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <div className="rounded bg-red-100 text-red-700 px-2 py-1 font-bold">Risk $1</div>
          <span className="text-gray-400">:</span>
          <div className="rounded bg-green-100 text-green-700 px-2 py-1 font-bold">Reward $3</div>
          <span className="text-[10px] text-gray-400">= 1:3 ratio</span>
        </div>
      )

    case 'legs':
      return (
        <div className="mt-2 flex gap-1">
          {Array.from({ length: visual.count as number }).map((_, i) => (
            <div key={i} className="flex-1 h-6 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-[10px] font-bold text-blue-600">
              Leg {i + 1}
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}

export default function GlossaryPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Analyzer</Link>
        <span className="mx-2 text-gray-300">|</span>
        <Link href="/learn" className="text-sm text-blue-600 hover:underline">Strategy Library</Link>

        <h1 className="mt-4 text-4xl font-bold text-gray-900">Options Glossary</h1>
        <p className="mt-3 text-lg text-gray-500">
          Every term you need to know, explained in plain English with examples.
        </p>

        {/* Quick nav */}
        <nav className="mt-6 flex flex-wrap gap-2">
          {GLOSSARY.map(section => (
            <a
              key={section.category}
              href={`#${section.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 flex items-center gap-1.5"
            >
              <span>{section.icon}</span>
              {section.category}
            </a>
          ))}
        </nav>

        <div className="mt-10 space-y-10">
          {GLOSSARY.map(section => (
            <section key={section.category} id={section.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.category}
              </h2>
              <div className="mt-4 space-y-3">
                {section.terms.map(({ term, definition, icon, visual }) => (
                  <div key={term} className="rounded-lg bg-white border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <dt className="text-sm font-bold text-gray-900">{term}</dt>
                        <dd className="mt-1 text-sm text-gray-600 leading-relaxed">{definition}</dd>
                        {visual && <TermVisual visual={visual as Visual} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
