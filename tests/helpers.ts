import { ModeKind, TwigLexer } from "../src/lexer.js";
import TwigParser from "../src/parser.js";

const lexer = new TwigLexer();
const parser = new TwigParser();

export function parse(tpl: string, modeKind: ModeKind = ModeKind.Template): TwigParser {
  const { tokens } = lexer.tokenize(tpl, modeKind);
  console.log(tokens);

  parser.input = tokens;

  return parser;
}
