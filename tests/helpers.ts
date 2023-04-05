import { TwigLexer } from "../src/lexer.js";
import TwigParser from "../src/parser.js";

const lexer = new TwigLexer();
const parser = new TwigParser();

export function parse(tpl: string, initialMode: string = 'template'): TwigParser {
  const { tokens } = lexer.tokenize(tpl, initialMode);
  parser.input = tokens;

  return parser;
}
