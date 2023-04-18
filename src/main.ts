import { TwigLexer } from './lexer.js';
import { TwigParser } from './twig-parser.js';

const lexer = new TwigLexer();
const parser = new TwigParser();

// const tmpl = `Text {# Comment #} {{user.name}} {% set v = 54 %} end text`;
const tmpl = `
{% if item.url %}
  111{{ item.text }}222
{% else %}
  333{{ item.text }}444
{% endif %}
`;
const { tokens } = lexer.tokenize(tmpl);

parser.input = tokens;

const ast = parser.Template();

if (parser.errors.length > 0) {
  console.log(parser.errors);
} else {
  console.debug(ast);
  console.log('Done');
}
