import { test, expect } from 'vitest';
import { parser } from './helpers.js';
import { ModeKind } from '../src/lexer.js';

test('Identifier', () => {
  expect(parser(`user`, ModeKind.Statement).Identifier()).toStrictEqual({
    type: 'Identifier',
    name: `user`,
  });
});

test('Number', () => {
  expect(parser('0', ModeKind.Statement).NumericLiteral(), 'Zero').toStrictEqual(
    {
      type: 'NumericLiteral',
      value: 0,
    }
  );
  expect(
    parser('42', ModeKind.Statement).NumericLiteral(),
    'Integer'
  ).toStrictEqual({
    type: 'NumericLiteral',
    value: 42,
  });
  expect(
    parser('42.23', ModeKind.Statement).NumericLiteral(),
    'Float'
  ).toStrictEqual({
    type: 'NumericLiteral',
    value: 42.23,
  });
});

test('String', () => {
  expect(
    parser(`"Hello world"`, ModeKind.Statement).StringLiteral()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(
    parser(`'Hello world'`, ModeKind.Statement).StringLiteral()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parser(`""`, ModeKind.Statement).StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: '',
  });
  expect(
    parser(`'It\\'s good'`, ModeKind.Statement).StringLiteral()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: `It\\'s good`,
  });
});

