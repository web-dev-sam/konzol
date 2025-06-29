import { expect, it, describe, vi, beforeEach } from 'vitest'
import { expectError, expectResult, RED, RESET, run } from './utils/utils'

const dataUsers = fetch('https://jsonplaceholder.typicode.com/users').then((r) => r.json())

vi.stubGlobal('console', {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
})

describe('Simple formatter syntax', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should ignore code with no macros', async () => {
    const error = vi.mocked(console.error)
    await run(`const log = () => 8; log()`)
    expect(error).toHaveBeenCalledTimes(0)
  })

  it('should error when no arguments provided', async () => {
    await expectError(`log!()`, [expect.stringContaining('Konzol: Call to')])
  })

  it('should error when first argument is not a string', async () => {
    await expectError(`log!(42, 42)`, [expect.stringContaining('Konzol: First argument')])
  })

  it('should log a plain string', async () => {
    const info = vi.mocked(console.info)
    await expectResult(`log!("42")`, ["42"])
    expect(info).toHaveBeenCalledWith(expect.stringContaining('Konzol: Temporarily injected code size'))
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

  it('should handle multiple placeholders with excessive arguments', async () => {
    await expectResult(`log!("{}{}", 6, 9, 42)`, [6, 9])
  })

  it('should handle multiple placeholders with excessive arguments', async () => {
    await expectError(`log!("{ }{}", 6, 9)`, [expect.stringContaining('Konzol: Invalid formatter string')])
  })
})


describe('Formatter with modifiers', () => {
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
    await expectResult(`log!("{*.address.geo.lat}", [])`, [[]], { loadVirtual: true })
  })
})


describe('Macro positioning', () => {
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





// string coding chars
// a-zA-Z0-9_
// .,;: []{}() <>@$%#?!= ~&| *+-/\^

// Categories of syntax
// 1. Arbitrary functions `(func)` `(func|func2)`
// 2. Injected variables `{}` `{varA}`
// 3. Literal props `[any(thing){is literal}]` // Result: "any(thing){is literal}"

// Features:
// 2. Injected Variables
//   2.1. `{varA}` `{varB}` `{varC}`
//   2.2. `{varA.propA.0.propB}` `{varA.propA.*.propB}``{varA.prop[.]A.*.propB}`
//   2.3. `{varA:.4}`          -> 3.1415
//        `{varA:,}`           -> 300,000,000
//        `{varA:.4,}` `{varA:,.4}` -> 300,000,000.1234
//        `{varA:<8}`          -> "    hello"      (right aligned text)
//        `{varA:>8}`          -> "hello    "      (left aligned text)
//        `{varA:^12}`         -> "    helo    "   (centered text)
//        `{varA:#^12}`        -> "####helo####"        (centered text)
//        `{{varA:^6}:#^12}`   -> "### helo ###"   (centered text)
//        `{varA:^6|#^12}`     -> "### helo ###"   (centered text)
//        `{varA:(^6)|(#^12)}` -> "### helo ###"   (centered text)
//        `{varA:?}`           -> "helo\n    at <anonymous>:1:1"   (stack-trace)
//        `{varA:(lower|upper|snake|kebab|camel|capitalize|repeat(3)|trim|first|last|center(12,#)|oneline|red|green|blue|<#fff>|italic|bold)}` -> ...
//        `{varA:@search}`   -> Search for any key or value that includes 'search' in it
//        `{varA:@[exactly this.]}` -> Search for any key or value that exactly matches 'exactly this.'
//        `{varA:@.search}`  -> Search for any key that includes 'search' in it
//        `{varA:@@search}`  -> Search for any value that includes 'search' in it
//        `{varA:@%regex%}`  -> Search for any key or value that matches the regex
//        `{varA:@.%regex%}` -> Search for any key that matches the regex
//        `{varA:@@%regex%}` -> Search for any value that matches the regex
//        `{varA:@@%regex%i}` -> Search for any value that matches the regex with flags

// Syntax:
// RootExpression:     `{VariableExpression:ModifierExpression}`
// ModifierExpression: `(FunctionExpression)` or `(FunctionExpression|FunctionExpression)`
// FunctionExpression: `FunctionName` or `FunctionName(ArgumentList)` or `Shorthand`
// ArgumentList:      `Argument` or `Argument, Argument` or `Argument, Argument, ...`
// Shorthand:         `(anything here ...)` or `@search` or `@.search` or `@@search` or `@@%regex%`
//                    or `?` or `<5` or `>5` or `^12` or `#^12` or ...
// ...

// API
// $format(format: Format, ...args: any[]): string
// $log(format: Format, ...args: any[]): void
// $warn(format: Format, ...args: any[]): void
// $error(format: Format, ...args: any[]): void
// $info(format: Format, ...args: any[]): void
// $debug(format: Format, ...args: any[]): void
