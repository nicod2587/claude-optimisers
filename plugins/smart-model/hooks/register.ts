import type { Register } from 'claude-code'

// Cheaper model for clearly routine turns. Everything else stays on the
// session's own model (Opus, in the standard setup).
const CHEAP = 'sonnet'
// Each model keeps its own prompt cache, so switching models on a long
// conversation means re-caching the whole context. Past this size, a
// downgrade can cost more than it saves, so we stay on Opus.
const MAX_MESSAGES_FOR_DOWNGRADE = 40
// A long prompt is rarely routine, and not worth a classifier call to find out.
const MAX_CHARS_FOR_DOWNGRADE = 1500
// How much of Claude's last reply the classifier sees, so that "yes, do it"
// is judged by what "it" is.
const PREVIOUS_REPLY_CHARS = 1200

const CLASSIFY_PROMPT = `You route a coding assistant's next turn to a model.
Answer "routine" ONLY if the request is clearly simple and low-stakes: a quick
factual question, a small obvious edit, formatting, renaming, running a known
command, summarising something short, casual chat.
Answer "hard" for anything involving debugging, an error message or stack
trace, design or architecture, multi-file changes, research, analysis, maths,
writing that matters, security, ambiguity, or anything you are not sure about.
A short reply such as "yes", "go ahead", "do it" or "continue" takes the label
of the work it approves: read the assistant's previous message, and answer
"hard" unless that work is itself clearly routine.
`

type Route = { model: string; isForced: boolean }
const routed = new Map<string, Route>() // turnId -> decision, fixed for the turn

export const register: Register = on => {
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e) // leave subagents alone
    const text = e.text.trim()
    let route: Route | undefined
    // Override by hand: start a prompt with "!opus" or "!sonnet".
    const forced = /^!(opus|sonnet)\b/i.exec(text)
    if (forced) route = { model: forced[1]!.toLowerCase(), isForced: true }
    else if (text && text.length <= MAX_CHARS_FOR_DOWNGRADE) {
      try {
        let previous = ''
        try {
          const msgs = await $.session.messages()
          const last = msgs.filter(m => m.role === 'assistant' && m.text).at(-1)
          if (last) previous = last.text.slice(-PREVIOUS_REPLY_CHARS)
        } catch {
          previous = ''
        }
        const label = await $.model.classify(
          CLASSIFY_PROMPT +
            (previous ? `\nAssistant's previous message (end of it):\n${previous}\n` : '') +
            `\nRequest:\n${text}`,
          ['routine', 'hard'],
          { model: 'haiku' },
        )
        if (label === 'routine') route = { model: CHEAP, isForced: false }
      } catch {
        route = undefined // in doubt: leave the session's model alone
      }
    }
    // No route = a continuation, a long prompt or a hard one: the session's model.
    if (route) routed.set(e.turnId, route)
    if (routed.size > 50) routed.delete(routed.keys().next().value!)
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    if (e.agentId !== undefined) return yield* next(e)
    const route = routed.get(e.turnId)
    if (!route) {
      if (e.index === 0) $.ui.status(undefined)
      return yield* next(e)
    }
    if (e.index === 0 && !route.isForced) {
      // Decide once, on the first step, and keep it for the whole turn: a
      // switch halfway through a turn pays for both models' caches.
      const isAlreadyCheap = /sonnet|haiku/i.test(e.model)
      if (isAlreadyCheap || e.messageCount > MAX_MESSAGES_FOR_DOWNGRADE) {
        routed.delete(e.turnId)
        $.ui.status(undefined)
        return yield* next(e)
      }
    }
    if (e.index === 0) {
      $.ui.status(`model: ${route.model} (${route.isForced ? 'forced' : 'routine'})`)
    }
    return yield* next({ ...e, model: route.model })
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    routed.delete(e.turnId)
    return r
  })
}