test('Boolean', () => {
  expect(parser(`true`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parser(`TRUE`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parser(`false`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
  expect(parser(`FALSE`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
});

test('Null', () => {
  const expected = {
    type: 'NullLiteral',
    value: null,
  };

  expect(parser(`null`, ModeKind.Statement).NullLiteral()).toStrictEqual(
    expected
  );
  expect(parser(`NULL`, ModeKind.Statement).NullLiteral()).toStrictEqual(
    expected
  );
  expect(parser(`none`, ModeKind.Statement).NullLiteral()).toStrictEqual(
    expected
  );
});

test('ArrayLiteral', () => {
  expect(parser(`[]`, ModeKind.Statement).ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [],
  });

  expect(parser(`[1, [2, 3]]`, ModeKind.Statement).ArrayLiteral()).toStrictEqual(
    {
      type: 'ArrayLiteral',
      elements: [
        {
          type: 'NumericLiteral',
          value: 1,
        },
        {
          type: 'ArrayLiteral',
          elements: [
            {
              type: 'NumericLiteral',
              value: 2,
            },
            {
              type: 'NumericLiteral',
              value: 3,
            },
          ],
        },
      ],
    }
  );
});

test('PropertyName', () => {
  expect(parser(`"key"`, ModeKind.Statement).PropertyName()).toStrictEqual(
    parser(`"key"`, ModeKind.Statement).StringLiteral()
  );
  expect(parser(`1`, ModeKind.Statement).PropertyName()).toStrictEqual(
    parser(`1`, ModeKind.Statement).NumericLiteral()
  );
  expect(parser(`key`, ModeKind.Statement).PropertyName()).toStrictEqual(
    parser(`key`, ModeKind.Statement).Identifier()
  );
  expect(parser(`(name)`, ModeKind.Statement).PropertyName()).toStrictEqual({
    type: 'Identifier',
    name: 'name',
  });
  // TODO: { (1 + 1): 'bar', (foo ~ 'b'): 'baz' }
});

test('Property', () => {
  expect(parser(`"key": 42`, ModeKind.Statement).Property()).toStrictEqual({
    type: 'Property',
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

  expect(parser(`(name): "Anna"`, ModeKind.Statement).Property()).toStrictEqual({
    type: 'Property',
    key: {
      type: 'Identifier',
      name: 'name',
    },
    value: {
      type: 'StringLiteral',
      value: 'Anna',
    },
    shorthand: false,
  });

  expect(parser(`foo`, ModeKind.Statement).Property()).toStrictEqual({
    type: 'Property',
    value: {
      type: 'Identifier',
      name: 'foo',
    },
    key: {
      type: 'StringLiteral',
      value: 'foo',
    },
    shorthand: true,
  });
});

test('ObjectLiteral', () => {
  expect(parser(`{}`, ModeKind.Statement).ObjectLiteral()).toStrictEqual({
    type: 'ObjectLiteral',
    properties: [],
  });

  expect(
    parser(`{"key": 23, foo: bar, val}`, ModeKind.Statement).ObjectLiteral()
  ).toStrictEqual({
    type: 'ObjectLiteral',
    properties: [
      {
        type: 'Property',
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
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'foo',
        },
        value: {
          type: 'Identifier',
          name: 'bar',
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
          name: 'val',
        },
        shorthand: true,
      },
    ],
  });
});

test('ParenthesizedExpression', () => {
  expect(parser(`{{ (4) }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      type: 'ParenthesizedExpression',
      expr: {
        type: 'NumericLiteral',
        value: 4,
      },
    },
  });

  expect(
    parser(`{{ not (post.status is constant('Post::PUBLISHED')) }}`).Template()
      .body[0]
  ).toStrictEqual({
    type: 'VariableStatement',
    value: {
      type: 'UnaryExpression',
      operator: 'not',
      argument: {
        type: 'ParenthesizedExpression',
        expr: {
          left: {
            object: {
              type: 'Identifier',
              name: 'post',
            },
            property: {
              type: 'Identifier',
              name: 'status',
            },
            type: 'MemberExpression',
          },
          operator: 'is',
          right: {
            arguments: [
              {
                type: 'StringLiteral',
                value: 'Post::PUBLISHED',
              },
            ],
            callee: {
              type: 'Identifier',
              name: 'constant',
            },
            type: 'CallExpression',
          },
          type: 'BinaryExpression',
        },
      },
    },
  });
});

test('BinaryExpression', () => {
  expect(parser(`1 + 2`, ModeKind.Statement).Expression()).toStrictEqual({
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

  expect(parser(`4 * 2 + 2 * 3`, ModeKind.Statement).Expression()).toStrictEqual(
    {
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
    }
  );
});

test('ExpressionList', () => {
  expect(
    parser(`"Hello", 42`, ModeKind.Statement).ExpressionList()
  ).toStrictEqual([
    {
      type: 'StringLiteral',
      value: 'Hello',
    },
    {
      type: 'NumericLiteral',
      value: 42,
    },
  ]);
});

test('AssignmentExpression', () => {
  expect(
    parser(`"Hello"`, ModeKind.Statement).AssignmentExpression()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });

  expect(
    parser(`4 > 1`, ModeKind.Statement).AssignmentExpression()
  ).toStrictEqual({
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
    parser(`true ? 1 : 2`, ModeKind.Statement).AssignmentExpression()
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

  expect(
    parser(`1 ?: 2`, ModeKind.Statement).AssignmentExpression()
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
      type: 'NumericLiteral',
      value: 1,
    },
    type: 'ConditionalExpression',
  });
});

test('LeftHandSideExpression', () => {
  expect(
    parser(`user.firstName`, ModeKind.Statement).LeftHandSideExpression()
  ).toStrictEqual({
    object: {
      type: 'Identifier',
      name: 'user',
    },
    property: {
      type: 'Identifier',
      name: 'firstName',
    },
    type: 'MemberExpression',
  });

  expect(
    parser(`user['name']`, ModeKind.Statement).LeftHandSideExpression()
  ).toStrictEqual({
    object: {
      type: 'Identifier',
      name: 'user',
    },
    property: {
      type: 'StringLiteral',
      value: 'name',
    },
    type: 'MemberExpression',
  });

  expect(
    parser(`user.a.b`, ModeKind.Statement).LeftHandSideExpression()
  ).toStrictEqual({
    type: 'MemberExpression',
    object: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'user',
      },
      property: {
        type: 'Identifier',
        name: 'a',
      },
    },
    property: {
      type: 'Identifier',
      name: 'b',
    },
  });
});

test('UnaryExpression', () => {
  expect(parser(`-4`, ModeKind.Statement).UnaryExpression()).toStrictEqual({
    argument: {
      type: 'NumericLiteral',
      value: 4,
    },
    operator: '-',
    type: 'UnaryExpression',
  });

  expect(parser(`not true`, ModeKind.Statement).UnaryExpression()).toStrictEqual(
    {
      argument: {
        type: 'BooleanLiteral',
        value: true,
      },
      operator: 'not',
      type: 'UnaryExpression',
    }
  );

  expect(parser(`{{ 2 + -2 }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      type: 'BinaryExpression',
      left: {
        type: 'NumericLiteral',
        value: 2,
      },
      operator: '+',
      right: {
        argument: {
          type: 'NumericLiteral',
          value: 2,
        },
        operator: '-',
        type: 'UnaryExpression',
      },
    },
  });
});

test('VariableStatement', () => {
  expect(parser(`{{ 4 }}`).VariableStatement()).toStrictEqual({
    value: {
      type: 'NumericLiteral',
      value: 4,
    },
    type: 'VariableStatement',
  });

  expect(parser(`{{ {a: "true"} }}`).VariableStatement()).toStrictEqual({
    value: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'Identifier',
            name: 'a',
          },
          shorthand: false,
          type: 'Property',
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
  expect(parser(`Hello world`).Text()).toStrictEqual({
    value: 'Hello world',
    type: 'Text',
  });
});

test('Comment', () => {
  expect(parser(`{# Lorem Ipsum #}`).Comment()).toStrictEqual({
    value: 'Lorem Ipsum',
    type: 'Comment',
  });
});

test('Template', () => {
  expect(
    parser(`{# Lorem Ipsum #} {{"str"}} <div></div>`).Template()
  ).toStrictEqual({
    type: 'Template',
    body: [
      {
        type: 'Comment',
        value: 'Lorem Ipsum',
      },
      {
        type: 'Text',
        value: ' ',
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
        value: ` <div></div>`,
      },
    ],
  });
});

test('SetStatement', () => {
  expect(parser(`{% set name = 'Bruce Wayne' %}`).Statement()).toStrictEqual({
    type: 'SetStatement',
    declarations: [
      {
        init: {
          type: 'StringLiteral',
          value: 'Bruce Wayne',
        },
        name: {
          type: 'Identifier',
          name: 'name',
        },
        type: 'VariableDeclaration',
      },
    ],
  });

  expect(
    parser(`{% set name, nick_name = 'Bruce Wayne', 'Batman' %}`).Statement()
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
          name: 'name',
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
          name: 'nick_name',
        },
        type: 'VariableDeclaration',
      },
    ],
  });

  expect(
    parser(`{% set greetings %}Hello user!{% endset %}`).Statement()
  ).toStrictEqual({
    type: 'SetStatement',
    declarations: [
      {
        init: {
          type: 'Text',
          value: 'Hello user!',
        },
        name: {
          type: 'Identifier',
          name: 'greetings',
        },
        type: 'VariableDeclaration',
      },
    ],
  });
});

test('CallExpression', () => {
  expect(parser(`{{ hello() }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      arguments: [],
      callee: {
        type: 'Identifier',
        name: 'hello',
      },
      type: 'CallExpression',
    },
  });

  expect(
    parser(`{{ hello(42, model="T800") }}`).Template().body[0]
  ).toStrictEqual({
    type: 'VariableStatement',
    value: {
      arguments: [
        {
          type: 'NumericLiteral',
          value: 42,
        },
        {
          key: {
            type: 'Identifier',
            name: 'model',
          },
          type: 'NamedArgument',
          value: {
            type: 'StringLiteral',
            value: 'T800',
          },
        },
      ],
      callee: {
        type: 'Identifier',
        name: 'hello',
      },
      type: 'CallExpression',
    },
  });
});

test('FilterExpression', () => {
  expect(
    parser(`list|join(', ')|title`, ModeKind.Statement).FilterExpression()
  ).toStrictEqual({
    type: 'FilterExpression',
    expression: {
      type: 'FilterExpression',
      expression: {
        type: 'Identifier',
        name: 'list',
      },
      filter: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'join',
        },
        arguments: [
          {
            type: 'StringLiteral',
            value: ', ',
          },
        ],
      },
    },
    filter: {
      type: 'Identifier',
      name: 'title',
    },
  });
});

test('ApplyStatement', () => {
  expect(
    parser(
      `{% apply upper %}This text becomes uppercase{% endapply %}`
    ).SourceElementList()
  ).toStrictEqual([
    {
      type: 'ApplyStatement',
      text: {
        type: 'Text',
        value: 'This text becomes uppercase',
      },
      filter: {
        type: 'Identifier',
        name: 'upper',
      },
    },
  ]);

  expect(
    parser(
      `{% apply lower|escape('html') %}<strong>SOME TEXT</strong>{% endapply %}`
    ).SourceElementList()
  ).toStrictEqual([
    {
      type: 'ApplyStatement',
      text: {
        type: 'Text',
        value: '<strong>SOME TEXT</strong>',
      },
      filter: {
        type: 'FilterExpression',
        expression: {
          type: 'Identifier',
          name: 'lower',
        },
        filter: {
          type: 'CallExpression',
          arguments: [
            {
              type: 'StringLiteral',
              value: 'html',
            },
          ],
          callee: {
            type: 'Identifier',
            name: 'escape',
          },
        },
      },
    },
  ]);
});

test('ForInStatement', () => {
  expect(
    parser(`{% for i in arr %}{{ i }}{% endfor %}`).Template()
  ).toStrictEqual({
    type: 'Template',
    body: [
      {
        type: 'ForInStatement',
        alternate: null,
        variables: [
          {
            type: 'Identifier',
            name: 'i',
          },
        ],
        expression: {
          type: 'Identifier',
          name: 'arr',
        },
        body: [
          {
            type: 'VariableStatement',
            value: {
              type: 'Identifier',
              name: 'i',
            },
          },
        ],
      },
    ],
  });

  expect(
    parser(
      `{% for user in users %}{{ user }}{% else %}<em>no user found</em>{% endfor %}`
    ).Template()
  ).toStrictEqual({
    type: 'Template',
    body: [
      {
        type: 'ForInStatement',
        variables: [
          {
            type: 'Identifier',
            name: 'user',
          },
        ],
        expression: {
          type: 'Identifier',
          name: 'users',
        },
        body: [
          {
            type: 'VariableStatement',
            value: {
              type: 'Identifier',
              name: 'user',
            },
          },
        ],
        alternate: {
          type: 'Text',
          value: '<em>no user found</em>',
        },
      },
    ],
  });
});

test('ArrowFunction', () => {
  expect(parser(`{{ v => v * 2 }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      params: [
        {
          type: 'Identifier',
          name: 'v',
        },
      ],
      body: {
        left: {
          type: 'Identifier',
          name: 'v',
        },
        operator: '*',
        right: {
          type: 'NumericLiteral',
          value: 2,
        },
        type: 'BinaryExpression',
      },
      type: 'ArrowFunction',
    },
  });

  expect(parser(`{{ () => "Hello" }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      params: [],
      body: {
        type: 'StringLiteral',
        value: 'Hello',
      },
      type: 'ArrowFunction',
    },
  });

  expect(
    parser(`{{ (first, second) => first + second }}`).Template().body[0]
  ).toStrictEqual({
    type: 'VariableStatement',
    value: {
      params: [
        {
          type: 'Identifier',
          name: 'first',
        },
        {
          type: 'Identifier',
          name: 'second',
        },
      ],
      body: {
        left: {
          type: 'Identifier',
          name: 'first',
        },
        operator: '+',
        right: {
          type: 'Identifier',
          name: 'second',
        },
        type: 'BinaryExpression',
      },
      type: 'ArrowFunction',
    },
  });
});

test('ExponentiationExpression', () => {
  expect(
    parser(`2 ** 2`, ModeKind.Statement).ExponentiationExpression()
  ).toStrictEqual({
    left: {
      type: 'NumericLiteral',
      value: 2,
    },
    operator: '**',
    right: {
      type: 'NumericLiteral',
      value: 2,
    },
    type: 'BinaryExpression',
  });

  expect(
    parser(`2 ** 2 ** PI`, ModeKind.Statement).ExponentiationExpression()
  ).toStrictEqual({
    left: {
      left: {
        type: 'NumericLiteral',
        value: 2,
      },
      operator: '**',
      right: {
        type: 'NumericLiteral',
        value: 2,
      },
      type: 'BinaryExpression',
    },
    operator: '**',
    right: {
      type: 'Identifier',
      name: 'PI',
    },
    type: 'BinaryExpression',
  });
});

test('CoalesceExpression', () => {
  expect(
    parser(`2 ?? 2`, ModeKind.Statement).CoalesceExpression()
  ).toStrictEqual({
    left: {
      type: 'NumericLiteral',
      value: 2,
    },
    operator: '??',
    right: {
      type: 'NumericLiteral',
      value: 2,
    },
    type: 'BinaryExpression',
  });

  expect(
    parser(`a and b ?? c or d`, ModeKind.Statement).CoalesceExpression()
  ).toStrictEqual({
    left: {
      left: {
        type: 'Identifier',
        name: 'a',
      },
      operator: 'and',
      right: {
        type: 'Identifier',
        name: 'b',
      },
      type: 'BinaryExpression',
    },
    operator: '??',
    right: {
      left: {
        type: 'Identifier',
        name: 'c',
      },
      operator: 'or',
      right: {
        type: 'Identifier',
        name: 'd',
      },
      type: 'BinaryExpression',
    },
    type: 'BinaryExpression',
  });
});

test('IfStatement', () => {
  expect(
    parser(
      `{% if online == false %}<p>Our website is in maintenance mode. Please, come back later.</p>{% endif %}`
    ).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: null,
        consequent: [
          {
            type: 'Text',
            value:
              '<p>Our website is in maintenance mode. Please, come back later.</p>',
          },
        ],
        test: {
          left: {
            type: 'Identifier',
            name: 'online',
          },
          operator: '==',
          right: {
            type: 'BooleanLiteral',
            value: false,
          },
          type: 'BinaryExpression',
        },
        type: 'IfStatement',
      },
    ],
    type: 'Template',
  });

  expect(
    parser(`{% if not user.subscribed %}{% endif %}`).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: null,
        consequent: [],
        test: {
          argument: {
            object: {
              type: 'Identifier',
              name: 'user',
            },
            property: {
              type: 'Identifier',
              name: 'subscribed',
            },
            type: 'MemberExpression',
          },
          operator: 'not',
          type: 'UnaryExpression',
        },
        type: 'IfStatement',
      },
    ],
    type: 'Template',
  });

  expect(
    parser(
      `{% if product.stock > 10 %}Available{% else %}Sold-out!{% endif %}`
    ).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: [
          {
            type: 'Text',
            value: 'Sold-out!',
          },
        ],
        consequent: [
          {
            type: 'Text',
            value: 'Available',
          },
        ],
        test: {
          left: {
            object: {
              type: 'Identifier',
              name: 'product',
            },
            property: {
              type: 'Identifier',
              name: 'stock',
            },
            type: 'MemberExpression',
          },
          operator: '>',
          type: 'BinaryExpression',
          right: {
            type: 'NumericLiteral',
            value: 10,
          },
        },
        type: 'IfStatement',
      },
    ],
    type: 'Template',
  });

  expect(
    parser(
      `{% if product.stock > 10 %}Available{% elseif product.stock > 0 %}Only {{ product.stock }} left!{% else %}Sold-out!{% endif %}`
    ).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: {
          alternate: [
            {
              type: 'Text',
              value: 'Sold-out!',
            },
          ],
          consequent: [
            {
              type: 'Text',
              value: 'Only ',
            },
            {
              type: 'VariableStatement',
              value: {
                object: {
                  type: 'Identifier',
                  name: 'product',
                },
                property: {
                  type: 'Identifier',
                  name: 'stock',
                },
                type: 'MemberExpression',
              },
            },
            {
              type: 'Text',
              value: ' left!',
            },
          ],
          test: {
            left: {
              object: {
                type: 'Identifier',
                name: 'product',
              },
              property: {
                type: 'Identifier',
                name: 'stock',
              },
              type: 'MemberExpression',
            },
            operator: '>',
            type: 'BinaryExpression',
            right: {
              type: 'NumericLiteral',
              value: 0,
            },
          },
          type: 'IfStatement',
        },
        consequent: [
          {
            type: 'Text',
            value: 'Available',
          },
        ],
        test: {
          left: {
            object: {
              type: 'Identifier',
              name: 'product',
            },
            property: {
              type: 'Identifier',
              name: 'stock',
            },
            type: 'MemberExpression',
          },
          operator: '>',
          type: 'BinaryExpression',
          right: {
            type: 'NumericLiteral',
            value: 10,
          },
        },
        type: 'IfStatement',
      },
    ],
    type: 'Template',
  });

  expect(
    parser(
      `{% if true %}111{{ text }}222{% else %}333{{ item }}444{% endif %}`
    ).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: [
          {
            type: 'Text',
            value: '333',
          },
          {
            type: 'VariableStatement',
            value: {
              type: 'Identifier',
              name: 'item',
            },
          },
          {
            type: 'Text',
            value: '444',
          },
        ],
        consequent: [
          {
            type: 'Text',
            value: '111',
          },
          {
            type: 'VariableStatement',
            value: {
              type: 'Identifier',
              name: 'text',
            },
          },
          {
            type: 'Text',
            value: '222',
          },
        ],
        test: {
          type: 'BooleanLiteral',
          value: true,
        },
        type: 'IfStatement',
      },
    ],
    type: 'Template',
  });
});

test('AutoescapeStatement', () => {
  expect(
    parser(`{% autoescape %}{% endautoescape %}`).Template().body[0]
  ).toStrictEqual({
    strategy: null,
    type: 'AutoescapeStatement',
    value: [],
  });

  expect(
    parser(`{% autoescape %}Everything{% endautoescape %}`).Template().body[0]
  ).toStrictEqual({
    strategy: null,
    type: 'AutoescapeStatement',
    value: [
      {
        type: 'Text',
        value: 'Everything',
      },
    ],
  });

  expect(
    parser(`{% autoescape 'html' %}Everything{% endautoescape %}`).Template()
      .body[0]
  ).toStrictEqual({
    strategy: {
      type: 'StringLiteral',
      value: 'html',
    },
    type: 'AutoescapeStatement',
    value: [
      {
        type: 'Text',
        value: 'Everything',
      },
    ],
  });

  expect(
    parser(`{% autoescape false %}Everything{% endautoescape %}`).Template()
      .body[0]
  ).toStrictEqual({
    strategy: {
      type: 'BooleanLiteral',
      value: false,
    },
    type: 'AutoescapeStatement',
    value: [
      {
        type: 'Text',
        value: 'Everything',
      },
    ],
  });
});

test('CacheStatement', () => {
  expect(
    parser(`{% cache "cache key" %}Cached forever{% endcache %}`).Template()
      .body[0]
  ).toStrictEqual({
    expiration: null,
    key: {
      type: 'StringLiteral',
      value: 'cache key',
    },
    type: 'CacheStatement',
    value: [
      {
        type: 'Text',
        value: 'Cached forever',
      },
    ],
  });

  expect(
    parser(
      `{% cache "cache key" ttl(300) %}Cached for 300 seconds{% endcache %}`
    ).Template().body[0]
  ).toStrictEqual({
    expiration: {
      callee: {
        type: 'Identifier',
        name: 'ttl',
      },
      arguments: [
        {
          type: 'NumericLiteral',
          value: 300,
        },
      ],
      type: 'CallExpression',
    },
    key: {
      type: 'StringLiteral',
      value: 'cache key',
    },
    type: 'CacheStatement',
    value: [
      {
        type: 'Text',
        value: 'Cached for 300 seconds',
      },
    ],
  });
});

test('DeprecatedStatement', () => {
  expect(
    parser(
      `{% deprecated 'The "base.twig" template is deprecated, use "layout.twig" instead.' %}`
    ).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value:
        'The "base.twig" template is deprecated, use "layout.twig" instead.',
    },
    type: 'DeprecatedStatement',
  });
});

test('DoStatement', () => {
  expect(parser(`{% do 1 + 2 %}`).Template().body[0]).toStrictEqual({
    expr: {
      left: {
        type: 'NumericLiteral',
        value: 1,
      },
      operator: '+',
      right: {
        type: 'NumericLiteral',
        value: 2,
      },
      type: 'BinaryExpression',
    },
    type: 'DoStatement',
  });
});

test('FlushStatement', () => {
  expect(parser(`{% flush %}`).Template().body[0]).toStrictEqual({
    type: 'FlushStatement',
  });
});

test('BlockStatement', () => {
  expect(
    parser(`{% block title %}Index{% endblock %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Index',
      },
    ],
    name: {
      type: 'Identifier',
      name: 'title',
    },
    type: 'BlockStatement',
    shortcut: false,
  });

  expect(
    parser(`{% block title %}Index{% endblock title %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Index',
      },
    ],
    name: {
      type: 'Identifier',
      name: 'title',
    },
    type: 'BlockStatement',
    shortcut: false,
  });
});

test('BlockInlineStatement', () => {
  expect(
    parser(`{% block title page_title|title %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'VariableStatement',
        value: {
          expression: {
            type: 'Identifier',
            name: 'page_title',
          },
          filter: {
            type: 'Identifier',
            name: 'title',
          },
          type: 'FilterExpression',
        },
      },
    ],
    name: {
      type: 'Identifier',
      name: 'title',
    },
    type: 'BlockStatement',
    shortcut: true,
  });
});

test('ExtendsStatement', () => {
  expect(parser(`{% extends "base.html" %}`).Template().body[0]).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'base.html',
    },
    type: 'ExtendsStatement',
  });
});

