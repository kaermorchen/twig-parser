import { test, expect } from 'vitest';
import { parse } from './helpers.js';

test('Identifier', () => {
  expect(parse(`user`).Identifier()).toStrictEqual({
    type: 'Identifier',
    value: `user`,
  });
});

test('Number', () => {
  expect(parse('0').NumericLiteral(), 'Zero').toStrictEqual({
    type: 'NumericLiteral',
    value: 0,
  });
  expect(parse('42').NumericLiteral(), 'Integer').toStrictEqual({
    type: 'NumericLiteral',
    value: 42,
  });
  expect(parse('42.23').NumericLiteral(), 'Float').toStrictEqual({
    type: 'NumericLiteral',
    value: 42.23,
  });
});

test('String', () => {
  expect(parse(`"Hello world"`).StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`'Hello world'`).StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`""`).StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: '',
  });
  expect(parse(`'It\\'s good'`).StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: `It\\'s good`,
  });
});

test('Boolean', () => {
  expect(parse(`true`).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`TRUE`).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`false`).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
  expect(parse(`FALSE`).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
});

test('Null', () => {
  const expected = {
    type: 'NullLiteral',
    value: null,
  };

  expect(parse(`null`).NullLiteral()).toStrictEqual(expected);
  expect(parse(`NULL`).NullLiteral()).toStrictEqual(expected);
  expect(parse(`none`).NullLiteral()).toStrictEqual(expected);
});

test('ArrayLiteral', () => {
  expect(parse(`[]`).ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [],
  });

  expect(parse(`[1, [2, 3]]`).ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [parse('1').NumericLiteral(), parse('[2, 3]').ArrayLiteral()],
  });
});

test('PropertyName', () => {
  expect(parse(`"key"`).PropertyName()).toStrictEqual(
    parse(`"key"`).StringLiteral()
  );
  expect(parse(`1`).PropertyName()).toStrictEqual(parse(`1`).NumericLiteral());
  expect(parse(`key`).PropertyName()).toStrictEqual(parse(`key`).Identifier());
  expect(parse(`(name)`).PropertyName()).toStrictEqual(
    parse(`name`).Expression()
  );
  // TODO: { (1 + 1): 'bar', (foo ~ 'b'): 'baz' }
});

test('PropertyAssignment', () => {
  expect(parse(`"key": 42`).PropertyAssignment()).toStrictEqual({
    type: 'PropertyAssignment',
    key: {
      type: 'StringLiteral',
      value: 'key',
    },
    value: {
      type: 'NumericLiteral',
      value: 42,
    },
    shorthand: false,
  });

  expect(parse(`(name): "Anna"`).PropertyAssignment()).toStrictEqual({
    type: 'PropertyAssignment',
    key: {
      type: 'Identifier',
      value: 'name',
    },
    value: {
      type: 'StringLiteral',
      value: 'Anna',
    },
    shorthand: false,
  });

  expect(parse(`foo`).PropertyAssignment()).toStrictEqual({
    type: 'PropertyAssignment',
    key: {
      type: 'StringLiteral',
      value: 'foo',
    },
    value: {
      type: 'Identifier',
      value: 'foo',
    },
    shorthand: true,
  });
});

test('ObjectLiteral', () => {
  expect(parse(`{}`).ObjectLiteral()).toStrictEqual({
    type: 'ObjectLiteral',
    properties: [],
  });

  expect(parse(`{"key": 23, foo: bar, val}`).ObjectLiteral()).toStrictEqual({
    type: 'ObjectLiteral',
    properties: [
      {
        type: 'PropertyAssignment',
        key: {
          type: 'StringLiteral',
          value: 'key',
        },
        value: {
          type: 'NumericLiteral',
          value: 23,
        },
        shorthand: false,
      },
      {
        type: 'PropertyAssignment',
        key: {
          type: 'Identifier',
          value: 'foo',
        },
        value: {
          type: 'Identifier',
          value: 'bar',
        },
        shorthand: false,
      },
      {
        type: 'PropertyAssignment',
        key: {
          type: 'StringLiteral',
          value: 'val',
        },
        value: {
          type: 'Identifier',
          value: 'val',
        },
        shorthand: true,
      },
    ],
  });
});

