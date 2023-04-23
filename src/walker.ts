import { Node } from './types.js';

export class Walker {
  enter: (...args: any) => any;

  constructor(enter: (...args: any) => any) {
    this.enter = enter;
  }

  visit<AST extends Node>(
    node: AST,
    parent?: AST,
    prop?: string,
    index?: number
  ): AST {
    if (node) {
      if (this.enter) {
        this.enter(node, parent, prop, index);
      }

      for (let key in node) {
        const value = node[key];

        if (Array.isArray(value)) {
          const nodes = value;

          for (let i = 0; i < nodes.length; i += 1) {
            const item = nodes[i];

            if (isNode(item)) {
              this.visit(item, node, key, i);
            }
          }
        } else if (isNode(value)) {
          // @ts-ignore
          this.visit(value, node, key);
        }
      }
    }

    return node;
  }
}

function isNode(value: unknown): value is Node {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

export function walk<T extends Node>(ast: T, enter: (...args: any) => any): T {
  const instance = new Walker(enter);

  return instance.visit(ast);
}
