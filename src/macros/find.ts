
type KonzolHelperFunctionNames = 'find' | 'cases'

export const namespace = (name: KonzolHelperFunctionNames, segment: string) => 
  `globalThis.__kzl_${name} || (globalThis.__kzl_${name}=${segment});`

const findCodeSegment = namespace('find', /*js*/`(obj, patternParts)=>{
  const results = {};
  
  function traverse(current, currentPath, patternIndex) {
    if (patternIndex >= patternParts.length) {
      const displayPath = currentPath.join('.');
      results[displayPath] = current;
      return;
    }
    
    if (current == null || typeof current !== 'object') {
      return;
    }
    const patternPart = patternParts[patternIndex];
    
    if (patternPart === '*') {
      if (Array.isArray(current)) {
        for (let i = 0; i < current.length; i++) {
          traverse(
            current[i], 
            [...currentPath, i.toString()], 
            patternIndex + 1
          );
        }
      } else {
        for (const key in current) {
          if (current.hasOwnProperty(key)) {
            traverse(
              current[key], 
              [...currentPath, key], 
              patternIndex + 1
            );
          }
        }
      }
    } else {
      if (Array.isArray(current)) {
        const index = parseInt(patternPart, 10);
        if (!isNaN(index) && index >= 0 && index < current.length) {
          traverse(
            current[index], 
            [...currentPath, patternPart], 
            patternIndex + 1
          );
        }
      } else {
        if (current.hasOwnProperty(patternPart)) {
          traverse(
            current[patternPart], 
            [...currentPath, patternPart], 
            patternIndex + 1
          );
        }
      }
    }
  }
  
  traverse(obj, [], 0);
  return results;
}`)
const casesCodeSegment = namespace('cases', /*js*/`async(value,logic)=>{
  if(value instanceof Promise)value=await value
  let e=()=>logic.else?.()
  if(value==null)return logic.null?.()??e()
  if(Array.isArray(value))return logic.arr?.()??e()
  if(value instanceof Map)return logic.map?.()??e()
  if(value instanceof Set)return logic.set?.()??e()
  if(typeof value==='number')return logic.num?.()??e()
  return e()
}`)


export const codeSegments: Record<KonzolHelperFunctionNames, string> = {
  find: findCodeSegment,
  cases: casesCodeSegment,
}
