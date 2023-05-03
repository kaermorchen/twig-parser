import { ModeKind, TwigLexer } from '../src/lexer.js';
import { TwigParser } from '../src/twig-parser.js';

const lexer = new TwigLexer();
const twigParser = new TwigParser();

export function parser(
  tpl: string,
  modeKind = ModeKind.Template
) {
  const { tokens } = lexer.tokenize(tpl, modeKind);

  twigParser.input = tokens;

  return twigParser;
}
