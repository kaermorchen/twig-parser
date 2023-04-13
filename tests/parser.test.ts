import { test, expect } from 'vitest';
import { parse } from './helpers.js';
import { ModeKind } from '../src/lexer.js';

test('Identifier', () => {
  expect(parse(`user`, ModeKind.Statement).Identifier()).toStrictEqual({
    type: 'Identifier',
    value: `user`,
  });
});

test('Number', () => {
  expect(parse('0', ModeKind.Statement).NumericLiteral(), 'Zero').toStrictEqual(
    {
      type: 'NumericLiteral',
      value: 0,
    }
  );
  expect(
    parse('42', ModeKind.Statement).NumericLiteral(),
    'Integer'
  ).toStrictEqual({
    type: 'NumericLiteral',
    value: 42,
  });
  expect(
    parse('42.23', ModeKind.Statement).NumericLiteral(),
    'Float'
  ).toStrictEqual({
    type: 'NumericLiteral',
    value: 42.23,
  });
});

test('String', () => {
  expect(
    parse(`"Hello world"`, ModeKind.Statement).StringLiteral()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(
    parse(`'Hello world'`, ModeKind.Statement).StringLiteral()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`""`, ModeKind.Statement).StringLiteral()).toStrictEqual({
    type: 'StringLiteral',
    value: '',
  });
  expect(
    parse(`'It\\'s good'`, ModeKind.Statement).StringLiteral()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: `It\\'s good`,
  });
});

