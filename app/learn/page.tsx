'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StrategyFlowDiagram } from '@/components/StrategyFlowDiagram'
// level filter uses string literal, no type import needed

const STRATEGY_LEVELS: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
  'covered-call': 'beginner',
  'cash-secured-put': 'beginner',
  'long-call': 'beginner',
  'long-put': 'beginner',
  'protective-put': 'beginner',
  'bull-call-spread': 'intermediate',
  'bear-put-spread': 'intermediate',
  'calendar-spread': 'intermediate',
  'diagonal-spread': 'intermediate',
  'bull-put-spread': 'intermediate',
  'bear-call-spread': 'intermediate',
  'iron-condor': 'advanced',
  'straddle': 'advanced',
}

const STRATEGIES = [
  {
    id: 'covered-call',
    name: 'Covered Call',
    beginner: {
      summary: 'You own a stock and sell someone the right to buy it from you at a higher price.',
      analogy: 'Like renting out a parking spot you own — you collect rent (premium) and keep the spot unless someone pays the full agreed price.',
      when: "When you own the stock and think it won't move much in the near term.",
    },
    intermediate: {
      greeks: 'Short delta (capped upside), positive theta (time decay works for you), short vega.',
      when: 'High IV environment — sell expensive calls. Avoid before earnings (IV spike then crush).',
      avoid: "If you expect a strong move up — you'd miss gains above the strike.",
    },
    advanced: {
      profile: 'Max profit: (strike - cost basis) + premium. Max loss: cost basis - premium.',
      adjustments: 'Roll up and out if stock rallies to avoid assignment. Roll down if stock drops to reduce cost basis.',
      notes: 'Watch for early assignment risk around ex-dividend dates when short call is ITM.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Own 100 Shares', description: 'You already own 100 shares of a stock.', icon: '\uD83D\uDCC8', detail: 'Each options contract covers exactly 100 shares — so you need at least 100.' },
        { step: 2, title: 'Sell a Call Option', description: 'Sell someone the right to buy your shares at a higher price (the "strike price").', icon: '\uD83D\uDCDD', detail: 'You choose a strike above the current price. The higher the strike, the less premium but more room for gains.' },
        { step: 3, title: 'Collect Premium', description: 'You get paid cash upfront — this is your income. The money is yours to keep no matter what.', icon: '\uD83D\uDCB0', detail: 'Premium is per share, so multiply by 100 for total cash received.' },
        { step: 4, title: 'Wait for Expiration', description: 'See what happens to the stock price by the expiry date. You can also close the position early.', icon: '\u23F3', detail: 'Most covered call sellers close at 50-75% of max profit rather than waiting for expiration.' },
      ],
      outcomes: [
        { label: 'Stock stays below strike price', description: 'You keep the premium AND all your shares. Best case scenario — free income! You can sell another call next month.', color: 'green' as const, pnl: 'Example: +$350 profit (premium kept)' },
        { label: 'Stock rises above strike price', description: 'Your shares get sold at the strike price. You keep the premium but miss out on any gains above the strike.', color: 'blue' as const, pnl: 'Example: +$1,350 (gains up to strike + premium), but missed gains above' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175',
        lines: [
          'You own 100 shares of AAPL at $175/share',
          'You sell the $185 call expiring in 30 days for $3.50/share',
          'You collect: $3.50 x 100 = $350 cash upfront',
          'If AAPL stays under $185 → you keep $350 + your shares',
          'If AAPL goes to $200 → shares sold at $185, you keep $350 but miss $15/share above strike',
        ],
      },
      maxProfit: '$1,350',
      maxLoss: 'Stock drops to $0 (minus premium)',
      breakEven: '$171.50',
      riskLevel: 'Low' as const,
      keyTerms: [
        { term: 'Strike Price', definition: 'The price at which the buyer can purchase your shares. Choose above current price for a covered call.' },
        { term: 'Premium', definition: 'The cash you receive for selling the option. This is yours to keep regardless of outcome.' },
        { term: 'Expiration Date', definition: 'The deadline — after this date, the option disappears. Typical: 30-45 days out.' },
        { term: 'Assignment', definition: 'When the buyer exercises their right to buy your shares at the strike price.' },
      ],
    },
  },
  {
    id: 'cash-secured-put',
    name: 'Cash-Secured Put',
    beginner: {
      summary: 'You sell someone the right to sell you shares at a lower price, collecting cash upfront.',
      analogy: "Like putting in a limit order to buy a stock at a discount, but getting paid while you wait.",
      when: "When you want to buy a stock anyway and wouldn't mind owning it at a discount.",
    },
    intermediate: {
      greeks: 'Positive delta (bullish), positive theta, short vega.',
      when: 'High IV, bullish to neutral bias. Great after a pullback when IV spikes.',
      avoid: 'Before earnings — IV crush can make the put worthless faster, but assignment risk is real.',
    },
    advanced: {
      profile: 'Max profit: premium collected. Max loss: strike - premium (stock goes to zero).',
      adjustments: 'Roll down and out if stock drops sharply. Convert to covered call after assignment.',
      notes: 'Effective cost basis = strike - premium. Compare to simply buying stock.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Set Aside Cash', description: 'Have enough cash to buy 100 shares at the strike price.', icon: '\uD83C\uDFE6', detail: 'Your broker holds this cash as collateral. For a $170 strike, you need $17,000 in your account.' },
        { step: 2, title: 'Sell a Put Option', description: 'Agree to buy shares at a lower price if the stock drops to your strike.', icon: '\uD83D\uDCDD', detail: 'Choose a strike below the current price. The closer to current price, the more premium but higher chance of assignment.' },
        { step: 3, title: 'Collect Premium', description: 'You get paid cash immediately. This is income whether or not you end up buying the shares.', icon: '\uD83D\uDCB0', detail: 'The premium effectively reduces your purchase price if you do get assigned.' },
        { step: 4, title: 'Wait for Expiration', description: 'If the stock stays above your strike, the put expires and you keep the premium. If it drops below, you buy the shares.', icon: '\u23F3', detail: 'Think of it as getting paid to place a limit buy order.' },
      ],
      outcomes: [
        { label: 'Stock stays above strike price', description: 'The put expires worthless. You keep the premium as pure profit! You can sell another put and repeat.', color: 'green' as const, pnl: 'Example: +$250 profit (premium kept, no shares bought)' },
        { label: 'Stock drops below strike price', description: "You buy 100 shares at the strike price. But you keep the premium, reducing your cost even more.", color: 'blue' as const, pnl: 'Example: Buy at $170, but effective cost = $167.50 after premium' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175',
        lines: [
          'You want to buy AAPL but think $175 is a bit high',
          'You sell the $170 put expiring in 30 days for $2.50/share',
          'You collect: $2.50 x 100 = $250 cash upfront',
          'You set aside $17,000 cash (100 x $170) as collateral',
          'If AAPL stays above $170 → you keep $250, no shares bought',
          'If AAPL drops to $165 → you buy at $170, but effective cost is $167.50 (170 - 2.50)',
        ],
      },
      maxProfit: '$250',
      maxLoss: '$16,750 (stock to $0)',
      breakEven: '$167.50',
      riskLevel: 'Low' as const,
      keyTerms: [
        { term: 'Cash-Secured', definition: 'You have enough cash in your account to buy 100 shares at the strike price. This is required by your broker.' },
        { term: 'Put Option', definition: 'Gives the buyer the right to SELL shares to you at the strike price. When you sell a put, you agree to BUY.' },
        { term: 'Assignment', definition: 'When you are required to buy the shares because the stock dropped below your strike price.' },
        { term: 'Effective Cost Basis', definition: 'Strike price minus the premium you collected. Your true purchase price if assigned.' },
      ],
    },
  },
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    beginner: {
      summary: 'You bet that a stock will stay in a certain price range — not too high, not too low.',
      analogy: 'Like setting up two walls in a bowling alley — you win as long as the ball (stock price) stays in the lane.',
      when: 'When you think the stock will be calm and move very little.',
    },
    intermediate: {
      greeks: 'Near-zero delta, positive theta, short vega — you want time and low movement.',
      when: 'High IV rank (>50), earnings have passed, expect range-bound trading.',
      avoid: 'Before major events (earnings, Fed meetings) where big moves are likely.',
    },
    advanced: {
      profile: 'Max profit: net credit. Max loss: width of widest spread - credit.',
      adjustments: 'Defend by rolling the threatened side up/down. Close at 50% profit.',
      notes: 'Probability of profit \u2248 1 - delta of short call + 1 - |delta| of short put.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Pick a Range', description: 'Choose upper and lower price boundaries you think the stock will stay within.', icon: '\uD83D\uDCCF', detail: 'Wider range = higher chance of profit but smaller payout. Narrower range = bigger payout but riskier.' },
        { step: 2, title: 'Sell a Put Spread (lower side)', description: 'Sell a put near the lower boundary and buy a cheaper put further below for protection.', icon: '\uD83D\uDCC9', detail: 'The bought put limits your loss if the stock crashes. This is the "floor" of your trade.' },
        { step: 3, title: 'Sell a Call Spread (upper side)', description: 'Sell a call near the upper boundary and buy a cheaper call further above for protection.', icon: '\uD83D\uDCC8', detail: 'The bought call limits your loss if the stock rockets up. This is the "ceiling" of your trade.' },
        { step: 4, title: 'Collect Net Credit', description: 'The premiums you collect from selling are more than what you pay for buying. The difference is your income.', icon: '\uD83D\uDCB0', detail: 'You want all 4 options to expire worthless — that means the stock stayed in your range.' },
      ],
      outcomes: [
        { label: 'Stock stays in the range', description: 'All options expire worthless. You keep the entire credit collected. This is the most likely outcome if you chose a wide range.', color: 'green' as const, pnl: 'Example: +$180 profit (full credit kept)' },
        { label: 'Stock breaks out of range', description: 'You lose on one side, but your bought options cap the loss. Maximum loss = spread width minus credit received.', color: 'red' as const, pnl: 'Example: -$320 loss (spread width $500 - $180 credit)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175 (you think it stays between $165-$185)',
        lines: [
          'Sell $165 put for $1.50 + Buy $160 put for $0.80 → put spread credit: $0.70',
          'Sell $185 call for $1.60 + Buy $190 call for $0.50 → call spread credit: $1.10',
          'Total credit: ($0.70 + $1.10) x 100 = $180',
          'Max risk per side: $5.00 spread width - $1.80 credit = $3.20 x 100 = $320',
          'You win if AAPL stays between $163.20 and $186.80 at expiration',
        ],
      },
      maxProfit: '$180',
      maxLoss: '$320',
      breakEven: '$163.20 / $186.80',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'Spread', definition: 'Two options at different strikes — one bought, one sold. Limits both your profit and loss.' },
        { term: 'Credit', definition: 'Cash you receive upfront because you sell more expensive options than you buy.' },
        { term: 'Spread Width', definition: 'The dollar difference between strikes in each spread. Determines your max loss.' },
        { term: 'Iron', definition: 'Means the trade uses both calls AND puts. A regular condor uses only one type.' },
      ],
    },
  },
  {
    id: 'bull-call-spread',
    name: 'Bull Call Spread',
    beginner: {
      summary: 'You buy a call option and sell a higher-strike call to reduce cost. A cheaper way to bet on a stock going up.',
      analogy: "Like paying for a flight upgrade but only up to business class, not first class — you save money but cap your upside.",
      when: 'When you think the stock will go up moderately, but not by a huge amount.',
    },
    intermediate: {
      greeks: 'Positive delta, negative theta (time decay works against you), long vega.',
      when: 'Low IV — calls are cheaper to buy. Bullish bias with defined target.',
      avoid: "High IV environments — paying for expensive long call eats into edge.",
    },
    advanced: {
      profile: 'Max profit: (spread width - debit) \u00D7 100. Max loss: debit paid. Break-even: lower strike + debit.',
      adjustments: 'Roll out in time if directional view is unchanged but timing is off.',
      notes: 'Best risk/reward when short strike aligns with expected move (1 std dev).',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Buy a Call (lower strike)', description: 'Buy a call option near the current stock price. This gives you upside exposure.', icon: '\uD83D\uDCE5', detail: 'This is the more expensive leg. It gives you the right to buy at this price.' },
        { step: 2, title: 'Sell a Call (higher strike)', description: 'Sell a call at a higher price to offset some of the cost. This caps your upside.', icon: '\uD83D\uDCE4', detail: 'You give up gains above this strike price in exchange for paying less overall.' },
        { step: 3, title: 'Pay Net Debit', description: 'Your cost = price of bought call minus price of sold call. This is the most you can lose.', icon: '\uD83D\uDCB3', detail: 'Compared to just buying a call, this is much cheaper because the sold call offsets the cost.' },
        { step: 4, title: 'Wait for Stock to Rise', description: 'You want the stock to be at or above the higher strike by expiration for maximum profit.', icon: '\uD83D\uDCC8', detail: 'You can close the trade early to lock in partial profits.' },
      ],
      outcomes: [
        { label: 'Stock rises above higher strike', description: 'Maximum profit! Both calls are in-the-money, and you earn the full spread width minus your cost.', color: 'green' as const, pnl: 'Example: +$280 profit ($5 spread - $2.20 cost = $2.80 x 100)' },
        { label: 'Stock stays below lower strike', description: 'Both calls expire worthless. You lose only the net debit paid — your loss is defined and capped.', color: 'red' as const, pnl: 'Example: -$220 loss (the debit you paid)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175 (you think it goes to $185+)',
        lines: [
          'Buy the $175 call for $5.00/share (costs $500)',
          'Sell the $180 call for $2.80/share (receive $280)',
          'Net debit: $5.00 - $2.80 = $2.20/share ($220 total)',
          'Max profit if AAPL goes above $180: ($5.00 width - $2.20 cost) x 100 = $280',
          'Break-even: $175 + $2.20 = $177.20',
        ],
      },
      maxProfit: '$280',
      maxLoss: '$220',
      breakEven: '$177.20',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'Debit Spread', definition: 'A spread where you pay to enter (costs money upfront). Opposite of a credit spread.' },
        { term: 'Spread Width', definition: 'Difference between the two strike prices ($180 - $175 = $5). Determines max profit potential.' },
        { term: 'In-the-Money (ITM)', definition: 'When the stock price is above a call strike. The option has real, exercisable value.' },
        { term: 'Net Debit', definition: 'The total cost of the trade — what you paid for the bought call minus what you received for the sold call.' },
      ],
    },
  },
  {
    id: 'bear-put-spread',
    name: 'Bear Put Spread',
    beginner: {
      summary: 'You buy a put and sell a lower-strike put to reduce cost. A cheaper way to profit when a stock drops.',
      analogy: 'Like buying car insurance with a deductible — you pay less upfront but your coverage has a floor.',
      when: 'When you think a stock will drop, but want to limit how much you spend on the bet.',
    },
    intermediate: {
      greeks: 'Negative delta (bearish), negative theta, long vega.',
      when: 'Low IV — puts are cheaper. Bearish bias with defined downside target.',
      avoid: 'High IV environments where puts are expensive.',
    },
    advanced: {
      profile: 'Max profit: spread width - debit. Max loss: debit paid. Break-even: higher strike - debit.',
      adjustments: 'Roll down and out if bearish thesis unchanged but timing is off.',
      notes: 'Mirror image of bull call spread. Best when sold strike is at 1 std dev down.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Buy a Put (higher strike)', description: 'Buy a put near the current stock price. This profits when the stock drops.', icon: '\uD83D\uDCE5', detail: 'This is the more expensive leg. It gives you the right to sell at this price.' },
        { step: 2, title: 'Sell a Put (lower strike)', description: 'Sell a put at a lower price to reduce your cost. This caps your downside profit.', icon: '\uD83D\uDCE4', detail: 'You give up profits below this strike in exchange for paying less overall.' },
        { step: 3, title: 'Pay Net Debit', description: 'Your cost = price of bought put minus price of sold put. This is the most you can lose.', icon: '\uD83D\uDCB3', detail: 'Much cheaper than buying a put alone — the sold put subsidizes your trade.' },
        { step: 4, title: 'Wait for Stock to Drop', description: 'You want the stock at or below the lower strike by expiration for maximum profit.', icon: '\uD83D\uDCC9', detail: 'You can close early to lock in gains if the stock drops fast.' },
      ],
      outcomes: [
        { label: 'Stock drops below lower strike', description: 'Maximum profit! Both puts are in-the-money and you earn the full spread width minus your cost.', color: 'green' as const, pnl: 'Example: +$300 profit ($5 spread - $2.00 cost = $3.00 x 100)' },
        { label: 'Stock stays above higher strike', description: 'Both puts expire worthless. You lose the net debit — but it\'s a defined, capped loss.', color: 'red' as const, pnl: 'Example: -$200 loss (the debit you paid)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175 (you think it drops to $165)',
        lines: [
          'Buy the $175 put for $4.50/share (costs $450)',
          'Sell the $170 put for $2.50/share (receive $250)',
          'Net debit: $4.50 - $2.50 = $2.00/share ($200 total)',
          'Max profit if AAPL drops below $170: ($5.00 width - $2.00 cost) x 100 = $300',
          'Break-even: $175 - $2.00 = $173.00',
        ],
      },
      maxProfit: '$300',
      maxLoss: '$200',
      breakEven: '$173.00',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'Put Option', definition: 'Gives you the right to SELL a stock at the strike price. Increases in value when the stock drops.' },
        { term: 'Bear / Bearish', definition: 'Expecting the stock price to go down. A bear put spread profits from downward movement.' },
        { term: 'Defined Risk', definition: 'Your maximum loss is known before you enter the trade. No surprises.' },
        { term: 'In-the-Money (ITM) Put', definition: 'When the stock is BELOW the put strike. The option has real value.' },
      ],
    },
  },
  {
    id: 'long-call',
    name: 'Long Call',
    beginner: {
      summary: "You pay for the right to buy a stock at a set price. If the stock goes up, your option becomes more valuable.",
      analogy: 'Like paying a small deposit to lock in a house purchase price — if the house price goes up, your deposit becomes very valuable.',
      when: 'When you strongly believe a stock will rise significantly before the expiration date.',
    },
    intermediate: {
      greeks: 'Positive delta, negative theta (time decay hurts), positive vega.',
      when: 'Low IV environments — cheap to buy premium. Before expected catalysts.',
      avoid: 'High IV (expensive) or slow-moving stocks where theta eats your position.',
    },
    advanced: {
      profile: 'Max profit: unlimited. Max loss: premium paid. Break-even: strike + premium.',
      adjustments: 'Roll out (same strike, later expiry) to extend time if thesis is still valid.',
      notes: 'Delta ~0.5 (ATM) for balanced risk/reward. Delta ~0.7+ (ITM) for directional conviction.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Pick a Stock You\'re Bullish On', description: 'Find a stock you believe will go up. Do your research on why.', icon: '\uD83D\uDD0D', detail: 'Options amplify gains AND losses vs. buying stock, so conviction matters.' },
        { step: 2, title: 'Choose Strike & Expiry', description: 'Pick a strike price (the price you can buy at) and an expiration date.', icon: '\uD83C\uDFAF', detail: 'At-the-money (ATM) = strike near current price. Out-of-the-money (OTM) = strike above current price (cheaper but riskier).' },
        { step: 3, title: 'Pay the Premium', description: 'You pay cash upfront for the option. This is the most you can ever lose on this trade.', icon: '\uD83D\uDCB3', detail: 'One contract = 100 shares. If premium is $3.00, you pay $300 total.' },
        { step: 4, title: 'Watch & Decide', description: 'If the stock goes up, your call gains value. You can sell the call anytime for profit or wait until expiry.', icon: '\u23F3', detail: 'Time decay works against you — the option loses value each day. Don\'t hold until the very last day.' },
      ],
      outcomes: [
        { label: 'Stock goes up significantly', description: 'Your call becomes very valuable. The higher the stock goes, the more you make. Profit is theoretically unlimited!', color: 'green' as const, pnl: 'Example: Stock rises $10 → call gains ~$700-$1,000' },
        { label: 'Stock stays flat or drops', description: 'Your call loses value over time and may expire worthless. You lose only what you paid — nothing more.', color: 'red' as const, pnl: 'Example: -$300 loss (premium paid)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175 (you think it goes to $190)',
        lines: [
          'Buy the $175 call expiring in 45 days for $3.00/share',
          'Total cost: $3.00 x 100 = $300 (this is the most you can lose)',
          'If AAPL goes to $190: call is worth at least $15.00 → profit = ($15 - $3) x 100 = $1,200',
          'If AAPL stays at $175 or drops: call expires worthless → loss = $300',
          'Break-even: AAPL needs to be above $178 ($175 + $3) at expiry',
        ],
      },
      maxProfit: 'Unlimited',
      maxLoss: '$300 (premium)',
      breakEven: '$178.00',
      riskLevel: 'High' as const,
      keyTerms: [
        { term: 'Call Option', definition: 'The right (not obligation) to BUY 100 shares at the strike price before expiration.' },
        { term: 'Premium', definition: 'The price you pay for the option. Think of it as the cost of your ticket to participate.' },
        { term: 'Time Decay (Theta)', definition: 'Options lose value every day just from time passing. Like an ice cube melting — accelerates near expiry.' },
        { term: 'At-the-Money (ATM)', definition: 'When the strike price equals the current stock price. Best balance of cost and probability.' },
      ],
    },
  },
  {
    id: 'long-put',
    name: 'Long Put',
    beginner: {
      summary: "You pay for the right to sell a stock at a set price. If the stock drops, your option becomes more valuable.",
      analogy: "Like buying insurance for your car — you pay a premium now so you're protected if something bad happens to the stock.",
      when: 'When you think a stock will fall, or as a hedge against a stock you own.',
    },
    intermediate: {
      greeks: 'Negative delta (bearish), negative theta, positive vega.',
      when: 'Low IV — cheap puts. Before anticipated bad news or as portfolio protection.',
      avoid: "High IV — puts are expensive and IV crush can lose you money even if the stock drops.",
    },
    advanced: {
      profile: 'Max profit: strike - premium (stock to zero). Max loss: premium paid. Break-even: strike - premium.',
      adjustments: 'Roll down and out if stock falls and you want to lock in some profit.',
      notes: 'Protective put on existing long stock position = synthetic long call.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Identify a Bearish Setup', description: 'Find a stock you believe will drop — maybe bad earnings, losing market share, or overvalued.', icon: '\uD83D\uDD0D', detail: 'Buying a put is like "shorting" a stock but with limited risk — you can only lose the premium.' },
        { step: 2, title: 'Choose Strike & Expiry', description: 'Pick a strike price (the price you can sell at) and how long you want the trade to last.', icon: '\uD83C\uDFAF', detail: 'ATM puts cost more but have higher chance of profit. OTM puts are cheaper but need a bigger drop.' },
        { step: 3, title: 'Pay the Premium', description: 'Pay cash upfront for the put. This is your maximum possible loss — no margin calls, no surprises.', icon: '\uD83D\uDCB3', detail: 'One contract = 100 shares. If premium is $4.00, you pay $400 total.' },
        { step: 4, title: 'Watch & Decide', description: 'If the stock drops, your put gains value. Sell the put for profit at any time, or wait until expiry.', icon: '\u23F3', detail: 'Time decay works against you, just like with calls. Close the trade when you have a good profit.' },
      ],
      outcomes: [
        { label: 'Stock drops significantly', description: 'Your put becomes very valuable. The lower the stock goes, the more profit you make.', color: 'green' as const, pnl: 'Example: Stock drops $15 → put gains ~$1,100' },
        { label: 'Stock stays flat or rises', description: 'Your put loses value and may expire worthless. You lose the premium — but that\'s all.', color: 'red' as const, pnl: 'Example: -$400 loss (premium paid)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175 (you think it drops to $155)',
        lines: [
          'Buy the $175 put expiring in 45 days for $4.00/share',
          'Total cost: $4.00 x 100 = $400 (this is the most you can lose)',
          'If AAPL drops to $155: put is worth at least $20 → profit = ($20 - $4) x 100 = $1,600',
          'If AAPL stays at $175 or rises: put expires worthless → loss = $400',
          'Break-even: AAPL needs to be below $171 ($175 - $4) at expiry',
        ],
      },
      maxProfit: '$17,100 (stock to $0)',
      maxLoss: '$400 (premium)',
      breakEven: '$171.00',
      riskLevel: 'High' as const,
      keyTerms: [
        { term: 'Put Option', definition: 'The right (not obligation) to SELL 100 shares at the strike price. Gains value when the stock drops.' },
        { term: 'Bearish', definition: 'Expecting the stock to go down. Buying a put is a bearish bet.' },
        { term: 'Hedge', definition: 'Using a put to protect a stock you own from dropping. Like insurance for your portfolio.' },
        { term: 'IV Crush', definition: 'When implied volatility drops sharply (often after earnings), all options lose value fast — even if you were right about direction.' },
      ],
    },
  },
  {
    id: 'protective-put',
    name: 'Protective Put',
    beginner: {
      summary: 'You own stock and buy a put as insurance against a big drop. Your upside is still unlimited.',
      analogy: "Like buying home insurance — you hope you never need it, but it's there if disaster strikes. You still enjoy the house going up in value.",
      when: 'When you own a stock and are worried about a short-term downturn but want to keep holding long-term.',
    },
    intermediate: {
      greeks: 'Combined position: reduced delta, negative theta, positive vega.',
      when: 'Before earnings, geopolitical uncertainty, or any event that could cause a sharp drop.',
      avoid: 'Routinely — the cost of constantly buying puts as insurance eats into returns.',
    },
    advanced: {
      profile: 'Max profit: unlimited upside (stock rises). Max loss: capped at (stock price - strike + premium).',
      adjustments: 'Consider a collar (sell a call to offset put cost). Roll down after stock drops to lock in floor.',
      notes: 'Stock + protective put = synthetic long call. Compare cost to just buying a call instead.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Own the Stock', description: 'You already own 100 shares of a stock you want to keep long-term.', icon: '\uD83D\uDCC8', detail: 'Maybe you\'ve had it for years and don\'t want to sell, but you\'re nervous about a short-term drop.' },
        { step: 2, title: 'Buy a Put Below Current Price', description: 'Buy a put option at a strike below the current price. This is your "insurance policy."', icon: '\uD83D\uDEE1\uFE0F', detail: 'The strike you choose is your "floor" — no matter what, you can sell at this price.' },
        { step: 3, title: 'Pay the Premium', description: 'This is the cost of your insurance. Think of it as the deductible on your policy.', icon: '\uD83D\uDCB3', detail: 'The further OTM the put, the cheaper it is — but the more loss you absorb before protection kicks in.' },
        { step: 4, title: "You're Protected", description: 'If the stock crashes, your put limits the damage. If it rises, you still get all the upside.', icon: '\u2705', detail: 'It\'s the only strategy that gives you unlimited upside AND limited downside. The cost is the premium.' },
      ],
      outcomes: [
        { label: 'Stock rises', description: 'Great! You profit from the stock going up. The put expires worthless — think of it as insurance you didn\'t need. A small price for peace of mind.', color: 'green' as const, pnl: 'Example: Stock rises $20 → +$2,000 gain, minus $350 premium = +$1,650 net' },
        { label: 'Stock crashes', description: 'Your put kicks in and limits your loss. No matter how far the stock drops, you can sell at the strike price.', color: 'blue' as const, pnl: 'Example: Stock drops $30, but max loss capped at ~$850 (not $3,000)' },
      ],
      example: {
        title: 'Example Trade: You own AAPL at $175 and earnings are next week',
        lines: [
          'You own 100 shares of AAPL at $175 ($17,500 invested)',
          'Worried about earnings? Buy the $165 put for $3.50/share',
          'Cost of protection: $3.50 x 100 = $350',
          'If AAPL drops to $140: you sell at $165 (not $140) → saved $2,150',
          'If AAPL rises to $195: you keep all $20/share gain, minus $350 insurance cost',
          'Your "floor" is $165 minus the $3.50 premium = $161.50 effective',
        ],
      },
      maxProfit: 'Unlimited (stock rises)',
      maxLoss: '$1,350 (to floor)',
      breakEven: '$178.50',
      riskLevel: 'Low' as const,
      keyTerms: [
        { term: 'Floor', definition: 'The minimum price you can sell your stock for, set by the put strike. Your worst-case exit price.' },
        { term: 'Insurance Cost', definition: 'The premium you pay for the put. A higher premium gets you a higher floor (better protection).' },
        { term: 'Collar', definition: 'Advanced move: sell a call above current price to pay for the put. Free insurance, but caps your upside.' },
        { term: 'Portfolio Hedge', definition: 'Using puts on an index (like SPY) to protect your entire portfolio, not just one stock.' },
      ],
    },
  },
  {
    id: 'straddle',
    name: 'Long Straddle',
    beginner: {
      summary: 'You buy both a call AND a put at the same strike price. You profit from a big move in EITHER direction.',
      analogy: "Like betting on a football game where you win if either team wins by a lot — you just need a blowout, not a close game.",
      when: "When you think a stock will make a huge move, but you're not sure which direction (e.g., before earnings).",
    },
    intermediate: {
      greeks: 'Near-zero delta (neutral), very negative theta (expensive to hold), high positive vega.',
      when: 'Before earnings or major announcements when you expect a big move. Low IV is ideal.',
      avoid: 'When IV is already high — you need an even bigger move to overcome the expensive premiums.',
    },
    advanced: {
      profile: 'Max profit: unlimited in either direction. Max loss: total premiums paid. Two break-evens: strike \u00B1 total premium.',
      adjustments: 'Sell winning side early if move happens fast. Convert to strangle by rolling one leg OTM.',
      notes: 'Implied move = straddle price / stock price. Compare to expected move to assess value.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Expect a Big Move', description: "Something big is coming — earnings, FDA approval, lawsuit ruling — but you don't know if it's good or bad news.", icon: '\uD83D\uDCF0', detail: 'The key insight: you don\'t need to predict the direction, just the size of the move.' },
        { step: 2, title: 'Buy a Call at Current Price', description: 'Buy an ATM call — this profits if the stock goes UP.', icon: '\uD83D\uDCC8', detail: 'At-the-money (ATM) means the strike equals the current stock price.' },
        { step: 3, title: 'Buy a Put at Same Price', description: 'Buy an ATM put at the same strike and expiry — this profits if the stock goes DOWN.', icon: '\uD83D\uDCC9', detail: 'Now you\'re covered in both directions. But you paid for two options, so you need a big move.' },
        { step: 4, title: 'Need a BIG Move', description: 'The stock needs to move enough in either direction to cover the cost of BOTH options.', icon: '\uD83D\uDCA5', detail: 'Calculate your break-evens: strike + total premium (upside) and strike - total premium (downside).' },
      ],
      outcomes: [
        { label: 'Stock makes a huge move (either way)', description: 'One of your options becomes very valuable, more than covering the cost of both. The bigger the move, the bigger your profit!', color: 'green' as const, pnl: 'Example: Stock moves $15 either way → ~$800 profit' },
        { label: 'Stock barely moves', description: 'Both options lose value from time decay. If the stock doesn\'t move enough, you lose some or all of the premiums paid.', color: 'red' as const, pnl: 'Example: Stock moves $2 → -$500 loss' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175 (earnings announcement tomorrow)',
        lines: [
          'Buy the $175 call for $4.00/share ($400)',
          'Buy the $175 put for $3.50/share ($350)',
          'Total cost: $7.50 x 100 = $750 (this is the most you can lose)',
          'Break-even UP: $175 + $7.50 = $182.50',
          'Break-even DOWN: $175 - $7.50 = $167.50',
          'You profit if AAPL goes above $182.50 OR below $167.50',
          'If AAPL jumps to $195: call worth $20, put worth $0 → profit = ($20 - $7.50) x 100 = $1,250',
        ],
      },
      maxProfit: 'Unlimited',
      maxLoss: '$750 (both premiums)',
      breakEven: '$167.50 / $182.50',
      riskLevel: 'High' as const,
      keyTerms: [
        { term: 'Straddle', definition: 'Buying both a call and a put at the same strike and expiry. You\'re "straddling" the current price.' },
        { term: 'Implied Move', definition: 'How much the market expects the stock to move. If straddle costs $7.50 on a $175 stock, implied move = ~4.3%.' },
        { term: 'Volatility (IV)', definition: 'How much the market expects the stock to bounce around. High IV = expensive options. Buy straddles when IV is low.' },
        { term: 'Break-even', definition: 'The two prices where you start making money. Stock must move past one of these to profit.' },
      ],
    },
  },
  {
    id: 'calendar-spread',
    name: 'Calendar Spread',
    beginner: {
      summary: 'Sell a near-term option and buy a longer-term option at the same strike price. You profit from the near-term option decaying faster.',
      analogy: 'Like subletting your apartment for one month while holding a year-long lease — you collect short-term rent while keeping long-term rights.',
      when: 'When you expect the stock to stay near a specific price and IV is high (near-term options are expensive).',
    },
    intermediate: {
      greeks: 'Net positive theta (short-term decays faster), long vega (benefits from IV increase in back month), near-neutral delta.',
      when: 'High IV environment where near-term options are richly priced. Works well around earnings if you sell the pre-earnings expiry and buy post-earnings.',
      avoid: 'When expecting a large directional move — the position profits most when the stock stays near the strike.',
    },
    advanced: {
      profile: 'Max profit: when stock is at the strike at near-term expiry. Max loss: net debit paid.',
      adjustments: 'Roll the short leg to the next expiry if near-term expires worthless. Shift strikes if stock moves away.',
      notes: 'The position benefits from IV skew between expirations. Be aware of early assignment risk on the short leg.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Sell Near-Term Option', description: 'Sell a call (or put) that expires soon — typically 2-4 weeks out.', icon: '\uD83D\uDCDD', detail: 'The near-term option decays fastest, which works in your favor.' },
        { step: 2, title: 'Buy Longer-Term Option', description: 'Buy the same type of option at the same strike, but with a later expiration — typically 6-8 weeks out.', icon: '\uD83D\uDCC5', detail: 'The longer-term option retains more value because it has more time left.' },
        { step: 3, title: 'Profit from Time Decay Difference', description: 'The near-term option loses value faster than the long-term one. The gap is your profit.', icon: '\u23F3', detail: 'This works best when the stock stays near the strike price.' },
      ],
      outcomes: [
        { label: 'Stock stays near the strike', description: 'Near-term option expires worthless, long-term option retains value. You keep the difference.', color: 'green' as const, pnl: 'Example: +$150 profit' },
        { label: 'Stock moves far from strike', description: 'Both options gain/lose similarly, erasing the time decay advantage. You may lose the net debit paid.', color: 'red' as const, pnl: 'Example: -$200 loss (net debit)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175',
        lines: [
          'Sell the $175 call expiring in 2 weeks for $2.50/share',
          'Buy the $175 call expiring in 6 weeks for $4.50/share',
          'Net debit: ($4.50 - $2.50) x 100 = $200',
          'If AAPL stays near $175: near-term expires worthless, long-term worth ~$3.50 → profit ~$150',
          'If AAPL jumps to $195: both options move similarly → small loss or break-even',
        ],
      },
      maxProfit: '~$150 (at strike at near-term expiry)',
      maxLoss: '$200 (net debit paid)',
      breakEven: '~$173 / ~$177',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'Calendar Spread', definition: 'Two options at the same strike but different expirations. Also called a "time spread" or "horizontal spread."' },
        { term: 'Time Decay (Theta)', definition: 'Near-term options lose value faster than longer-term ones. This difference is how the calendar spread makes money.' },
        { term: 'Net Debit', definition: 'The cost to enter the trade — the long option costs more than the short one since it has more time.' },
        { term: 'Rolling', definition: 'When the short leg expires, you can sell another near-term option against your long leg to repeat the process.' },
      ],
    },
  },
  {
    id: 'diagonal-spread',
    name: 'Diagonal Spread (PMCC)',
    beginner: {
      summary: 'Buy a deep in-the-money call with a long expiration (LEAP), then sell short-term out-of-the-money calls against it. Like a covered call but using a LEAP instead of 100 shares.',
      analogy: 'Like buying a long-term lease on a rental property and subletting month-to-month — much less capital tied up than buying the property outright.',
      when: 'When you\'re bullish on a stock but don\'t want to tie up thousands of dollars buying 100 shares.',
    },
    intermediate: {
      greeks: 'Long delta (bullish exposure), positive theta from short calls, long vega on back month. The deep ITM LEAP acts like stock.',
      when: 'High IV for the short leg (collect rich premiums) and low IV for the long LEAP. Moderate bullish outlook.',
      avoid: 'If the stock could drop significantly — the LEAP loses value. Also avoid if the short call strike is too close to the LEAP strike.',
    },
    advanced: {
      profile: 'Max profit: short call premium + (short strike - long strike) if assigned. Max loss: LEAP cost - premiums collected.',
      adjustments: 'Roll short calls up/out when challenged. If stock drops, pause selling calls and wait for recovery. Buy LEAP with delta > 0.70.',
      notes: 'The LEAP must have enough extrinsic value that early assignment is unlikely. Keep short strike above LEAP break-even.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Buy a LEAP Call', description: 'Buy a deep ITM call option with 6-12+ months until expiration.', icon: '\uD83D\uDCC8', detail: 'Choose delta 0.70-0.80 (deep ITM). This acts as your "stock replacement" at a fraction of the cost.' },
        { step: 2, title: 'Sell Short-Term Calls', description: 'Sell OTM calls expiring in 2-4 weeks against your LEAP.', icon: '\uD83D\uDCDD', detail: 'Choose a strike ~5% above the current price. You collect premium each cycle.' },
        { step: 3, title: 'Repeat Monthly', description: 'When the short call expires, sell another one. Rinse and repeat to generate income.', icon: '\uD83D\uDD04', detail: 'Over time, the premiums collected can pay for a significant portion of the LEAP cost.' },
      ],
      outcomes: [
        { label: 'Stock rises slowly / stays flat', description: 'Short calls expire worthless, you keep the premium. LEAP retains value. Ideal scenario.', color: 'green' as const, pnl: 'Example: +$300/month in premiums collected' },
        { label: 'Stock rises above short strike', description: 'You may need to roll the short call up and out, or close both legs for a profit.', color: 'blue' as const, pnl: 'Example: +$1,500 total profit (capped at short strike)' },
        { label: 'Stock drops significantly', description: 'LEAP loses value. Short call premiums provide some cushion but won\'t offset a large drop.', color: 'red' as const, pnl: 'Example: -$1,200 (LEAP depreciation minus premiums)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175',
        lines: [
          'Buy the $155 call LEAP (12 months out) for $30.00/share ($3,000)',
          'Sell the $185 call (30 days out) for $3.00/share ($300)',
          'Capital required: $3,000 vs $17,500 for 100 shares',
          'If AAPL stays under $185: keep $300, sell another call next month',
          'After 6 months of selling calls at ~$300 each: $1,800 collected, LEAP still worth ~$28',
          'Effective cost reduced from $3,000 to $1,200',
        ],
      },
      maxProfit: '$3,300 per cycle (strike diff + premium)',
      maxLoss: '$2,700 (LEAP cost - premiums)',
      breakEven: '$158 (LEAP strike + net cost)',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'PMCC', definition: 'Poor Man\'s Covered Call — uses a LEAP instead of stock. "Poor man\'s" because it requires much less capital.' },
        { term: 'LEAP', definition: 'Long-term Equity Anticipation Security — an option with 6-12+ months until expiration.' },
        { term: 'Deep ITM', definition: 'An option with a strike well below the stock price (for calls). It moves nearly 1:1 with the stock.' },
        { term: 'Rolling', definition: 'Closing an expiring short call and opening a new one at a later date (and possibly different strike).' },
      ],
    },
  },
  {
    id: 'bull-put-spread',
    name: 'Bull Put Spread',
    beginner: {
      summary: 'Sell a put at a higher strike and buy a put at a lower strike. You collect a credit upfront and profit if the stock stays above the short put strike.',
      analogy: 'Like betting that the floor won\'t collapse — you get paid upfront for your confidence, and you buy insurance (the long put) to limit your downside.',
      when: 'When you\'re moderately bullish and want to collect premium with defined risk.',
    },
    intermediate: {
      greeks: 'Positive delta (bullish), positive theta (time decay helps), short vega (lower IV helps).',
      when: 'High IV environment — sell expensive puts. Best when you expect the stock to stay flat or rise moderately.',
      avoid: 'Before earnings or events that could cause a big drop. Also avoid in low IV environments where credit received is small.',
    },
    advanced: {
      profile: 'Max profit: credit received. Max loss: (strike width - credit) x 100. Break-even: short strike - credit.',
      adjustments: 'Roll down and out if stock drops toward short strike. Close early at 50-75% of max profit.',
      notes: 'The credit spread version of a bull call spread. Same directional bet but benefits from time decay instead of fighting it.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Sell Higher Strike Put', description: 'Sell a put option slightly below the current stock price. You receive a premium.', icon: '\uD83D\uDCDD', detail: 'This is your main income source. Choose a strike where you\'d be comfortable owning the stock.' },
        { step: 2, title: 'Buy Lower Strike Put', description: 'Buy a put at a lower strike to cap your downside risk.', icon: '\uD83D\uDEE1\uFE0F', detail: 'This defines your maximum loss. The wider the spread, the more risk but more premium.' },
        { step: 3, title: 'Collect Net Credit', description: 'The premium received from selling exceeds the cost of buying. The difference is yours to keep if the stock cooperates.', icon: '\uD83D\uDCB0', detail: 'You want both options to expire worthless — that means the stock stayed above your short strike.' },
      ],
      outcomes: [
        { label: 'Stock stays above short strike', description: 'Both puts expire worthless. You keep the entire credit.', color: 'green' as const, pnl: 'Example: +$200 profit (full credit kept)' },
        { label: 'Stock drops below long strike', description: 'Max loss reached. You lose the spread width minus the credit received.', color: 'red' as const, pnl: 'Example: -$300 loss (spread width - credit)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175',
        lines: [
          'Sell the $170 put for $3.00/share',
          'Buy the $165 put for $1.00/share',
          'Net credit: ($3.00 - $1.00) x 100 = $200',
          'If AAPL stays above $170: keep $200',
          'If AAPL drops to $160: lose ($5 - $2) x 100 = $300',
          'Break-even: $170 - $2.00 = $168',
        ],
      },
      maxProfit: '$200 (credit received)',
      maxLoss: '$300 (spread width - credit)',
      breakEven: '$168',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'Credit Spread', definition: 'A spread where you receive money upfront. You want the options to expire worthless so you keep the credit.' },
        { term: 'Spread Width', definition: 'The difference between the two strikes. A $5 wide spread means your max risk is $500 minus credit received.' },
        { term: 'Short Put', definition: 'The put you sold (higher strike). This is where your profit comes from but also your risk.' },
        { term: 'Assignment Risk', definition: 'If the stock drops below your short strike before expiry, you may be assigned (forced to buy shares). Close early to avoid.' },
      ],
    },
  },
  {
    id: 'bear-call-spread',
    name: 'Bear Call Spread',
    beginner: {
      summary: 'Sell a call at a lower strike and buy a call at a higher strike. You collect a credit upfront and profit if the stock stays below the short call strike.',
      analogy: 'Like betting it won\'t rain — you get paid for your prediction, and buy an umbrella (long call) just in case you\'re wrong.',
      when: 'When you\'re moderately bearish or neutral and want to collect premium with defined risk.',
    },
    intermediate: {
      greeks: 'Negative delta (bearish), positive theta (time decay helps), short vega (lower IV helps).',
      when: 'High IV environment — sell expensive calls. Works when you expect the stock to stay flat or drop moderately.',
      avoid: 'Before positive catalysts (earnings beats, product launches) that could send the stock higher.',
    },
    advanced: {
      profile: 'Max profit: credit received. Max loss: (strike width - credit) x 100. Break-even: short strike + credit.',
      adjustments: 'Roll up and out if stock rises toward short strike. Close early at 50-75% of max profit.',
      notes: 'The bearish counterpart to the bull put spread. Same mechanics but profits when stock stays below the short strike.',
    },
    diagram: {
      steps: [
        { step: 1, title: 'Sell Lower Strike Call', description: 'Sell a call option slightly above the current stock price. You receive a premium.', icon: '\uD83D\uDCDD', detail: 'Choose a strike above a resistance level where you think the stock won\'t reach.' },
        { step: 2, title: 'Buy Higher Strike Call', description: 'Buy a call at a higher strike to cap your upside risk.', icon: '\uD83D\uDEE1\uFE0F', detail: 'This defines your maximum loss. Without it, you\'d have unlimited risk.' },
        { step: 3, title: 'Collect Net Credit', description: 'The premium from selling exceeds the cost of buying. You keep this credit if the stock stays below the short strike.', icon: '\uD83D\uDCB0', detail: 'You want both options to expire worthless — stock stayed below your short call.' },
      ],
      outcomes: [
        { label: 'Stock stays below short strike', description: 'Both calls expire worthless. You keep the entire credit.', color: 'green' as const, pnl: 'Example: +$180 profit (full credit kept)' },
        { label: 'Stock rises above long strike', description: 'Max loss reached. You lose the spread width minus the credit received.', color: 'red' as const, pnl: 'Example: -$320 loss (spread width - credit)' },
      ],
      example: {
        title: 'Example Trade: AAPL at $175',
        lines: [
          'Sell the $180 call for $2.80/share',
          'Buy the $185 call for $1.00/share',
          'Net credit: ($2.80 - $1.00) x 100 = $180',
          'If AAPL stays below $180: keep $180',
          'If AAPL rises to $190: lose ($5 - $1.80) x 100 = $320',
          'Break-even: $180 + $1.80 = $181.80',
        ],
      },
      maxProfit: '$180 (credit received)',
      maxLoss: '$320 (spread width - credit)',
      breakEven: '$181.80',
      riskLevel: 'Medium' as const,
      keyTerms: [
        { term: 'Credit Spread', definition: 'A spread where you receive money upfront. You profit when the options expire worthless.' },
        { term: 'Short Call', definition: 'The call you sold (lower strike). Your profit source but also your risk if the stock rises past it.' },
        { term: 'Spread Width', definition: 'The difference between strikes ($5 here). Determines max loss: width minus credit.' },
        { term: 'Resistance Level', definition: 'A price the stock has struggled to break above. Good place to set your short call strike.' },
      ],
    },
  },
]