test('WithStatement', () => {
  expect(parser(`{% with %}{% endwith %}`).Template().body[0]).toStrictEqual({
    accessToOuterScope: true,
    body: [],
    expr: null,
    type: 'WithStatement',
  });

  expect(
    parser(`{% with { foo: 42 } %}{{ foo }}{% endwith %}`).Template().body[0]
  ).toStrictEqual({
    accessToOuterScope: true,
    body: [
      {
        type: 'VariableStatement',
        value: {
          type: 'Identifier',
          name: 'foo',
        },
      },
    ],
    expr: {
      properties: [
        {
          key: {
            type: 'Identifier',
            name: 'foo',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'NumericLiteral',
            value: 42,
          },
        },
      ],
      type: 'ObjectLiteral',
    },
    type: 'WithStatement',
  });

  expect(
    parser(
      `{% with { foo: 42 } only %}{# only foo is defined #}{% endwith %}`
    ).Template().body[0]
  ).toStrictEqual({
    accessToOuterScope: false,
    body: [
      {
        type: 'Comment',
        value: 'only foo is defined',
      },
    ],
    expr: {
      properties: [
        {
          key: {
            type: 'Identifier',
            name: 'foo',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'NumericLiteral',
            value: 42,
          },
        },
      ],
      type: 'ObjectLiteral',
    },
    type: 'WithStatement',
  });
});

