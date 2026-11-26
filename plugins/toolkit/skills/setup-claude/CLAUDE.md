# Global instructions

## Matt Pocock skills (mattpocock-skills plugin): pick and use them yourself

The user does not choose skills and should not have to type them. On every task, decide yourself whether one of Matt Pocock's skills fits, use it, and say in one short line which one you are using. Never ask the user which skill to use, and never tell them to type a slash command you could run yourself. If several fit, use them in the order the task needs. If none fits, just do the task. Where one overlaps with another plugin's skill, use the Matt Pocock skill.

### Skills you call with the Skill tool

| When | Skill |
|---|---|
| Planning a change, a design decision, unclear or fuzzy requirements | `mattpocock-skills:grilling` |
| Writing or fixing code where tests make sense | `mattpocock-skills:tdd` |
| Bug, failing test, crash, wrong output, slowness | `mattpocock-skills:diagnosing-bugs` |
| Reviewing a diff, branch or PR, or before committing a non-trivial change | `mattpocock-skills:code-review` |
| Module or interface design, where a seam goes, testability | `mattpocock-skills:codebase-design` |
| Project terminology, GLOSSARY.md, ADRs | `mattpocock-skills:domain-modeling` |
| A design question best answered by a throwaway prototype | `mattpocock-skills:prototype` |
| Writing a PR body | `mattpocock-skills:pr` |
| A factual question that needs primary sources | `mattpocock-skills:research` |
| Steps only the human can do (credentials, dashboards, infra) | `mattpocock-skills:wizard` |
| Writing skills, CLAUDE.md, AGENTS.md | `mattpocock-skills:writing-for-agents` |

### Skills the Skill tool can't call: read the file and follow it

These are marked user-only, so the Skill tool refuses them. When one fits, find its file with Glob at
`~/.claude/plugins/cache/claude-plugins-official/mattpocock-skills/*/skills/<group>/<name>/SKILL.md`
(take the highest version), read it and any files it points to, and follow it as if it had been invoked.

| When | Skill (group/name) |
|---|---|
| Planning a change inside a code repo (instead of plain grilling) | `engineering/grill-with-docs` |
| A plan has been agreed and is big enough to write down as a spec | `engineering/to-spec` |
| A spec or plan needs breaking into tasks | `engineering/to-tickets` |
| Building from a spec or tickets | `engineering/implement` (or `engineering/implement-spec` for a whole spec with many tickets) |
| Work too big for one session | `engineering/wayfinder` |
| Sorting or triaging issues | `engineering/triage` |
| The user asks about cleanup, refactoring or architecture of a codebase | `engineering/improve-codebase-architecture` |
| End of a long session that had friction or repeated mistakes | `engineering/retro` |
| Context is getting full, or the user is moving the work to a new session | `productivity/handoff` |
| The user wants to learn a topic over several sessions | `productivity/teach` |
| A decision needs input from someone other than the user | `productivity/to-questionnaire` |
| The user is confused by your last message ("what?", "I don't get it") | `productivity/wait-what` |
| First spec, ticket or triage flow in a git repo with no setup yet | `engineering/setup-matt-pocock-skills` |

### Limits

- Use a skill only when the task genuinely calls for it. A one-line answer or a small edit needs none.
- Anything that posts outside this computer (issues, PRs, pushes, messages) still needs the user's OK first, whatever the skill says.
