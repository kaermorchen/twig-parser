import { EmbeddedActionsParser } from 'chevrotain';
import * as tokens from './tokens.js';

export default class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(tokens);
    this.performSelfAnalysis();
  }

  template = this.RULE('template', () => {
    return {
      type: 'template',
      children: this.SUBRULE(this.elements),
    };
  });

  elements = this.RULE('elements', () => {
    const result = [];

    this.MANY(() => {
      result.push(this.SUBRULE(this.element));
    });

    return result;
  });

  element = this.RULE('element', () => {
    return this.OR([
      {
        ALT: () => this.SUBRULE(this.text),
      },
      {
        ALT: () => this.SUBRULE(this.variable),
      },
      {
        ALT: () => this.SUBRULE(this.block),
      },
    ]);
  });

  variable = this.RULE('variable', () => {
    this.CONSUME(tokens.varStart);
    const value = this.SUBRULE(this.expression);
    this.CONSUME(tokens.varEnd);

    return {
      type: 'variable',
      value,
    };
  });

  text = this.RULE('text', () => ({
    type: 'text',
    value: this.CONSUME(tokens.text).payload,
  }));

  block = this.RULE('block', () => {
    this.CONSUME(tokens.name);
  });

  expression = this.RULE('expression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.number) },
      { ALT: () => this.SUBRULE(this.string) },
      { ALT: () => this.SUBRULE(this.name) },
    ]);
  });

  name = this.RULE('name', () => ({
    type: 'name',
    value: this.CONSUME(tokens.name).payload,
  }));

  number = this.RULE('number', () => ({
    type: 'number',
    value: this.CONSUME(tokens.number).payload,
  }));

  string = this.RULE('string', () => ({
    type: 'string',
    value: this.CONSUME(tokens.string).payload,
  }));
}
