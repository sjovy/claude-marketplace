# claude-marketplace

Thomas's personal [Claude Code](https://code.claude.com) plugin marketplace.

One repo to track. Add it once:

```
/plugin marketplace add sjovy/claude-marketplace
```

Then install any plugin it lists:

```
/plugin install <plugin-name>@sjovy
/reload-plugins
```

## Plugins

| Plugin | Source | Notes |
|---|---|---|
| `mattpocock-skills` | [`sjovy/mattpocock-skills`](https://github.com/sjovy/mattpocock-skills) | Fork of `mattpocock/skills`. Sync the fork to pull upstream updates. |

## Adding a plugin

Append an entry to `.claude-plugin/marketplace.json`:

```json
{
  "name": "<plugin-name>",
  "source": { "source": "github", "repo": "sjovy/<repo>", "ref": "main" },
  "description": "..."
}
```

Point `repo` at a fork (frozen until you sync it) or at an upstream repo. To freeze an
upstream source against surprise changes, replace `"ref": "main"` with `"sha": "<commit>"`.
