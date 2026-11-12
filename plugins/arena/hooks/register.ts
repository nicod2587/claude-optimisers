import type { Register } from 'claude-code'

// Opt-in only: /arena costs several model calls, so it never runs by itself.
// Each contestant answers independently; a judge compares them and says
// where they agree, where they split, and which reasoning holds up.
const CONTESTANTS = ['opus', 'claude-fable-5-2', 'sonnet']
const JUDGE = 'opus'
const CONTEXT_CHARS = 20000

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'arena',
      description:
        'Ask several models the same hard question, then have Opus judge where they agree and disagree',
    })
    return next(e)
  })

  on('command.run', { command: 'arena' }, async ($, e) => {
    const question = e.args.trim()
    if (!question) return { text: 'Usage: /arena <the hard or unsettled question>' }

    // Recent conversation, so the contestants know what "this" refers to.
    let context = ''
    try {
      const msgs = await $.session.messages()
      context = msgs
        .map(m => `${m.role.toUpperCase()}: ${m.text}`)
        .join('\n\n')
        .slice(-CONTEXT_CHARS)
    } catch {
      context = ''
    }

    const system =
      'You are one of several independent experts answering the same question. ' +
      'Think carefully, state your answer first, then your reasoning, the strongest ' +
      'counter-argument, and how confident you are (low/medium/high). Be concise.'
    const prompt =
      (context ? `Conversation so far (for context):\n${context}\n\n---\n\n` : '') +
      `Question: ${question}`

    $.ui.status(`arena: asking ${CONTESTANTS.length} models...`)
    const answers = await Promise.all(
      CONTESTANTS.map(async model => {
        try {
          const r = await $.model.complete({ model, system, prompt, effort: 'high', maxTokens: 4000 })
          return r.isAnswered ? { model, text: r.text } : undefined
        } catch {
          return undefined
        }
      }),
    )
    const got = answers.filter((a): a is { model: string; text: string } => !!a)
    if (got.length === 0) {
      $.ui.status(undefined)
      return { text: 'arena: no model answered.' }
    }

    $.ui.status('arena: judging...')
    const labelled = got.map((a, i) => `### Answer ${String.fromCharCode(65 + i)}\n${a.text}`).join('\n\n')
    let verdict = ''
    try {
      const j = await $.model.complete({
        model: JUDGE,
        effort: 'high',
        maxTokens: 3000,
        system:
          'You judge independent answers to a hard question. Do not favour an answer for ' +
          'its length or confidence. Report: 1) where they agree, 2) where they disagree ' +
          'and why, 3) which reasoning is strongest and any error you spot, 4) your ' +
          'best synthesised answer, 5) what is genuinely unsettled and what would settle it.',
        prompt: `Question: ${question}\n\n${labelled}`,
      })
      verdict = j.isAnswered ? j.text : '(judge gave no answer)'
    } catch {
      verdict = '(judge failed)'
    }
    $.ui.status(undefined)

    const who = got.map((a, i) => `${String.fromCharCode(65 + i)} = ${a.model}`).join(', ')
    const text = `## Arena: ${question}\n\n${verdict}\n\n_Contestants: ${who}_`
    return {
      text,
      context: [`Full arena answers, for reference:\n\n${labelled}\n\n(${who})`],
    }
  })
}
