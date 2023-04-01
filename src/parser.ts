import { EmbeddedActionsParser, Rule } from 'chevrotain';
import { tokens } from './lexer.js';

function createOperatorRule(name: string, consumeOperator, subrule, ctx: TwigParser) {
  return ctx.RULE(name, () => {
    let operator, right, left = ctx.SUBRULE(subrule);

    ctx.OPTION(() => {
      operator = ctx.CONSUME(consumeOperator).image;
      right = ctx.SUBRULE2(subrule);
    });

    if (operator && right) {
      return {
        type: 'BinaryExpression',
        left,
        operator,
        right,
      };
    } else {
      return left;
    }
  });
}

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
      { ALT: () => this.SUBRULE(this.blocks) },
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

  blocks = this.RULE('blocks', () => {
    return this.OR([{ ALT: () => this.SUBRULE(this.verbatimBlock) }]);
  });

  verbatimBlock = this.RULE('verbatimBlock', () => {
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
    return this.SUBRULE(this.operator10);
  });

  identifier = this.RULE('identifier', () => {
    return {
      type: 'Identifier',
      value: this.CONSUME(tokens.Identifier).image,
    };
  });

  literal = this.RULE('literal', () => {
    return this.OR({
      IGNORE_AMBIGUITIES: true,
      DEF: [
        { ALT: () => this.SUBRULE(this.nullLiteral) },
        { ALT: () => this.SUBRULE(this.booleanLiteral) },
        { ALT: () => this.SUBRULE(this.numberLiteral) },
        { ALT: () => this.SUBRULE(this.stringLiteral) },
      ],
    });
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

  booleanLiteral = this.RULE('booleanLiteral', () => {
    return {
      type: 'BooleanLiteral',
      value: this.CONSUME(tokens.Boolean).image.toLowerCase() === 'true',
    };
  });

  nullLiteral = this.RULE('nullLiteral', () => {
    return {
      type: 'NullLiteral',
      value: this.CONSUME(tokens.Null) ? null : undefined,
    };
  });

  arrayExpression = this.RULE('ArrayExpression', () => {
    const elements = [];

    this.CONSUME(tokens.LSquare);
    this.MANY_SEP({
      SEP: tokens.Comma,
      DEF: () => {
        elements.push(this.SUBRULE(this.expression));
      },
    });
    this.CONSUME(tokens.RSquare);

    return {
      type: 'ArrayExpression',
      elements,
    };
  });

  propertyKey = this.RULE('propertyKey', () => {
    return this.OR([
      {
        // (foo)
        ALT: () => {
          let expr;
          this.CONSUME(tokens.LParen);
          expr = this.SUBRULE(this.expression);
          this.CONSUME(tokens.RParen);
          return expr;
        },
      },
      {
        // 'foo'
        ALT: () => this.SUBRULE(this.stringLiteral),
      },
      {
        // foo
        ALT: () => this.SUBRULE(this.identifier),
      },
      {
        // 42
        ALT: () => this.SUBRULE(this.numberLiteral),
      },
    ]);
  });

  property = this.RULE('property', () => {
    let key, value, shorthand;

    this.OR([
      {
        ALT: () => {
          key = this.SUBRULE(this.propertyKey);
          this.CONSUME(tokens.Colon);
          value = this.SUBRULE(this.expression);
          shorthand = false;
        },
      },
      {
        ALT: () => {
          value = this.SUBRULE(this.identifier);
          key = Object.assign({}, value, { type: 'StringLiteral' });
          shorthand = true;
        },
      },
    ]);

    return {
      type: 'Property',
      key,
      value,
      shorthand,
    };
  });

  hashExpression = this.RULE('HashExpression', () => {
    const properties = [];

    this.CONSUME(tokens.LCurly);
    this.MANY_SEP({
      SEP: tokens.Comma,
      DEF: () => {
        properties.push(this.SUBRULE(this.property));
      },
    });
    this.CONSUME(tokens.RCurly);

    return {
      type: 'HashExpression',
      properties,
    };
  });

  atomicExpression = this.RULE('atomicExpression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.literal) },
      { ALT: () => this.SUBRULE(this.identifier) },
      { ALT: () => this.SUBRULE(this.arrayExpression) },
      { ALT: () => this.SUBRULE(this.hashExpression) },
      { ALT: () => this.SUBRULE(this.parenthesisExpression) },
    ]);
  });

  operator300 = createOperatorRule('operator300', tokens.Operator300, this.atomicExpression, this);
  operator200 = createOperatorRule('operator200', tokens.Operator200, this.operator300, this);
  operator100 = createOperatorRule('operator100', tokens.Operator100, this.operator200, this);
  operator60 = createOperatorRule('operator60', tokens.Operator60, this.operator100, this);
  operator40 = createOperatorRule('operator40', tokens.Operator40, this.operator60, this);
  operator30 = createOperatorRule('operator30', tokens.Operator30, this.operator40, this);
  operator25 = createOperatorRule('operator25', tokens.Operator25, this.operator30, this);
  operator20 = createOperatorRule('operator20', tokens.Operator20, this.operator25, this);
  operator18 = createOperatorRule('operator18', tokens.Operator18, this.operator20, this);
  operator17 = createOperatorRule('operator17', tokens.Operator17, this.operator18, this);
  operator16 = createOperatorRule('operator16', tokens.Operator16, this.operator17, this);
  operator15 = createOperatorRule('operator15', tokens.Operator15, this.operator16, this);
  operator10 = createOperatorRule('operator10', tokens.Operator10, this.operator15, this);

  parenthesisExpression = this.RULE('parenthesisExpression', () => {
    let expression;

    this.CONSUME(tokens.LParen);
    expression = this.SUBRULE(this.expression);
    this.CONSUME(tokens.RParen);

    return expression;
  });
}
