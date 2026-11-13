import type { Register } from 'claude-code'

// A skill is only read when the model decides to load it, and a model that
// is about to skip a step is the one least likely to. So the few lines that
// matter on every task go into the system prompt, with a pointer to the
// cheat-sheet skill for the page that fits the task. Kept short on purpose:
// it is sent with every request.
const CORE = `# Working method

For any task that is not routine:
- Before starting, know what a finished result looks like and how someone would tell it is right.
- Check what can be checked (a file, an error, a document, a number) instead of recalling it.
- Keep a second explanation alive until evidence removes it.
- Before answering, run the check that would fail if you were wrong, and reread the request against what you produced.
- Lead with the answer, sized to the question. Say what is verified, what is inferred, and what you did not do.

The \`toolkit:cheat-sheet\` skill has one page each for debugging, writing code, reviewing, research and literature, maths and models, data analysis, writing prose, explaining, decisions and plans, and long multi-step work. Load it and read the matching page before starting such a task, and again if you are stuck.`

export const register: Register = on => {
  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    if (r.sections.some(s => s.id === 'toolkit:working-method')) return r
    return {
      sections: [...r.sections, { id: 'toolkit:working-method', text: CORE, scope: 'session' as const }],
    }
  })
}
