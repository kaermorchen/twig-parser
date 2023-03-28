import { CstParser } from 'chevrotain';
import { tokens } from './lexer.js';

export default class TwigParser extends CstParser {
  constructor() {
    super(tokens);
    this.performSelfAnalysis();
  }

  template = this.RULE('template', () => {
    this.SUBRULE(this.elements);
  });

  elements = this.RULE('elements', () => {
    this.MANY(() => {
      this.SUBRULE(this.element);
    });
  });

  element = this.RULE('element', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.comment) },
      { ALT: () => this.SUBRULE(this.text) },
      { ALT: () => this.SUBRULE(this.variable) },
      // { ALT: () => this.SUBRULE(this.block) },
    ]);
  });

  text = this.RULE('text', () => {
    this.CONSUME(tokens.Text);
  });

  comment = this.RULE('comment', () => {
    this.CONSUME(tokens.LComment);
    this.OPTION(() => {
      this.CONSUME(tokens.Comment);
    });
    this.CONSUME(tokens.RComment);
  });

  variable = this.RULE('variable', () => {
    this.CONSUME(tokens.LVariable);
    this.OPTION(() => {
      this.SUBRULE(this.expression);
    });
    this.CONSUME(tokens.RVariable);
  });

  // block = this.RULE('block', () => {
  //   this.CONSUME(tokens.name);
  // });

  expression = this.RULE('expression', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      // { ALT: () => this.SUBRULE(this.name) },
    ]);
  });

  // name = this.RULE('name', () => {
  //   this.CONSUME(tokens.name);
  // });

  literal = this.RULE('literal', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.numberLiteral) },
      { ALT: () => this.SUBRULE(this.stringLiteral) },
    ]);
  });

  numberLiteral = this.RULE('numberLiteral', () => {
    this.CONSUME(tokens.Number);
  });

  stringLiteral = this.RULE('stringLiteral', () => {
    this.CONSUME(tokens.String);
  });
}
