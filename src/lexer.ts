import {
  createToken as chevrotainCreateToken,
  CustomPatternMatcherReturn,
  IMultiModeLexerDefinition,
  ITokenConfig,
  Lexer,
  TokenType,
} from 'chevrotain';

export enum ModeKind {
  Template = 'Template',
  Statement = 'Statement',
  Comment = 'Comment',
}

const lexerDefinition: IMultiModeLexerDefinition = {
  modes: {
    [ModeKind.Template]: [],
    [ModeKind.Statement]: [],
    [ModeKind.Comment]: [],
  },
  defaultMode: ModeKind.Template,
};

function createToken(
  config: ITokenConfig,
  modeKinds: ModeKind[] = []
): TokenType {
  const token = chevrotainCreateToken(config);

  for (const modeKind of modeKinds) {
    lexerDefinition.modes[modeKind].push(token);
  }

  return token;
}

export const Precedence10 = createToken(
  {
    name: 'Precedence10',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence15 = createToken(
  {
    name: 'Precedence15',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence16 = createToken(
  {
    name: 'Precedence16',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence17 = createToken(
  {
    name: 'Precedence17',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence18 = createToken(
  {
    name: 'Precedence18',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence20 = createToken(
  {
    name: 'Precedence20',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence25 = createToken(
  {
    name: 'Precedence25',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence30 = createToken(
  {
    name: 'Precedence30',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence40 = createToken(
  {
    name: 'Precedence40',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence60 = createToken(
  {
    name: 'Precedence60',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence100 = createToken(
  {
    name: 'Precedence100',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence200 = createToken(
  {
    name: 'Precedence200',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);
export const Precedence300 = createToken(
  {
    name: 'Precedence300',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);

export const WhiteSpaceToken = createToken(
  { name: 'WhiteSpaceToken', pattern: /\s+/, group: Lexer.SKIPPED },
  [ModeKind.Statement, ModeKind.Template, ModeKind.Comment]
);

export const Number = createToken(
  {
    name: 'Number',
    pattern: /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/,
  },
  [ModeKind.Statement]
);
export const String = createToken(
  {
    name: 'String',
    pattern: /"([^#"\\]*(?:\\.[^#"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/,
  },
  [ModeKind.Statement]
);

export const LComment = createToken(
  { name: 'LComment', pattern: /{#/, push_mode: ModeKind.Comment },
  [ModeKind.Template]
);
export const RComment = createToken(
  {
    name: 'RComment',
    pattern: /#}/,
    pop_mode: true,
  },
  [ModeKind.Comment]
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
  [ModeKind.Comment]
);

export const LVariable = createToken(
  { name: 'LVariable', pattern: /{{[-~]?/, push_mode: ModeKind.Statement },
  [ModeKind.Template]
);
export const RVariable = createToken(
  {
    name: 'RVariable',
    pattern: /[-~]?}}/,
    pop_mode: true,
  },
  [ModeKind.Statement]
);

export const LBlock = createToken(
  { name: 'LBlock', pattern: /{%[-~]?/, push_mode: ModeKind.Statement },
  [ModeKind.Template]
);
export const RBlock = createToken(
  {
    name: 'RBlock',
    pattern: /[-~]?%}/,
    pop_mode: true,
  },
  [ModeKind.Statement]
);

export const Boolean = createToken(
  { name: 'Boolean', pattern: /true|false/i },
  [ModeKind.Statement]
);
export const Null = createToken({ name: 'Null', pattern: /null|none/i }, [
  ModeKind.Statement,
]);
export const Arrow = createToken({ name: 'Arrow', pattern: /=>/ }, [
  ModeKind.Statement,
]);

export const OrBinary = createToken(
  {
    name: 'OrBinary',
    pattern: /or/,
    categories: [Precedence10],
  },
  [ModeKind.Statement]
);
export const AndBinary = createToken(
  {
    name: 'AndBinary',
    pattern: /and/,
    categories: [Precedence15],
  },
  [ModeKind.Statement]
);
export const BitwiseOrBinary = createToken(
  {
    name: 'BitwiseOrBinary',
    pattern: /b-or/,
    categories: [Precedence16],
  },
  [ModeKind.Statement]
);
export const BitwiseXorBinary = createToken(
  {
    name: 'BitwiseXorBinary',
    pattern: /b-xor/,
    categories: [Precedence17],
  },
  [ModeKind.Statement]
);
export const BitwiseAndBinary = createToken(
  {
    name: 'BitwiseAndBinary',
    pattern: /b-and/,
    categories: [Precedence18],
  },
  [ModeKind.Statement]
);
export const EqualBinary = createToken(
  {
    name: 'EqualBinary',
    pattern: /==/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const NotEqualBinary = createToken(
  {
    name: 'NotEqualBinary',
    pattern: /!=/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const SpaceshipBinary = createToken(
  {
    name: 'SpaceshipBinary',
    pattern: /<=>/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const GreaterEqualBinary = createToken(
  {
    name: 'GreaterEqualBinary',
    pattern: />=/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const LessEqualBinary = createToken(
  {
    name: 'LessEqualBinary',
    pattern: /<=/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const LessBinary = createToken(
  {
    name: 'LessBinary',
    pattern: /</,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const GreaterBinary = createToken(
  {
    name: 'GreaterBinary',
    pattern: />/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const NotInBinary = createToken(
  {
    name: 'NotInBinary',
    pattern: /not in/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const InBinary = createToken(
  {
    name: 'InBinary',
    pattern: /in/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const MatchesBinary = createToken(
  {
    name: 'MatchesBinary',
    pattern: /matches/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const StartsWithBinary = createToken(
  {
    name: 'StartsWithBinary',
    pattern: /starts with/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const EndsWithBinary = createToken(
  {
    name: 'EndsWithBinary',
    pattern: /ends with/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const HasSomeBinary = createToken(
  {
    name: 'HasSomeBinary',
    pattern: /has some/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const HasEveryBinary = createToken(
  {
    name: 'HasEveryBinary',
    pattern: /has every/,
    categories: [Precedence20],
  },
  [ModeKind.Statement]
);
export const RangeBinary = createToken(
  {
    name: 'RangeBinary',
    pattern: /\.\./,
    categories: [Precedence25],
  },
  [ModeKind.Statement]
);
export const Plus = createToken(
  {
    name: 'AddBinary',
    pattern: /\+/,
    categories: [Precedence30],
  },
  [ModeKind.Statement]
);
export const Minus = createToken(
  {
    name: 'SubBinary',
    pattern: /\-/,
    categories: [Precedence30],
  },
  [ModeKind.Statement]
);
export const ConcatBinary = createToken(
  {
    name: 'ConcatBinary',
    pattern: /\~/,
    categories: [Precedence40],
  },
  [ModeKind.Statement]
);
export const PowerBinary = createToken(
  {
    name: 'PowerBinary',
    pattern: /\*\*/,
    categories: [Precedence200],
  },
  [ModeKind.Statement]
);
export const MulBinary = createToken(
  {
    name: 'MulBinary',
    pattern: /\*/,
    categories: [Precedence60],
  },
  [ModeKind.Statement]
);
export const FloorDivBinary = createToken(
  {
    name: 'FloorDivBinary',
    pattern: /\/\//,
    categories: [Precedence60],
  },
  [ModeKind.Statement]
);
export const DivBinary = createToken(
  {
    name: 'DivBinary',
    pattern: /\//,
    categories: [Precedence60],
  },
  [ModeKind.Statement]
);
export const ModBinary = createToken(
  {
    name: 'ModBinary',
    pattern: /%/,
    categories: [Precedence60],
  },
  [ModeKind.Statement]
);
export const IsNotBinary = createToken(
  {
    name: 'IsNotBinary',
    pattern: /is not/,
    categories: [Precedence100],
  },
  [ModeKind.Statement]
);
export const IsBinary = createToken(
  {
    name: 'IsBinary',
    pattern: /is/,
    categories: [Precedence100],
  },
  [ModeKind.Statement]
);
export const NullCoalesceExpression = createToken(
  {
    name: 'NullCoalesceExpression',
    pattern: /\?\?/,
    categories: [Precedence300],
  },
  [ModeKind.Statement]
);

export const Not = createToken({ name: 'Not', pattern: /not/ }, [
  ModeKind.Statement,
]);
export const Exclamation = createToken({ name: 'Exclamation', pattern: /!/ }, [
  ModeKind.Statement,
]);
export const PlusPlus = createToken({ name: 'PlusPlus', pattern: /\+\+/ }, [
  ModeKind.Statement,
]);
export const MinusMinus = createToken({ name: 'MinusMinus', pattern: /\-\-/ }, [
  ModeKind.Statement,
]);

export const Dot = createToken({ name: 'Dot', pattern: /\./ }, [
  ModeKind.Statement,
]);
export const LCurly = createToken({ name: 'LCurly', pattern: /{/ }, [
  ModeKind.Statement,
]);
export const RCurly = createToken({ name: 'RCurly', pattern: /}/ }, [
  ModeKind.Statement,
]);
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ }, [
  ModeKind.Statement,
]);
export const RBracket = createToken({ name: 'RBracket', pattern: /]/ }, [
  ModeKind.Statement,
]);
export const LParen = createToken({ name: 'LParen', pattern: /\(/ }, [
  ModeKind.Statement,
]);
export const RParen = createToken({ name: 'RParen', pattern: /\)/ }, [
  ModeKind.Statement,
]);
export const Comma = createToken({ name: 'Comma', pattern: /,/ }, [
  ModeKind.Statement,
]);
export const Colon = createToken({ name: 'Colon', pattern: /:/ }, [
  ModeKind.Statement,
]);
export const SemiColon = createToken({ name: 'SemiColon', pattern: /;/ }, [
  ModeKind.Statement,
]);
export const Question = createToken({ name: 'Question', pattern: /\?/ }, [
  ModeKind.Statement,
]);
export const VerticalBar = createToken({ name: 'VerticalBar', pattern: /\|/ }, [
  ModeKind.Statement,
]);
export const EqualsToken = createToken({ name: 'EqualsToken', pattern: /=/ }, [
  ModeKind.Statement,
]);

export const SetToken = createToken({ name: 'SetToken', pattern: /set/ }, [
  ModeKind.Statement,
]);
export const EndSetToken = createToken(
  { name: 'EndSetToken', pattern: /endset/ },
  [ModeKind.Statement]
);

export const ApplyToken = createToken(
  { name: 'ApplyToken', pattern: /apply/ },
  [ModeKind.Statement]
);
export const EndApplyToken = createToken(
  { name: 'EndApplyToken', pattern: /endapply/ },
  [ModeKind.Statement]
);

export const ForToken = createToken({ name: 'ForToken', pattern: /for/ }, [
  ModeKind.Statement,
]);
export const ElseToken = createToken({ name: 'ElseToken', pattern: /else/ }, [
  ModeKind.Statement,
]);
export const EndForToken = createToken(
  { name: 'EndForToken', pattern: /endfor/ },
  [ModeKind.Statement]
);

export const IdentifierName = createToken(
  {
    name: 'IdentifierName',
    pattern: /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
  },
  [ModeKind.Statement]
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
  [ModeKind.Template]
);

export class TwigLexer extends Lexer {
  constructor() {
    super(lexerDefinition);
  }
}
