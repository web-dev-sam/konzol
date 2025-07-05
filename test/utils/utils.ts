import fs from 'node:fs'
import path from 'node:path'
import { expect, vi } from 'vitest'
import { transform } from '../../src/core/transform'
import { grayPrefixed, greenPrefixed, redPrefixed, yellowPrefixed } from '../../src/utils/utils'

const virtualModule = fs.readFileSync(
  path.resolve(__dirname, '../../assets/virtual-module.min.js'),
  'utf-8',
)

interface RunOptions {
  id?: string
  loadVirtual?: boolean
}

export async function run(code: string, {
  id = 'main.ts',
  loadVirtual = false,
}: RunOptions = {}): Promise<unknown> {
  const transformedCode = (transform(code, id, {
    functionName: 'log!',
    entry: 'src/tests/dev/main.ts',
  }) as any)?.code
  try {
    // eslint-disable-next-line no-eval
    return await eval((loadVirtual ? virtualModule : '') + transformedCode) ?? ''
  }
  catch (e) {
    throw new Error(`${e}\n${transformedCode}\n`)
  }
}

export async function expectResult(code: string, expected: unknown[], options: RunOptions = {}): Promise<void> {
  const log = vi.mocked(console.log)
  await run(code, options)
  expect(log).toHaveBeenCalledWith(...expected)
}

export async function expectError(code: string, msg: string, options: RunOptions = {}): Promise<void> {
  const error = vi.mocked(console.error)
  await run(code, options)
  expectToBeCalledWith(error, 'error', msg)
}

export const RESET = '\x1B[0m'
export function expectToBeCalledWith(mock: any, type: 'error' | 'warn' | 'success' | 'log', msg: string): void {
  expect(mock).toHaveBeenCalledWith(
    expect.stringContaining({
      error: redPrefixed(''),
      warn: yellowPrefixed(''),
      success: greenPrefixed(''),
      log: grayPrefixed(''),
    }[type] + msg),
    RESET,
  )
}
