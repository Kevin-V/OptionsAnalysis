'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StrategyFlowDiagram } from '@/components/StrategyFlowDiagram'
import type { ExperienceLevel } from '@/lib/types'

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
        { step: 1, title: 'Own 100 Shares', description: 'You already own 100 shares of a stock.', icon: '\uD83D\uDCC8' },
        { step: 2, title: 'Sell a Call Option', description: 'Sell someone the right to buy your shares at a set price.', icon: '\uD83D\uDCDD' },
        { step: 3, title: 'Collect Premium', description: 'You get paid cash upfront — this is your income.', icon: '\uD83D\uDCB0' },
        { step: 4, title: 'Wait for Expiration', description: 'See what happens to the stock price by the expiry date.', icon: '\u23F3' },
      ],
      outcomes: [
        { label: 'Stock stays below strike price', description: 'You keep the premium AND all your shares. Best case scenario — free income!', color: 'green' as const },
        { label: 'Stock rises above strike price', description: 'Your shares get sold at the strike price. You keep the premium but miss out on gains above the strike.', color: 'blue' as const },
      ],
    },
  },
  {
    id: 'cash-secured-put',
    name: 'Cash-Secured Put',
    beginner: {
      summary: 'You sell someone the right to sell you shares at a lower price, collecting cash upfront.',
      analogy: "Like putting in a limit order to buy a stock, but getting paid while you wait.",
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
        { step: 1, title: 'Set Aside Cash', description: 'Have enough cash to buy 100 shares at the strike price.', icon: '\uD83C\uDFE6' },
        { step: 2, title: 'Sell a Put Option', description: 'Agree to buy shares at a lower price if the stock drops.', icon: '\uD83D\uDCDD' },
        { step: 3, title: 'Collect Premium', description: 'You get paid cash immediately — income while you wait.', icon: '\uD83D\uDCB0' },
        { step: 4, title: 'Wait for Expiration', description: 'See if the stock drops below your strike price.', icon: '\u23F3' },
      ],
      outcomes: [
        { label: 'Stock stays above strike price', description: 'The put expires worthless. You keep the premium as pure profit! You can sell another put.', color: 'green' as const },
        { label: 'Stock drops below strike price', description: "You buy the shares at the strike price (a discount to what it was). You keep the premium, reducing your cost even more.", color: 'blue' as const },
      ],
    },
  },
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    beginner: {
      summary: 'You bet that a stock will stay in a certain price range — not too high, not too low.',
      analogy: 'Like renting out both walls of a hallway. You collect rent as long as the stock stays in the hall.',
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
        { step: 1, title: 'Pick a Range', description: 'Choose upper and lower price boundaries you think the stock will stay within.', icon: '\uD83D\uDCCF' },
        { step: 2, title: 'Sell Two Spreads', description: 'Sell a call spread above and a put spread below the current price.', icon: '\uD83D\uDCCA' },
        { step: 3, title: 'Collect Premium', description: 'You receive cash upfront for selling these spreads.', icon: '\uD83D\uDCB0' },
        { step: 4, title: 'Wait for Expiration', description: 'Hope the stock stays in your chosen range.', icon: '\u23F3' },
      ],
      outcomes: [
        { label: 'Stock stays in the range', description: 'All options expire worthless. You keep all the premium — maximum profit!', color: 'green' as const },
        { label: 'Stock breaks out of range', description: 'You lose money on one side, but your loss is capped. The premium collected reduces your loss.', color: 'red' as const },
      ],
    },
  },
  {
    id: 'bull-call-spread',
    name: 'Bull Call Spread',
    beginner: {
      summary: 'You buy a call option and sell a higher-strike call to reduce cost.',
      analogy: "Like paying for a flight upgrade but only up to business class, not first class.",
      when: 'When you think the stock will go up, but not by a huge amount.',
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
        { step: 1, title: 'Buy a Call', description: 'Buy a call at a lower strike price (costs money).', icon: '\uD83D\uDCE5' },
        { step: 2, title: 'Sell a Call', description: 'Sell a call at a higher strike (offsets some cost).', icon: '\uD83D\uDCE4' },
        { step: 3, title: 'Pay Net Debit', description: 'Your total cost is the difference between the two premiums.', icon: '\uD83D\uDCB3' },
        { step: 4, title: 'Wait for Expiration', description: 'Hope the stock rises toward the higher strike.', icon: '\uD83D\uDCC8' },
      ],
      outcomes: [
        { label: 'Stock rises above higher strike', description: 'Maximum profit! You earn the difference between strikes minus what you paid.', color: 'green' as const },
        { label: 'Stock stays below lower strike', description: 'Maximum loss — you lose the net debit you paid. But the loss is capped and defined.', color: 'red' as const },
      ],
    },
  },
  {
    id: 'bear-put-spread',
    name: 'Bear Put Spread',
    beginner: {
      summary: 'You buy a put and sell a lower-strike put to reduce cost. Profits when the stock drops.',
      analogy: 'Like buying insurance on your car with a deductible — you pay less upfront but your coverage has a floor.',
      when: 'When you think a stock will drop, but want to limit how much you spend.',
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
        { step: 1, title: 'Buy a Put', description: 'Buy a put at a higher strike price (costs money).', icon: '\uD83D\uDCE5' },
        { step: 2, title: 'Sell a Put', description: 'Sell a put at a lower strike (offsets some cost).', icon: '\uD83D\uDCE4' },
        { step: 3, title: 'Pay Net Debit', description: 'Your total cost is the difference between the two premiums.', icon: '\uD83D\uDCB3' },
        { step: 4, title: 'Wait for Expiration', description: 'Hope the stock drops toward the lower strike.', icon: '\uD83D\uDCC9' },
      ],
      outcomes: [
        { label: 'Stock drops below lower strike', description: 'Maximum profit! You earn the difference between strikes minus what you paid.', color: 'green' as const },
        { label: 'Stock stays above higher strike', description: 'Maximum loss — you lose the net debit you paid. But the loss is capped.', color: 'red' as const },
      ],
    },
  },
  {
    id: 'long-call',
    name: 'Long Call',
    beginner: {
      summary: "You pay for the right to buy a stock at today's price, even if it goes way up.",
      analogy: 'Like paying a small deposit to lock in a house purchase price before it goes up.',
      when: 'When you strongly believe a stock will rise significantly.',
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
        { step: 1, title: 'Pick a Stock', description: 'Find a stock you believe will go up.', icon: '\uD83D\uDD0D' },
        { step: 2, title: 'Buy a Call', description: 'Pay a premium for the right to buy at a set price (the strike).', icon: '\uD83D\uDCB3' },
        { step: 3, title: 'Wait & Watch', description: 'Watch the stock price move. Time is ticking!', icon: '\u23F3' },
        { step: 4, title: 'Decide at Expiry', description: 'Sell the call for profit, exercise it, or let it expire.', icon: '\u2696\uFE0F' },
      ],
      outcomes: [
        { label: 'Stock goes way up', description: 'Your call option becomes very valuable. Profit = stock price - strike - premium. Unlimited upside!', color: 'green' as const },
        { label: 'Stock stays flat or drops', description: 'Your call expires worthless. You lose the premium you paid — nothing more.', color: 'red' as const },
      ],
    },
  },
  {
    id: 'long-put',
    name: 'Long Put',
    beginner: {
      summary: "You pay for the right to sell a stock at today's price, even if it drops.",
      analogy: "Like buying insurance for your car — you pay a premium so you're covered if something bad happens.",
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
        { step: 1, title: 'Pick a Stock', description: 'Find a stock you believe will go down (or want to protect).', icon: '\uD83D\uDD0D' },
        { step: 2, title: 'Buy a Put', description: 'Pay a premium for the right to sell at a set price.', icon: '\uD83D\uDCB3' },
        { step: 3, title: 'Wait & Watch', description: 'Watch the stock price. You want it to drop!', icon: '\u23F3' },
        { step: 4, title: 'Decide at Expiry', description: 'Sell the put for profit, exercise it, or let it expire.', icon: '\u2696\uFE0F' },
      ],
      outcomes: [
        { label: 'Stock drops significantly', description: 'Your put becomes very valuable. Profit = strike - stock price - premium.', color: 'green' as const },
        { label: 'Stock stays flat or rises', description: 'Your put expires worthless. You lose only the premium you paid.', color: 'red' as const },
      ],
    },
  },
  {
    id: 'protective-put',
    name: 'Protective Put',
    beginner: {
      summary: 'You own stock and buy a put as insurance against a big drop.',
      analogy: "Like buying home insurance — you hope you never need it, but it's there if disaster strikes.",
      when: 'When you own a stock and are worried about a short-term downturn but want to keep holding.',
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
        { step: 1, title: 'Own the Stock', description: 'You already own 100 shares of a stock you like.', icon: '\uD83D\uDCC8' },
        { step: 2, title: 'Buy a Put', description: 'Buy a put option as insurance — sets a floor on your losses.', icon: '\uD83D\uDEE1\uFE0F' },
        { step: 3, title: 'Pay the Premium', description: 'This is the cost of your insurance policy.', icon: '\uD83D\uDCB3' },
        { step: 4, title: "You're Protected", description: 'No matter how far the stock drops, your loss is limited.', icon: '\u2705' },
      ],
      outcomes: [
        { label: 'Stock rises', description: 'Great! You profit from the stock going up. The put expires worthless — think of it as insurance you didn\'t need.', color: 'green' as const },
        { label: 'Stock crashes', description: 'Your put kicks in and limits your loss. You can sell at the strike price no matter how far it dropped.', color: 'blue' as const },
      ],
    },
  },
  {
    id: 'straddle',
    name: 'Long Straddle',
    beginner: {
      summary: 'You buy both a call AND a put at the same strike price. Profits from a big move in either direction.',
      analogy: "Like betting on a coin flip where you win if it's heads OR tails — you just need it to flip big.",
      when: "When you think a stock will make a huge move, but you're not sure which direction.",
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
        { step: 1, title: 'Expect Big News', description: 'You think something big will happen, but not sure which way.', icon: '\uD83D\uDCF0' },
        { step: 2, title: 'Buy a Call + Put', description: 'Buy both at the same strike price. Covers both directions!', icon: '\u2194\uFE0F' },
        { step: 3, title: 'Pay Double Premium', description: 'Costs more since you\'re buying two options.', icon: '\uD83D\uDCB3' },
        { step: 4, title: 'Wait for the Move', description: 'You need a BIG move to overcome the cost of both options.', icon: '\uD83D\uDCA5' },
      ],
      outcomes: [
        { label: 'Stock makes a huge move (either way)', description: 'One of your options becomes very valuable, more than covering the cost of both. Big win!', color: 'green' as const },
        { label: 'Stock barely moves', description: 'Both options lose value from time decay. You lose some or all of the premiums paid.', color: 'red' as const },
      ],
    },
  },
]

