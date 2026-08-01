# claude-marketplace

Thomas's personal [Claude Code](https://code.claude.com) plugin marketplace — a single curated **trust list** of plugins, each installed from a **fork I control** rather than directly from the original author.

One marketplace to track. Everything else is automatic once set up.

---

## How it works

Updates flow through three stages, all automatic:

```
upstream author        my fork                 my machine
(e.g. mattpocock)  ──▶ (sjovy/<repo>)      ──▶ (Claude Code)
   they push       AUTO: sync-forks          AUTO: marketplace
                   fast-forwards daily       auto-update + reload
```

- **Fork = durable copy.** If an author deletes, renames, or abandons their repo, my fork survives and the marketplace keeps resolving. And because syncing is **fast-forward-only**, a force-pushed/rewritten upstream history never flows in — the sync fails loudly ("diverged — manual merge needed") and waits for me.
- **Marketplace = the catalog.** This repo's `.claude-plugin/marketplace.json` lists each plugin and points at my fork of it.
- **Sync is automated.** `.github/workflows/sync-forks.yml` runs daily (04:00 UTC) and fast-forwards every fork in the account to its upstream. It reports via a single **"Fork sync report" issue** in this repo — created/updated only when something changed or needs attention. Requires the `FORK_SYNC_TOKEN` repository secret (fine-grained PAT, all repos, Contents + Issues read/write).
- **Auto-update is ON** for this marketplace, so synced changes reach Claude Code on their own at the next startup.

---

## Preparing a fork (do this at fork time, before anything else)

Forked repos inherit the upstream's GitHub Actions workflows. Every sync push
triggers them in **your** fork, where they fail without the upstream's secrets
— and GitHub emails "Run failed" every morning the upstream moved. The moment
you create a fork, while you still remember why:

1. **Fork** the upstream to `sjovy/<author>-<repo>`.
2. **Disable GitHub Actions on the fork**: Settings → Actions → General →
   **"Disable actions"** → Save. Or from the CLI:
   ```bash
   gh api -X PUT /repos/sjovy/<repo>/actions/permissions -F enabled=false
   ```
3. Continue with **Adding a new trusted plugin** below if it's marketplace-bound.

This applies to *every* fork in the account, marketplace-bound or not — any
fork with inherited CI will spam on its next sync. (All forks existing before
2026-08-01 have been bulk-disabled already.)

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

## Updating an installed plugin

Normally: **nothing to do.** The nightly sync fast-forwards the fork, auto-update pulls it down at the next Claude Code startup, and a reload prompt appears — run:
```
/reload-plugins
```

**To update immediately** (without waiting for the nightly sync): click **"Sync fork"** on the fork (or trigger the sync workflow manually), then:
```
/plugin marketplace update sjovy
/reload-plugins
```

**To know what changed:** watch the **"Fork sync report" issue** in this repo — it lists every synced fork, commit counts, and anything needing attention (diverged forks, stale `plugin.json` versions, dangling marketplace entries).

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
- **Trust is decided once, at adoption time — not per update.** With sync and auto-update both automatic, new upstream commits reach my machine with **no review step**. The fork protects availability (deletion, renames) and blocks history rewrites (fast-forward-only), but it does *not* screen what a trusted author pushes next. Adopt accordingly — be strictest about plugins containing `hooks/`, `.mcp.json`, or executable scripts (code that runs on my machine), relaxed about pure-markdown skills.
- **To put a specific plugin behind a review gate, pin it to a commit:**
  ```json
  "source": { "source": "github", "repo": "sjovy/<repo>", "sha": "<40-char commit>" }
  ```
  A pinned plugin never moves until I deliberately edit this file — that edit *is* the review. Use for anything whose upstream I trust less than the rest.
- **Diverged forks stop syncing.** If an upstream force-pushes, the nightly sync refuses the rewrite and flags the fork in the report issue ("diverged — manual merge needed"). That's the moment to look hard at what upstream did before resolving by hand.

---

## Design decisions (why it's built this way)

- **Forks over pointing at upstream** — chosen for **resilience**. If an author deletes, force-pushes, or abandons their repo, a direct upstream reference breaks and I can't even reinstall. My fork is an independent copy that survives, and fast-forward-only syncing rejects rewritten history on top.
- **Full automation over a per-update review gate** — the accepted trade-off. I trust the authors I adopt, continuously; in exchange, updates flow hands-off from their push to my machine. Where that trust is thinner, per-plugin SHA pinning restores a deliberate review step — per plugin, not as friction on everything.
- **One report channel** — the sync workflow speaks only through the "Fork sync report" issue, and only when something changed or broke. Silence means healthy.

Every entry is a one-line edit, so any plugin can be switched between fork ↔ upstream, or pinned to a SHA, at any time.
