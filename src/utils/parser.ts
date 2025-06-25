import { parse as peggyParse } from '../parser/parser'

export function konzolParse(input: string): ParseResult {
  const result = peggyParse(input)
  return result as ParseResult
}

export function isLiteralExpression(node: Expression): node is LiteralExpression {
  return node.type === 'literal'
}

export function isVariableExpression(node: Expression): node is VariableExpression {
  return node.type === 'variable'
}

export function isTextExpression(node: Expression): node is TextExpression {
  return node.type === 'text'
}

export function isIdentifierSegment(segment: PathSegment): segment is IdentifierSegment {
  return segment.type === 'identifier'
}

export function isWildcardSegment(segment: PathSegment): segment is WildcardSegment {
  return segment.type === 'wildcard'
}

export function isLiteralSegment(segment: PathSegment): segment is LiteralSegment {
  return segment.type === 'literal'
}

export function isNestedVariableSegment(segment: PathSegment): segment is VariableExpression {
  return segment.type === 'variable'
}

export function isFunctionExpression(node: ASTNode): node is FunctionExpression {
  return node.type === 'function'
}

interface ASTNode {
  type: string
}

export interface LiteralExpression extends ASTNode {
  type: 'literal'
  value: string
}

export interface VariableExpression extends ASTNode {
  type: 'variable'
  path: PathSegment[]
  modifiers: FunctionExpression[] | null
}

export interface TextExpression extends ASTNode {
  type: 'text'
  value: string
}

// Path segment types
export interface IdentifierSegment extends ASTNode {
  type: 'identifier'
  name: string
}

export interface WildcardSegment extends ASTNode {
  type: 'wildcard'
}

export interface LiteralSegment extends ASTNode {
  type: 'literal'
  value: string
}

export type PathSegment = IdentifierSegment | WildcardSegment | LiteralSegment | VariableExpression

export interface FunctionExpression extends ASTNode {
  type: 'function'
  content: string
  /**
   * true if wrapped in parentheses, false if implicit
   */
  explicit: boolean
}

export type Expression = LiteralExpression | VariableExpression | TextExpression
export type ParseResult = Expression[]
