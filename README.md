# claude-optimisers

Small Claude Code plugins that cut cost without cutting quality. Rule of thumb throughout: if in doubt, use Opus.

| Plugin | Always on? | What it does |
| --- | --- | --- |
| `smart-model` | yes | Haiku labels each prompt "routine" or "hard". Routine turns run on Sonnet; everything else, anything uncertain, continuations and subagents stay on Opus. No downgrade past ~40 messages, because switching models re-caches the whole conversation. Start a prompt with `!opus` or `!sonnet` to force a model. |
| `usage-guard` | yes | Status line with context %, session cost and rate-limit use. One-time warning at 70% context and 80% of a rate-limit window. It only warns; it never compacts or clears anything. |
| `arena` | opt-in | `/arena <question>`: Opus, Fable and Sonnet answer independently, then Opus judges where they agree and disagree, picks the strongest reasoning and says what is still unsettled. Costs several model calls, so use it for hard, contested questions. |
| `toolkit` | yes | Everyday skills: `stop-slop` (strip AI writing patterns), `/grill-me` (stress-test a plan, one round of questions at a time), `/handoff` (write a handoff note for a fresh session). Plus `/setup-claude`, which rebuilds this whole setup on a new computer. Third-party skills are MIT; see `plugins/toolkit/THIRD_PARTY.md`. |

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

- `plugins/smart-model/hooks/register.ts`: the routine/hard wording, `CHEAP`, and `MAX_MESSAGES_FOR_DOWNGRADE`.
- `plugins/usage-guard/hooks/register.ts`: `CONTEXT_WARN` and `RATE_WARN`.
- `plugins/arena/hooks/register.ts`: `CONTESTANTS` and `JUDGE`.
- `plugins/toolkit/skills/setup-claude/settings-template.json`: the standard model, effort, plugins and blocked MCP servers that `/setup-claude` applies.
