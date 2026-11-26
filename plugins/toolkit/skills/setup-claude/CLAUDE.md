# Global instructions

## Matt Pocock skills (mattpocock-skills plugin), always on

Before acting on a task, check whether a `mattpocock-skills:*` skill fits and invoke it with the Skill tool. Where one overlaps with another plugin (e.g. superpowers), use the Matt Pocock skill.

Skills Claude invokes itself:

| Situation | Skill |
|---|---|
| Planning a change, a design decision, unclear requirements | `mattpocock-skills:grilling` (instead of superpowers:brainstorming) |
| Writing or fixing code with tests | `mattpocock-skills:tdd` (instead of superpowers:test-driven-development) |
| Bug, failing test, crash, perf regression | `mattpocock-skills:diagnosing-bugs` (instead of superpowers:systematic-debugging) |
| Reviewing a diff, branch or PR | `mattpocock-skills:code-review` |
| Module or interface design, where a seam goes | `mattpocock-skills:codebase-design` |
| Project terminology, GLOSSARY.md, ADRs | `mattpocock-skills:domain-modeling` |
| Throwaway prototype to answer a design question | `mattpocock-skills:prototype` |
| Writing a PR body | `mattpocock-skills:pr` |
| Researching a question against primary sources | `mattpocock-skills:research` |
| Steps only the human can do (credentials, dashboards, infra) | `mattpocock-skills:wizard` |
| Writing skills, CLAUDE.md, AGENTS.md | `mattpocock-skills:writing-for-agents` |

Skills only the user can start. When one fits, suggest the user type it:

- `/grill-me` (non-code) or `/grill-with-docs` (in a code repo): before any real change
- `/to-spec`, `/to-tickets`, `/implement`, `/implement-spec`: spec-to-code flow
- `/wayfinder`: work too big for one session
- `/triage`, `/improve-codebase-architecture`, `/retro`
- `/handoff`, `/teach`, `/to-questionnaire`, `/wait-what`
- `/ask-matt`: when unsure which flow fits

In a git repo not yet configured for these skills, suggest `/setup-matt-pocock-skills` once before the spec, ticket or triage flows.
