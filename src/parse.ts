import { TwigLexer } from './lexer.js';
import { TwigParser } from './twig-parser.js';

const lexer = new TwigLexer();
const parser = new TwigParser();

export function parse(sourceText: string) {
  const { tokens } = lexer.tokenize(sourceText);

  parser.input = tokens;

  const ast = parser.Template();

  return {
    ast,
    tokens,
    Errors: parser.errors,
  };
}
