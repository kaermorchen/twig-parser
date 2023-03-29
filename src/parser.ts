import { EmbeddedActionsParser } from 'chevrotain';
import { tokens } from './lexer.js';

export default class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(tokens);
    this.performSelfAnalysis();
  }

  template = this.RULE('template', () => {
    return this.SUBRULE(this.elements);
  });

  elements = this.RULE('elements', () => {
    const elements = [];

    this.MANY(() => {
      elements.push(this.SUBRULE(this.element));
    });

    return elements;
  });

  element = this.RULE('element', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.text) },
      { ALT: () => this.SUBRULE(this.comment) },
      { ALT: () => this.SUBRULE(this.variable) },
      { ALT: () => this.SUBRULE(this.block) },
    ]);
  });

  text = this.RULE('text', () => {
    return this.CONSUME(tokens.Text);
  });

  rawText = this.RULE('rawText', () => {
    return this.CONSUME(tokens.RawText);
  });

  comment = this.RULE('comment', () => {
    let value = null;

    this.CONSUME(tokens.LComment);
    this.OPTION(() => {
      value = this.CONSUME(tokens.Comment).image;
    });
    this.CONSUME(tokens.RComment);

    return {
      type: 'Comment',
      value,
    };
  });

  variable = this.RULE('variable', () => {
    let value = null;

    this.CONSUME(tokens.LVariable);
    this.OPTION(() => {
      value = this.SUBRULE(this.expression);
    });
    this.CONSUME(tokens.RVariable);

    return {
      type: 'Variable',
      value,
    };
  });

  block = this.RULE('block', () => {
    return this.OR([{ ALT: () => this.SUBRULE(this.verbatim) }]);
  });

  verbatim = this.RULE('verbatim', () => {
    this.CONSUME(tokens.LBlock);
    this.CONSUME(tokens.Verbatim);
    this.CONSUME(tokens.RBlock);

    const value = this.SUBRULE(this.rawText).image;

    this.CONSUME1(tokens.LBlock);
    this.CONSUME1(tokens.EndVerbatim);
    this.CONSUME1(tokens.RBlock);

    return {
      type: 'VerbatimBlock',
      value,
    };
  });

  expression = this.RULE('expression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.identifier) },
    ]);
  });

  identifier = this.RULE('identifier', () => {
    return {
      type: 'Identifier',
      value: this.CONSUME(tokens.Identifier).image,
    };
  });

  literal = this.RULE('literal', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.numberLiteral) },
      { ALT: () => this.SUBRULE(this.stringLiteral) },
    ]);
  });

  numberLiteral = this.RULE('numberLiteral', () => {
    return {
      type: 'NumberLiteral',
      value: Number(this.CONSUME(tokens.Number).image),
    };
  });

  stringLiteral = this.RULE('stringLiteral', () => {
    return {
      type: 'StringLiteral',
      value: this.CONSUME(tokens.String).image.slice(1, -1),
    };
  });
}
