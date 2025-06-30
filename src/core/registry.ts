import { casesBuilder } from "./builder"

export const operations = [
  {
    alias: ['v', 'values', 'value'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: 'v',
        map: `[...v.values()]`,
        set: `[...v]`,
        null: `null`,
        num: `v`,
        str: `v.split('')`,
        else: `Object.values(v)`,
      })
    },
  },
  {
    alias: ['k', 'keys', 'key'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `v.map((_,i)=>i)`,
        map: `[...v.keys()]`,
        set: `[...v].map((_,i)=>i)`,
        null: `null`,
        num: `[]`,
        str: `v`,
        else: `Object.keys(v)`,
      })
    },
  },
  {
    alias: ['u', 'unique', 'uniq'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `[...new Set(v)]`,
        map: `[...new Set(v.values())]`,
        set: `[...v]`,
        null: `null`,
        num: `v`,
        str: `[...new Set(v.split(''))].join('')`,
        else: `Object.fromEntries(Object.entries(v).filter(([k,w],i,a)=>a.findIndex(([k2,w2])=>w2===w)===i))`,
      })
    }
  },
  {
    alias: ['c', 'count', 'len', 'length'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `v.length`,
        map: `v.size`,
        set: `v.size`,
        null: `null`,
        num: `1`,
        str: `v.length`,
        else: `Object.keys(v).length`,
      })
    },
  },
  {
    alias: ['search', 's', '@', (s: string) => s.startsWith('@')],
    builder(str: string, query: string) {
      return casesBuilder(str, {
        arr: `__kzl_search(v, ${query})`,
        map: `__kzl_search(v, ${query})`,
        set: `__kzl_search(v, ${query})`,
        null: `null`,
        num: `__kzl_search(v, ${query})`,
        str: `__kzl_search(v, ${query})`,
        else: `__kzl_search(v, ${query})`,
      })
    },
  },
  {
    alias: ['gt'],
    builder(str: string, num: number) {
      return casesBuilder(str, {
        arr: `v.filter(e=>e>${num})`,
        map: `[...v.values()].filter(e=>e>${num})`,
        set: `[...v].filter(e=>e>${num})`,
        null: `null`,
        num: `v>${num}?v:null`,
        str: `v`,
        else: `Object.fromEntries(Object.entries(v).filter(([k,w])=>w>${num}))`,
      })
    },
  },
  {
    alias: ['lt'],
    builder(str: string, num: number) {
      return casesBuilder(str, {
        arr: `v.filter(e=>e<${num})`,
        map: `[...v.values()].filter(e=>e<${num})`,
        set: `[...v].filter(e=>e<${num})`,
        null: `null`,
        num: `v<${num}?v:null`,
        str: `v`,
        else: `Object.fromEntries(Object.entries(v).filter(([k,w])=>w<${num}))`,
      })
    },
  },
  {
    alias: ['gte'],
    builder(str: string, num: number) {
      return casesBuilder(str, {
        arr: `v.filter(e=>e>=${num})`,
        map: `[...v.values()].filter(e=>e>=${num})`,
        set: `[...v].filter(e=>e>=${num})`,
        null: `null`,
        num: `v>=${num}?v:null`,
        str: `v`,
        else: `Object.fromEntries(Object.entries(v).filter(([k,w])=>w>=${num}))`,
      })
    },
  },
  {
    alias: ['lte'],
    builder(str: string, num: number) {
      return casesBuilder(str, {
        arr: `v.filter(e=>e<=${num})`,
        map: `[...v.values()].filter(e=>e<=${num})`,
        set: `[...v].filter(e=>e<=${num})`,
        null: `null`,
        num: `v<=${num}?v:null`,
        str: `v`,
        else: `Object.fromEntries(Object.entries(v).filter(([k,w])=>w<=${num}))`,
      })
    },
  },
  {
    alias: ['n', 'number', 'num'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `v.map(e=>+e)`,
        map: `Object.fromEntries(Object.entries(v).map(([k,w])=>+w))`,
        set: `[...v].map(e=>+e)`,
        null: `null`,
        num: `v`,
        str: `+v`,
        else: `Object.fromEntries(Object.entries(v).map(([k,w])=>+w))`,
      })
    },
  },
  {
    alias: ['first', '0'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `v[0]`,
        map: `[...v][0]`,
        set: `[...v][0]`,
        null: `null`,
        num: `v`,
        str: `v.at(0)`,
        else: `Object.values(v)[0]`,
      })
    },
  },
  {
    alias: ['last'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `v[v.length-1]`,
        map: `[...v][v.size-1]`,
        set: `[...v][v.size-1]`,
        null: `null`,
        num: `v`,
        str: `v.at(-1)`,
        else: `v`,
      })
    },
  },
  {
    alias: ['sum'],
    builder(str: string) {
      return casesBuilder(str, {
        arr: `v.reduce((a,b)=>isNaN(a+b)?0:a+b,0)`,
        map: `[...v].reduce((a,b)=>isNaN(a+b)?0:a+b,0)`,
        set: `[...v].reduce((a,b)=>isNaN(a+b)?0:a+b,0)`,
        null: `null`,
        num: `v`,
        str: `v`,
        else: `Object.entries(v).map(o=>o[1]).reduce((a,b)=>isNaN(a+b)?0:a+b,0)`,
      })
    },
  },{
  alias: ['lower', 'lowercase'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.toLowerCase() : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.toLowerCase() : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.toLowerCase() : e))`,
      null: `null`,
      num: `v`,
      str: `v.toLowerCase()`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.toLowerCase() : w]))`,
    })
  },
},
{
  alias: ['upper', 'uppercase'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.toUpperCase() : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.toUpperCase() : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.toUpperCase() : e))`,
      null: `null`,
      num: `v`,
      str: `v.toUpperCase()`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.toUpperCase() : w]))`,
    })
  },
},
{
  alias: ['snake', 'snake_case', '_'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase() : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase() : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase() : e))`,
      null: `null`,
      num: `v`,
      str: `v.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase()`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase() : w]))`,
    })
  },
},
{
  alias: ['kebab', 'kebab-case', '-'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase() : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase() : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase() : e))`,
      null: `null`,
      num: `v`,
      str: `v.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase() : w]))`,
    })
  },
},
{
  alias: ['camel', 'camelCase', 'cc'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '') : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '') : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '') : e))`,
      null: `null`,
      num: `v`,
      str: `v.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '') : w]))`,
    })
  },
},
{
  alias: ['capitalize', 'cap'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.charAt(0).toUpperCase() + e.slice(1).toLowerCase() : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.charAt(0).toUpperCase() + e.slice(1).toLowerCase() : e))`,
      null: `null`,
      num: `v`,
      str: `v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w]))`,
    })
  },
},
{
  alias: ['trim'],
  builder(str: string) {
    return casesBuilder(str, {
      arr: `v.map(e => typeof e === 'string' ? e.trim() : e)`,
      map: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.trim() : w]))`,
      set: `new Set([...v].map(e => typeof e === 'string' ? e.trim() : e))`,
      null: `null`,
      num: `v`,
      str: `v.trim()`,
      else: `Object.fromEntries(Object.entries(v).map(([k,w]) => [k, typeof w === 'string' ? w.trim() : w]))`,
    })
  },
}
] satisfies Operation[]