test('UseStatement', () => {
  expect(parser(`{% use "blocks.html" %}`).Template().body[0]).toStrictEqual({
    importedBlocks: [],
    name: {
      type: 'StringLiteral',
      value: 'blocks.html',
    },
    type: 'UseStatement',
  });

  expect(
    parser(
      `{% use "blocks.html" with sidebar as base_sidebar, title as base_title %}`
    ).Template().body[0]
  ).toStrictEqual({
    importedBlocks: [
      {
        left: {
          type: 'Identifier',
          name: 'sidebar',
        },
        operator: 'as',
        right: {
          type: 'Identifier',
          name: 'base_sidebar',
        },
        type: 'BinaryExpression',
      },
      {
        left: {
          type: 'Identifier',
          name: 'title',
        },
        operator: 'as',
        right: {
          type: 'Identifier',
          name: 'base_title',
        },
        type: 'BinaryExpression',
      },
    ],
    name: {
      type: 'StringLiteral',
      value: 'blocks.html',
    },
    type: 'UseStatement',
  });
});

test('SandboxStatement', () => {
  expect(
    parser(`{% sandbox %}{% include 'user.html' %}{% endsandbox %}`).Template()
      .body[0]
  ).toStrictEqual({
    body: [
      {
        expr: {
          type: 'StringLiteral',
          value: 'user.html',
        },
        ignoreMissing: false,
        only: false,
        type: 'IncludeStatement',
        variables: null,
      },
    ],
    type: 'SandboxStatement',
  });
});