test('ParenthesisExpression', () => {
  expect(parse(`(4)`).ParenthesisExpression()).toStrictEqual({
    type: 'NumericLiteral',
    value: 4,
  });
});

test('BinaryExpression', () => {
  expect(parse(`1 + 2`).Expression()).toStrictEqual({
    type: 'BinaryExpression',
    left: {
      type: 'NumericLiteral',
      value: 1,
    },
    operator: '+',
    right: {
      type: 'NumericLiteral',
      value: 2,
    },
  });

  expect(parse(`4 * 2 + 2 * 3`).Expression()).toStrictEqual({
    type: 'BinaryExpression',
    left: {
      type: 'BinaryExpression',
      left: {
        type: 'NumericLiteral',
        value: 4,
      },
      operator: '*',
      right: {
        type: 'NumericLiteral',
        value: 2,
      },
    },
    operator: '+',
    right: {
      type: 'BinaryExpression',
      left: {
        type: 'NumericLiteral',
        value: 2,
      },
      operator: '*',
      right: {
        type: 'NumericLiteral',
        value: 3,
      },
    },
  });

  expect(parse(`2 * (2 + 2)`).Expression()).toStrictEqual({
    type: 'BinaryExpression',
    left: {
      type: 'NumericLiteral',
      value: 2,
    },
    operator: '*',
    right: {
      type: 'BinaryExpression',
      left: {
        type: 'NumericLiteral',
        value: 2,
      },
      operator: '+',
      right: {
        type: 'NumericLiteral',
        value: 2,
      },
    },
  });
});

test('Expression', () => {
  expect(parse(`"Hello"`).Expression()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });
});

test('AssignmentExpression', () => {
  expect(parse(`"Hello"`).AssignmentExpression()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });

  expect(parse(`4 > 1`).AssignmentExpression()).toStrictEqual({
    left: {
      type: 'NumericLiteral',
      value: 4,
    },
    operator: '>',
    right: {
      type: 'NumericLiteral',
      value: 1,
    },
    type: 'BinaryExpression',
  });

  expect(parse(`true ? 1 : 2`).AssignmentExpression()).toStrictEqual({
    alternate: {
      type: 'NumericLiteral',
      value: 2,
    },
    consequent: {
      type: 'NumericLiteral',
      value: 1,
    },
    test: {
      type: 'BooleanLiteral',
      value: true,
    },
    type: 'ConditionalExpression',
  });
});

test('MemberExpression', () => {
  expect(parse(`user.name`).MemberExpression()).toStrictEqual({
    object: {
      type: 'Identifier',
      value: 'user',
    },
    property: {
      type: 'Identifier',
      value: 'name',
    },
    type: 'MemberExpression',
  });

  expect(parse(`user['name']`).MemberExpression()).toStrictEqual({
    object: {
      type: 'Identifier',
      value: 'user',
    },
    property: {
      type: 'StringLiteral',
      value: 'name',
    },
    type: 'MemberExpression',
  });

  expect(parse(`user.a.b`).MemberExpression()).toStrictEqual({
    type: 'MemberExpression',
    object: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        value: 'user',
      },
      property: {
        type: 'Identifier',
        value: 'a',
      },
    },
    property: {
      type: 'Identifier',
      value: 'b',
    },
  });
});

test('UnaryExpression', () => {
  expect(parse(`-4`).UnaryExpression()).toStrictEqual({
    argument: {
      type: 'NumericLiteral',
      value: 4,
    },
    operator: '-',
    type: 'UnaryExpression',
  });

  expect(parse(`not true`).UnaryExpression()).toStrictEqual({
    argument: {
      type: 'BooleanLiteral',
      value: true,
    },
    operator: 'not',
    type: 'UnaryExpression',
  });
});

test('VariableStatement', () => {
  expect(parse(`{{ 4 }}`).VariableStatement()).toStrictEqual({
    value: {
      type: 'NumericLiteral',
      value: 4,
    },
    type: 'VariableStatement',
  });

  expect(parse(`{{ {a: "true"} }}`).VariableStatement()).toStrictEqual({
    value: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'Identifier',
            value: 'a',
          },
          shorthand: false,
          type: 'PropertyAssignment',
          value: {
            type: 'StringLiteral',
            value: 'true',
          },
        },
      ],
    },
    type: 'VariableStatement',
  });
});
