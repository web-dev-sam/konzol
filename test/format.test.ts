import { beforeEach, describe, expect, it, vi } from 'vitest'
import { expectError, expectResult, RESET, run } from './utils/utils'

const dataUsers = fetch('https://jsonplaceholder.typicode.com/users').then(r => r.json())

vi.stubGlobal('console', {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
})

describe('simple formatter syntax', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should ignore code with no macros', async () => {
    const error = vi.mocked(console.error)
    await run(`const log = () => 8; log()`)
    expect(error).toHaveBeenCalledTimes(0)
  })

  it('should error when no arguments provided', async () => {
    await expectError(`log!()`, 'Call to')
  })

  it('should error when first argument is not a string', async () => {
    await expectError(`log!(42, 42)`, 'First argument')
  })

  it('should log a plain string', async () => {
    const info = vi.mocked(console.info)
    await expectResult(`log!("42")`, ['42'])
    expect(info).toBeCalledWith(expect.stringContaining('Hydrate macros'), RESET)
  })

  it('should log undefined when placeholder has no argument', async () => {
    await expectResult(`log!("{}")`, [undefined])
  })

  it('should substitute placeholder with argument', async () => {
    await expectResult(`log!("{}", 6)`, [6])
  })

  it('should split string with placeholder at start', async () => {
    await expectResult(`log!("H{}", 6)`, ['H', 6])
  })

  it('should split string with placeholder at end', async () => {
    await expectResult(`log!("{}H", 6)`, [6, 'H'])
  })

  it('should split string with placeholder in middle', async () => {
    await expectResult(`log!("H{}J", 6)`, ['H', 6, 'J'])
  })

  it('should preserve whitespace around placeholders', async () => {
    await expectResult(`log!(" {}J", 6)`, [' ', 6, 'J'])
  })

  it('should handle multiple placeholders with insufficient arguments', async () => {
    await expectResult(`log!("{}{}", 1)`, [1, undefined])
  })

  it('should handle multiple placeholders with matching arguments', async () => {
    await expectResult(`log!("{}{}", 6, 9)`, [6, 9])
  })

  it('should handle simple placeholder replacement', async () => {
    await expectResult(`log!("Hello {}", "World")`, ['Hello ', 'World'])
  })

  it('should handle mixed types in placeholders', async () => {
    await expectResult(`log!("Number: {}, String: {}, Boolean: {}", 42, "test", true)`, ['Number: ', 42, ', String: ', 'test', ', Boolean: ', true])
  })

  it('should extract simple object properties', async () => {
    await expectResult(
      'log!("Name: {name}", { name: "John", age: 30 })',
      ['Name: ', { name: 'John' }],
      { loadVirtual: true },
    )
  })

  it('should handle multiple placeholders with excessive arguments', async () => {
    await expectResult(`log!("{}{}", 6, 9, 42)`, [6, 9])
    await expectError(`log!("{ }{}", 6, 9)`, 'Invalid formatter string')
  })
})

describe('formatter with modifiers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log undefined when placeholder has no argument', async () => {
    await expectResult(`log!("{:n}")`, [null], { loadVirtual: true })
  })

  it('numbers have no keys', async () => {
    await expectResult(`log!("{:k}", 6)`, [[]])
  })

  it('numbers values are just themselves', async () => {
    await expectResult(`log!("{:v}", 6)`, [6])
  })

  it('complex modifiers', async () => {
    await expectResult(`log!("{*.address.geo.lat}", [])`, [{}], { loadVirtual: true })
  })
})

describe('macro positioning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle in fetch then', async () => {
    const expectedObj = await dataUsers
    await expectResult(`
      fetch('https://jsonplaceholder.typicode.com/users')
        .then((r) => r.json())
        .then((users) => {
          log!('Original: {}', users)
        })
    `, ['Original: ', expect.objectContaining(expectedObj)])
  })

  it('nested macros are replaced with null', async () => {
    const log = vi.mocked(console.log)
    await run(`
      log!('Original: {}', log!('{}', 9))
    `)
    expect(log).toHaveBeenCalledWith('Original: ', null)
  })
})
