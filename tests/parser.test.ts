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
  ).toEqual({
    type: 'VerbatimBlock',
    value,
  });
});

test('Number', () => {
  expect(parse('0').numberLiteral(), 'Zero').toEqual({
    type: 'NumberLiteral',
    value: 0,
  });
  expect(parse('42').numberLiteral(), 'Integer').toEqual({
    type: 'NumberLiteral',
    value: 42,
  });
  expect(parse('42.23').numberLiteral(), 'Float').toEqual({
    type: 'NumberLiteral',
    value: 42.23,
  });
});

test('String', () => {
  expect(parse(`"Hello world"`).stringLiteral()).toEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`'Hello world'`).stringLiteral()).toEqual({
    type: 'StringLiteral',
    value: 'Hello world',
  });
  expect(parse(`""`).stringLiteral()).toEqual({
    type: 'StringLiteral',
    value: '',
  });
  expect(parse(`'It\\'s good'`).stringLiteral()).toEqual({
    type: 'StringLiteral',
    value: `It\\'s good`,
  });
});

test('Identifier', () => {
  expect(parse(`user`).identifier()).toEqual({
    type: 'Identifier',
    value: `user`,
  });
});
