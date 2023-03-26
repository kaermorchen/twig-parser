import { test, expect } from 'vitest';
import { Lexer } from "../src/lexer.js";
import TwigParser from "../src/parser.js";

const lexer = new Lexer();
const parser = new TwigParser();

export default function tpl2asr(tpl) {
  const { tokens } = lexer.tokenize(tpl);
  parser.input = tokens;

  return parser.template();
}

test('Text', () => {
  expect(tpl2asr(`Text`)).toMatchSnapshot();
});