type TabKey = 'beginner' | 'intermediate' | 'advanced'

function StrategySection({ strategy }: { strategy: typeof STRATEGIES[number] }) {
  const [activeTab, setActiveTab] = useState<TabKey>('beginner')

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 pb-0">
        <h2 className="text-2xl font-bold text-gray-900">{strategy.name}</h2>
      </div>

      {/* Tab buttons */}
      <div className="mt-4 flex border-b border-gray-200 px-6">
        {(['beginner', 'intermediate', 'advanced'] as TabKey[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`mr-6 border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'beginner' && (
          <div className="space-y-5">
            <p className="text-gray-700">{strategy.beginner.summary}</p>
            <p className="text-gray-500 italic">&ldquo;{strategy.beginner.analogy}&rdquo;</p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Use when:</span> {strategy.beginner.when}
            </p>
            <StrategyFlowDiagram
              strategyName={strategy.name}
              steps={strategy.diagram.steps}
              outcomes={strategy.diagram.outcomes}
            />
          </div>
        )}

        {activeTab === 'intermediate' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Greeks:</span> {strategy.intermediate.greeks}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Use when:</span> {strategy.intermediate.when}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Avoid when:</span> {strategy.intermediate.avoid}
            </p>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Profile:</span> {strategy.advanced.profile}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Adjustments:</span> {strategy.advanced.adjustments}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {strategy.advanced.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Analyzer</Link>
        <h1 className="mt-4 text-4xl font-bold text-gray-900">Options Strategy Library</h1>
        <p className="mt-3 text-lg text-gray-500">
          Learn what each strategy is, when to use it, and why &mdash; at every experience level.
        </p>

        <div className="mt-10 space-y-8">
          {STRATEGIES.map(s => (
            <StrategySection key={s.id} strategy={s} />
          ))}
        </div>
      </div>
    </main>
  )
}
