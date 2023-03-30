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

createToken({ name: 'Boolean', pattern: /true|false/i });
createToken({ name: 'Null', pattern: /null|none/i });
createToken({ name: 'Arrow', pattern: /=>/ });

createToken({ name: 'OrBinary', pattern: /or/ });
createToken({ name: 'AndBinary', pattern: /and/ });
createToken({ name: 'BitwiseOrBinary', pattern: /b-or/ });
createToken({ name: 'BitwiseXorBinary', pattern: /b-xor/ });
createToken({ name: 'BitwiseAndBinary', pattern: /b-and/ });
createToken({ name: 'EqualBinary', pattern: /==/ });
createToken({ name: 'NotEqualBinary', pattern: /!=/ });
createToken({ name: 'SpaceshipBinary', pattern: /<=>/ });
createToken({ name: 'GreaterEqualBinary', pattern: />=/ });
createToken({ name: 'LessEqualBinary', pattern: /<=/ });
createToken({ name: 'LessBinary', pattern: /</ });
createToken({ name: 'GreaterBinary', pattern: />/ });
createToken({ name: 'NotInBinary', pattern: /not in/ });
createToken({ name: 'InBinary', pattern: /in/ });
createToken({ name: 'MatchesBinary', pattern: /matches/ });
createToken({ name: 'StartsWithBinary', pattern: /starts with/ });
createToken({ name: 'EndsWithBinary', pattern: /ends with/ });
createToken({ name: 'HasSomeBinary', pattern: /has some/ });
createToken({ name: 'HasEveryBinary', pattern: /has every/ });
createToken({ name: 'RangeBinary', pattern: /\.\./ });
createToken({ name: 'AddBinary', pattern: /\+/ });
createToken({ name: 'SubBinary', pattern: /\-/ });
createToken({ name: 'ConcatBinary', pattern: /\~/ });
createToken({ name: 'NotUnary', pattern: /not/ });
createToken({ name: 'PowerBinary', pattern: /\*\*/ });
createToken({ name: 'MulBinary', pattern: /\*/ });
createToken({ name: 'FloorDivBinary', pattern: /\/\// });
createToken({ name: 'DivBinary', pattern: /\// });
createToken({ name: 'ModBinary', pattern: /%/ });
createToken({ name: 'IsNotBinary', pattern: /is not/ });
createToken({ name: 'IsBinary', pattern: /is/ });
createToken({ name: 'NullCoalesceExpression', pattern: /\?\?/ });

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
createToken({ name: 'Question', pattern: /\?/ });
createToken({ name: 'VerticalBar', pattern: /\|/ });

createToken({ name: 'Verbatim', pattern: /\bverbatim\b/ });
createToken({ name: 'EndVerbatim', pattern: /\bendverbatim\b/ });
createToken({
  name: 'Identifier',
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
