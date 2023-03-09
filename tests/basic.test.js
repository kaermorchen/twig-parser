import { test, expect } from 'vitest';
import Parser from '../src/parser';
console.log(Parser.parse({}));
test('Base', () => {
  // expect(Parser.parse(`a`)).toMatchSnapshot();
});

// test('Numbers', () => {
//   expect(Parser.parse(`{{ 42 }}`)).toMatchSnapshot();
// });

// test('Strings', () => {
//   expect(Parser.parse(`{{ "Hello" }}`)).toMatchSnapshot();
// });

// test('Identifier', () => {
//   expect(Parser.parse(`{{ foo }}`)).toMatchSnapshot();
// });
