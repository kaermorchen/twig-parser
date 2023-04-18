import { ModeKind, TwigLexer } from '../src/lexer.js';
import { TwigParser } from '../src/twig-parser.js';

const lexer = new TwigLexer();
const twigParser = new TwigParser();

export function parser(
  tpl,
  modeKind = ModeKind.Template
) {
  const { tokens } = lexer.tokenize(tpl, modeKind);
  // console.log(tokens);

  twigParser.input = tokens;

  return twigParser;
}
