import {
  createToken as chevrotainCreateToken,
  CustomPatternMatcherReturn,
  ITokenConfig,
  Lexer,
  MultiModesDefinition,
  TokenType,
} from 'chevrotain';

const modes: MultiModesDefinition = {
  statement: [],
  template: [],
  comment: [],
};

function createToken(
  config: ITokenConfig,
  modes: TokenType[][] = []
): TokenType {
  const token = chevrotainCreateToken(config);

  for (const mode of modes) {
    mode.push(token);
  }

  return token;
}

export const Precedence10 = createToken(
  {
    name: 'Precedence10',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence15 = createToken(
  {
    name: 'Precedence15',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence16 = createToken(
  {
    name: 'Precedence16',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence17 = createToken(
  {
    name: 'Precedence17',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence18 = createToken(
  {
    name: 'Precedence18',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence20 = createToken(
  {
    name: 'Precedence20',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence25 = createToken(
  {
    name: 'Precedence25',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence30 = createToken(
  {
    name: 'Precedence30',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence40 = createToken(
  {
    name: 'Precedence40',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence60 = createToken(
  {
    name: 'Precedence60',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence100 = createToken(
  {
    name: 'Precedence100',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence200 = createToken(
  {
    name: 'Precedence200',
    pattern: Lexer.NA,
  },
  [modes.statement]
);
export const Precedence300 = createToken(
  {
    name: 'Precedence300',
    pattern: Lexer.NA,
  },
  [modes.statement]
);

export const WhiteSpace = createToken(
  { name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED },
  [modes.statement, modes.template, modes.comment]
);

export const Number = createToken(
  {
    name: 'Number',
    pattern: /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/,
  },
  [modes.statement]
);
export const String = createToken(
  {
    name: 'String',
    pattern: /"([^#"\\]*(?:\\.[^#"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/,
  },
  [modes.statement]
);

export const LComment = createToken(
  { name: 'LComment', pattern: /{#/, push_mode: 'comment' },
  [modes.template]
);
export const RComment = createToken(
  {
    name: 'RComment',
    pattern: /#}/,
    pop_mode: true,
  },
  [modes.comment]
);
export const Comment = createToken(
  {
    name: 'Comment',
    line_breaks: true,
    pattern: (text, startOffset): CustomPatternMatcherReturn | null => {
      const startBlockPattern = /\s*\#\}/;

      const execResult = startBlockPattern.exec(text);

      return execResult
        ? [text.substring(startOffset, execResult.index)]
        : null;
    },
  },
  [modes.comment]
);

export const LVariable = createToken(
  { name: 'LVariable', pattern: /{{[-~]?/, push_mode: 'statement' },
  [modes.template]
);
export const RVariable = createToken(
  {
    name: 'RVariable',
    pattern: /[-~]?}}/,
    pop_mode: true,
  },
  [modes.statement]
);

export const LBlock = createToken(
  { name: 'LBlock', pattern: /{%[-~]?/, push_mode: 'statement' },
  [modes.template]
);
export const RBlock = createToken(
  {
    name: 'RBlock',
    pattern: /[-~]?%}/,
    pop_mode: true,
  },
  [modes.statement]
);

export const Boolean = createToken(
  { name: 'Boolean', pattern: /true|false/i },
  [modes.statement]
);
export const Null = createToken({ name: 'Null', pattern: /null|none/i }, [
  modes.statement,
]);
export const Arrow = createToken({ name: 'Arrow', pattern: /=>/ }, [
  modes.statement,
]);

export const OrBinary = createToken(
  {
    name: 'OrBinary',
    pattern: /or/,
    categories: [Precedence10],
  },
  [modes.statement]
);
export const AndBinary = createToken(
  {
    name: 'AndBinary',
    pattern: /and/,
    categories: [Precedence15],
  },
  [modes.statement]
);
export const BitwiseOrBinary = createToken(
  {
    name: 'BitwiseOrBinary',
    pattern: /b-or/,
    categories: [Precedence16],
  },
  [modes.statement]
);
export const BitwiseXorBinary = createToken(
  {
    name: 'BitwiseXorBinary',
    pattern: /b-xor/,
    categories: [Precedence17],
  },
  [modes.statement]
);
export const BitwiseAndBinary = createToken(
  {
    name: 'BitwiseAndBinary',
    pattern: /b-and/,
    categories: [Precedence18],
  },
  [modes.statement]
);
export const EqualBinary = createToken(
  {
    name: 'EqualBinary',
    pattern: /==/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const NotEqualBinary = createToken(
  {
    name: 'NotEqualBinary',
    pattern: /!=/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const SpaceshipBinary = createToken(
  {
    name: 'SpaceshipBinary',
    pattern: /<=>/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const GreaterEqualBinary = createToken(
  {
    name: 'GreaterEqualBinary',
    pattern: />=/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const LessEqualBinary = createToken(
  {
    name: 'LessEqualBinary',
    pattern: /<=/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const LessBinary = createToken(
  {
    name: 'LessBinary',
    pattern: /</,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const GreaterBinary = createToken(
  {
    name: 'GreaterBinary',
    pattern: />/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const NotInBinary = createToken(
  {
    name: 'NotInBinary',
    pattern: /not in/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const InBinary = createToken(
  {
    name: 'InBinary',
    pattern: /in/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const MatchesBinary = createToken(
  {
    name: 'MatchesBinary',
    pattern: /matches/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const StartsWithBinary = createToken(
  {
    name: 'StartsWithBinary',
    pattern: /starts with/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const EndsWithBinary = createToken(
  {
    name: 'EndsWithBinary',
    pattern: /ends with/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const HasSomeBinary = createToken(
  {
    name: 'HasSomeBinary',
    pattern: /has some/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const HasEveryBinary = createToken(
  {
    name: 'HasEveryBinary',
    pattern: /has every/,
    categories: [Precedence20],
  },
  [modes.statement]
);
export const RangeBinary = createToken(
  {
    name: 'RangeBinary',
    pattern: /\.\./,
    categories: [Precedence25],
  },
  [modes.statement]
);
export const Plus = createToken(
  {
    name: 'AddBinary',
    pattern: /\+/,
    categories: [Precedence30],
  },
  [modes.statement]
);
export const Minus = createToken(
  {
    name: 'SubBinary',
    pattern: /\-/,
    categories: [Precedence30],
  },
  [modes.statement]
);
export const ConcatBinary = createToken(
  {
    name: 'ConcatBinary',
    pattern: /\~/,
    categories: [Precedence40],
  },
  [modes.statement]
);
export const PowerBinary = createToken(
  {
    name: 'PowerBinary',
    pattern: /\*\*/,
    categories: [Precedence200],
  },
  [modes.statement]
);
export const MulBinary = createToken(
  {
    name: 'MulBinary',
    pattern: /\*/,
    categories: [Precedence60],
  },
  [modes.statement]
);
export const FloorDivBinary = createToken(
  {
    name: 'FloorDivBinary',
    pattern: /\/\//,
    categories: [Precedence60],
  },
  [modes.statement]
);
export const DivBinary = createToken(
  {
    name: 'DivBinary',
    pattern: /\//,
    categories: [Precedence60],
  },
  [modes.statement]
);
export const ModBinary = createToken(
  {
    name: 'ModBinary',
    pattern: /%/,
    categories: [Precedence60],
  },
  [modes.statement]
);
export const IsNotBinary = createToken(
  {
    name: 'IsNotBinary',
    pattern: /is not/,
    categories: [Precedence100],
  },
  [modes.statement]
);
export const IsBinary = createToken(
  {
    name: 'IsBinary',
    pattern: /is/,
    categories: [Precedence100],
  },
  [modes.statement]
);
export const NullCoalesceExpression = createToken(
  {
    name: 'NullCoalesceExpression',
    pattern: /\?\?/,
    categories: [Precedence300],
  },
  [modes.statement]
);

export const Not = createToken({ name: 'Not', pattern: /not/ }, [
  modes.statement,
]);
export const Exclamation = createToken({ name: 'Exclamation', pattern: /!/ }, [
  modes.statement,
]);
export const PlusPlus = createToken({ name: 'PlusPlus', pattern: /\+\+/ }, [
  modes.statement,
]);
export const MinusMinus = createToken({ name: 'MinusMinus', pattern: /\-\-/ }, [
  modes.statement,
]);

export const Dot = createToken({ name: 'Dot', pattern: /\./ }, [
  modes.statement,
]);
export const LCurly = createToken({ name: 'LCurly', pattern: /{/ }, [
  modes.statement,
]);
export const RCurly = createToken({ name: 'RCurly', pattern: /}/ }, [
  modes.statement,
]);
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ }, [
  modes.statement,
]);
export const RBracket = createToken({ name: 'RBracket', pattern: /]/ }, [
  modes.statement,
]);
export const LParen = createToken({ name: 'LParen', pattern: /\(/ }, [
  modes.statement,
]);
export const RParen = createToken({ name: 'RParen', pattern: /\)/ }, [
  modes.statement,
]);
export const Comma = createToken({ name: 'Comma', pattern: /,/ }, [
  modes.statement,
]);
export const Colon = createToken({ name: 'Colon', pattern: /:/ }, [
  modes.statement,
]);
export const SemiColon = createToken({ name: 'SemiColon', pattern: /;/ }, [
  modes.statement,
]);
export const Question = createToken({ name: 'Question', pattern: /\?/ }, [
  modes.statement,
]);
export const VerticalBar = createToken({ name: 'VerticalBar', pattern: /\|/ }, [
  modes.statement,
]);
export const EqualsToken = createToken({ name: 'EqualsToken', pattern: /=/ }, [
  modes.statement,
]);

export const SetToken = createToken({ name: 'SetToken', pattern: /set/ }, [
  modes.statement,
]);
export const EndSetToken = createToken(
  { name: 'EndSetToken', pattern: /endset/ },
  [modes.statement]
);

export const ApplyToken = createToken(
  { name: 'ApplyToken', pattern: /apply/ },
  [modes.statement]
);
export const EndApplyToken = createToken(
  { name: 'EndApplyToken', pattern: /endapply/ },
  [modes.statement]
);

export const ForToken = createToken({ name: 'ForToken', pattern: /for/ }, [
  modes.statement,
]);
export const ElseToken = createToken({ name: 'ElseToken', pattern: /else/ }, [
  modes.statement,
]);
export const EndForToken = createToken(
  { name: 'EndForToken', pattern: /endfor/ },
  [modes.statement]
);

export const IdentifierName = createToken(
  {
    name: 'IdentifierName',
    pattern: /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
  },
  [modes.statement]
);

// export const RawText = createToken({
//   name: 'RawText',
//   line_breaks: true,
//   pattern: (text, startOffset): CustomPatternMatcherReturn | null => {
//     const startBlockPattern = /{%\s*endverbatim/;
//     startBlockPattern.lastIndex = startOffset;

//     const execResult = startBlockPattern.exec(text);

//     return execResult === null
//       ? null
//       : [text.substring(startOffset, execResult.index)];
//   },
// });

export const Text = createToken(
  {
    name: 'Text',
    line_breaks: true,
    pattern: (text, startOffset): CustomPatternMatcherReturn | null => {
      const startBlockPattern = /\{[{%#]/;
      const allText = text.substring(startOffset);
      const execResult = startBlockPattern.exec(allText);

      return execResult === null
        ? [allText]
        : [allText.substring(0, execResult.index)];
    },
  },
  [modes.template]
);

export class TwigLexer extends Lexer {
  constructor() {
    super({ modes, defaultMode: 'template' });
  }
}
