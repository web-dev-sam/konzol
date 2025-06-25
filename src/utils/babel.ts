import _generate from '@babel/generator'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import * as types from '@babel/types'

// biome-ignore lint/suspicious/noExplicitAny: babel, man, make yo shit esm please
const __generate = _generate as any
// biome-ignore lint/suspicious/noExplicitAny: babel, man, make yo shit esm please
const __traverse = _traverse as any

// Ensure esm-commonjs compatibility
export const traverse = (typeof _traverse === 'function' ? __traverse : __traverse.default) as typeof _traverse
export const generate = (typeof _generate === 'function' ? __generate : __generate.default) as typeof _generate

export { parse, types }
