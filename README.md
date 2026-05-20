# claude-marketplace

Thomas's personal [Claude Code](https://code.claude.com) plugin marketplace — a single curated **trust list** of plugins, each installed from a **fork I control** rather than directly from the original author.

One marketplace to track. Everything else is automatic once set up.

---

## How it works

Updates flow through three stages. Two are automatic; the middle one is deliberately manual and acts as my review gate:

```
upstream author        my fork                 my machine
(e.g. mattpocock)  ──▶ (sjovy/<repo>)      ──▶ (Claude Code)
   they push       MANUAL: I review the      AUTO: marketplace
                   diff, then "Sync fork"    auto-update + reload
```

- **Fork = durable copy + security gate.** Nothing reaches my machine until I've looked at what changed upstream and chosen to pull it. If an author deletes or rewrites their repo, my fork survives, so I'm never stranded.
- **Marketplace = the catalog.** This repo's `.claude-plugin/marketplace.json` lists each plugin and points at my fork of it.
- **Auto-update is ON** for this marketplace, so once I sync a fork, the change reaches Claude Code on its own.

---

## Install (one time, per machine)

```
/plugin marketplace add sjovy/claude-marketplace
```

Then install any plugin it lists:

```
/plugin install <plugin-name>@sjovy
/reload-plugins
```

> **Requirement:** plugins here use the `github` source type, which clones over **SSH** (`git@github.com`). The machine needs an SSH key registered with GitHub, or installs fail with `Permission denied (publickey)`. Set up once:
> ```bash
> ssh-keygen -t ed25519 -C "you@example.com" -f ~/.ssh/id_ed25519 -N ""
> gh ssh-key add ~/.ssh/id_ed25519.pub --title "this-machine"
> ssh -T git@github.com   # expect: "Hi sjovy! You've successfully authenticated"
> ```

---

## Plugins

| Plugin | My fork | Upstream | Type | Notes |
|---|---|---|---|---|
| `mattpocock-skills` | [`sjovy/mattpocock-skills`](https://github.com/sjovy/mattpocock-skills) | [`mattpocock/skills`](https://github.com/mattpocock/skills) | skills only | Inert markdown — low risk. |

---

## Updating an installed plugin

1. **On GitHub** — open the fork, **review the incoming upstream changes**, then click **"Sync fork"**. *(This is the security checkpoint — see Warnings.)*
2. **In Claude Code** — at the next startup, auto-update pulls the new commit and prompts a reload. Run:
   ```
   /reload-plugins
   ```

**To update immediately** without restarting:
```
/plugin marketplace update sjovy
/reload-plugins
```

No reinstall is needed in normal use — auto-update + reload is the whole flow.

---

## Adding a new trusted plugin

1. **Fork** the upstream repo to `sjovy/<repo>` on GitHub.
2. **Add an entry** to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "<plugin-name>",
     "source": { "source": "github", "repo": "sjovy/<repo>", "ref": "main" },
     "description": "..."
   }
   ```
   *(`<plugin-name>` must match the `name` field in the plugin's own `.claude-plugin/plugin.json`.)*
3. **Commit & push** this repo.
4. **Refresh and install** in Claude Code:
   ```
   /plugin marketplace update sjovy
   /plugin install <plugin-name>@sjovy
   /reload-plugins
   ```

---

## Command cheat-sheet

| Command | What it does |
|---|---|
| `/plugin marketplace add sjovy/claude-marketplace` | Register this marketplace (one time per machine) |
| `/plugin install <name>@sjovy` | Install a plugin |
| `/reload-plugins` | Apply plugin changes in the running session |
| `/plugin marketplace update sjovy` | Manually refresh the catalog + pull latest plugin versions |
| `/plugin marketplace list` | List registered marketplaces |
| `/plugin uninstall <name>@sjovy` | Remove a plugin |
| `/plugin` → **Marketplaces** → `sjovy` | Toggle auto-update, view status |

---

## ⚠️ Warnings & caveats

- **Plugins execute with your user privileges.** No sandbox. Anthropic does not review third-party plugins. Only fork and add sources you trust.
- **The fork only protects you if you actually review the diff** before clicking "Sync fork." The button will happily fast-forward whatever upstream pushed. Pay closest attention to anything touching `hooks/`, `.mcp.json`, or executable scripts.
  - **Skills** = inert markdown instructions → low risk, quick scan.
  - **Hooks / MCP servers** = code that runs on your machine → review hard.
- **Auto-update is per-marketplace, not per-plugin.** Every plugin added here inherits auto-update = ON. To freeze one plugin while the rest auto-update, pin its source to an exact commit:
  ```json
  "source": { "source": "github", "repo": "sjovy/<repo>", "sha": "<40-char commit>" }
  ```
- **Forks go stale silently.** A fork never auto-pulls upstream — it only moves when I click "Sync fork." This is the accepted cost of the security gate; the trade-off is that I must remember to sync to receive updates and fixes.

---

## Design decisions (why it's built this way)

- **Forks over pointing at upstream** — chosen for **resilience**. If an author deletes, force-pushes, or abandons their repo, a direct upstream reference breaks and I can't even reinstall. My fork is an independent copy that survives. The accepted cost is manual syncing, which doubles as the malware-review gate.
- **Auto-update ON** — once a fork is reviewed and synced, propagation to my machine should be hands-off.
- **No declarative `settings.json`, no auto-sync automation** — deliberately kept simple; manual fork-sync is the one manual step I accept in exchange for control.

Every entry is a one-line edit, so any plugin can be switched between fork ↔ upstream, or pinned to a SHA, at any time.