test('IncludeStatement', () => {
  expect(parser(`{% include 'header.html' %}`).Template().body[0]).toStrictEqual(
    {
      expr: {
        type: 'StringLiteral',
        value: 'header.html',
      },
      ignoreMissing: false,
      only: false,
      type: 'IncludeStatement',
      variables: null,
    }
  );

  expect(
    parser(`{% include 'header.html' with {'foo': 'bar'} %}`).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'header.html',
    },
    ignoreMissing: false,
    only: false,
    type: 'IncludeStatement',
    variables: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'StringLiteral',
            value: 'foo',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'StringLiteral',
            value: 'bar',
          },
        },
      ],
    },
  });

  expect(
    parser(`{% include 'header.html' only %}`).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'header.html',
    },
    ignoreMissing: false,
    only: true,
    type: 'IncludeStatement',
    variables: null,
  });

  expect(
    parser(
      `{% include 'header.html' ignore missing with {'foo': 'bar'} only %}`
    ).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'header.html',
    },
    ignoreMissing: true,
    only: true,
    type: 'IncludeStatement',
    variables: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'StringLiteral',
            value: 'foo',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'StringLiteral',
            value: 'bar',
          },
        },
      ],
    },
  });
});

test('MacroStatement', () => {
  expect(
    parser(`{% macro input() %}{% endmacro %}`).Template().body[0]
  ).toStrictEqual({
    type: 'MacroStatement',
    body: [],
    arguments: [],
    name: {
      type: 'Identifier',
      name: 'input',
    },
  });

  expect(
    parser(`{% macro input(name, age = 42) %}<input/>{% endmacro %}`).Template()
      .body[0]
  ).toStrictEqual({
    type: 'MacroStatement',
    body: [
      {
        type: 'Text',
        value: '<input/>',
      },
    ],
    arguments: [
      {
        type: 'Identifier',
        name: 'name',
      },
      {
        key: {
          type: 'Identifier',
          name: 'age',
        },
        type: 'NamedArgument',
        value: {
          type: 'NumericLiteral',
          value: 42,
        },
      },
    ],
    name: {
      type: 'Identifier',
      name: 'input',
    },
  });
});