function StrategySection({ strategy }: { strategy: typeof STRATEGIES[number] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{strategy.name}</h2>

        <p className="text-gray-700">{strategy.beginner.summary}</p>
        <p className="mt-2 text-gray-500 italic">&ldquo;{strategy.beginner.analogy}&rdquo;</p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-green-50 p-3">
            <span className="font-medium text-green-800">Use when:</span>
            <p className="mt-1 text-green-700">{strategy.beginner.when}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <span className="font-medium text-amber-800">Avoid when:</span>
            <p className="mt-1 text-amber-700">{strategy.intermediate.avoid}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <span className="font-medium text-blue-800">Greeks:</span>
            <p className="mt-1 text-blue-700">{strategy.intermediate.greeks}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm space-y-1">
          <p className="text-gray-700"><span className="font-medium">Profile:</span> {strategy.advanced.profile}</p>
          <p className="text-gray-700"><span className="font-medium">Adjustments:</span> {strategy.advanced.adjustments}</p>
          <p className="text-gray-700"><span className="font-medium">Notes:</span> {strategy.advanced.notes}</p>
        </div>

        <div className="mt-5">
          <StrategyFlowDiagram
            strategyName={strategy.name}
            steps={strategy.diagram.steps}
            outcomes={strategy.diagram.outcomes}
            example={strategy.diagram.example}
            keyTerms={strategy.diagram.keyTerms}
            maxProfit={strategy.diagram.maxProfit}
            maxLoss={strategy.diagram.maxLoss}
            breakEven={strategy.diagram.breakEven}
            riskLevel={strategy.diagram.riskLevel}
          />
        </div>
      </div>
    </div>
  )
}

