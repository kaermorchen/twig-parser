import { test, expect } from 'vitest';
import result from '../src/parser';

console.log(result.parse('aaa {{ bbbb }} ccc'));

// console.log(result.parse('aaa {{ bbbb }} ccc'));
// console.log(result.parser.parse('4 + 23'));

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
