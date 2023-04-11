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

export const tokens: Record<string, TokenType> = {};

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

  tokens[token.name] = token;

  for (const modeKind of modeKinds) {
    lexerDefinition.modes[modeKind].push(token);
  }

  return token;
}

export const WhiteSpaceToken = createToken(
  { name: 'WhiteSpaceToken', pattern: /\s+/, group: Lexer.SKIPPED },
  [ModeKind.Statement, ModeKind.Comment]
);

export const NumberToken = createToken(
  {
    name: 'NumberToken',
    pattern: /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/,
  },
  [ModeKind.Statement]
);
export const StringToken = createToken(
  {
    name: 'StringToken',
    pattern: /"([^#"\\]*(?:\\.[^#"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/,
  },
  [ModeKind.Statement]
);

export const LCommentToken = createToken(
  { name: 'LCommentToken', pattern: /{#/, push_mode: ModeKind.Comment },
  [ModeKind.Template]
);
export const RCommentToken = createToken(
  {
    name: 'RCommentToken',
    pattern: /#}/,
    pop_mode: true,
  },
  [ModeKind.Comment]
);
export const CommentToken = createToken(
  {
    name: 'CommentToken',
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

export const LVariableToken = createToken(
  { name: 'LVariableToken', pattern: /{{[-~]?/, push_mode: ModeKind.Statement },
  [ModeKind.Template]
);
export const RVariableToken = createToken(
  {
    name: 'RVariableToken',
    pattern: /[-~]?}}/,
    pop_mode: true,
  },
  [ModeKind.Statement]
);

export const LBlockToken = createToken(
  { name: 'LBlockToken', pattern: /{%[-~]?/, push_mode: ModeKind.Statement },
  [ModeKind.Template]
);
export const RBlockToken = createToken(
  {
    name: 'RBlockToken',
    pattern: /[-~]?%}/,
    pop_mode: true,
  },
  [ModeKind.Statement]
);

export const BooleanToken = createToken(
  {
    name: 'BooleanToken',
    pattern: Lexer.NA,
  },
  [ModeKind.Statement]
);

export const TrueToken = createToken(
  { name: 'TrueToken', pattern: /\btrue\b/i, categories: BooleanToken },
  [ModeKind.Statement]
);

export const FalseToken = createToken(
  { name: 'FalseToken', pattern: /\bfalse\b/i, categories: BooleanToken },
  [ModeKind.Statement]
);

export const NullToken = createToken(
  { name: 'NullToken', pattern: /\bnull\b|\bnone\b/i },
  [ModeKind.Statement]
);

export const EqualsGreaterToken = createToken(
  { name: 'EqualsGreaterToken', pattern: /=>/ },
  [ModeKind.Statement]
);

export const OrToken = createToken(
  {
    name: 'OrToken',
    pattern: /\bor\b/,
  },
  [ModeKind.Statement]
);
export const AndToken = createToken(
  {
    name: 'AndToken',
    pattern: /\band\b/,
  },
  [ModeKind.Statement]
);
export const BitwiseOrToken = createToken(
  {
    name: 'BitwiseOrToken',
    pattern: /\bb-or\b/,
  },
  [ModeKind.Statement]
);
export const BitwiseXorToken = createToken(
  {
    name: 'BitwiseXorToken',
    pattern: /\bb-xor\b/,
  },
  [ModeKind.Statement]
);
export const BitwiseAndToken = createToken(
  {
    name: 'BitwiseAndToken',
    pattern: /\bb-and\b/,
  },
  [ModeKind.Statement]
);
export const EqualEqualToken = createToken(
  {
    name: 'EqualEqualToken',
    pattern: /==/,
  },
  [ModeKind.Statement]
);
export const ExclamationEqualsToken = createToken(
  {
    name: 'ExclamationEqualsToken',
    pattern: /!=/,
  },
  [ModeKind.Statement]
);
export const SpaceshipToken = createToken(
  {
    name: 'SpaceshipToken',
    pattern: /<=>/,
  },
  [ModeKind.Statement]
);
export const GreaterEqualToken = createToken(
  {
    name: 'GreaterEqualToken',
    pattern: />=/,
  },
  [ModeKind.Statement]
);
export const LessEqualToken = createToken(
  {
    name: 'LessEqualToken',
    pattern: /<=/,
  },
  [ModeKind.Statement]
);
export const LessToken = createToken(
  {
    name: 'LessToken',
    pattern: /</,
  },
  [ModeKind.Statement]
);
export const GreaterToken = createToken(
  {
    name: 'GreaterToken',
    pattern: />/,
  },
  [ModeKind.Statement]
);
export const NotInToken = createToken(
  {
    name: 'NotInToken',
    pattern: /\bnot in\b/,
  },
  [ModeKind.Statement]
);
export const InToken = createToken(
  {
    name: 'InToken',
    pattern: /\bin\b/,
  },
  [ModeKind.Statement]
);
export const MatchesToken = createToken(
  {
    name: 'MatchesToken',
    pattern: /\bmatches\b/,
  },
  [ModeKind.Statement]
);
export const StartsWithToken = createToken(
  {
    name: 'StartsWithToken',
    pattern: /\bstarts with\b/,
  },
  [ModeKind.Statement]
);
export const EndsWithToken = createToken(
  {
    name: 'EndsWithToken',
    pattern: /\bends with\b/,
  },
  [ModeKind.Statement]
);
export const HasSomeToken = createToken(
  {
    name: 'HasSomeToken',
    pattern: /\bhas some\b/,
  },
  [ModeKind.Statement]
);
export const HasEveryToken = createToken(
  {
    name: 'HasEveryToken',
    pattern: /\bhas every\b/,
  },
  [ModeKind.Statement]
);
export const DotDotToken = createToken(
  {
    name: 'DotDotToken',
    pattern: /\.\./,
  },
  [ModeKind.Statement]
);
export const PlusToken = createToken(
  {
    name: 'PlusToken',
    pattern: /\+/,
  },
  [ModeKind.Statement]
);
export const MinusToken = createToken(
  {
    name: 'MinusToken',
    pattern: /\-/,
  },
  [ModeKind.Statement]
);
export const TildeToken = createToken(
  {
    name: 'TildeToken',
    pattern: /\~/,
  },
  [ModeKind.Statement]
);
export const AsteriskAsteriskToken = createToken(
  {
    name: 'AsteriskAsteriskToken',
    pattern: /\*\*/,
  },
  [ModeKind.Statement]
);
export const AsteriskToken = createToken(
  {
    name: 'AsteriskToken',
    pattern: /\*/,
  },
  [ModeKind.Statement]
);
export const SlashSlashToken = createToken(
  {
    name: 'SlashSlashToken',
    pattern: /\/\//,
  },
  [ModeKind.Statement]
);
export const SlashToken = createToken(
  {
    name: 'SlashToken',
    pattern: /\//,
  },
  [ModeKind.Statement]
);
export const PercentToken = createToken(
  {
    name: 'PercentToken',
    pattern: /%/,
  },
  [ModeKind.Statement]
);
export const IsNotToken = createToken(
  {
    name: 'IsNotToken',
    pattern: /\bis not\b/,
  },
  [ModeKind.Statement]
);
export const IsToken = createToken(
  {
    name: 'IsToken',
    pattern: /\bis\b/,
  },
  [ModeKind.Statement]
);
export const QuestionQuestionToken = createToken(
  {
    name: 'QuestionQuestionToken',
    pattern: /\?\?/,
  },
  [ModeKind.Statement]
);

export const NotToken = createToken({ name: 'NotToken', pattern: /\bnot\b/ }, [
  ModeKind.Statement,
]);
export const ExclamationToken = createToken(
  { name: 'ExclamationToken', pattern: /!/ },
  [ModeKind.Statement]
);
export const PlusPlusToken = createToken(
  { name: 'PlusPlusToken', pattern: /\+\+/ },
  [ModeKind.Statement]
);
export const MinusMinusToken = createToken(
  { name: 'MinusMinusToken', pattern: /\-\-/ },
  [ModeKind.Statement]
);

export const DotToken = createToken({ name: 'DotToken', pattern: /\./ }, [
  ModeKind.Statement,
]);
export const OpenBraceToken = createToken(
  { name: 'OpenBraceToken', pattern: /{/ },
  [ModeKind.Statement]
);
export const CloseBraceToken = createToken(
  { name: 'CloseBraceToken', pattern: /}/ },
  [ModeKind.Statement]
);
export const OpenBracketToken = createToken(
  { name: 'OpenBracketToken', pattern: /\[/ },
  [ModeKind.Statement]
);
export const CloseBracketToken = createToken(
  { name: 'CloseBracketToken', pattern: /]/ },
  [ModeKind.Statement]
);
export const OpenParenToken = createToken(
  { name: 'OpenParenToken', pattern: /\(/ },
  [ModeKind.Statement]
);
export const CloseParenToken = createToken(
  { name: 'CloseParenToken', pattern: /\)/ },
  [ModeKind.Statement]
);
export const CommaToken = createToken({ name: 'CommaToken', pattern: /,/ }, [
  ModeKind.Statement,
]);
export const ColonToken = createToken({ name: 'ColonToken', pattern: /:/ }, [
  ModeKind.Statement,
]);
export const SemiColonToken = createToken(
  { name: 'SemiColonToken', pattern: /;/ },
  [ModeKind.Statement]
);
export const QuestionToken = createToken(
  { name: 'QuestionToken', pattern: /\?/ },
  [ModeKind.Statement]
);
export const BarToken = createToken({ name: 'BarToken', pattern: /\|/ }, [
  ModeKind.Statement,
]);
export const EqualsToken = createToken({ name: 'EqualsToken', pattern: /=/ }, [
  ModeKind.Statement,
]);

export const SetToken = createToken({ name: 'SetToken', pattern: /\bset\b/ }, [
  ModeKind.Statement,
]);
export const EndSetToken = createToken(
  { name: 'EndSetToken', pattern: /\bendset\b/ },
  [ModeKind.Statement]
);

export const ApplyToken = createToken(
  { name: 'ApplyToken', pattern: /\bapply\b/ },
  [ModeKind.Statement]
);
export const EndApplyToken = createToken(
  { name: 'EndApplyToken', pattern: /\bendapply\b/ },
  [ModeKind.Statement]
);

export const ForToken = createToken({ name: 'ForToken', pattern: /\bfor\b/ }, [
  ModeKind.Statement,
]);
export const EndForToken = createToken(
  { name: 'EndForToken', pattern: /\bendfor\b/ },
  [ModeKind.Statement]
);

export const IfToken = createToken({ name: 'IfToken', pattern: /\bif\b/ }, [
  ModeKind.Statement,
]);
export const EndIfToken = createToken(
  { name: 'EndIfToken', pattern: /\bendif\b/ },
  [ModeKind.Statement]
);

export const ElseIfToken = createToken(
  { name: 'ElseIfToken', pattern: /\belseif\b/ },
  [ModeKind.Statement]
);
export const ElseToken = createToken({ name: 'ElseToken', pattern: /\belse\b/ }, [
  ModeKind.Statement,
]);

export const AutoescapeToken = createToken(
  { name: 'AutoescapeToken', pattern: /\bautoescape\b/ },
  [ModeKind.Statement]
);
export const EndAutoescapeToken = createToken(
  { name: 'EndAutoescapeToken', pattern: /\bendautoescape\b/ },
  [ModeKind.Statement]
);

export const DeprecatedToken = createToken(
  { name: 'DeprecatedToken', pattern: /\bdeprecated\b/ },
  [ModeKind.Statement]
);
export const EndDeprecatedToken = createToken(
  { name: 'EndDeprecatedToken', pattern: /\benddeprecated\b/ },
  [ModeKind.Statement]
);

export const CacheToken = createToken(
  { name: 'CacheToken', pattern: /\bcache\b/ },
  [ModeKind.Statement]
);
export const EndCacheToken = createToken(
  { name: 'EndCacheToken', pattern: /\bendcache\b/ },
  [ModeKind.Statement]
);

export const DoToken = createToken({ name: 'DoToken', pattern: /\bdo\b/ }, [
  ModeKind.Statement,
]);

export const FlushToken = createToken(
  { name: 'FlushToken', pattern: /\bflush\b/ },
  [ModeKind.Statement]
);

export const BlockToken = createToken(
  { name: 'BlockToken', pattern: /\bblock\b/ },
  [ModeKind.Statement]
);
export const EndBlockToken = createToken(
  { name: 'EndBlockToken', pattern: /\bendblock\b/ },
  [ModeKind.Statement]
);

export const ExtendsToken = createToken(
  { name: 'ExtendsToken', pattern: /\bextends\b/ },
  [ModeKind.Statement]
);

export const WithToken = createToken(
  { name: 'WithToken', pattern: /\bwith\b/ },
  [ModeKind.Statement]
);
export const EndWithToken = createToken(
  { name: 'EndWithToken', pattern: /\bendwith\b/ },
  [ModeKind.Statement]
);
export const OnlyToken = createToken(
  { name: 'OnlyToken', pattern: /\bonly\b/ },
  [ModeKind.Statement]
);
export const UseToken = createToken(
  { name: 'UseToken', pattern: /\buse\b/ },
  [ModeKind.Statement]
);

export const IdentifierToken = createToken(
  {
    name: 'IdentifierToken',
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

export const TextToken = createToken(
  {
    name: 'TextToken',
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