const LEVEL_FILTERS = [
  { value: 'all', label: 'All Strategies' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
}

export default function LearnPage() {
  const [selectedId, setSelectedId] = useState<string>('all')

  const visible = selectedId === 'all'
    ? STRATEGIES
    : STRATEGIES.filter(s => s.id === selectedId)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Analyzer</Link>
        <span className="mx-2 text-gray-300">|</span>
        <Link href="/glossary" className="text-sm text-blue-600 hover:underline">Glossary</Link>
        <h1 className="mt-4 text-4xl font-bold text-gray-900">Options Strategy Library</h1>
        <p className="mt-3 text-lg text-gray-500">
          Learn what each strategy is, when to use it, and why &mdash; at every experience level.
        </p>

        {/* Strategy selector */}
        <div className="mt-6">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Strategies</option>
            <optgroup label="Beginner">
              {STRATEGIES.filter(s => STRATEGY_LEVELS[s.id] === 'beginner').sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
            <optgroup label="Intermediate">
              {STRATEGIES.filter(s => STRATEGY_LEVELS[s.id] === 'intermediate').sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
            <optgroup label="Advanced">
              {STRATEGIES.filter(s => STRATEGY_LEVELS[s.id] === 'advanced').sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="mt-8 space-y-8">
          {visible.map(s => (
            <div key={s.id}>
              <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_BADGE[STRATEGY_LEVELS[s.id]] ?? ''}`}>
                {STRATEGY_LEVELS[s.id]?.charAt(0).toUpperCase()}{STRATEGY_LEVELS[s.id]?.slice(1)}
              </span>
              <StrategySection strategy={s} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
