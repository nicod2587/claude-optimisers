import type { Register } from 'claude-code'

// Warns only; never compacts or clears anything by itself, so nothing is lost.
const CONTEXT_WARN = 70 // % of the context window
const RATE_WARN = 80 // % of a rate-limit window (e.g. the five-hour one)

const warned = new Set<string>()

// "2026-11-13T18:00:00Z" -> ", resets in 2h 10m"
function resetText(resetsAt: string | undefined): string {
  if (!resetsAt) return ''
  const minutes = Math.round((Date.parse(resetsAt) - Date.now()) / 60000)
  if (!Number.isFinite(minutes) || minutes <= 0) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h >= 48) return `, resets in ${Math.round(h / 24)} days`
  return `, resets in ${h ? `${h}h ` : ''}${m}m`
}

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
        const name = l.kind.replaceAll('_', ' ')
        parts.push(`${name} ${Math.round(l.percentUsed)}%`)
        if (l.percentUsed >= RATE_WARN && !warned.has(l.kind)) {
          warned.add(l.kind)
          $.ui.toast(
            `${name} limit ${Math.round(l.percentUsed)}% used` +
              resetText(l.resetsAt) +
              '. Save Opus-heavy work for after the reset if you can.',
          )
        }
        // The window has reset: warn again the next time it fills.
        if (l.percentUsed < RATE_WARN / 2) warned.delete(l.kind)
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
