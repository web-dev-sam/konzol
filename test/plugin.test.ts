import { expect, it, describe, vi, beforeEach } from 'vitest'
import { transform } from '../src/core/transform'
import { run } from './utils/utils'

const RED = '\x1b[31m'
const RESET = '\x1b[0m'

vi.stubGlobal('console', {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
})

describe('Invalid plugin usage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle missing plugin parameters', async () => {
    const error = vi.mocked(console.error)
    await eval(
      transform('', 'main.ts',
        undefined!
      ) as any
    )
    expect(error).toHaveBeenCalledWith(RED, expect.stringContaining('Konzol:'), RESET)
  })

  it('should handle missing option fields', async () => {
    const error = vi.mocked(console.error)
    await eval(
      transform('', 'main.ts',
        {} as any
      ) as any
    )
    expect(error).toHaveBeenCalledWith(RED, expect.stringContaining('Konzol:'), RESET)
  })

  it('should ignore non-supported files', async () => {
    const result = await eval(
      transform('', 'main.json',
        {} as any
      ) as any
    )?.error
    expect(result).toBe(undefined)
  })
})


describe('Loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load .vue files', async () => {
    const log = vi.mocked(console.log)
    await run(`
      <script setup lang="ts">
        log!('{}', 42)
      </script>
      <template>
        <div>Test</div>
      </template>
    `, { id: 'App.vue' })
    expect(log).toHaveBeenCalledWith(42)
  })

  it('should ignore .vue files without script', async () => {
    const log = vi.mocked(console.log)
    await run(`
      <template>
        <div>Test</div>
      </template>
    `, { id: 'App.vue' })
    expect(log).toHaveBeenCalledTimes(0)
  })

  it('should ignore .vue files without macros', async () => {
    const log = vi.mocked(console.log)
    await run(`
      <template>
        <div>Test</div>
      </template>
      <script></script>
    `, { id: 'App.vue' })
    expect(log).toHaveBeenCalledTimes(0)
  })
})
