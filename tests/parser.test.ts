import { test, expect } from 'vitest';
import { parse } from './helpers.js';

test('Identifier', () => {
  expect(parse(`user`, 'statement').Identifier()).toStrictEqual({
    type: 'Identifier',
    value: `user`,
  });
});

test('Number', () => {
  expect(parse('0', 'statement').NumericLiteral(), 'Zero').toStrictEqual({
    type: 'NumericLiteral',
    value: 0,
  });
  expect(parse('42', 'statement').NumericLiteral(), 'Integer').toStrictEqual({
    type: 'NumericLiteral',
    value: 42,
  });
  expect(parse('42.23', 'statement').NumericLiteral(), 'Float').toStrictEqual({
    type: 'NumericLiteral',
    value: 42.23,
  });
});

test('String', () => {
  expect(parse(`"Hello world"`, 'statement').StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`'Hello world'`, 'statement').StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`""`, 'statement').StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: '',
  });
  expect(parse(`'It\\'s good'`, 'statement').StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: `It\\'s good`,
  });
});

test('Boolean', () => {
  expect(parse(`true`, 'statement').BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`TRUE`, 'statement').BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`false`, 'statement').BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
  expect(parse(`FALSE`, 'statement').BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
});

test('Null', () => {
  const expected = {
    type: 'NullLiteral',
    value: null,
  };

  expect(parse(`null`, 'statement').NullLiteral()).toStrictEqual(expected);
  expect(parse(`NULL`, 'statement').NullLiteral()).toStrictEqual(expected);
  expect(parse(`none`, 'statement').NullLiteral()).toStrictEqual(expected);
});

test('ArrayLiteral', () => {
  expect(parse(`[]`, 'statement').ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [],
  });

  expect(parse(`[1, [2, 3]]`, 'statement').ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [
      parse('1', 'statement').NumericLiteral(),
      parse('[2, 3]', 'statement').ArrayLiteral(),
    ],
  });
});

test('PropertyName', () => {
  expect(parse(`"key"`, 'statement').PropertyName()).toStrictEqual(
    parse(`"key"`, 'statement').StringLiteral()
  );
  expect(parse(`1`, 'statement').PropertyName()).toStrictEqual(
    parse(`1`, 'statement').NumericLiteral()
  );
  expect(parse(`key`, 'statement').PropertyName()).toStrictEqual(
    parse(`key`, 'statement').Identifier()
  );
  expect(parse(`(name)`, 'statement').PropertyName()).toStrictEqual(
    parse(`name`, 'statement').Expression()
  );
  // TODO: { (1 + 1): 'bar', (foo ~ 'b'): 'baz' }
});

test('PropertyAssignment', () => {
  expect(parse(`"key": 42`, 'statement').PropertyAssignment()).toStrictEqual({
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

  expect(
    parse(`(name): "Anna"`, 'statement').PropertyAssignment()
  ).toStrictEqual({
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

  expect(parse(`foo`, 'statement').PropertyAssignment()).toStrictEqual({
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
  expect(parse(`{}`, 'statement').ObjectLiteral()).toStrictEqual({
    type: 'ObjectLiteral',
    properties: [],
  });

  expect(
    parse(`{"key": 23, foo: bar, val}`, 'statement').ObjectLiteral()
  ).toStrictEqual({
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
  expect(parse(`(4)`, 'statement').ParenthesisExpression()).toStrictEqual({
    type: 'NumericLiteral',
    value: 4,
  });
});

test('BinaryExpression', () => {
  expect(parse(`1 + 2`, 'statement').Expression()).toStrictEqual({
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

  expect(parse(`4 * 2 + 2 * 3`, 'statement').Expression()).toStrictEqual({
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

  expect(parse(`2 * (2 + 2)`, 'statement').Expression()).toStrictEqual({
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
  expect(parse(`"Hello"`, 'statement').Expression()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });
});

test('AssignmentExpression', () => {
  expect(parse(`"Hello"`, 'statement').AssignmentExpression()).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });

  expect(parse(`4 > 1`, 'statement').AssignmentExpression()).toStrictEqual({
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

  expect(
    parse(`true ? 1 : 2`, 'statement').AssignmentExpression()
  ).toStrictEqual({
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
  expect(parse(`user.name`, 'statement').MemberExpression()).toStrictEqual({
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

  expect(parse(`user['name']`, 'statement').MemberExpression()).toStrictEqual({
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

  expect(parse(`user.a.b`, 'statement').MemberExpression()).toStrictEqual({
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
  expect(parse(`-4`, 'statement').UnaryExpression()).toStrictEqual({
    argument: {
      type: 'NumericLiteral',
      value: 4,
    },
    operator: '-',
    type: 'UnaryExpression',
  });

  expect(parse(`not true`, 'statement').UnaryExpression()).toStrictEqual({
    argument: {
      type: 'BooleanLiteral',
      value: true,
    },
    operator: 'not',
    type: 'UnaryExpression',
  });
});

test('VariableStatement', () => {
  expect(parse(`{{ 4 }}`, 'template').VariableStatement()).toStrictEqual({
    value: {
      type: 'NumericLiteral',
      value: 4,
    },
    type: 'VariableStatement',
  });

  expect(
    parse(`{{ {a: "true"} }}`, 'template').VariableStatement()
  ).toStrictEqual({
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

test('Text', () => {
  expect(parse(`Hello world`, 'template').Text()).toStrictEqual({
    value: 'Hello world',
    type: 'Text',
  });
});

test('Comment', () => {
  expect(parse(`{# Lorem Ipsum #}`, 'template').Comment()).toStrictEqual({
    value: 'Lorem Ipsum',
    type: 'Comment',
  });
});

test('Program', () => {
  expect(
    parse(`{# Lorem Ipsum #} {{"str"}} <div></div>`, 'template').Program()
  ).toStrictEqual({
    type: 'Program',
    body: [
      {
        type: 'Comment',
        value: 'Lorem Ipsum',
      },
      {
        type: 'VariableStatement',
        value: {
          type: 'StringLiteral',
          value: 'str',
        },
      },
      {
        type: 'Text',
        value: `<div></div>`,
      },
    ],
  });
});

test('SetInlineStatement', () => {
  expect(
    parse(`{% set name = 'Bruce Wayne' %}`, 'template').Statement()
  ).toStrictEqual({
    type: 'SetStatement',
    declarations: [
      {
        init: {
          type: 'StringLiteral',
          value: 'Bruce Wayne',
        },
        name: {
          type: 'Identifier',
          value: 'name',
        },
        type: 'VariableDeclaration',
      },
    ],
  });

  expect(
    parse(
      `{% set name, nick_name = 'Bruce Wayne', 'Batman' %}`,
      'template'
    ).Statement()
  ).toStrictEqual({
    type: 'SetStatement',
    declarations: [
      {
        init: {
          type: 'StringLiteral',
          value: 'Bruce Wayne',
        },
        name: {
          type: 'Identifier',
          value: 'name',
        },
        type: 'VariableDeclaration',
      },
      {
        init: {
          type: 'StringLiteral',
          value: 'Batman',
        },
        name: {
          type: 'Identifier',
          value: 'nick_name',
        },
        type: 'VariableDeclaration',
      },
    ],
  });
});