test('ImportStatement', () => {
  expect(
    parser(`{% import "forms.html" as forms %}`).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'forms.html',
    },
    name: {
      type: 'Identifier',
      name: 'forms',
    },
    type: 'ImportStatement',
  });
});

test('FromStatement', () => {
  expect(
    parser(
      `{% from 'forms.html' import input as input_field, textarea %}`
    ).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'forms.html',
    },
    type: 'FromStatement',
    variables: [
      {
        left: {
          type: 'Identifier',
          name: 'input',
        },
        operator: 'as',
        right: {
          type: 'Identifier',
          name: 'input_field',
        },
        type: 'BinaryExpression',
      },
      {
        type: 'Identifier',
        name: 'textarea',
      },
    ],
  });
});

test('EmbedStatement', () => {
  expect(
    parser(
      `{% embed 'teasers_skeleton.twig' %}{# These blocks are defined in "teasers_skeleton.twig" #}{% endembed %}`
    ).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'teasers_skeleton.twig',
    },
    ignoreMissing: false,
    only: false,
    type: 'EmbedStatement',
    variables: null,
    body: [
      {
        type: 'Comment',
        value: 'These blocks are defined in "teasers_skeleton.twig"',
      },
    ],
  });

  expect(
    parser(
      `{% embed 'header.html' with {'foo': 'bar'} %}{% endembed %}`
    ).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'header.html',
    },
    ignoreMissing: false,
    only: false,
    type: 'EmbedStatement',
    variables: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'StringLiteral',
            value: 'foo',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'StringLiteral',
            value: 'bar',
          },
        },
      ],
    },
    body: [],
  });

  expect(
    parser(`{% embed 'header.html' only %}{% endembed %}`).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'header.html',
    },
    ignoreMissing: false,
    only: true,
    type: 'EmbedStatement',
    variables: null,
    body: [],
  });

  expect(
    parser(
      `{% embed 'header.html' ignore missing with {'foo': 'bar'} only %}{% endembed %}`
    ).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'header.html',
    },
    ignoreMissing: true,
    only: true,
    type: 'EmbedStatement',
    variables: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'StringLiteral',
            value: 'foo',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'StringLiteral',
            value: 'bar',
          },
        },
      ],
    },
    body: [],
  });
});

