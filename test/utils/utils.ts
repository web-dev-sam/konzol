import { transform } from "../../src/core/transform"
import fs from 'fs'
import path from 'path'
import { expect, vi } from "vitest"

const virtualModule = fs.readFileSync(
  path.resolve(__dirname, '../../assets/virtual-module.min.js'),
  'utf-8'
)

type RunOptions = {
  id?: string,
  loadVirtual?: boolean
}

export async function run(code: string, {
  id = 'main.ts',
  loadVirtual = false
}: RunOptions = {}) {
  const transformedCode = (transform(code, id,
    {
      functionName: 'log!',
      entry: 'src/tests/dev/main.ts',
    }
  ) as any)?.code
  return await eval((loadVirtual ? virtualModule : '') + transformedCode) ?? ''
}

export async function expectResult(code: string, expected: unknown[], options: RunOptions = {}) {
  const log = vi.mocked(console.log)
  await run(code, options)
  expect(log).toHaveBeenCalledWith(...expected)
}


type ErrorOptions = {
  onlyServerSide?: boolean
}
export const RED = '\x1b[31m'
export const RESET = '\x1b[0m'
export async function expectError(code: string, expected: unknown[], options: RunOptions & ErrorOptions = {}) {
  const error = vi.mocked(console.error)
  await run(code, options)
  // Vite error
  expect(error).toHaveBeenCalledWith(RED, ...expected, RESET)
  // Injected app error
  if (!options.onlyServerSide)
    expect(error).toHaveBeenCalledWith(RED, ...expected, RESET)
}