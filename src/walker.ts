import { Node } from './types.js';

export class Walker {
  enter: (...args: any) => any;

  constructor(enter: (...args: any) => any) {
    this.enter = enter;
  }

  visit<AST extends Node>(
    node: AST,
    parent: AST = null,
    prop: string = null,
    index: number = null
  ): AST | null {
    if (node) {
      if (this.enter) {
        this.enter(node, parent, prop, index);
      }

      for (let key in node) {
        const value: unknown = node[key];

        if (Array.isArray(value)) {
          const nodes = value;

          for (let i = 0; i < nodes.length; i += 1) {
            const item = nodes[i];

            if (isNode(item)) {
              this.visit(item, node, key, i);
            }
          }
        } else if (isNode(value)) {
          this.visit(value, node, key, null);
        }
      }
    }

    return node;
  }
}

function isNode(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

export function walk<T extends Node>(
  ast: T,
  enter: (...args: any) => any
): boolean {
  const instance = new Walker(enter);

  return instance.visit(ast);
}
