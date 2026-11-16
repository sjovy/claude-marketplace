import { expect, test } from 'claude-code/testing'

const BAND = { plugin: 'cache-varm', component: 'AbovePrompt', props: { hasSurvey: false } } as const

const seed = (lastAt: number) => (_: unknown, e: { key: string }) =>
  e.key === 'snap'
    ? { value: { value: { lastAt, wasHit: true, percent: 42, tokens: 84000 }, version: 1 } }
    : { value: { value: Date.now(), version: 1 } }

test('varm cache visar nedräkning', async ($, on) => {
  on('state.get', seed(Date.now() - 60_000) as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface } as never)
    expect((await ui.find({ type: 'Text', text: /cache varm, 4:0\d kvar/ }))?.text).toBeTruthy()
    expect((await ui.find({ type: 'Text', text: /kontext: 42% \(84k\)/ }))?.text).toBeTruthy()
    await ui.unmount()
  }
})

test('kall cache efter TTL', async ($, on) => {
  on('state.get', seed(Date.now() - 7 * 60_000) as never)
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' } as never)
  expect((await ui.find({ type: 'Text', text: /cache kall/ }))?.text).toBeTruthy()
  await ui.unmount()
})
