// Simple template grammar with [] literals and {} variables
// [] takes precedence over {}

start
  = expression*

expression
  = literal / variable / text

// Literal expressions - highest precedence
literal
  = "[" content:literalContent "]" {
    return {
      type: "literal",
      value: content
    };
  }

// Capture everything between [] as raw text
literalContent
  = chars:(!"]" char:. { return char; })* {
    return chars.join("");
  }

// Variable expressions
variable
  = "{" path:variablePath modifiers:(":" content:modifierContent { return content; })? "}" {
    return {
      type: "variable",
      path: path,
      modifiers: modifiers || null
    };
  }

// Variable path - can include complex expressions and inline literals, or be empty
variablePath
  = parts:variablePathPart* {
    // Handle empty path case
    if (parts.length === 0) {
      return [];
    }
    
    // Flatten and join all parts into path segments
    let segments = [];
    let currentSegment = "";
    
    for (let part of parts) {
      if (part.type === "dot") {
        if (currentSegment) {
          segments.push({ type: "identifier", name: currentSegment });
          currentSegment = "";
        }
      } else if (part.type === "literal") {
        currentSegment += part.value;
      } else if (part.type === "text") {
        currentSegment += part.value;
      } else if (part.type === "wildcard") {
        if (currentSegment) {
          segments.push({ type: "identifier", name: currentSegment });
          currentSegment = "";
        }
        segments.push(part);
      } else if (part.type === "variable") {
        if (currentSegment) {
          segments.push({ type: "identifier", name: currentSegment });
          currentSegment = "";
        }
        segments.push(part);
      }
    }
    
    // Add final segment if any
    if (currentSegment) {
      segments.push({ type: "identifier", name: currentSegment });
    }
    
    return segments;
  }

// Variable path parts - can be dots, literals, wildcards, variables, or text
variablePathPart
  = dot / pathLiteral / wildcard / nestedVariable / pathText

// Dot separator
dot
  = "." {
    return { type: "dot" };
  }

// Literal within path: [anything]
pathLiteral
  = "[" content:pathLiteralContent "]" {
    return { type: "literal", value: content };
  }

// Content inside path literals
pathLiteralContent
  = chars:(!"]" char:. { return char; })* {
    return chars.join("");
  }

// Regular text in path (letters, numbers, underscore)
pathText
  = chars:pathTextChar+ {
    return { type: "text", value: chars.join("") };
  }

// Path text characters
pathTextChar
  = [a-zA-Z0-9_]

// Path segment can be identifier, wildcard, literal, or nested variable
pathSegment
  = literal / wildcard / nestedVariable / identifier

// Wildcard (*) 
wildcard
  = "*" {
    return { type: "wildcard" };
  }

// Nested variable expression
nestedVariable
  = "{" path:variablePath modifiers:(":" content:modifierContent { return content; })? "}" {
    return {
      type: "variable",
      path: path,
      modifiers: modifiers || null
    };
  }

// Simple identifier - can start with letter/underscore OR be purely numeric
identifier
  = numericIdentifier / alphaIdentifier

// Purely numeric identifier (for array indices)
numericIdentifier
  = digits:[0-9]+ {
    return {
      type: "identifier",
      name: digits.join("")
    };
  }

// Alpha identifier (traditional variable names)
alphaIdentifier
  = first:[a-zA-Z_] rest:[a-zA-Z0-9_]* {
    return {
      type: "identifier",
      name: first + rest.join("")
    };
  }

// Everything after the colon - now parsed as function list
modifierContent
  = functions:functionList {
    return functions;
  }

// List of functions separated by |
functionList
  = first:functionExpression rest:("|" func:functionExpression { return func; })* {
    return [first, ...rest];
  }

// A function can be explicit (in parentheses) or implicit
functionExpression
  = explicitFunction / implicitFunction

// Explicit function: (anything here)
explicitFunction
  = "(" content:functionContent ")" {
    return {
      type: "function",
      content: content,
      explicit: true
    };
  }

// Implicit function: anything that's not | or }
implicitFunction
  = content:functionContent {
    return {
      type: "function", 
      content: content,
      explicit: false
    };
  }

// Function content - can contain embedded [...] literals
functionContent
  = parts:functionContentPart* {
    return parts.join("");
  }

// Function content parts - literals or regular text
functionContentPart
  = functionLiteral / functionRegularText

// Literal within function: [anything] becomes the content inside
functionLiteral
  = "[" content:functionLiteralContent "]" {
    return content;
  }

// Content inside function literals - everything except ]
functionLiteralContent
  = chars:(!"]" char:. { return char; })* {
    return chars.join("");
  }

// Regular text in functions - everything except terminators and [
functionRegularText
  = chars:functionRegularChar+ {
    return chars.join("");
  }

// Regular characters in function content (not [,|,),})
functionRegularChar
  = ![|\])}\[] char:. { return char; }

// Plain text - everything else
text
  = chars:textChar+ {
    return {
      type: "text",
      value: chars.join("")
    };
  }

// Text characters - anything that's not the start of [] or {}
textChar
  = ![{[] char:. { return char; }