import { beforeEach, describe, expect, it, vi } from 'vitest'
import { transform } from '../src/core/transform'
import { expectError, run } from './utils/utils'

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

  // it('should handle missing plugin parameters', async () => {
  //   const error = vi.mocked(console.error)
  //   // eslint-disable-next-line no-eval
  //   await eval(
  //     transform('', 'main.ts', undefined!,
  //     ) as any,
  //   )
  //   expectToBeCalledWith(error, 'error', 'Options are not provided')
  // })

  // it('should handle missing option fields', async () => {
  //   const error = vi.mocked(console.error)
  //   // eslint-disable-next-line no-eval
  //   await eval(
  //     transform('', 'main.ts', {} as any,
  //     ) as any,
  //   )

  //   expectToBeCalledWith(error, 'error', 'Options are not provided')
  // })

  it('should ignore non-supported files', async () => {
    // eslint-disable-next-line no-eval
    const result = await eval(

      transform('', 'main.json', {}) as any,

    )?.error as any
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

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle custom macro name', async () => {
    const log = vi.mocked(console.log)
    await run(`yoo('YOOO???')`, { id: 'main.jsx' }, {
      macroName: 'yoo',
    })
    expect(log).toHaveBeenCalledWith('YOOO???')
  })

  it('should warn about invalid custom macro name', async () => {
    await expectError('!yoo(\'YOOO???\')', 'Invalid macro name', { id: 'main.ts' }, {
      macroName: '!yoo',
    })
  })

  it('should warn about invalid custom macro name 2', async () => {
    await expectError('yoo!!(\'YOOO???\')', 'Invalid macro name', { id: 'main.tsx' }, {
      macroName: 'yoo!!',
    })
  })

  it('should accept valid macro name', async () => {
    await expectError('yoo!(\'YOOO???\')', 'Macro names ending with "!" are only supported in TypeScript files', { id: 'main.js' }, {
      macroName: 'yoo!',
    })
  })

  it('should warn about ts syntax macro in js files', async () => {
    await expectError('yoo!(\'YOOO???\')', 'Macro names ending with "!" are only supported in TypeScript files', { id: 'main.jsx' }, {
      macroName: 'yoo!',
    })
  })
})
