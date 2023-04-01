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

export const Precedence10 = createToken({ name: 'Precedenc10', pattern: Lexer.NA });
export const Precedenc15 = createToken({ name: 'Precedenc15', pattern: Lexer.NA });
export const Precedenc16 = createToken({ name: 'Precedenc16', pattern: Lexer.NA });
export const Precedenc17 = createToken({ name: 'Precedenc17', pattern: Lexer.NA });
export const Precedenc18 = createToken({ name: 'Precedenc18', pattern: Lexer.NA });
export const Precedenc20 = createToken({ name: 'Precedenc20', pattern: Lexer.NA });
export const Precedenc25 = createToken({ name: 'Precedenc25', pattern: Lexer.NA });
export const Precedenc30 = createToken({ name: 'Precedenc30', pattern: Lexer.NA });
export const Precedenc40 = createToken({ name: 'Precedenc40', pattern: Lexer.NA });
export const Precedenc60 = createToken({ name: 'Precedenc60', pattern: Lexer.NA });
export const Precedenc100 = createToken({ name: 'Precedenc100', pattern: Lexer.NA });
export const Precedenc200 = createToken({ name: 'Precedenc200', pattern: Lexer.NA });
export const Precedenc300 = createToken({ name: 'Precedenc300', pattern: Lexer.NA });

export const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });
export const Number = createToken({
  name: 'Number',
  pattern: /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/,
});
export const String = createToken({
  name: 'String',
  pattern: /"([^#"\\]*(?:\\.[^#"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/,
});

export const LComment = createToken({ name: 'LComment', pattern: /{#/ });
export const RComment = createToken({ name: 'RComment', pattern: /#}/ });
export const Comment = createToken({
  name: 'Comment',
  pattern: /[\S\s]*?(?=\s*#})/,
  line_breaks: true,
});

export const LVariable = createToken({ name: 'LVariable', pattern: /{{[-~]?/ });
export const RVariable = createToken({ name: 'RVariable', pattern: /[-~]?}}/ });

export const LBlock = createToken({ name: 'LBlock', pattern: /{%[-~]?/ });
export const RBlock = createToken({ name: 'RBlock', pattern: /[-~]?%}/ });

export const Boolean = createToken({ name: 'Boolean', pattern: /true|false/i });
export const Null = createToken({ name: 'Null', pattern: /null|none/i });
export const Arrow = createToken({ name: 'Arrow', pattern: /=>/ });

export const OrBinary = createToken({ name: 'OrBinary', pattern: /or/, categories: [Precedence10] });
export const AndBinary = createToken({ name: 'AndBinary', pattern: /and/, categories: [Precedenc15] });
export const BitwiseOrBinary = createToken({ name: 'BitwiseOrBinary', pattern: /b-or/, categories: [Precedenc16] });
export const BitwiseXorBinary = createToken({ name: 'BitwiseXorBinary', pattern: /b-xor/, categories: [Precedenc17] });
export const BitwiseAndBinary = createToken({ name: 'BitwiseAndBinary', pattern: /b-and/, categories: [Precedenc18] });
export const EqualBinary = createToken({ name: 'EqualBinary', pattern: /==/, categories: [Precedenc20] });
export const NotEqualBinary = createToken({ name: 'NotEqualBinary', pattern: /!=/, categories: [Precedenc20] });
export const SpaceshipBinary = createToken({ name: 'SpaceshipBinary', pattern: /<=>/, categories: [Precedenc20] });
export const GreaterEqualBinary = createToken({ name: 'GreaterEqualBinary', pattern: />=/, categories: [Precedenc20] });
export const LessEqualBinary = createToken({ name: 'LessEqualBinary', pattern: /<=/, categories: [Precedenc20] });
export const LessBinary = createToken({ name: 'LessBinary', pattern: /</, categories: [Precedenc20] });
export const GreaterBinary = createToken({ name: 'GreaterBinary', pattern: />/, categories: [Precedenc20] });
export const NotInBinary = createToken({ name: 'NotInBinary', pattern: /not in/, categories: [Precedenc20] });
export const InBinary = createToken({ name: 'InBinary', pattern: /in/, categories: [Precedenc20] });
export const MatchesBinary = createToken({ name: 'MatchesBinary', pattern: /matches/, categories: [Precedenc20] });
export const StartsWithBinary = createToken({ name: 'StartsWithBinary', pattern: /starts with/, categories: [Precedenc20] });
export const EndsWithBinary = createToken({ name: 'EndsWithBinary', pattern: /ends with/, categories: [Precedenc20] });
export const HasSomeBinary = createToken({ name: 'HasSomeBinary', pattern: /has some/, categories: [Precedenc20] });
export const HasEveryBinary = createToken({ name: 'HasEveryBinary', pattern: /has every/, categories: [Precedenc20] });
export const RangeBinary = createToken({ name: 'RangeBinary', pattern: /\.\./, categories: [Precedenc25] });
export const AddBinary = createToken({ name: 'AddBinary', pattern: /\+/, categories: [Precedenc30] });
export const SubBinary = createToken({ name: 'SubBinary', pattern: /\-/, categories: [Precedenc30] });
export const ConcatBinary = createToken({ name: 'ConcatBinary', pattern: /\~/, categories: [Precedenc40] });
export const NotUnary = createToken({ name: 'NotUnary', pattern: /not/ });
export const PowerBinary = createToken({ name: 'PowerBinary', pattern: /\*\*/, categories: [Precedenc200] });
export const MulBinary = createToken({ name: 'MulBinary', pattern: /\*/, categories: [Precedenc60] });
export const FloorDivBinary = createToken({ name: 'FloorDivBinary', pattern: /\/\//, categories: [Precedenc60] });
export const DivBinary = createToken({ name: 'DivBinary', pattern: /\//, categories: [Precedenc60] });
export const ModBinary = createToken({ name: 'ModBinary', pattern: /%/, categories: [Precedenc60] });
export const IsNotBinary = createToken({ name: 'IsNotBinary', pattern: /is not/, categories: [Precedenc100] });
export const IsBinary = createToken({ name: 'IsBinary', pattern: /is/, categories: [Precedenc100] });
export const NullCoalesceExpression = createToken({ name: 'NullCoalesceExpression', pattern: /\?\?/, categories: [Precedenc300] });

export const Dot = createToken({ name: 'Dot', pattern: /\./ });
export const LCurly = createToken({ name: 'LCurly', pattern: /{/ });
export const RCurly = createToken({ name: 'RCurly', pattern: /}/ });
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ });
export const RBracket = createToken({ name: 'RBracket', pattern: /]/ });
export const LParen = createToken({ name: 'LParen', pattern: /\(/ });
export const RParen = createToken({ name: 'RParen', pattern: /\)/ });
export const Comma = createToken({ name: 'Comma', pattern: /,/ });
export const Colon = createToken({ name: 'Colon', pattern: /:/ });
export const SemiColon = createToken({ name: 'SemiColon', pattern: /;/ });
export const Question = createToken({ name: 'Question', pattern: /\?/ });
export const VerticalBar = createToken({ name: 'VerticalBar', pattern: /\|/ });

export const Verbatim = createToken({ name: 'Verbatim', pattern: /\bverbatim\b/ });
export const EndVerbatim = createToken({ name: 'EndVerbatim', pattern: /\bendverbatim\b/ });
export const IdentifierName = createToken({
  name: 'IdentifierName',
  pattern: /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
});

export const RawText = createToken({
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

export const Text = createToken({
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
