import { isIdentifierSegment, isTextExpression, isVariableExpression, isWildcardSegment, type ParseResult, type FunctionExpression } from "../utils/parser";

export function build(
  ast: ParseResult
) {
  let resultExpression = '';

  for (const konzolNodeIndex in ast) { // DFS
    const konzolNode = ast[konzolNodeIndex];
    if (isTextExpression(konzolNode)) {
      resultExpression += `"${konzolNode.value}"`;
    }
    else if (isVariableExpression(konzolNode)) {
      // TODO: The order of functions is important
      if (konzolNode.path.length === 0) { // "{}"
        const modifiedArg = applyModifiers(`a`, konzolNode.modifiers)
        resultExpression += `, ${modifiedArg}`
      } else {
        const path = konzolNode.path.map(part => {
          if (isIdentifierSegment(part)) {
            return part.name;
          } // else if (isNestedVariableSegment(part)) {
          else if (isWildcardSegment(part)) {
            return '*';
          }
          return '';
        });
        const modifiedArg = applyModifiers(`v`, konzolNode.modifiers)

        resultExpression += `${+konzolNodeIndex > 0 ? ',' : ''}(v=__kzl_find(a, ${JSON.stringify(path)}),${modifiedArg})`;
      }
    }
  }

  const resultCode = `async(_,a)=>{let v;console.log(${resultExpression})}`
  // console.log("------")
  // console.log(resultCode)
  // console.log("------")

  return resultCode
}

type HandledType = 'null' | 'arr' | 'map' | 'set' | 'num' | 'else';
type SafeCasesMap = {
  [K in HandledType]: string;
};
function casesBuilder(checkedVal: string, cases: SafeCasesMap) {
  return `await __kzl_cases(${checkedVal},{` +
    Object.entries(cases).map(([prim, code]) => `${prim}:async()=>${code}`).join(',')
    + `})`
}

const values = (str: string) => casesBuilder(str, {
  arr: str,
  map: `[...${str}.values()]`,
  set: `[...${str}]`,
  null: `null`,
  num: `${str}`,
  else: `Object.values(${str})`
})
const keys = (str: string) => casesBuilder(str, {
  arr: `${str}.map((_,i)=>i)`,
  map: `[...${str}.keys()]`,
  set: `[...${str}].map((_,i)=>i)`,
  null: `null`,
  num: `${str}`,
  else: `Object.keys(${str})`
})
const gt = (str: string, num: string) => casesBuilder(str, {
  arr: `${str}.filter(e=>e>${num})`,
  map: `[...${str}.values()].filter(e=>e>${num})`,
  set: `[...${str}].filter(e=>e>${num})`,
  null: `null`,
  num: `${str}>${num} ? ${str} : null`,
  else: `Object.fromEntries(Object.entries(${str}).filter(([k,v])=>v>${num}))`
})
const num = (str: string) => casesBuilder(str, {
  arr: `${str}.map(e=>+e)`,
  map: `Object.fromEntries(Object.entries(${str}).map(([k,v])=>+v))`,
  set: `[...${str}].map(e=>+e)`,
  null: `null`,
  num: `+${str}`,
  else: `Object.fromEntries(Object.entries(${str}).map(([k,v])=>+v))`
})
const unique = (str: string) => casesBuilder(str, {
  arr: `[...new Set(${str})]`,
  map: `[...new Set(${str}.values())]`,
  set: `[...${str}]`,
  null: `null`,
  num: `${str}`,
  else: `Object.fromEntries(Object.entries(${str}).filter(([k,v],i,a)=>a.findIndex(([k2,v2])=>v2===v)===i))`
})
const count = (str: string) => casesBuilder(str, {
  arr: `(${str}).length`,
  map: `${str}.size`,
  set: `${str}.size`,
  null: `null`,
  num: `1`,
  else: `Object.keys(${str}).length`
})

type Operation = {
  alias: string[],
  builder: (str: string, ...args: any[]) => string
}
const operations: Operation[] = [
  {
    alias: ['v', 'values', 'value'],
    builder: values
  },
  {
    alias: ['k', 'keys', 'key'],
    builder: keys
  },
  {
    alias: ['u', 'unique', 'uniq'],
    builder: unique
  },
  {
    alias: ['c', 'count', 'len', 'length'],
    builder: count
  },
  {
    alias: ['gt'],
    builder: gt
  },
  {
    alias: ['n', 'number', 'num'],
    builder: num
  }
]
const aliases = operations.map(e => e.alias).flat()

function applyModifiers(
  expression: string,
  modifiers: FunctionExpression[] | null
) {
  const modifierContents = modifiers?.map(modifier => modifier.content)
  if (!modifierContents || modifierContents.length === 0) {
    return expression;
  }

  const operationMap: Record<string, Operation['builder']> = {};
  for (const operation of operations) {
    for (const alias of operation.alias) {
      operationMap[alias] = operation.builder
    }
  }

  let result = expression;
  for (const modifier of modifierContents) {
    const maybeModifier = parseModifier(modifier)
    if (!maybeModifier) continue

    const { prefix, args } = maybeModifier;
    const operation = operationMap[prefix];
    result = operation?.(result, ...args) ?? result;
  }
  return result;
}


type Modifier = {
  prefix: string;
  args: (string | number | boolean | null | undefined)[];
}
function parseModifier(input: string): Modifier | null {
  const pattern = /^(.+?)(?:<([^>]*)>)?$/;
  const match = input.match(pattern);
  if (!match) {
    console.warn(`Invalid modifier format: ${input}\nExpected format: "modifier<arg1, arg2, ...>" or "modifier"`);
    return null;
  }

  const [, prefix, argsStr] = match;
  if (!aliases.includes(prefix.trim())) {
    console.warn(`Unknown modifier: ${prefix.trim()}`);
    return null;
  }

  if (argsStr == null || argsStr.trim() === '') {
    return { prefix: prefix.trim(), args: [] };
  }

  const args = argsStr.split(',').map(part => {
    if (part === '' || part === 'undefined') {
      return undefined                             // func<0,>   -->   [0, undefined]
    }
    if (part.trim() === '') {
      const normalizedPart = part.replaceAll(/`/g, "\\`")
      return `\`${normalizedPart}\``               // func<0, >  -->   [0, ` `]
    }

    part = part.trim();
    if (!isNaN(Number(part))) {
      return Number(part)                          // func<0, 1> -->   [0, 1]
    }
    if (part === 'true') {
      return true;                                 // func<0, true> -->   [0, true]
    }
    if (part === 'null') {
      return null;                                 // func<0, null> -->   [0, null]
    }
    if (part === 'false') {
      return false;                                // func<0, false> -->   [0, false]
    }
    if (
      (part.startsWith('"') && part.endsWith('"')) ||
      (part.startsWith("'") && part.endsWith("'")) ||
      (part.startsWith("`") && part.endsWith("`"))
    ) {
      const normalizedPart = part.slice(1, -1).replaceAll(/`/g, "\\`")
      return `\`${normalizedPart}`;                // func<0, "idk`whatever lol 😂"> -->   [0, `idk\`whatever lol 😂`]
    }

    const normalizedPart = part.replaceAll(/`/g, "\\`")
    return `\`${normalizedPart}\``                 // func<0, idk`whatever lol 😂> -->   [0, `idk\`whatever lol 😂`]
  });

  return { prefix: prefix.trim(), args };
}