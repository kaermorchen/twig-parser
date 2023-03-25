import { createToken, CstParser, Lexer as ChevLexer } from 'chevrotain';
import { Lexer } from './lexer.js';
import { Token } from './token.js';

const lexer = new Lexer();

const whiteSpace = createToken({
  name: 'whiteSpace',
  pattern: /\s+/,
  group: ChevLexer.SKIPPED,
});

const EOF = createToken({
  name: 'EOF',
});

const text = createToken({
  name: 'text',
});

const blockStart = createToken({
  name: 'BlockStart',
});

const varStart = createToken({
  name: 'VarStart',
});

const blockEnd = createToken({
  name: 'BlockEnd',
});

const varEnd = createToken({
  name: 'VarEnd',
});

const name = createToken({
  name: 'Name',
});

const number = createToken({
  name: 'number',
});

const string = createToken({
  name: 'string',
});

const operator = createToken({
  name: 'operator',
});

const punctuation = createToken({
  name: 'punctuation',
});

const interpolationStart = createToken({
  name: 'interpolationStart',
});

const interpolationEnd = createToken({
  name: 'interpolationStart',
});

const arrow = createToken({
  name: 'arrow',
});

// Lexer
let allTokens = [
  whiteSpace,
  EOF,
  text,
  blockStart,
  varStart,
  blockEnd,
  varEnd,
  name,
  number,
  string,
  operator,
  punctuation,
  interpolationStart,
  interpolationEnd,
  arrow,
];

// const tmpl = `Text {# Comment #} {{user.name}} {% set v = 54 %} end text`;
const tmpl = `Text {{ user }}`;
const tokens = [];

for (const token of lexer.tokenize(tmpl)) {
  const tokenTypeIdx = getTokenType(token.getType())?.tokenTypeIdx;

  tokens.push({
    tokenTypeIdx,
    payload: token.value,
    image: String(token.value),
    startLine: token.lineno,
  });
}

function getTokenType(tokenId: number) {
  switch (tokenId) {
    case Token.EOF_TYPE:
      return EOF;
    case Token.TEXT_TYPE:
      return text;
    case Token.BLOCK_START_TYPE:
      return blockStart;
    case Token.VAR_START_TYPE:
      return varStart;
    case Token.BLOCK_END_TYPE:
      return blockEnd;
    case Token.VAR_END_TYPE:
      return varEnd;
    case Token.NAME_TYPE:
      return name;
    case Token.NUMBER_TYPE:
      return number;
    case Token.STRING_TYPE:
      return string;
    case Token.OPERATOR_TYPE:
      return operator;
    case Token.PUNCTUATION_TYPE:
      return punctuation;
    case Token.INTERPOLATION_START_TYPE:
      return interpolationStart;
    case Token.INTERPOLATION_END_TYPE:
      return interpolationEnd;
    case Token.ARROW_TYPE:
      return arrow;
  }
}

class TwigParser extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE('template', () => {
      $.SUBRULE($.elements);
      $.CONSUME(EOF);
    });

    $.RULE('elements', () => {
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.element);
      });
    });

    $.RULE('element', () => {
      $.OR([
        { ALT: () => $.CONSUME(text) },
        { ALT: () => $.SUBRULE($.variable) },
      ]);
    });

    $.RULE('variable', () => {
      $.CONSUME(varStart);
      $.CONSUME(name);
      $.CONSUME(varEnd);
    });

    this.performSelfAnalysis();
  }
}

const parser = new TwigParser();

parser.input = tokens;
const ast = parser.template();

if (parser.errors.length > 0) {
  console.log(parser.errors);
} else {
  console.debug(ast);
  console.log('Done');
}
