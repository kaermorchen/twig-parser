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

createToken({ name: 'LComment', pattern: /{#/ });
createToken({ name: 'RComment', pattern: /#}/ });
createToken({ name: 'Comment', pattern: /[\S\s]*?(?=\s*#})/, line_breaks: true, });

createToken({ name: 'True', pattern: /true/ });
createToken({ name: 'False', pattern: /false/ });
createToken({ name: 'Null', pattern: /null/ });
createToken({ name: 'LCurly', pattern: /{/ });
createToken({ name: 'RCurly', pattern: /}/ });
createToken({ name: 'LSquare', pattern: /\[/ });
createToken({ name: 'RSquare', pattern: /]/ });
createToken({ name: 'Comma', pattern: /,/ });
createToken({ name: 'Colon', pattern: /:/ });

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
