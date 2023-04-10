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
  expect(parse(`hello()`, ModeKind.Statement).CallExpression()).toStrictEqual({
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      value: 'hello',
    },
    arguments: [],
  });

  expect(
    parse(`hello(42, model="T800")`, ModeKind.Statement).CallExpression()
  ).toStrictEqual({
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      value: 'hello',
    },
    arguments: [
      {
        type: 'NumericLiteral',
        value: 42,
      },
      {
        type: 'NamedArgument',
        key: {
          type: 'Identifier',
          value: 'model',
        },
        value: {
          type: 'StringLiteral',
          value: 'T800',
        },
      },
    ],
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
  expect(parse(`{% flush %}`).Template().body[0]).toStrictEqual({ type: 'FlushStatement' });
});

// test('Boilerplate', () => {
//   expect(parse(``).Template().body[0]).toStrictEqual();
// });
