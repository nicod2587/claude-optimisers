---
name: setup-claude
description: Rebuild this Claude Code setup on a new or reset computer - plugins, settings, MCP servers - and check what is still missing.
disable-model-invocation: true
argument-hint: "check (report only, change nothing) or leave empty to set up"
---

Set up Claude Code on this computer to match the owner's standard setup, or
report how far this computer is from it. If the user passed `check`, only
report: change nothing.

The target settings are in `settings-template.json` next to this file. Read it
first.

## Rules

- Settings live in `~/.claude/settings.json` (user scope). Read it before any
  change. Merge into it; never replace the file. Never touch `permissions`,
  `hooks`, `env` or any key the template does not name.
- Before the first change, copy the file to
  `~/.claude/settings.json.bak-<YYYY-MM-DD>`.
- After writing, parse the file as JSON to prove it is valid. A broken
  settings file silently disables every setting in it.
- Ask before each group of changes below, showing what will change. One
  confirmation per group is enough.
- Report what you did and what is left. Do not claim a step worked unless you
  checked it.

## Steps

1. **Marketplaces.** For each entry in the template's `extraKnownMarketplaces`
   not already known (`claude plugin marketplace list`), run
   `claude plugin marketplace add <owner/repo>`.

2. **Plugins.** For each plugin set to `true` in the template's
   `enabledPlugins` that is not installed (`claude plugin list`), run
   `claude plugin install <plugin@marketplace> --scope user`.
   Plugins set to `false` (the design plugins) must not be on at user scope.
   They belong to the website project only: if the user names that project's
   folder, write `.claude/settings.local.json` there with both set to `true`,
   and add that path to the project's `.gitignore`.

3. **Settings.** Merge every other top-level key from the template into
   `~/.claude/settings.json`. For `deniedMcpServers`, add missing entries and
   keep existing ones. For `enabledPlugins` and `extraKnownMarketplaces`, add or
   update the named keys only.

4. **Duplicate skills.** List `~/.claude/skills/`. If a folder there has the
   same name as a skill this plugin or the obsidian plugin provides
   (cheat-sheet, stop-slop, grill-me, grilling, handoff, obsidian-markdown, obsidian-cli,
   obsidian-bases, json-canvas, defuddle), it loads twice. Offer to move those
   folders to `~/.claude/skills-backup-<YYYY-MM-DD>/`. Move, never delete.

5. **MCP servers that follow the account.** Gmail, Google Drive, Google
   Calendar, Undermind and the bio-research plugin (PubMed, bioRxiv,
   Consensus) come from the claude.ai account, not this computer. Run
   `claude mcp list` and report which are connected. For any missing, tell the
   user to sign in with the same claude.ai account and run `/mcp`.

6. **Google Scholar MCP (optional, needs Python).** This one is local. If the
   user wants it and it is missing:
   - clone `https://github.com/JackKuo666/Google-Scholar-MCP-Server` into
     `~/MCP/Google-Scholar-MCP-Server`
   - create a venv there and install `requirements.txt`
   - `claude mcp add google-scholar --scope user -- <venv python> <repo>/google_scholar_server.py`
   Read the repo's README first; it is third-party code.

7. **Report.** A short table: each step, done / already fine / skipped / needs
   the user, and anything to do by hand. End by telling the user to start a
   new session so the changes load.

## Not covered

- Permission rules: they are specific to each computer's folders.
- Project `CLAUDE.md` files and the second brain: they live in the project
  folders, not here.
- Cloud sessions (claude.ai/code) ignore user settings. To cover a repo there,
  add the `extraKnownMarketplaces` and `enabledPlugins` blocks from the
  template to that repo's `.claude/settings.json`.
