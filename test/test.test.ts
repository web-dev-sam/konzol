import { expect, test } from 'vitest'
import { transform } from '../src/core/transform'

test('Invalid plugin usage', async () => {
  const result1 = await eval(
    transform('', 'main.ts',
      undefined!,
      true
    ) as any
  )?.error
  expect(result1?.startsWith('Konzol:')).toBe(true)

  const result2 = await eval(
    transform('', 'main.ts',
      {} as any,
      true
    ) as any
  )?.error
  expect(result2?.startsWith('Konzol:')).toBe(true)
})


test('Basic {}', async () => {
  expect(await run(`
    log!('Original:  {}', 42)
  `)).toEqual(42)
})


async function run(code: string) {
  const transformedCode = (transform(code, 'main.ts',
      {
        functionName: 'log!',
        entry: 'src/tests/dev/main.ts',
      },
      true
    ) as any)?.code
  return await eval(transformedCode) ?? ''
}
