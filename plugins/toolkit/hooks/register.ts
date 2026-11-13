import type { Register } from 'claude-code'

// A skill is only read when the model decides to load it, and a model that
// is about to skip a step is the one least likely to. So the few lines that
// matter on every task go into the system prompt, with a pointer to the
// cheat-sheet skill for the page that fits the task. Kept short on purpose:
// it is sent with every request.
const CORE = `# Working method

- Check what can be checked (a file, an error, a document, a number) instead of recalling it. Never present a reference, a statistic or an API detail from memory as checked.
- Keep a second explanation alive until evidence removes it.
- Before answering, run the check that would fail if you were wrong, and reread the request against what you produced. Say what you did not do or could not verify.

Load the \`toolkit:cheat-sheet\` skill and read the matching page before you: debug something that is not obvious, change code across several files, review code or a plan, cite literature, derive or model something, report a statistic, write prose that will be submitted or published, give advice on a decision, or say "done" after many steps. Load it too when the same fix has failed twice.`

export const register: Register = on => {
  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    if (r.sections.some(s => s.id === 'toolkit:working-method')) return r
    return {
      sections: [...r.sections, { id: 'toolkit:working-method', text: CORE, scope: 'session' as const }],
    }
  })
}
