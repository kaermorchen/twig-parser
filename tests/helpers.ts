import { TwigLexer } from "../src/lexer.js";
import TwigParser from "../src/parser.js";

const lexer = new TwigLexer();
const parser = new TwigParser();

export function tpl2asr(tpl: string) {
  const { tokens } = lexer.tokenize(tpl);
  parser.input = tokens;

  return parser.template();
}
