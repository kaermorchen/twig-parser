import { test, expect } from 'vitest';
import { parse } from './helpers.js';

test('Identifier', () => {
  expect(parse(`user`).identifier()).toStrictEqual({
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

test('ArrayExpression', () => {
  expect(parse(`[]`).arrayExpression()).toStrictEqual({
    type: 'ArrayExpression',
    elements: [],
  });

  expect(parse(`[1, [2, 3]]`).arrayExpression()).toStrictEqual({
    type: 'ArrayExpression',
    elements: [parse('1').numberLiteral(), parse('[2, 3]').arrayExpression()],
  });
});

test('PropertyKey', () => {
  expect(parse(`"key"`).propertyKey()).toStrictEqual(
    parse(`"key"`).stringLiteral()
  );
  expect(parse(`1`).propertyKey()).toStrictEqual(parse(`1`).numberLiteral());
  expect(parse(`key`).propertyKey()).toStrictEqual(parse(`key`).identifier());
  expect(parse(`(name)`).propertyKey()).toStrictEqual(
    parse(`name`).expression()
  );
  // TODO: { (1 + 1): 'bar', (foo ~ 'b'): 'baz' }
});

test('Property', () => {
  expect(parse(`"key": 42`).property()).toStrictEqual({
    type: 'Property',
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

  expect(parse(`(name): "Anna"`).property()).toStrictEqual({
    type: 'Property',
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

  expect(parse(`foo`).property()).toStrictEqual({
    type: 'Property',
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

test('HashExpression', () => {
  expect(parse(`{}`).hashExpression()).toStrictEqual({
    type: 'HashExpression',
    properties: [],
  });

  expect(parse(`{"key": 23, foo: bar, val}`).hashExpression()).toStrictEqual({
    type: 'HashExpression',
    properties: [
      {
        type: 'Property',
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
        type: 'Property',
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
        type: 'Property',
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
  expect(parse(`(4)`).parenthesisExpression()).toStrictEqual({
    type: 'NumberLiteral',
    value: 4,
  });
});

test('Operator', () => {
  expect(parse(`or`).operator()).toStrictEqual('or');
  expect(parse(`and`).operator()).toStrictEqual('and');
  expect(parse(`b-or`).operator()).toStrictEqual('b-or');
  expect(parse(`b-xor`).operator()).toStrictEqual('b-xor');
  expect(parse(`b-and`).operator()).toStrictEqual('b-and');
  expect(parse(`==`).operator()).toStrictEqual('==');
  expect(parse(`!=`).operator()).toStrictEqual('!=');
  expect(parse(`<=>`).operator()).toStrictEqual('<=>');
  expect(parse(`>=`).operator()).toStrictEqual('>=');
  expect(parse(`<=`).operator()).toStrictEqual('<=');
  expect(parse(`<`).operator()).toStrictEqual('<');
  expect(parse(`>`).operator()).toStrictEqual('>');
  expect(parse(`not in`).operator()).toStrictEqual('not in');
  expect(parse(`in`).operator()).toStrictEqual('in');
  expect(parse(`matches`).operator()).toStrictEqual('matches');
  expect(parse(`starts with`).operator()).toStrictEqual('starts with');
  expect(parse(`ends with`).operator()).toStrictEqual('ends with');
  expect(parse(`has some`).operator()).toStrictEqual('has some');
  expect(parse(`has every`).operator()).toStrictEqual('has every');
  expect(parse('..').operator()).toStrictEqual('..');
  expect(parse(`+`).operator()).toStrictEqual('+');
  expect(parse(`-`).operator()).toStrictEqual('-');
  expect(parse(`~`).operator()).toStrictEqual('~');
  expect(parse(`not`).operator()).toStrictEqual('not');
  expect(parse(`*`).operator()).toStrictEqual('*');
  expect(parse(`/`).operator()).toStrictEqual('/');
  expect(parse(`//`).operator()).toStrictEqual('//');
  expect(parse(`%`).operator()).toStrictEqual('%');
  expect(parse(`is not`).operator()).toStrictEqual('is not');
  expect(parse(`is`).operator()).toStrictEqual('is');
  expect(parse(`**`).operator()).toStrictEqual('**');
  expect(parse(`??`).operator()).toStrictEqual('??');
});

test('BinaryExpression', () => {
  // expect(parse(`1 + 2`).binaryExpression()).toStrictEqual({
  //   type: 'BinaryExpression',
  //   left: {
  //     type: 'NumberLiteral',
  //     value: 1,
  //   },
  //   operator: '+',
  //   right: {
  //     type: 'NumberLiteral',
  //     value: 2,
  //   },
  // });
});

test('Expression', () => {
  expect(parse(`"Hello"`).expression()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });

  expect(parse(`1 + 2 * 3`).expression()).toStrictEqual({
    type: 'BinaryExpression',
    left: {
      type: 'NumberLiteral',
      value: 1,
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
