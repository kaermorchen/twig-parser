import {
  createToken as chevrotainCreateToken,
  CustomPatternMatcherReturn,
  ITokenConfig,
  Lexer,
  TokenType,
} from 'chevrotain';

export const tokenMap: Map<string, TokenType> = new Map();

function createToken(config: ITokenConfig): TokenType {
  const token = chevrotainCreateToken(config);

  tokenMap.set(config.name, token);

  return token;
}

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
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

// export const blockStart = createToken({
//   name: 'blockStart',
// });

// export const varStart = createToken({
//   name: 'varStart',
// });

// export const blockEnd = createToken({
//   name: 'blockEnd',
// });

// export const varEnd = createToken({
//   name: 'varEnd',
// });

// export const name = createToken({
//   name: 'name',
// });

// export const number = createToken({
//   name: 'number',
// });

// export const string = createToken({
//   name: 'string',
// });

// export const operator = createToken({
//   name: 'operator',
// });

// export const punctuation = createToken({
//   name: 'punctuation',
// });

// export const interpolationStart = createToken({
//   name: 'interpolationStart',
// });

// export const interpolationEnd = createToken({
//   name: 'interpolationEnd',
// });

// export const arrow = createToken({
//   name: 'arrow',
// });

export class TwigLexer extends Lexer {
  constructor() {
    super([...tokenMap.values()]);
  }
}

export const tokens = Object.fromEntries(tokenMap);
