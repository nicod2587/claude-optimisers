import type { Register } from 'claude-code'

// Opt-in only: /arena costs several model calls, so it never runs by itself.
// Each contestant answers independently; a judge compares them and says
// where they agree, where they split, and which reasoning holds up.
//
// A contestant is a model plus a brief. Two briefs on the same model still
// disagree usefully, so the arena keeps working when a model is retired:
// a contestant whose model does not answer is dropped and named in the result.
const DIRECT = 'Give the answer you think is most likely right.'
const SCEPTIC =
  'Start from the suspicion that the obvious answer is wrong or incomplete. Look for ' +
  'the assumption it rests on, the case where it fails, and the alternative it ignores. ' +
  'If the obvious answer survives that, say so plainly; do not disagree for show.'
const CONTESTANTS: { model: string; brief: string }[] = [
  { model: 'opus', brief: DIRECT },
  { model: 'opus', brief: SCEPTIC },
  { model: 'claude-fable-5-2', brief: DIRECT },
  { model: 'sonnet', brief: DIRECT },
]
const JUDGE = 'opus'
const CONTEXT_CHARS = 20000
// Tool results (file contents, command output) are part of what "this" refers
// to, so the contestants see the start of each.
const TOOL_RESULT_CHARS = 2000
// Roomy caps: an answer cut off mid-argument would be judged as a weak answer.
const ANSWER_TOKENS = 8000
const VERDICT_TOKENS = 6000
// How much of each answer stays in the conversation afterwards.
const KEPT_ANSWER_CHARS = 3000

type Answer = { model: string; text: string }

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

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
        .map(m => {
          const results = (m.toolResults ?? [])
            .filter(t => t.text)
            .map(t => `[tool result]\n${t.text.slice(0, TOOL_RESULT_CHARS)}`)
          return [m.text, ...results].filter(Boolean).join('\n')
        })
        .map((body, i) => (body ? `${msgs[i]!.role.toUpperCase()}: ${body}` : ''))
        .filter(Boolean)
        .join('\n\n')
        .slice(-CONTEXT_CHARS)
    } catch {
      context = ''
    }
    const background = context ? `Conversation so far (for context):\n${context}\n\n---\n\n` : ''

    const system = (brief: string) =>
      'You are one of several independent experts answering the same question. ' +
      brief +
      ' State your answer first, then the reasoning that carries it, the strongest ' +
      'counter-argument, and how confident you are (low/medium/high) with the one fact ' +
      'that would change your mind. Separate what you know from what you are inferring. ' +
      'You see the conversation and the start of each tool result, not the files ' +
      'themselves: if the answer depends on something you were not shown, say so. ' +
      'Be concise.'
    const prompt = `${background}Question: ${question}`

    $.ui.status(`arena: asking ${CONTESTANTS.length} contestants...`)
    const failed: string[] = []
    const answers = await Promise.all(
      CONTESTANTS.map(async ({ model, brief }): Promise<Answer | undefined> => {
        const name = brief === SCEPTIC ? `${model} (sceptic)` : model
        try {
          const r = await $.model.complete({
            model,
            system: system(brief),
            prompt,
            effort: 'high',
            maxTokens: ANSWER_TOKENS,
          })
          if (r.isAnswered) return { model: name, text: r.text }
        } catch {
          // fall through
        }
        failed.push(name)
        return undefined
      }),
    )
    // Shuffled, so the judge cannot learn that "Answer A" is always the same model.
    const got = shuffle(answers.filter((a): a is Answer => !!a))
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
        maxTokens: VERDICT_TOKENS,
        system:
          'You judge independent answers to a hard question. Agreement is not evidence: ' +
          'the answers may share one mistake, so check the reasoning yourself instead of ' +
          'counting votes. Do not favour an answer for its length or its confidence. ' +
          'Report: 1) the best answer, in your own words, first; 2) where the answers ' +
          'agree, and whether that agreement is well founded; 3) where they disagree and ' +
          'what the disagreement turns on; 4) any error you found, and in which answer; ' +
          '5) what is still unsettled and the cheapest thing that would settle it.',
        prompt: `${background}Question: ${question}\n\n${labelled}`,
      })
      verdict = j.isAnswered ? j.text : '(judge gave no answer)'
    } catch {
      verdict = '(judge failed)'
    }
    $.ui.status(undefined)

    const who = got.map((a, i) => `${String.fromCharCode(65 + i)} = ${a.model}`).join(', ')
    const missing = failed.length ? ` · no answer from: ${failed.join(', ')}` : ''
    const text = `## Arena: ${question}\n\n${verdict}\n\n_Contestants: ${who}${missing}_`
    return {
      text,
      context: [
        'Arena answers, for reference (each may be cut short):\n\n' +
          got
            .map((a, i) => `### Answer ${String.fromCharCode(65 + i)}\n${a.text.slice(0, KEPT_ANSWER_CHARS)}`)
            .join('\n\n') +
          `\n\n(${who})`,
      ],
    }
  })
}
