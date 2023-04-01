import {
  createToken as chevrotainCreateToken,
  CustomPatternMatcherReturn,
  ITokenConfig,
  Lexer,
  TokenType,
} from 'chevrotain';

const tokenArray: TokenType[] = [];

function createToken(config: ITokenConfig): TokenType {
  const token = chevrotainCreateToken(config);

  tokenArray.push(token);

  return token;
}

function findTokenByName(name: string): TokenType | undefined {
  return tokenArray.find((item) => item.name === name);
}

function createTokenCategory(name: string): TokenType {
  return findTokenByName(name) ?? createToken({ name, pattern: Lexer.NA });
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

createToken({ name: 'OrBinary', pattern: /or/, categories: createTokenCategory('Operator10') });
createToken({ name: 'AndBinary', pattern: /and/, categories: createTokenCategory('Operator15') });
createToken({ name: 'BitwiseOrBinary', pattern: /b-or/, categories: createTokenCategory('Operator16') });
createToken({ name: 'BitwiseXorBinary', pattern: /b-xor/, categories: createTokenCategory('Operator17') });
createToken({ name: 'BitwiseAndBinary', pattern: /b-and/, categories: createTokenCategory('Operator18') });
createToken({ name: 'EqualBinary', pattern: /==/, categories: createTokenCategory('Operator20') });
createToken({ name: 'NotEqualBinary', pattern: /!=/, categories: createTokenCategory('Operator20') });
createToken({ name: 'SpaceshipBinary', pattern: /<=>/, categories: createTokenCategory('Operator20') });
createToken({ name: 'GreaterEqualBinary', pattern: />=/, categories: createTokenCategory('Operator20') });
createToken({ name: 'LessEqualBinary', pattern: /<=/, categories: createTokenCategory('Operator20') });
createToken({ name: 'LessBinary', pattern: /</, categories: createTokenCategory('Operator20') });
createToken({ name: 'GreaterBinary', pattern: />/, categories: createTokenCategory('Operator20') });
createToken({ name: 'NotInBinary', pattern: /not in/, categories: createTokenCategory('Operator20') });
createToken({ name: 'InBinary', pattern: /in/, categories: createTokenCategory('Operator20') });
createToken({ name: 'MatchesBinary', pattern: /matches/, categories: createTokenCategory('Operator20') });
createToken({ name: 'StartsWithBinary', pattern: /starts with/, categories: createTokenCategory('Operator20') });
createToken({ name: 'EndsWithBinary', pattern: /ends with/, categories: createTokenCategory('Operator20') });
createToken({ name: 'HasSomeBinary', pattern: /has some/, categories: createTokenCategory('Operator20') });
createToken({ name: 'HasEveryBinary', pattern: /has every/, categories: createTokenCategory('Operator20') });
createToken({ name: 'RangeBinary', pattern: /\.\./, categories: createTokenCategory('Operator25') });
createToken({ name: 'AddBinary', pattern: /\+/, categories: createTokenCategory('Operator30') });
createToken({ name: 'SubBinary', pattern: /\-/, categories: createTokenCategory('Operator30') });
createToken({ name: 'ConcatBinary', pattern: /\~/, categories: createTokenCategory('Operator40') });
createToken({ name: 'NotUnary', pattern: /not/ });
createToken({ name: 'PowerBinary', pattern: /\*\*/, categories: createTokenCategory('Operator200') });
createToken({ name: 'MulBinary', pattern: /\*/, categories: createTokenCategory('Operator60') });
createToken({ name: 'FloorDivBinary', pattern: /\/\//, categories: createTokenCategory('Operator60') });
createToken({ name: 'DivBinary', pattern: /\//, categories: createTokenCategory('Operator60') });
createToken({ name: 'ModBinary', pattern: /%/, categories: createTokenCategory('Operator60') });
createToken({ name: 'IsNotBinary', pattern: /is not/, categories: createTokenCategory('Operator100') });
createToken({ name: 'IsBinary', pattern: /is/, categories: createTokenCategory('Operator100') });
createToken({ name: 'NullCoalesceExpression', pattern: /\?\?/, categories: createTokenCategory('Operator300') });

createToken({ name: 'Dot', pattern: /\./ });
createToken({ name: 'LCurly', pattern: /{/ });
createToken({ name: 'RCurly', pattern: /}/ });
createToken({ name: 'LBracket', pattern: /\[/ });
createToken({ name: 'RBracket', pattern: /]/ });
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
