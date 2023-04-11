import { TwigLexer } from './lexer.js';
import TwigParser from './parser.js';

const lexer = new TwigLexer();
const parser = new TwigParser();

// const tmpl = `Text {# Comment #} {{user.name}} {% set v = 54 %} end text`;
const tmpl = `Text {{ user }}`;
const { tokens } = lexer.tokenize(tmpl);

parser.input = tokens;

const ast = parser.Template();

if (parser.errors.length > 0) {
  console.log(parser.errors);
} else {
  console.debug(ast);
  console.log('Done');
}