test('VerbatimStatement', () => {
  expect(
    parser(`{% verbatim %}<li>{{ item }}</li>{% endverbatim %}`).Template()
      .body[0]
  ).toStrictEqual({
    type: 'VerbatimStatement',
    body: [
      {
        type: 'Text',
        value: '<li>',
      },
      {
        type: 'VariableStatement',
        value: {
          type: 'Identifier',
          name: 'item',
        },
      },
      {
        type: 'Text',
        value: '</li>',
      },
    ],
  });
});

test('StringInterpolation', () => {
  expect(parser(`{{ "#{ 32 } baz" }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      body: [
        {
          expr: {
            type: 'NumericLiteral',
            value: 32,
          },
          type: 'InterpolationExpression',
        },
        {
          type: 'StringLiteral',
          value: ' baz',
        },
      ],
      type: 'StringInterpolation',
    },
  });

  expect(parser(`{{ "foo #{ 32 }" }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      body: [
        {
          type: 'StringLiteral',
          value: 'foo ',
        },
        {
          expr: {
            type: 'NumericLiteral',
            value: 32,
          },
          type: 'InterpolationExpression',
        },
      ],
      type: 'StringInterpolation',
    },
  });

  expect(
    parser(`{{ "foo #{ 32 } baz#{ { a: 32} }" }}`).Template().body[0]
  ).toStrictEqual({
    type: 'VariableStatement',
    value: {
      body: [
        {
          type: 'StringLiteral',
          value: 'foo ',
        },
        {
          expr: {
            type: 'NumericLiteral',
            value: 32,
          },
          type: 'InterpolationExpression',
        },
        {
          type: 'StringLiteral',
          value: ' baz',
        },
        {
          expr: {
            type: 'ObjectLiteral',
            properties: [
              {
                key: {
                  type: 'Identifier',
                  name: 'a',
                },
                shorthand: false,
                type: 'Property',
                value: {
                  type: 'NumericLiteral',
                  value: 32,
                },
              },
            ],
          },
          type: 'InterpolationExpression',
        },
      ],
      type: 'StringInterpolation',
    },
  });
});

