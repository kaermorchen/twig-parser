import { createToken, Lexer as ChevLexer } from 'chevrotain';

export const whiteSpace = createToken({
  name: 'whiteSpace',
  pattern: /\s+/,
  group: ChevLexer.SKIPPED,
});

export const EOF = createToken({
  name: 'EOF',
});

export const text = createToken({
  name: 'text',
});

export const blockStart = createToken({
  name: 'BlockStart',
});

export const varStart = createToken({
  name: 'VarStart',
});

export const blockEnd = createToken({
  name: 'BlockEnd',
});

export const varEnd = createToken({
  name: 'VarEnd',
});

export const name = createToken({
  name: 'Name',
});

export const number = createToken({
  name: 'number',
});

export const string = createToken({
  name: 'string',
});

export const operator = createToken({
  name: 'operator',
});

export const punctuation = createToken({
  name: 'punctuation',
});

export const interpolationStart = createToken({
  name: 'interpolationStart',
});

export const interpolationEnd = createToken({
  name: 'interpolationStart',
});

export const arrow = createToken({
  name: 'arrow',
});
