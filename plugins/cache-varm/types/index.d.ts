export type CacheSnap = {
  /** När senaste svar från huvudtråden kom (ms). */
  lastAt: number
  /** Om senaste anropet läste från cachen. */
  wasHit: boolean
  /** Kontext i procent av fönstret. */
  percent: number | null
  /** Kontext i tokens. */
  tokens: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'cache-varm': { snap: CacheSnap | null; now: number }
  }
}