export const aliases = operations.flatMap((e) => e.alias)
export type Operation = {
  alias: (string | ((s: string) => boolean))[]
  builder: (str: string, ...args: any[]) => string
}



// string coding chars
// a-zA-Z0-9_
// .,;: []{}() <>@$%#?!= ~&| *+-/\^

// Categories of syntax
// 1. Arbitrary functions `(func)` `(func|func2)`
// 2. Injected variables `{}` `{varA}`
// 3. Literal props `[any(thing){is literal}]` // Result: "any(thing){is literal}"

// Features:
// 2. Injected Variables
//   2.2. `{varA.propA.0.propB}` `{varA.propA.*.propB}``{varA.prop[.]A.*.propB}`
//   2.3. `{varA:.4}`          -> 3.1415
//        `{varA:,}`           -> 300,000,000
//        `{varA:.4,}` `{varA:,.4}` -> 300,000,000.1234
//        `{varA:<8}`          -> "    hello"      (right aligned text)
//        `{varA:>8}`          -> "hello    "      (left aligned text)
//        `{varA:^12}`         -> "    helo    "   (centered text)
//        `{varA:#^12}`        -> "####helo####"        (centered text)
//        `{{varA:^6}:#^12}`   -> "### helo ###"   (centered text)
//        `{varA:^6|#^12}`     -> "### helo ###"   (centered text)
//        `{varA:?}`           -> "helo\n    at <anonymous>:1:1"   (stack-trace)
//        `{varA:(lower|upper|snake|kebab|camel|capitalize|repeat(3)|trim|first|last|center(12,#)|oneline|red|green|blue|<#fff>|italic|bold)}` -> ...
//        `{varA:@[exactly this.]}` -> Search for any key or value that exactly matches 'exactly this.'
//        `{varA:@.search}`  -> Search for any key that includes 'search' in it
//        `{varA:@@search}`  -> Search for any value that includes 'search' in it
//        `{varA:@%regex%}`  -> Search for any key or value that matches the regex
//        `{varA:@.%regex%}` -> Search for any key that matches the regex
//        `{varA:@@%regex%}` -> Search for any value that matches the regex
//        `{varA:@@%regex%i}` -> Search for any value that matches the regex with flags

// Syntax:
// RootExpression:     `{VariableExpression:ModifierExpression}`
// ModifierExpression: `(FunctionExpression)` or `(FunctionExpression|FunctionExpression)`
// FunctionExpression: `FunctionName` or `FunctionName(ArgumentList)` or `Shorthand`
// ArgumentList:      `Argument` or `Argument, Argument` or `Argument, Argument, ...`
// Shorthand:         `(anything here ...)` or `@search` or `@.search` or `@@search` or `@@%regex%`
//                    or `?` or `<5` or `>5` or `^12` or `#^12` or ...
// ...

// API
// $format(format: Format, ...args: any[]): string
// $log(format: Format, ...args: any[]): void
// $warn(format: Format, ...args: any[]): void
// $error(format: Format, ...args: any[]): void
// $info(format: Format, ...args: any[]): void
// $debug(format: Format, ...args: any[]): void
