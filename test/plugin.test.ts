import { beforeEach, describe, expect, it, vi } from 'vitest'
import { transform } from '../src/core/transform'
import { expectToBeCalledWith, run } from './utils/utils'

vi.stubGlobal('console', {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
})

describe('invalid plugin usage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle missing plugin parameters', async () => {
    const error = vi.mocked(console.error)
    // eslint-disable-next-line no-eval
    await eval(
      transform('', 'main.ts', undefined!,
      ) as any,
    )
    expectToBeCalledWith(error, 'error', 'Options are not provided')
  })

  it('should handle missing option fields', async () => {
    const error = vi.mocked(console.error)
    // eslint-disable-next-line no-eval
    await eval(
      transform('', 'main.ts', {} as any,
      ) as any,
    )

    expectToBeCalledWith(error, 'error', 'Options are not provided')
  })

  it('should ignore non-supported files', async () => {
    // eslint-disable-next-line no-eval
    const result = await eval(
      transform('', 'main.json', {} as any,
      ) as any,
    )?.error
    expect(result).toBe(undefined)
  })
})

describe('loaders', () => {
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
