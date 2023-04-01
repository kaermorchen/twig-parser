import { test, expect } from 'vitest';
import { parse } from './helpers.js';

test('Identifier', () => {
  expect(parse(`user`).Identifier()).toStrictEqual({
    type: 'Identifier',
    value: `user`,
  });
});

test('Number', () => {
  expect(parse('0').numberLiteral(), 'Zero').toStrictEqual({
    type: 'NumberLiteral',
    value: 0,
  });
  expect(parse('42').numberLiteral(), 'Integer').toStrictEqual({
    type: 'NumberLiteral',
    value: 42,
  });
  expect(parse('42.23').numberLiteral(), 'Float').toStrictEqual({
    type: 'NumberLiteral',
    value: 42.23,
  });
});

test('String', () => {
  expect(parse(`"Hello world"`).stringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`'Hello world'`).stringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`""`).stringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: '',
  });
  expect(parse(`'It\\'s good'`).stringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: `It\\'s good`,
  });
});

test('Boolean', () => {
  expect(parse(`true`).booleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`TRUE`).booleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`false`).booleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
  expect(parse(`FALSE`).booleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
});

test('Null', () => {
  const expected = {
    type: 'NullLiteral',
    value: null,
  };

  expect(parse(`null`).nullLiteral()).toStrictEqual(expected);
  expect(parse(`NULL`).nullLiteral()).toStrictEqual(expected);
  expect(parse(`none`).nullLiteral()).toStrictEqual(expected);
});

test('ArrayLiteral', () => {
  expect(parse(`[]`).ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [],
  });

  expect(parse(`[1, [2, 3]]`).ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [parse('1').numberLiteral(), parse('[2, 3]').ArrayLiteral()],
  });
});

test('PropertyName', () => {
  expect(parse(`"key"`).PropertyName()).toStrictEqual(
    parse(`"key"`).stringLiteral()
  );
  expect(parse(`1`).PropertyName()).toStrictEqual(parse(`1`).numberLiteral());
  expect(parse(`key`).PropertyName()).toStrictEqual(parse(`key`).Identifier());
  expect(parse(`(name)`).PropertyName()).toStrictEqual(
    parse(`name`).expression()
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
      type: 'NumberLiteral',
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
          type: 'NumberLiteral',
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
    type: 'NumberLiteral',
    value: 4,
  });
});

test('BinaryExpression', () => {
  expect(parse(`1 + 2`).expression()).toStrictEqual({
    type: 'BinaryExpression',
    left: {
      type: 'NumberLiteral',
      value: 1,
    },
    operator: '+',
    right: {
      type: 'NumberLiteral',
      value: 2,
    },
  });

  expect(parse(`4 * 2 + 2 * 3`).expression()).toStrictEqual({
    type: 'BinaryExpression',
    left: {
      type: 'BinaryExpression',
      left: {
        type: 'NumberLiteral',
        value: 4,
      },
      operator: '*',
      right: {
        type: 'NumberLiteral',
        value: 2,
      },
    },
    operator: '+',
    right: {
      type: 'BinaryExpression',
      left: {
        type: 'NumberLiteral',
        value: 2,
      },
      operator: '*',
      right: {
        type: 'NumberLiteral',
        value: 3,
      },
    },
  });
});

test('Expression', () => {
  expect(parse(`"Hello"`).expression()).toStrictEqual({
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
      type: 'NumberLiteral',
      value: 4,
    },
    operator: '>',
    right: {
      type: 'NumberLiteral',
      value: 1,
    },
    type: 'BinaryExpression',
  });

  expect(parse(`true ? 1 : 2`).AssignmentExpression()).toStrictEqual({
    alternate: {
      type: 'NumberLiteral',
      value: 2,
    },
    consequent: {
      type: 'NumberLiteral',
      value: 1,
    },
    test: {
      type: 'BooleanLiteral',
      value: true,
    },
    type: 'ConditionalExpression',
  });
});
