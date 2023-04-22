import { TwigLexer } from './lexer.js';
import { TwigParser } from './twig-parser.js';

let lexer: TwigLexer;
let parser: TwigParser;

export function parse(sourceText: string) {
  if (!lexer && !parser) {
    lexer = new TwigLexer();
    parser = new TwigParser();
  }

  const { tokens } = lexer.tokenize(sourceText);

  parser.input = tokens;

  const ast = parser.Template();

  return {
    ast,
    tokens,
    errors: parser.errors,
  };
}
