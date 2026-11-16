# cache-varm

Visar en rad ovanför promptrutan i Claude Code: hur stor del av kontextfönstret som används, om promptcachen fortfarande är varm och hur länge den lever, samt om senaste anropet träffade cachen eller missade.

Exempel: `kontext: 42% (84k) · cache varm, 3:12 kvar · senaste: träff`

Nedräkningen blir gul under en minut och röd när cachen har dött. Cachens livslängd ställs med `ttlMinutes` (5 som standard, 60 för 1-timmescache). Syns i terminalen, desktop-appens Code-flik, VS Code och mobilappens Code-vy.

Installera: `/plugin install cache-varm@sjovy`