test('FormThemeStatement', () => {
  expect(
    parser(`{% form_theme form 'form/fields.html.twig' %}`).Template().body[0]
  ).toStrictEqual({
    form: {
      type: 'Identifier',
      name: 'form',
    },
    resources: [
      {
        type: 'StringLiteral',
        value: 'form/fields.html.twig',
      },
    ],
    only: false,
    type: 'FormThemeStatement',
  });

  expect(
    parser(
      `{% form_theme form 'form/fields.html.twig' 'form/fields2.html.twig' %}`
    ).Template().body[0]
  ).toStrictEqual({
    form: {
      type: 'Identifier',
      name: 'form',
    },
    resources: [
      {
        type: 'StringLiteral',
        value: 'form/fields.html.twig',
      },
      {
        type: 'StringLiteral',
        value: 'form/fields2.html.twig',
      },
    ],
    only: false,
    type: 'FormThemeStatement',
  });

  expect(
    parser(
      `{% form_theme form with ['foundation_5_layout.html.twig'] only %}`
    ).Template().body[0]
  ).toStrictEqual({
    form: {
      type: 'Identifier',
      name: 'form',
    },
    resources: {
      elements: [
        {
          type: 'StringLiteral',
          value: 'foundation_5_layout.html.twig',
        },
      ],
      type: 'ArrayLiteral',
    },
    only: true,
    type: 'FormThemeStatement',
  });
});

test('TransStatement', () => {
  expect(
    parser(`{% trans %}Hello %name%{% endtrans %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Hello %name%',
      },
    ],
    type: 'TransStatement',
  });

  expect(
    parser(
      `{% trans with {'%name%': 'Fabien'} from 'app' %}Hello %name%{% endtrans %}`
    ).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Hello %name%',
      },
    ],
    domain: {
      type: 'StringLiteral',
      value: 'app',
    },
    type: 'TransStatement',
    vars: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'StringLiteral',
            value: '%name%',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'StringLiteral',
            value: 'Fabien',
          },
        },
      ],
    },
  });

  expect(
    parser(
      `{% trans with {'%name%': 'Fabien'} from 'app' into 'fr' %}Hello %name%{% endtrans %}`
    ).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Hello %name%',
      },
    ],
    domain: {
      type: 'StringLiteral',
      value: 'app',
    },
    locale: {
      type: 'StringLiteral',
      value: 'fr',
    },
    type: 'TransStatement',
    vars: {
      type: 'ObjectLiteral',
      properties: [
        {
          key: {
            type: 'StringLiteral',
            value: '%name%',
          },
          shorthand: false,
          type: 'Property',
          value: {
            type: 'StringLiteral',
            value: 'Fabien',
          },
        },
      ],
    },
  });
});

test('TransDefaultDomainStatement', () => {
  expect(
    parser(`{% trans_default_domain domain %}`).Template().body[0]
  ).toStrictEqual({
    domain: {
      type: 'Identifier',
      name: 'domain',
    },
    type: 'TransDefaultDomainStatement',
  });
});

test('StopwatchStatement', () => {
  expect(
    parser(`{% stopwatch 'event_name' %}...{% endstopwatch %}`).Template()
      .body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: '...',
      },
    ],
    event_name: {
      type: 'StringLiteral',
      value: 'event_name',
    },
    type: 'StopwatchStatement',
  });
});

test('Divisible by', () => {
  expect(
    parser(`{% if loop.index is divisible by(3) %}{% endif %}`).Template()
      .body[0]
  ).toStrictEqual({
    alternate: null,
    consequent: [],
    test: {
      left: {
        object: {
          type: 'Identifier',
          name: 'loop',
        },
        property: {
          type: 'Identifier',
          name: 'index',
        },
        type: 'MemberExpression',
      },
      operator: 'is',
      right: {
        arguments: [
          {
            type: 'NumericLiteral',
            value: 3,
          },
        ],
        callee: {
          type: 'Identifier',
          name: 'divisible by',
        },
        type: 'CallExpression',
      },
      type: 'BinaryExpression',
    },
    type: 'IfStatement',
  });
});

test('Same as', () => {
  expect(
    parser(`{% if foo.attribute is same as(false) %}{% endif %}`).Template()
      .body[0]
  ).toStrictEqual({
    alternate: null,
    consequent: [],
    test: {
      left: {
        object: {
          type: 'Identifier',
          name: 'foo',
        },
        property: {
          type: 'Identifier',
          name: 'attribute',
        },
        type: 'MemberExpression',
      },
      operator: 'is',
      right: {
        arguments: [
          {
            type: 'BooleanLiteral',
            value: false,
          },
        ],
        callee: {
          type: 'Identifier',
          name: 'same as',
        },
        type: 'CallExpression',
      },
      type: 'BinaryExpression',
    },
    type: 'IfStatement',
  });
});

test('Set, In, Arrow Function', () => {
  expect(
    parser(`{% set sizes = sizes in v => v > 38 %}`).Template().body[0]
  ).toStrictEqual({
    declarations: [
      {
        init: {
          left: {
            type: 'Identifier',
            name: 'sizes',
          },
          operator: 'in',
          right: {
            body: {
              left: {
                type: 'Identifier',
                name: 'v',
              },
              operator: '>',
              right: {
                type: 'NumericLiteral',
                value: 38,
              },
              type: 'BinaryExpression',
            },
            params: [
              {
                type: 'Identifier',
                name: 'v',
              },
            ],
            type: 'ArrowFunction',
          },
          type: 'BinaryExpression',
        },
        name: {
          type: 'Identifier',
          name: 'sizes',
        },
        type: 'VariableDeclaration',
      },
    ],
    type: 'SetStatement',
  });
});

// test('Boilerplate', () => {
//   expect(parse(``).Template().body[0]).toStrictEqual();
// });
