import { CstParser } from 'chevrotain';
import * as tokens from './tokens.js';

export default class TwigParser extends CstParser {
  constructor() {
    super(tokens);

    const $ = this;

    $.RULE('template', () => {
      $.SUBRULE($.elements);
    });

    $.RULE('elements', () => {
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.element);
      });
    });

    $.RULE('element', () => {
      return $.OR([
        { ALT: () => $.CONSUME(tokens.text) },
        { ALT: () => $.SUBRULE($.variable) },
        { ALT: () => $.SUBRULE($.block) },
      ]);
    });

    $.RULE('variable', () => {
      $.CONSUME(tokens.varStart);
      $.SUBRULE($.expression);
      $.CONSUME(tokens.varEnd);
    });

    $.RULE('block', () => {
      $.CONSUME(tokens.name);
    });

    $.RULE('expression', () => {
      return $.OR([{ ALT: () => $.CONSUME(tokens.name) }]);
    });

    this.performSelfAnalysis();
  }
}
