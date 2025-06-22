import { parse } from '@babel/parser';
import * as types from '@babel/types';
import _generate from '@babel/generator';
import _traverse from '@babel/traverse';

// Ensure esm-commonjs compatibility
export const traverse = (
  typeof _traverse === 'function' ? _traverse : (_traverse as any).default
) as typeof _traverse
export const generate = (
  typeof _generate === 'function' ? _generate : (_generate as any).default
) as typeof _generate

export {
  parse,
  types
}