import {
  createToken as chevrotainCreateToken,
  CustomPatternMatcherReturn,
  ITokenConfig,
  Lexer,
  TokenType,
} from 'chevrotain';

const tokenArray: TokenType[] = [];

function createToken(config: ITokenConfig) {
  tokenArray.push(chevrotainCreateToken(config));
}

createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });
createToken({
  name: 'Number',
  pattern: /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/,
});
createToken({
  name: 'String',
  pattern: /"([^#"\\]*(?:\\.[^#"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/,
});

createToken({ name: 'LComment', pattern: /{#/ });
createToken({ name: 'RComment', pattern: /#}/ });
createToken({
  name: 'Comment',
  pattern: /[\S\s]*?(?=\s*#})/,
  line_breaks: true,
});

createToken({ name: 'LVariable', pattern: /{{[-~]?/ });
createToken({ name: 'RVariable', pattern: /[-~]?}}/ });

createToken({ name: 'LBlock', pattern: /{%[-~]?/ });
createToken({ name: 'RBlock', pattern: /[-~]?%}/ });

createToken({ name: 'True', pattern: /true/ });
createToken({ name: 'False', pattern: /false/ });
createToken({ name: 'Null', pattern: /null/ });
createToken({ name: 'Dot', pattern: /\./ });
createToken({ name: 'LCurly', pattern: /{/ });
createToken({ name: 'RCurly', pattern: /}/ });
createToken({ name: 'LSquare', pattern: /\[/ });
createToken({ name: 'RSquare', pattern: /]/ });
createToken({ name: 'LParen', pattern: /\(/ });
createToken({ name: 'RParen', pattern: /\)/ });
createToken({ name: 'Comma', pattern: /,/ });
createToken({ name: 'Colon', pattern: /:/ });
createToken({ name: 'SemiColon', pattern: /;/ });
createToken({ name: 'Arrow', pattern: /=>/ });
createToken({ name: 'Equals', pattern: /=/ });
createToken({ name: 'Star', pattern: /\*/ });
createToken({ name: 'Plus', pattern: /\+/ });
createToken({ name: 'Question', pattern: /\?/ });
createToken({ name: 'GreaterThan', pattern: />/ });
createToken({ name: 'Slash', pattern: /\// });
createToken({ name: 'VerticalBar', pattern: /\|/ });
createToken({ name: 'Verbatim', pattern: /\bverbatim\b/ });
createToken({ name: 'EndVerbatim', pattern: /\bendverbatim\b/ });
createToken({
  name: 'Name',
  pattern: /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
});

createToken({
  name: 'RawText',
  line_breaks: true,
  pattern: (text, startOffset): CustomPatternMatcherReturn | null => {
    const startBlockPattern = /{%\s*endverbatim/;
    startBlockPattern.lastIndex = startOffset;

    const execResult = startBlockPattern.exec(text);

    return execResult === null
      ? null
      : [text.substring(startOffset, execResult.index)];
  },
});

createToken({
  name: 'Text',
  line_breaks: true,
  pattern: (text, startOffset): CustomPatternMatcherReturn | null => {
    const startBlockPattern = /\{[{%#]/;
    startBlockPattern.lastIndex = startOffset;

    const execResult = startBlockPattern.exec(text);

    return execResult === null
      ? [text]
      : [text.substring(startOffset, execResult.index)];
  },
});

export class TwigLexer extends Lexer {
  constructor() {
    super(tokenArray);
  }
}

export const tokens = tokenArray.reduce<Record<string, TokenType>>(
  (obj, token) => {
    obj[token.name] = token;

    return obj;
  },
  {}
);
