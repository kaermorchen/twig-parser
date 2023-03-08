import { test, expect } from 'vitest';
import Parser from '../out/parser.js';

test('Numbers', () => {
  expect(Parser.parse(`{{ 42 }}`)).toMatchSnapshot();
});

test('Strings', () => {
  expect(Parser.parse(`{{ "Hello" }}`)).toMatchSnapshot();
});

test('Identifier', () => {
  expect(Parser.parse(`{{ foo }}`)).toMatchSnapshot();
});
