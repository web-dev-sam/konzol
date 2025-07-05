export function overwrite(str: string, startOffset: number, endOffset: number, replacement: string): string {
  return str.slice(0, startOffset) + replacement + str.slice(endOffset)
}
