import { test, expect } from 'vitest';
import { parse } from './helpers.js';

test('VerbatimBlock', () => {
  const value = `<ul>
      {% for item in seq %}
        <li>{{ item }}</li>
      {% endfor %}
    </ul>`;

  expect(
    parse(`{% verbatim %}${value}{% endverbatim %}`).verbatimBlock()
  ).toStrictEqual({
    type: 'VerbatimBlock',
    value,
  });
});

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
