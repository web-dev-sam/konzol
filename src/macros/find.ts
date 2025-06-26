type KonzolHelperFunctionNames = 'find' | 'cases'

export const namespace = (name: KonzolHelperFunctionNames, segment: string) => `globalThis.__kzl_${name} || (globalThis.__kzl_${name}=${segment});`

const findCodeSegment = namespace(
  'find',
  /*js*/ `(obj,patternParts)=>{
const results={}
function traverse(cur,curPath,patternIndex){
  if(patternIndex>=patternParts.length){
    const displayPath=curPath.join('.')
    results[displayPath]=cur
    return
  }
  if (cur==null||typeof cur!=='object')return

  const patternPart=patternParts[patternIndex]
  if(patternPart==='*'){
    if(Array.isArray(cur)){
      for(let i=0;i<cur.length;i++)
        traverse(cur[i],[...curPath,i.toString()],patternIndex+1)
    }else{
      for(const key in cur){
        if(cur.hasOwnProperty(key))
          traverse(cur[key],[...curPath, key],patternIndex+1)
      }
    }return
  }
  if(Array.isArray(cur)){
    const index=parseInt(patternPart,10);
    if(!isNaN(index)&&index>=0&&index<cur.length)
      traverse(cur[index],[...curPath, patternPart],patternIndex+1)
  } else if(cur.hasOwnProperty(patternPart))
    traverse(cur[patternPart],[...curPath, patternPart],patternIndex+1)
}
traverse(obj, [], 0)
return results
}`,
)
const casesCodeSegment = namespace(
  'cases',
  /*js*/ `async(v,logic)=>{
if(v instanceof Promise)v=await v
let e=()=>logic.else?.(v)
if(v==null)return logic.null?.(v)??e()
if(Array.isArray(v))return logic.arr?.(v)??e()
if(v instanceof Map)return logic.map?.(v)??e()
if(v instanceof Set)return logic.set?.(v)??e()
if(typeof v==='number')return logic.num?.(v)??e()
return e()
}`,
)

export const codeSegments: Record<KonzolHelperFunctionNames, string> = {
  find: findCodeSegment,
  cases: casesCodeSegment,
}
