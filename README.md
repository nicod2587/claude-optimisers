# claude-optimisers

Small Claude Code plugins that cut cost without cutting quality. Rule of thumb throughout: if in doubt, use Opus.

| Plugin | Always on? | What it does |
| --- | --- | --- |
| `smart-model` | yes | Haiku labels each prompt "routine" or "hard", reading the end of Claude's last reply too, so "yes, do it" is judged by what it approves. Routine turns run on Sonnet; everything else, anything uncertain, long prompts, continuations and subagents stay on the session's model. The choice is made once per turn. No downgrade past ~40 messages, because switching models re-caches the whole conversation. Start a prompt with `!opus` or `!sonnet` to force a model for that turn. |
| `usage-guard` | yes | Status line with context %, session cost and rate-limit use. One-time warning at 70% context and 80% of a rate-limit window. It only warns; it never compacts or clears anything. |
| `arena` | opt-in | `/arena <question>`: Opus, Opus briefed as a sceptic, Fable and Sonnet answer independently. Opus then judges, with the answers shuffled and unnamed: the best answer first, whether the agreement is well founded, what the disagreement turns on, and what is still unsettled. A model that does not answer is dropped and named, so the arena keeps working when a model is retired. Costs several model calls, so use it for hard, contested questions. |
| `toolkit` | yes | Everyday skills: `cheat-sheet` (working methods, see below), `stop-slop` (strip AI writing patterns), `/grill-me` (stress-test a plan, one round of questions at a time), `/handoff` (write a handoff note for a fresh session). Plus `/setup-claude`, which rebuilds this whole setup on a new computer. Third-party skills are MIT; see `plugins/toolkit/THIRD_PARTY.md`. |

## The cheat sheet

`plugins/toolkit/skills/cheat-sheet/` records how to work a task so the answer is right: a one-page core, then one sheet each for debugging, writing code, reviewing, research, maths and models, data analysis, writing prose, explaining, decisions, and long multi-step work. It was written by a stronger model and reviewed by the one that uses it, so the method outlasts whichever model is current.

It reaches the model two ways. The toolkit plugin adds a few lines of the core to the system prompt of every session, with a pointer to the skill, and the model loads the skill and reads the matching sheet when a task calls for it. To read a sheet on demand, type `/toolkit:cheat-sheet`.

The sheets are plain Markdown. When Claude gets something wrong in a way a sheet should have caught, add a line to that sheet; it is the cheapest way to make the same mistake rarer.

## New computer

Two commands, then one skill does the rest:

```
/plugin marketplace add nicod2587/claude-optimisers
```

```
/plugin install toolkit@claude-optimisers
```

Start a new session and run `/setup-claude`. It adds the other marketplaces,
installs the plugins at user scope, merges the model, effort and MCP settings
from `plugins/toolkit/skills/setup-claude/settings-template.json` into
`~/.claude/settings.json` (backup first, never replacing the file), and checks
which account-level MCP servers are connected. `/setup-claude check` reports
the gaps without changing anything. Edit the template to change the standard
setup everywhere.

## Install one plugin

In Claude Code, at the prompt:

```
/plugin marketplace add nicod2587/claude-optimisers
```

```
/plugin install smart-model@claude-optimisers
```

```
/plugin install usage-guard@claude-optimisers
```

```
/plugin install arena@claude-optimisers
```

Choose the **user** scope when asked, so the plugins apply to every session on that computer, whichever folder it starts in.

## Cloud sessions

Cloud sessions don't read your computer's settings. To cover them, add this to the `.claude/settings.json` of a repo you open in the cloud:

```json
{
  "extraKnownMarketplaces": {
    "claude-optimisers": { "source": { "source": "github", "repo": "nicod2587/claude-optimisers" } }
  },
  "enabledPlugins": {
    "smart-model@claude-optimisers": true,
    "usage-guard@claude-optimisers": true,
    "arena@claude-optimisers": true,
    "toolkit@claude-optimisers": true
  }
}
```

## Tuning

- `plugins/smart-model/hooks/register.ts`: the routine/hard wording, `CHEAP`, `MAX_MESSAGES_FOR_DOWNGRADE` and `MAX_CHARS_FOR_DOWNGRADE`.
- `plugins/usage-guard/hooks/register.ts`: `CONTEXT_WARN` and `RATE_WARN`.
- `plugins/arena/hooks/register.ts`: `CONTESTANTS` (each a model and a brief) and `JUDGE`.
- `plugins/toolkit/hooks/register.ts`: `CORE`, the lines added to every system prompt. Keep it short; it is sent with every request.
- `plugins/toolkit/skills/cheat-sheet/sheets/`: one file per kind of task.
- `plugins/toolkit/skills/setup-claude/settings-template.json`: the standard model, effort, plugins and blocked MCP servers that `/setup-claude` applies.
