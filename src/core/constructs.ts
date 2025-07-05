interface CreateRootOptions {
  body: string
  args?: string
  declarations?: string
  strategy?: 'log' | 'error'
}
export function createRoot({ body, args = '$', declarations = 'v', strategy = 'log' }: CreateRootOptions): string {
  return /* js */`;(async(_,${args})=>{${!declarations ? '' : `let ${declarations};`}console.${strategy}(${body})})`
}

export function createString(content: string): string {
  return `'${content.replaceAll('\'', '\\\'')}'`
}
