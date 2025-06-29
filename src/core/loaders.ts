
export function vueLoader(codeStr: string, id: string): string | null {
  if (id.endsWith('.vue')) {
    const scriptMatch = codeStr.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (!scriptMatch || !scriptMatch.index) return null
    return scriptMatch[1]
  }
  return null
}
