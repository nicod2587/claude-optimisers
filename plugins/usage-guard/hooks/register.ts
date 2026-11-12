import type { Register } from 'claude-code'

// Warns only; never compacts or clears anything by itself, so nothing is lost.
const CONTEXT_WARN = 70 // % of the context window
const RATE_WARN = 80 // % of a rate-limit window (e.g. the five-hour one)

const warned = new Set<string>()

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    try {
      const u = await $.session.usage()
      const parts: string[] = []
      const ctx = u.context.percent
      if (ctx !== undefined) parts.push(`ctx ${Math.round(ctx)}%`)
      if (u.cost) parts.push(`$${u.cost.usd.toFixed(2)}`)
      for (const l of u.rateLimits) {
        const name = l.kind.replace('_', ' ')
        parts.push(`${name} ${Math.round(l.percentUsed)}%`)
        if (l.percentUsed >= RATE_WARN && !warned.has(l.kind)) {
          warned.add(l.kind)
          $.ui.toast(
            `${name} limit ${Math.round(l.percentUsed)}% used` +
              (l.resetsAt ? `, resets ${l.resetsAt}` : '') +
              '. Save Opus-heavy work for after the reset if you can.',
          )
        }
      }
      if (ctx !== undefined && ctx >= CONTEXT_WARN && !warned.has('ctx')) {
        warned.add('ctx')
        $.ui.toast(
          `Context ${Math.round(ctx)}% full: every turn re-sends all of it. ` +
            'Consider /compact, or /clear when you switch task.',
        )
      }
      if (ctx !== undefined && ctx < 30) warned.delete('ctx') // after /compact or /clear
      $.ui.status(parts.join(' · ') || undefined)
    } catch {
      // usage figures unavailable on this host: show nothing
    }
    return r
  })
}