test('Boolean', () => {
  expect(parse(`true`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`TRUE`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: true,
  });
  expect(parse(`false`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
  expect(parse(`FALSE`, ModeKind.Statement).BooleanLiteral()).toStrictEqual({
    type: 'BooleanLiteral',
    value: false,
  });
});

test('Null', () => {
  const expected = {
    type: 'NullLiteral',
    value: null,
  };

  expect(parse(`null`, ModeKind.Statement).NullLiteral()).toStrictEqual(
    expected
  );
  expect(parse(`NULL`, ModeKind.Statement).NullLiteral()).toStrictEqual(
    expected
  );
  expect(parse(`none`, ModeKind.Statement).NullLiteral()).toStrictEqual(
    expected
  );
});

test('ArrayLiteral', () => {
  expect(parse(`[]`, ModeKind.Statement).ArrayLiteral()).toStrictEqual({
    type: 'ArrayLiteral',
    elements: [],
  });

  expect(parse(`[1, [2, 3]]`, ModeKind.Statement).ArrayLiteral()).toStrictEqual(
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
  expect(parse(`"key"`, ModeKind.Statement).PropertyName()).toStrictEqual(
    parse(`"key"`, ModeKind.Statement).StringLiteral()
  );
  expect(parse(`1`, ModeKind.Statement).PropertyName()).toStrictEqual(
    parse(`1`, ModeKind.Statement).NumericLiteral()
  );
  expect(parse(`key`, ModeKind.Statement).PropertyName()).toStrictEqual(
    parse(`key`, ModeKind.Statement).Identifier()
  );
  expect(parse(`(name)`, ModeKind.Statement).PropertyName()).toStrictEqual({
    type: 'Identifier',
    value: 'name',
  });
  // TODO: { (1 + 1): 'bar', (foo ~ 'b'): 'baz' }
});

test('PropertyAssignment', () => {
  expect(
    parse(`"key": 42`, ModeKind.Statement).PropertyDefinition()
  ).toStrictEqual({
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
    parse(`(name): "Anna"`, ModeKind.Statement).PropertyDefinition()
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

  expect(parse(`foo`, ModeKind.Statement).PropertyDefinition()).toStrictEqual({
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
  expect(parse(`{}`, ModeKind.Statement).ObjectLiteral()).toStrictEqual({
    type: 'ObjectLiteral',
    properties: [],
  });

  expect(
    parse(`{"key": 23, foo: bar, val}`, ModeKind.Statement).ObjectLiteral()
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

test('ParenthesizedExpression', () => {
  expect(
    parse(`(4)`, ModeKind.Statement).ParenthesizedExpression()
  ).toStrictEqual({
    type: 'NumericLiteral',
    value: 4,
  });

  expect(
    parse(`{{ not (post.status is constant('Post::PUBLISHED')) }}`).Template()
      .body[0]
  ).toStrictEqual({
    type: 'VariableStatement',
    value: {
      type: 'UnaryExpression',
      operator: 'not',
      argument: {
        left: {
          object: {
            type: 'Identifier',
            value: 'post',
          },
          property: {
            type: 'Identifier',
            value: 'status',
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
            value: 'constant',
          },
          type: 'CallExpression',
        },
        type: 'BinaryExpression',
      },
    },
  });
});

test('BinaryExpression', () => {
  expect(parse(`1 + 2`, ModeKind.Statement).Expression()).toStrictEqual({
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

  expect(parse(`4 * 2 + 2 * 3`, ModeKind.Statement).Expression()).toStrictEqual(
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
    parse(`"Hello", 42`, ModeKind.Statement).ExpressionList()
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
    parse(`"Hello"`, ModeKind.Statement).AssignmentExpression()
  ).toStrictEqual({
    type: 'StringLiteral',
    value: 'Hello',
  });

  expect(
    parse(`4 > 1`, ModeKind.Statement).AssignmentExpression()
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
    parse(`true ? 1 : 2`, ModeKind.Statement).AssignmentExpression()
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
    parse(`1 ?: 2`, ModeKind.Statement).AssignmentExpression()
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
    parse(`user.firstName`, ModeKind.Statement).LeftHandSideExpression()
  ).toStrictEqual({
    object: {
      type: 'Identifier',
      value: 'user',
    },
    property: {
      type: 'Identifier',
      value: 'firstName',
    },
    type: 'MemberExpression',
  });

  expect(
    parse(`user['name']`, ModeKind.Statement).LeftHandSideExpression()
  ).toStrictEqual({
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

  expect(
    parse(`user.a.b`, ModeKind.Statement).LeftHandSideExpression()
  ).toStrictEqual({
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
  expect(parse(`-4`, ModeKind.Statement).UnaryExpression()).toStrictEqual({
    argument: {
      type: 'NumericLiteral',
      value: 4,
    },
    operator: '-',
    type: 'UnaryExpression',
  });

  expect(parse(`not true`, ModeKind.Statement).UnaryExpression()).toStrictEqual(
    {
      argument: {
        type: 'BooleanLiteral',
        value: true,
      },
      operator: 'not',
      type: 'UnaryExpression',
    }
  );
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

test('Text', () => {
  expect(parse(`Hello world`).Text()).toStrictEqual({
    value: 'Hello world',
    type: 'Text',
  });
});

test('Comment', () => {
  expect(parse(`{# Lorem Ipsum #}`).Comment()).toStrictEqual({
    value: 'Lorem Ipsum',
    type: 'Comment',
  });
});

test('Template', () => {
  expect(
    parse(`{# Lorem Ipsum #} {{"str"}} <div></div>`).Template()
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

test('SetInlineStatement', () => {
  expect(parse(`{% set name = 'Bruce Wayne' %}`).Statement()).toStrictEqual({
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
    parse(`{% set name, nick_name = 'Bruce Wayne', 'Batman' %}`).Statement()
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

test('SetBlockStatement', () => {
  expect(
    parse(`{% set greetings %}Hello user!{% endset %}`).Statement()
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
          value: 'greetings',
        },
        type: 'VariableDeclaration',
      },
    ],
  });
});

test('CallExpression', () => {
  expect(parse(`{{ hello() }}`).Template().body[0]).toStrictEqual({
    type: 'VariableStatement',
    value: {
      arguments: [],
      callee: {
        type: 'Identifier',
        value: 'hello',
      },
      type: 'CallExpression',
    },
  });

  expect(
    parse(`{{ hello(42, model="T800") }}`).Template().body[0]
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
            value: 'model',
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
        value: 'hello',
      },
      type: 'CallExpression',
    },
  });
});

test('FilterExpression', () => {
  expect(
    parse(`list|join(', ')|title`, ModeKind.Statement).FilterExpression()
  ).toStrictEqual({
    type: 'FilterExpression',
    expression: {
      type: 'FilterExpression',
      expression: {
        type: 'Identifier',
        value: 'list',
      },
      filter: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          value: 'join',
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
      value: 'title',
    },
  });
});

test('ApplyStatement', () => {
  expect(
    parse(
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
        value: 'upper',
      },
    },
  ]);

  expect(
    parse(
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
          value: 'lower',
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
            value: 'escape',
          },
        },
      },
    },
  ]);
});

test('ForInStatement', () => {
  expect(
    parse(`{% for i in arr %}{{ i }}{% endfor %}`).Template()
  ).toStrictEqual({
    type: 'Template',
    body: [
      {
        type: 'ForInStatement',
        alternate: null,
        variables: [
          {
            type: 'Identifier',
            value: 'i',
          },
        ],
        expression: {
          type: 'Identifier',
          value: 'arr',
        },
        body: [
          {
            type: 'VariableStatement',
            value: {
              type: 'Identifier',
              value: 'i',
            },
          },
        ],
      },
    ],
  });

  expect(
    parse(
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
            value: 'user',
          },
        ],
        expression: {
          type: 'Identifier',
          value: 'users',
        },
        body: [
          {
            type: 'VariableStatement',
            value: {
              type: 'Identifier',
              value: 'user',
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
  expect(parse(`v => v * 2`, ModeKind.Statement).ArrowFunction()).toStrictEqual(
    {
      params: {
        type: 'Identifier',
        value: 'v',
      },
      body: {
        left: {
          type: 'Identifier',
          value: 'v',
        },
        operator: '*',
        right: {
          type: 'NumericLiteral',
          value: 2,
        },
        type: 'BinaryExpression',
      },
      type: 'ArrowFunction',
    }
  );

  expect(
    parse(
      `(first, second) => first + second`,
      ModeKind.Statement
    ).ArrowFunction()
  ).toStrictEqual({
    params: [
      {
        type: 'Identifier',
        value: 'first',
      },
      {
        type: 'Identifier',
        value: 'second',
      },
    ],
    body: {
      left: {
        type: 'Identifier',
        value: 'first',
      },
      operator: '+',
      right: {
        type: 'Identifier',
        value: 'second',
      },
      type: 'BinaryExpression',
    },
    type: 'ArrowFunction',
  });
});

test('ExponentiationExpression', () => {
  expect(
    parse(`2 ** 2`, ModeKind.Statement).ExponentiationExpression()
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
    parse(`2 ** 2 ** PI`, ModeKind.Statement).ExponentiationExpression()
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
      value: 'PI',
    },
    type: 'BinaryExpression',
  });
});

test('CoalesceExpression', () => {
  expect(
    parse(`2 ?? 2`, ModeKind.Statement).CoalesceExpression()
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
    parse(`a and b ?? c or d`, ModeKind.Statement).CoalesceExpression()
  ).toStrictEqual({
    left: {
      left: {
        type: 'Identifier',
        value: 'a',
      },
      operator: 'and',
      right: {
        type: 'Identifier',
        value: 'b',
      },
      type: 'BinaryExpression',
    },
    operator: '??',
    right: {
      left: {
        type: 'Identifier',
        value: 'c',
      },
      operator: 'or',
      right: {
        type: 'Identifier',
        value: 'd',
      },
      type: 'BinaryExpression',
    },
    type: 'BinaryExpression',
  });
});

test('IfStatement', () => {
  expect(
    parse(
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
            value: 'online',
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
    parse(`{% if not user.subscribed %}{% endif %}`).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: null,
        consequent: [],
        test: {
          argument: {
            object: {
              type: 'Identifier',
              value: 'user',
            },
            property: {
              type: 'Identifier',
              value: 'subscribed',
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
    parse(
      `{% if product.stock > 10 %}Available{% else %}Sold-out!{% endif %}`
    ).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: {
          type: 'Text',
          value: 'Sold-out!',
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
              value: 'product',
            },
            property: {
              type: 'Identifier',
              value: 'stock',
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
    parse(
      `{% if product.stock > 10 %}Available{% elseif product.stock > 0 %}Only {{ product.stock }} left!{% else %}Sold-out!{% endif %}`
    ).Template()
  ).toStrictEqual({
    body: [
      {
        alternate: {
          alternate: {
            type: 'Text',
            value: 'Sold-out!',
          },
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
                  value: 'product',
                },
                property: {
                  type: 'Identifier',
                  value: 'stock',
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
                value: 'product',
              },
              property: {
                type: 'Identifier',
                value: 'stock',
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
              value: 'product',
            },
            property: {
              type: 'Identifier',
              value: 'stock',
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
});

test('AutoescapeStatement', () => {
  expect(
    parse(`{% autoescape %}{% endautoescape %}`).Template().body[0]
  ).toStrictEqual({
    strategy: null,
    type: 'AutoescapeStatement',
    value: [],
  });

  expect(
    parse(`{% autoescape %}Everything{% endautoescape %}`).Template().body[0]
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
    parse(`{% autoescape 'html' %}Everything{% endautoescape %}`).Template()
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
    parse(`{% autoescape false %}Everything{% endautoescape %}`).Template()
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
    parse(`{% cache "cache key" %}Cached forever{% endcache %}`).Template()
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
    parse(
      `{% cache "cache key" ttl(300) %}Cached for 300 seconds{% endcache %}`
    ).Template().body[0]
  ).toStrictEqual({
    expiration: {
      callee: {
        type: 'Identifier',
        value: 'ttl',
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
    parse(
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
  expect(parse(`{% do 1 + 2 %}`).Template().body[0]).toStrictEqual({
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
  expect(parse(`{% flush %}`).Template().body[0]).toStrictEqual({
    type: 'FlushStatement',
  });
});

test('BlockStatement', () => {
  expect(
    parse(`{% block title %}Index{% endblock %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Index',
      },
    ],
    name: {
      type: 'Identifier',
      value: 'title',
    },
    type: 'BlockStatement',
    shortcut: false,
  });

  expect(
    parse(`{% block title %}Index{% endblock title %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Index',
      },
    ],
    name: {
      type: 'Identifier',
      value: 'title',
    },
    type: 'BlockStatement',
    shortcut: false,
  });
});

test('BlockInlineStatement', () => {
  expect(
    parse(`{% block title page_title|title %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        expression: {
          type: 'Identifier',
          value: 'page_title',
        },
        filter: {
          type: 'Identifier',
          value: 'title',
        },
        type: 'FilterExpression',
      },
    ],
    name: {
      type: 'Identifier',
      value: 'title',
    },
    type: 'BlockStatement',
    shortcut: true,
  });
});

test('ExtendsStatement', () => {
  expect(parse(`{% extends "base.html" %}`).Template().body[0]).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'base.html',
    },
    type: 'ExtendsStatement',
  });
});

test('WithStatement', () => {
  expect(parse(`{% with %}{% endwith %}`).Template().body[0]).toStrictEqual({
    accessToOuterScope: true,
    body: [],
    expr: null,
    type: 'WithStatement',
  });

  expect(
    parse(`{% with { foo: 42 } %}{{ foo }}{% endwith %}`).Template().body[0]
  ).toStrictEqual({
    accessToOuterScope: true,
    body: [
      {
        type: 'VariableStatement',
        value: {
          type: 'Identifier',
          value: 'foo',
        },
      },
    ],
    expr: {
      properties: [
        {
          key: {
            type: 'Identifier',
            value: 'foo',
          },
          shorthand: false,
          type: 'PropertyAssignment',
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
    parse(
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
            value: 'foo',
          },
          shorthand: false,
          type: 'PropertyAssignment',
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
  expect(parse(`{% use "blocks.html" %}`).Template().body[0]).toStrictEqual({
    importedBlocks: [],
    name: {
      type: 'StringLiteral',
      value: 'blocks.html',
    },
    type: 'UseStatement',
  });

  expect(
    parse(
      `{% use "blocks.html" with sidebar as base_sidebar, title as base_title %}`
    ).Template().body[0]
  ).toStrictEqual({
    importedBlocks: [
      {
        left: {
          type: 'Identifier',
          value: 'sidebar',
        },
        operator: 'as',
        right: {
          type: 'Identifier',
          value: 'base_sidebar',
        },
        type: 'BinaryExpression',
      },
      {
        left: {
          type: 'Identifier',
          value: 'title',
        },
        operator: 'as',
        right: {
          type: 'Identifier',
          value: 'base_title',
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
    parse(`{% sandbox %}{% include 'user.html' %}{% endsandbox %}`).Template()
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
  expect(parse(`{% include 'header.html' %}`).Template().body[0]).toStrictEqual(
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
    parse(`{% include 'header.html' with {'foo': 'bar'} %}`).Template().body[0]
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
          type: 'PropertyAssignment',
          value: {
            type: 'StringLiteral',
            value: 'bar',
          },
        },
      ],
    },
  });

  expect(
    parse(`{% include 'header.html' only %}`).Template().body[0]
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
    parse(
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
          type: 'PropertyAssignment',
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
    parse(`{% macro input() %}{% endmacro %}`).Template().body[0]
  ).toStrictEqual({
    type: 'MacroStatement',
    body: [],
    arguments: [],
    name: {
      type: 'Identifier',
      value: 'input',
    },
  });

  expect(
    parse(`{% macro input(name, age = 42) %}<input/>{% endmacro %}`).Template()
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
        value: 'name',
      },
      {
        key: {
          type: 'Identifier',
          value: 'age',
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
      value: 'input',
    },
  });
});

test('ImportStatement', () => {
  expect(
    parse(`{% import "forms.html" as forms %}`).Template().body[0]
  ).toStrictEqual({
    expr: {
      type: 'StringLiteral',
      value: 'forms.html',
    },
    name: {
      type: 'Identifier',
      value: 'forms',
    },
    type: 'ImportStatement',
  });
});

test('FromStatement', () => {
  expect(
    parse(
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
          value: 'input',
        },
        operator: 'as',
        right: {
          type: 'Identifier',
          value: 'input_field',
        },
        type: 'BinaryExpression',
      },
      {
        type: 'Identifier',
        value: 'textarea',
      },
    ],
  });
});

test('EmbedStatement', () => {
  expect(
    parse(
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
    parse(
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
          type: 'PropertyAssignment',
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
    parse(`{% embed 'header.html' only %}{% endembed %}`).Template().body[0]
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
    parse(
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
          type: 'PropertyAssignment',
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
    parse(`{% verbatim %}<li>{{ item }}</li>{% endverbatim %}`).Template()
      .body[0]
  ).toStrictEqual({
    type: 'EmbedStatement',
    body: [
      {
        type: 'Text',
        value: '<li>',
      },
      {
        type: 'VariableStatement',
        value: {
          type: 'Identifier',
          value: 'item',
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
  expect(parse(`{{ "#{ 32 } baz" }}`).Template().body[0]).toStrictEqual({
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

  expect(parse(`{{ "foo #{ 32 }" }}`).Template().body[0]).toStrictEqual({
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
    parse(`{{ "foo #{ 32 } baz#{ { a: 32} }" }}`).Template().body[0]
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
                  value: 'a',
                },
                shorthand: false,
                type: 'PropertyAssignment',
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
    parse(`{% form_theme form 'form/fields.html.twig' %}`).Template().body[0]
  ).toStrictEqual({
    form: {
      type: 'Identifier',
      value: 'form',
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
    parse(
      `{% form_theme form 'form/fields.html.twig' 'form/fields2.html.twig' %}`
    ).Template().body[0]
  ).toStrictEqual({
    form: {
      type: 'Identifier',
      value: 'form',
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
    parse(
      `{% form_theme form with ['foundation_5_layout.html.twig'] only %}`
    ).Template().body[0]
  ).toStrictEqual({
    form: {
      type: 'Identifier',
      value: 'form',
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
    parse(`{% trans %}Hello %name%{% endtrans %}`).Template().body[0]
  ).toStrictEqual({
    body: [
      {
        type: 'Text',
        value: 'Hello %name%',
      },
    ],
    domain: null,
    locale: null,
    type: 'TransStatement',
    vars: [],
  });

  expect(
    parse(
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
    locale: null,
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
          type: 'PropertyAssignment',
          value: {
            type: 'StringLiteral',
            value: 'Fabien',
          },
        },
      ],
    },
  });

  expect(
    parse(
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
          type: 'PropertyAssignment',
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
    parse(`{% trans_default_domain domain %}`).Template().body[0]
  ).toStrictEqual({
    domain: {
      type: 'Identifier',
      value: 'domain',
    },
    type: 'TransDefaultDomainStatement',
  });
});

test('StopwatchStatement', () => {
  expect(
    parse(`{% stopwatch 'event_name' %}...{% endstopwatch %}`).Template()
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
    parse(`{% if loop.index is divisible by(3) %}{% endif %}`).Template()
      .body[0]
  ).toStrictEqual({
    alternate: null,
    consequent: [],
    test: {
      left: {
        object: {
          type: 'Identifier',
          value: 'loop',
        },
        property: {
          type: 'Identifier',
          value: 'index',
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
          value: 'divisible by',
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
    parse(`{% if foo.attribute is same as(false) %}{% endif %}`).Template()
      .body[0]
  ).toStrictEqual({
    alternate: null,
    consequent: [],
    test: {
      left: {
        object: {
          type: 'Identifier',
          value: 'foo',
        },
        property: {
          type: 'Identifier',
          value: 'attribute',
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
          value: 'same as',
        },
        type: 'CallExpression',
      },
      type: 'BinaryExpression',
    },
    type: 'IfStatement',
  });
});

// test('Boilerplate', () => {
//   expect(parse(``).Template().body[0]).toStrictEqual();
// });
