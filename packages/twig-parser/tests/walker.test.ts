import { test, expect } from 'vitest';
import { parse } from '../src/parse.js';
import { walk } from '../src/walker.js';
import { NodeKind } from '../src/types.js';

test('Identifier', () => {
  const { ast } = parse(`{{ 2 + 2 }}`);

  expect(walk(ast, () => {})).toStrictEqual(ast);

  expect(
    walk(ast, (node) => {
      if (node.type === NodeKind.NumericLiteral) {
        node.value = node.value + 1;
      }
    })
  ).toStrictEqual({
    type: 'Template',
    body: [
      {
        type: 'VariableStatement',
        value: {
          type: 'BinaryExpression',
          left: {
            type: 'NumericLiteral',
            value: 3,
          },
          operator: '+',
          right: {
            type: 'NumericLiteral',
            value: 3,
          },
        },
      },
    ],
  });
});
