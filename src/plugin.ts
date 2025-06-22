import type { Plugin } from 'vite';
import MagicString from 'magic-string';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import type { ParserPlugin } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import _generate from '@babel/generator';
import _traverse from '@babel/traverse';

// DON'T touch the code below, they are used to ensure esm-commonjs compatibility
const traverse = (
  typeof _traverse === 'function' ? _traverse : (_traverse as any).default
) as typeof _traverse
const generate = (
  typeof _generate === 'function' ? _generate : (_generate as any).default
) as typeof _generate
// DON'T touch the code above, they are used to ensure esm-commonjs compatibility

export interface DevConsoleOptions {
  functionName?: string;
}

export default function devConsole(options: DevConsoleOptions = {}): Plugin {
  const functionName = options.functionName || '$log';

  return {
    name: 'vite-plugin-dev-console',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') && !id.endsWith('.js') && !id.endsWith('.vue')) {
        return null;
      }

      let codeToTransform = code;
      let scriptOffset = 0;
      
      // Handle Vue files - extract script content
      if (id.endsWith('.vue')) {
        const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (!scriptMatch) {
          return null; // No script block found
        }
        
        codeToTransform = scriptMatch[1];
        scriptOffset = scriptMatch.index! + scriptMatch[0].indexOf(scriptMatch[1]);
      }

      // Parse the code into an AST
      const plugins: ParserPlugin[] = ['typescript', 'jsx'];

      const ast = parse(codeToTransform, {
        sourceType: 'module',
        plugins,
      });

      const s = new MagicString(code);
      let hasReplacement = false;

      // Traverse the AST to find function calls
      traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
          const { node } = path;

          if (
            t.isIdentifier(node.callee) && 
            node.callee.name === functionName
          ) {
            const start = node.start! + scriptOffset;
            const end = node.end! + scriptOffset;
            
            if (process.env.NODE_ENV === 'production') {
              // Remove the entire call expression in production
              // If it's part of an expression statement, remove the whole statement
              const parent = path.parent;
              if (t.isExpressionStatement(parent)) {
                const parentStart = parent.start! + scriptOffset;
                const parentEnd = parent.end! + scriptOffset;
                s.remove(parentStart, parentEnd);
              } else {
                s.overwrite(start, end, 'void 0');
              }
            }
            hasReplacement = true;
          }
        }
      });

      if (!hasReplacement) {
        return null;
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      };
    }
  };
}