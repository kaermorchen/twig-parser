import { EmbeddedActionsParser } from 'chevrotain';
import * as t from './lexer.js';

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
      value = this.SUBRULE(this.Expression);
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

  Expression = this.RULE('Expression', () => {
    return this.SUBRULE(this.AssignmentExpression);
  });

  Identifier = this.RULE('identifier', () => {
    return {
      type: 'Identifier',
      value: this.CONSUME(t.IdentifierName).image,
    };
  });

  AbsLiteral = this.RULE('AbsLiteral', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.NullLiteral) },
      { ALT: () => this.SUBRULE(this.BooleanLiteral) },
      { ALT: () => this.SUBRULE(this.NumericLiteral) },
      { ALT: () => this.SUBRULE(this.StringLiteral) },
    ]);
  });

  NumericLiteral = this.RULE('NumericLiteral', () => {
    return {
      type: 'NumericLiteral',
      value: Number(this.CONSUME(t.Number).image),
    };
  });

  StringLiteral = this.RULE('StringLiteral', () => {
    return {
      type: 'StringLiteral',
      value: this.CONSUME(t.String).image.slice(1, -1),
    };
  });

  BooleanLiteral = this.RULE('BooleanLiteral', () => {
    return {
      type: 'BooleanLiteral',
      value: this.CONSUME(t.Boolean).image.toLowerCase() === 'true',
    };
  });

  NullLiteral = this.RULE('NullLiteral', () => {
    return {
      type: 'NullLiteral',
      value: this.CONSUME(t.Null) ? null : undefined,
    };
  });

  BinaryExpression = this.RULE('BinaryExpression', () => {
    return this.SUBRULE(this.Precedenc10);
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

  PropertyName = this.RULE('PropertyName', () => {
    return this.OR([
      {
        // (foo)
        ALT: () => {
          let expr;
          this.CONSUME(t.LParen);
          expr = this.SUBRULE(this.Expression);
          this.CONSUME(t.RParen);
          return expr;
        },
      },
      {
        // 'foo'
        ALT: () => this.SUBRULE(this.StringLiteral),
      },
      {
        // foo
        ALT: () => this.SUBRULE(this.Identifier),
      },
      {
        // 42
        ALT: () => this.SUBRULE(this.NumericLiteral),
      },
    ]);
  });

  PropertyAssignment = this.RULE('PropertyAssignment', () => {
    let key, value, shorthand;

    this.OR([
      {
        ALT: () => {
          key = this.SUBRULE(this.PropertyName);
          this.CONSUME(t.Colon);
          value = this.SUBRULE(this.AssignmentExpression);
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
      type: 'PropertyAssignment',
      key,
      value,
      shorthand,
    };
  });

  ObjectLiteral = this.RULE('ObjectLiteral', () => {
    const properties = [];

    this.CONSUME(t.LCurly);
    this.MANY_SEP({
      SEP: t.Comma,
      DEF: () => {
        properties.push(this.SUBRULE(this.PropertyAssignment));
      },
    });
    this.CONSUME(t.RCurly);

    return {
      type: 'ObjectLiteral',
      properties,
    };
  });

  PrimaryExpression = this.RULE('PrimaryExpression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.AbsLiteral) },
      { ALT: () => this.SUBRULE(this.ArrayLiteral) },
      { ALT: () => this.SUBRULE(this.ObjectLiteral) },
      { ALT: () => this.SUBRULE(this.ParenthesisExpression) },
    ]);
  });

  // prettier-ignore
  Precedenc300 = createOperatorRule('Precedenc300', t.Precedenc300, this.PrimaryExpression, this);
  // prettier-ignore
  Precedenc200 = createOperatorRule('Precedenc200', t.Precedenc200, this.Precedenc300, this);
  // prettier-ignore
  Precedenc100 = createOperatorRule('Precedenc100', t.Precedenc100, this.Precedenc200, this);
  // prettier-ignore
  Precedenc60 = createOperatorRule('Precedenc60', t.Precedenc60, this.Precedenc100, this);
  // prettier-ignore
  Precedenc40 = createOperatorRule('Precedenc40', t.Precedenc40, this.Precedenc60, this);
  // prettier-ignore
  Precedenc30 = createOperatorRule('Precedenc30', t.Precedenc30, this.Precedenc40, this);
  // prettier-ignore
  Precedenc25 = createOperatorRule('Precedenc25', t.Precedenc25, this.Precedenc30, this);
  // prettier-ignore
  Precedenc20 = createOperatorRule('Precedenc20', t.Precedenc20, this.Precedenc25, this);
  // prettier-ignore
  Precedenc18 = createOperatorRule('Precedenc18', t.Precedenc18, this.Precedenc20, this);
  // prettier-ignore
  Precedenc17 = createOperatorRule('Precedenc17', t.Precedenc17, this.Precedenc18, this);
  // prettier-ignore
  Precedenc16 = createOperatorRule('Precedenc16', t.Precedenc16, this.Precedenc17, this);
  // prettier-ignore
  Precedenc15 = createOperatorRule('Precedenc15', t.Precedenc15, this.Precedenc16, this);
  // prettier-ignore
  Precedenc10 = createOperatorRule('Precedenc10', t.Precedence10, this.Precedenc15, this);

  ParenthesisExpression = this.RULE('ParenthesisExpression', () => {
    let expression;

    this.CONSUME(t.LParen);
    expression = this.SUBRULE(this.Expression);
    this.CONSUME(t.RParen);

    return expression;
  });

  MemberCallNewExpression = this.RULE('MemberCallNewExpression', () => {
    this.SUBRULE(this.PrimaryExpression);

    this.MANY2(() => {
      return this.OR2([
        { ALT: () => this.SUBRULE(this.BoxMemberExpression) },
        { ALT: () => this.SUBRULE(this.DotMemberExpression) },
        { ALT: () => this.SUBRULE(this.Arguments) },
      ]);
    });
  });

  BoxMemberExpression = this.RULE('BoxMemberExpression', () => {
    this.CONSUME(t.LBracket);
    this.SUBRULE(this.Expression);
    this.CONSUME(t.RBracket);
  });

  DotMemberExpression = this.RULE('DotMemberExpression', () => {
    this.CONSUME(t.Dot);
    this.CONSUME(t.IdentifierName);
  });

  Arguments = this.RULE('Arguments', () => {
    this.CONSUME(t.LParen);
    this.OPTION(() => {
      this.SUBRULE(this.AssignmentExpression);
      this.MANY(() => {
        this.CONSUME(t.Comma);
        this.SUBRULE2(this.AssignmentExpression);
      });
    });
    this.CONSUME(t.RParen);
  });
}
