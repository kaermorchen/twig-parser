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
        ALT: () => ({
          type: 'text',
          value: this.CONSUME(tokens.text).payload,
        }),
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

  block = this.RULE('block', () => {
    this.CONSUME(tokens.name);
  });

  expression = this.RULE('expression', () => {
    return this.OR([{ ALT: () => this.CONSUME(tokens.name).image }]);
  });
}
