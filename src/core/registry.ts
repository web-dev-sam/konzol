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
        else: `Object.keys(v).length`,
      })
    },
  },
  {
    alias: ['search', 's'],
    builder(str: string, query: string) {
      return casesBuilder(str, {
        arr: `__kzl_search(v, ${query})`,
        map: `__kzl_search(v, ${query})`,
        set: `__kzl_search(v, ${query})`,
        null: `null`,
        num: `__kzl_search(v, ${query})`,
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
        num: `+v`,
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
        else: `v`,
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
        else: `Object.entries(v).map(o=>o[1]).reduce((a,b)=>isNaN(a+b)?0:a+b,0)`,
      })
    },
  },
] satisfies Operation[]

export const aliases = operations.flatMap((e) => e.alias)
export type Operation = {
  alias: string[]
  builder: (str: string, ...args: any[]) => string
}
