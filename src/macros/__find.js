function find(obj, patternParts) {
  const results = {};
  
  function traverse(current, currentPath, patternIndex) {
    if (patternIndex >= patternParts.length) {
      const displayPath = currentPath.map(part => part.replace(/\./g, '_')).join('.');
      results[displayPath] = current;
      return;
    }
    
    const patternPart = patternParts[patternIndex];
    if (current == null || typeof current !== 'object') {
      return;
    }
    
    if (patternPart === '*') {
      for (const key in current) {
        if (current.hasOwnProperty(key)) {
          traverse(
            current[key], 
            [...currentPath, key], 
            patternIndex + 1
          );
        }
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
  
  traverse(obj, [], 0);
  return results;
}
