import { createToken, Lexer as ChevLexer } from 'chevrotain';

export const whiteSpace = createToken({
  name: 'whiteSpace',
  pattern: /\s+/,
  group: ChevLexer.SKIPPED,
});

export const text = createToken({
  name: 'text',
});

export const blockStart = createToken({
  name: 'blockStart',
});

export const varStart = createToken({
  name: 'varStart',
});

export const blockEnd = createToken({
  name: 'blockEnd',
});

export const varEnd = createToken({
  name: 'varEnd',
});

export const name = createToken({
  name: 'name',
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
