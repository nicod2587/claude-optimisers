import type { Register } from 'claude-code'

// Cheaper model for clearly routine turns. Everything else stays on Opus.
const CHEAP = 'sonnet'
const SAFE = 'opus'
// Each model keeps its own prompt cache, so switching models on a long
// conversation means re-caching the whole context. Past this size, a
// downgrade can cost more than it saves, so we stay on Opus.
const MAX_MESSAGES_FOR_DOWNGRADE = 40

const CLASSIFY_PROMPT = `You route a coding assistant's next turn to a model.
Answer "routine" ONLY if the request is clearly simple and low-stakes: a quick
factual question, a small obvious edit, formatting, renaming, running a known
command, summarising something short, casual chat.
Answer "hard" for anything involving debugging, design or architecture,
multi-file changes, research, analysis, writing that matters, security,
ambiguity, or anything you are not sure about.

Request:
`

const routed = new Map<string, string>() // turnId -> model

export const register: Register = on => {
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e) // leave subagents alone
    let model = SAFE
    const text = e.text.trim()
    // Override by hand: start a prompt with "!opus" or "!sonnet".
    const forced = /^!(opus|sonnet)\b/i.exec(text)
    if (forced) model = forced[1].toLowerCase()
    else if (text) {
      try {
        const label = await $.model.classify(
          CLASSIFY_PROMPT + text.slice(0, 4000),
          ['routine', 'hard'],
          { model: 'haiku' },
        )
        if (label === 'routine') model = CHEAP
      } catch {
        model = SAFE // in doubt: Opus
      }
    }
    // Empty text = a continuation; keep Opus.
    routed.set(e.turnId, model)
    if (routed.size > 50) routed.delete(routed.keys().next().value!)
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const want = routed.get(e.turnId)
    if (
      e.agentId === undefined &&
      want === CHEAP &&
      e.messageCount <= MAX_MESSAGES_FOR_DOWNGRADE
    ) {
      if (e.index === 0) $.ui.status(`model: ${CHEAP} (routine)`)
      return yield* next({ ...e, model: CHEAP })
    }
    if (e.agentId === undefined && e.index === 0) $.ui.status(undefined)
    return yield* next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    routed.delete(e.turnId)
    return r
  })
}
