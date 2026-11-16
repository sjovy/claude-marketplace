import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { CacheSnap } from '../types'

const snap = atom({ plugin: 'cache-varm', key: 'snap' } as const, null)
const now = atom({ plugin: 'cache-varm', key: 'now' } as const, 0)

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const register: Register = (on, options) => {
  const ttlMs = Number(options.ttlMinutes ?? 5) * 60_000
  let ticking = false

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    if (!ticking) {
      ticking = true
      $.clock.every(1000, () => {
        void update($, now, () => Date.now())
      })
    }
    return r
  })

  on('turn.step', async function* ($, e, next) {
    const r = yield* next(e)
    if (e.agentId === undefined && r.usage) {
      const { context } = await $.session.usage()
      const s: CacheSnap = {
        lastAt: Date.now(),
        wasHit: r.usage.cache_read_input_tokens > 0,
        percent: context.percent ?? null,
        tokens: context.tokens ?? null,
      }
      await update($, snap, () => s)
      if (!ticking) {
        ticking = true
        $.clock.every(1000, () => {
          void update($, now, () => Date.now())
        })
      }
    }
    return r
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const s = await read($, snap)
    if (e.props.hasSurvey || s === null) return next(e)

    const t = (await read($, now)) || Date.now()
    const left = s.lastAt + ttlMs - t
    const isWarm = left > 0
    const { Box, Text } = $.ui.resolve(e)
    const ctx =
      s.percent === null
        ? 'kontext: -'
        : `kontext: ${s.percent}%${s.tokens ? ` (${Math.round(s.tokens / 1000)}k)` : ''}`

    return (
      <Box>
        <Text dimColor>{ctx} · </Text>
        {isWarm ? (
          <Text color={left < 60_000 ? 'yellow' : 'green'}>
            cache varm, {fmt(left)} kvar
          </Text>
        ) : (
          <Text color="red">cache kall, {fmt(-left)} sedan den dog</Text>
        )}
        <Text dimColor>{s.wasHit ? ' · senaste: träff' : ' · senaste: miss'}</Text>
      </Box>
    )
  })
}
