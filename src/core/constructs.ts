
type CreateRootOptions = {
  body: string,
  args?: string,
  declarations?: string,
  strategy?: 'log' | 'error'
}
export function createRoot({ body, args = '$', declarations = 'v', strategy = 'log' }: CreateRootOptions) {
  return /*js*/`;(async(_,${args})=>{${!declarations ? '' : `let ${declarations};`}console.${strategy}(${body})})`
}

export function createString(content: string) {
  return `'${content.replaceAll("'", "\\'")}'`
}