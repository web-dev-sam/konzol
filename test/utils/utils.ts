import type { Options } from '../../src/types'
import fs from 'node:fs'
import path from 'node:path'
import { expect, vi } from 'vitest'
import { transform } from '../../src/core/transform'
import { boldRedPrefixed, grayPrefixed, greenPrefixed, yellowPrefixed } from '../../src/utils/utils'

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
}: RunOptions = {}, options: Partial<Options> = {}): Promise<unknown> {
  const transformedCode = (transform(code, id, {
    macroName: 'log!',
    ...options,
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

export async function expectError(code: string, msg: string, runOptions: RunOptions = {}, pluginOptions: Options = {}): Promise<void> {
  const error = vi.mocked(console.error)
  await run(code, runOptions, pluginOptions)
  expectToBeCalledWith(error, 'error', msg)
}

export const RESET = '\x1B[0m'
export function expectToBeCalledWith(mock: any, type: 'error' | 'warn' | 'success' | 'log', msg: string): void {
  const prefixes = {
    error: boldRedPrefixed(msg),
    warn: yellowPrefixed(msg),
    success: greenPrefixed(msg),
    log: grayPrefixed(msg),
  }

  expect(mock).toHaveBeenCalledWith(
    expect.stringContaining(prefixes[type]),
    RESET,
  )
}
