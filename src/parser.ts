import { EmbeddedActionsParser, Rule } from 'chevrotain';
import { tokens as t } from './lexer.js';

function createOperatorRule(
  name: string,
  consumeOperator,
  subrule,
  ctx: TwigParser
) {
  return ctx.RULE(name, () => {
    let operator,
      right,
      left = ctx.SUBRULE(subrule);

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
    super(t);
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
    return this.CONSUME(t.Text);
  });

  rawText = this.RULE('rawText', () => {
    return this.CONSUME(t.RawText);
  });

  comment = this.RULE('comment', () => {
    let value = null;

    this.CONSUME(t.LComment);
    this.OPTION(() => {
      value = this.CONSUME(t.Comment).image;
    });
    this.CONSUME(t.RComment);

    return {
      type: 'Comment',
      value,
    };
  });

  variable = this.RULE('variable', () => {
    let value = null;

    this.CONSUME(t.LVariable);
    this.OPTION(() => {
      value = this.SUBRULE(this.expression);
    });
    this.CONSUME(t.RVariable);

    return {
      type: 'Variable',
      value,
    };
  });

  blocks = this.RULE('blocks', () => {
    return this.OR([{ ALT: () => this.SUBRULE(this.verbatimBlock) }]);
  });

  verbatimBlock = this.RULE('verbatimBlock', () => {
    this.CONSUME(t.LBlock);
    this.CONSUME(t.Verbatim);
    this.CONSUME(t.RBlock);

    const value = this.SUBRULE(this.rawText).image;

    this.CONSUME1(t.LBlock);
    this.CONSUME1(t.EndVerbatim);
    this.CONSUME1(t.RBlock);

    return {
      type: 'VerbatimBlock',
      value,
    };
  });

  expression = this.RULE('expression', () => {
    return this.SUBRULE(this.BinaryExpression);
  });

  Identifier = this.RULE('identifier', () => {
    return {
      type: 'Identifier',
      value: this.CONSUME(t.Identifier).image,
    };
  });

  AbsLiteral = this.RULE('AbsLiteral', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.nullLiteral) },
      { ALT: () => this.SUBRULE(this.booleanLiteral) },
      { ALT: () => this.SUBRULE(this.numberLiteral) },
      { ALT: () => this.SUBRULE(this.stringLiteral) },
    ]);
  });

  numberLiteral = this.RULE('numberLiteral', () => {
    return {
      type: 'NumberLiteral',
      value: Number(this.CONSUME(t.Number).image),
    };
  });

  stringLiteral = this.RULE('stringLiteral', () => {
    return {
      type: 'StringLiteral',
      value: this.CONSUME(t.String).image.slice(1, -1),
    };
  });

  booleanLiteral = this.RULE('booleanLiteral', () => {
    return {
      type: 'BooleanLiteral',
      value: this.CONSUME(t.Boolean).image.toLowerCase() === 'true',
    };
  });

  nullLiteral = this.RULE('nullLiteral', () => {
    return {
      type: 'NullLiteral',
      value: this.CONSUME(t.Null) ? null : undefined,
    };
  });

  BinaryExpression = this.RULE('BinaryExpression', () => {
    return this.SUBRULE(this.operator10);
  });

  AssignmentExpression = this.RULE('AssignmentExpression', () => {
    const test = this.SUBRULE(this.BinaryExpression);
    let consequent, alternate;

    this.OPTION(() => {
      this.CONSUME(t.Question);
      consequent = this.SUBRULE1(this.AssignmentExpression);
      this.CONSUME(t.Colon);
      alternate = this.SUBRULE2(this.AssignmentExpression);
    });

    if (consequent && alternate) {
      return {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
      };
    } else {
      return test;
    }
  });

  ArrayLiteral = this.RULE('ArrayLiteral', () => {
    const elements = [];

    this.CONSUME(t.LBracket);
    this.MANY_SEP({
      SEP: t.Comma,
      DEF: () => {
        elements.push(this.SUBRULE(this.AssignmentExpression));
      },
    });
    this.CONSUME(t.RBracket);

    return {
      type: 'ArrayLiteral',
      elements,
    };
  });

  propertyKey = this.RULE('propertyKey', () => {
    return this.OR([
      {
        // (foo)
        ALT: () => {
          let expr;
          this.CONSUME(t.LParen);
          expr = this.SUBRULE(this.expression);
          this.CONSUME(t.RParen);
          return expr;
        },
      },
      {
        // 'foo'
        ALT: () => this.SUBRULE(this.stringLiteral),
      },
      {
        // foo
        ALT: () => this.SUBRULE(this.Identifier),
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
          this.CONSUME(t.Colon);
          value = this.SUBRULE(this.expression);
          shorthand = false;
        },
      },
      {
        ALT: () => {
          value = this.SUBRULE(this.Identifier);
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

  HashLiteral = this.RULE('HashLiteral', () => {
    const properties = [];

    this.CONSUME(t.LCurly);
    this.MANY_SEP({
      SEP: t.Comma,
      DEF: () => {
        properties.push(this.SUBRULE(this.property));
      },
    });
    this.CONSUME(t.RCurly);

    return {
      type: 'HashLiteral',
      properties,
    };
  });

  PrimaryExpression = this.RULE('PrimaryExpression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.AbsLiteral) },
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.ArrayLiteral) },
      { ALT: () => this.SUBRULE(this.HashLiteral) },
      { ALT: () => this.SUBRULE(this.ParenthesisExpression) },
    ]);
  });

  operator300 = createOperatorRule(
    'operator300',
    t.Operator300,
    this.PrimaryExpression,
    this
  );
  operator200 = createOperatorRule(
    'operator200',
    t.Operator200,
    this.operator300,
    this
  );
  operator100 = createOperatorRule(
    'operator100',
    t.Operator100,
    this.operator200,
    this
  );
  operator60 = createOperatorRule(
    'operator60',
    t.Operator60,
    this.operator100,
    this
  );
  operator40 = createOperatorRule(
    'operator40',
    t.Operator40,
    this.operator60,
    this
  );
  operator30 = createOperatorRule(
    'operator30',
    t.Operator30,
    this.operator40,
    this
  );
  operator25 = createOperatorRule(
    'operator25',
    t.Operator25,
    this.operator30,
    this
  );
  operator20 = createOperatorRule(
    'operator20',
    t.Operator20,
    this.operator25,
    this
  );
  operator18 = createOperatorRule(
    'operator18',
    t.Operator18,
    this.operator20,
    this
  );
  operator17 = createOperatorRule(
    'operator17',
    t.Operator17,
    this.operator18,
    this
  );
  operator16 = createOperatorRule(
    'operator16',
    t.Operator16,
    this.operator17,
    this
  );
  operator15 = createOperatorRule(
    'operator15',
    t.Operator15,
    this.operator16,
    this
  );
  operator10 = createOperatorRule(
    'operator10',
    t.Operator10,
    this.operator15,
    this
  );

  ParenthesisExpression = this.RULE('ParenthesisExpression', () => {
    let expression;

    this.CONSUME(t.LParen);
    expression = this.SUBRULE(this.expression);
    this.CONSUME(t.RParen);

    return expression;
  });
}
