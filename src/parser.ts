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

  PrimaryExpression = this.RULE('PrimaryExpression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.AbsLiteral) },
      { ALT: () => this.SUBRULE(this.ArrayLiteral) },
      { ALT: () => this.SUBRULE(this.ObjectLiteral) },
      { ALT: () => this.SUBRULE(this.ParenthesisExpression) },
    ]);
  });

  ParenthesisExpression = this.RULE('ParenthesisExpression', () => {
    let expression;

    this.CONSUME(t.LParen);
    expression = this.SUBRULE(this.Expression);
    this.CONSUME(t.RParen);

    return expression;
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

  MemberCallNewExpression = this.RULE('MemberCallNewExpression', () => {
    return this.SUBRULE(this.MemberExpression);
  });

  MemberExpression = this.RULE('MemberExpression', () => {
    let object = this.SUBRULE(this.PrimaryExpression);

    this.MANY(() => {
      const property = this.OR([
        { ALT: () => this.SUBRULE(this.BoxMemberExpression) },
        { ALT: () => this.SUBRULE(this.DotMemberExpression) },
      ]);

      if (property) {
        object = {
          type: 'MemberExpression',
          object,
          property,
        };
      }
    });

    return object;
  });

  BoxMemberExpression = this.RULE('BoxMemberExpression', () => {
    this.CONSUME(t.LBracket);
    const expr = this.SUBRULE(this.Expression);
    this.CONSUME(t.RBracket);

    return expr;
  });

  DotMemberExpression = this.RULE('DotMemberExpression', () => {
    this.CONSUME(t.Dot);
    return this.SUBRULE(this.Identifier);
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

  UnaryExpression = this.RULE('UnaryExpression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.MemberCallNewExpression) },
      {
        ALT: () => {
          const operator = this.OR1([
            { ALT: () => this.CONSUME(t.Plus).image },
            { ALT: () => this.CONSUME(t.Minus).image },
            { ALT: () => this.CONSUME(t.Not).image },
            { ALT: () => this.CONSUME(t.Exclamation).image },
          ]);

          const argument = this.SUBRULE1(this.UnaryExpression);

          return {
            type: 'UnaryExpression',
            operator,
            argument,
          };
        },
      },
    ]);
  });

  // prettier-ignore
  Precedence300 = createOperatorRule('Precedence300', t.Precedence300, this.UnaryExpression, this);
  // prettier-ignore
  Precedence200 = createOperatorRule('Precedence200', t.Precedence200, this.Precedence300, this);
  // prettier-ignore
  Precedence100 = createOperatorRule('Precedence100', t.Precedence100, this.Precedence200, this);
  // prettier-ignore
  Precedence60 = createOperatorRule('Precedence60', t.Precedence60, this.Precedence100, this);
  // prettier-ignore
  Precedence40 = createOperatorRule('Precedence40', t.Precedence40, this.Precedence60, this);
  // prettier-ignore
  Precedence30 = createOperatorRule('Precedence30', t.Precedence30, this.Precedence40, this);
  // prettier-ignore
  Precedence25 = createOperatorRule('Precedence25', t.Precedence25, this.Precedence30, this);
  // prettier-ignore
  Precedence20 = createOperatorRule('Precedence20', t.Precedence20, this.Precedence25, this);
  // prettier-ignore
  Precedence18 = createOperatorRule('Precedence18', t.Precedence18, this.Precedence20, this);
  // prettier-ignore
  Precedence17 = createOperatorRule('Precedence17', t.Precedence17, this.Precedence18, this);
  // prettier-ignore
  Precedence16 = createOperatorRule('Precedence16', t.Precedence16, this.Precedence17, this);
  // prettier-ignore
  Precedence15 = createOperatorRule('Precedence15', t.Precedence15, this.Precedence16, this);
  // prettier-ignore
  Precedence10 = createOperatorRule('Precedence10', t.Precedence10, this.Precedence15, this);

  BinaryExpression = this.RULE('BinaryExpression', () => {
    return this.SUBRULE(this.Precedence10);
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

  Expression = this.RULE('Expression', () => {
    return this.SUBRULE(this.AssignmentExpression);
  });

  Text = this.RULE('Text', () => {
    return {
      type: 'Text',
      value: this.CONSUME(t.Text).image,
    };
  });

  Comment = this.RULE('Comment', () => {
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

  Statement = this.RULE('Statement', () => {
    return this.OR([{ ALT: () => this.SUBRULE(this.VariableStatement) }]);
  });

  VariableStatement = this.RULE('VariableStatement', () => {
    this.CONSUME(t.LVariable);
    const value = this.SUBRULE(this.Expression);
    this.CONSUME(t.RVariable);

    return {
      type: 'VariableStatement',
      value,
    };
  });

  SourceElements = this.RULE('SourceElements', () => {
    const elements = [];

    this.MANY(() => {
      const element = this.OR([
        { ALT: () => this.SUBRULE(this.Text) },
        { ALT: () => this.SUBRULE(this.Comment) },
        { ALT: () => this.SUBRULE(this.Statement) },
      ]);

      elements.push(element);
    });

    return elements;
  });

  Program = this.RULE('Program', () => {
    return {
      type: 'Program',
      body: this.SUBRULE(this.SourceElements),
    };
  });

  // template = this.RULE('template', () => {
  //   return this.SUBRULE(this.elements);
  // });

  // elements = this.RULE('elements', () => {
  //   const elements = [];

  //   this.MANY(() => {
  //     elements.push(this.SUBRULE(this.element));
  //   });

  //   return elements;
  // });

  // element = this.RULE('element', () => {
  //   return this.OR([
  //     { ALT: () => this.SUBRULE(this.text) },
  //     { ALT: () => this.SUBRULE(this.comment) },
  //     { ALT: () => this.SUBRULE(this.variable) },
  //     { ALT: () => this.SUBRULE(this.blocks) },
  //   ]);
  // });

  // text = this.RULE('text', () => {
  //   return this.CONSUME(t.Text);
  // });

  // rawText = this.RULE('rawText', () => {
  //   return this.CONSUME(t.RawText);
  // });

  // comment = this.RULE('comment', () => {
  //   let value = null;

  //   this.CONSUME(t.LComment);
  //   this.OPTION(() => {
  //     value = this.CONSUME(t.Comment).image;
  //   });
  //   this.CONSUME(t.RComment);

  //   return {
  //     type: 'Comment',
  //     value,
  //   };
  // });

  // variable = this.RULE('variable', () => {
  //   let value = null;

  //   this.CONSUME(t.LVariable);
  //   this.OPTION(() => {
  //     value = this.SUBRULE(this.Expression);
  //   });
  //   this.CONSUME(t.RVariable);

  //   return {
  //     type: 'Variable',
  //     value,
  //   };
  // });

  // blocks = this.RULE('blocks', () => {
  //   return this.OR([{ ALT: () => this.SUBRULE(this.verbatimBlock) }]);
  // });

  // verbatimBlock = this.RULE('verbatimBlock', () => {
  //   this.CONSUME(t.LBlock);
  //   this.CONSUME(t.Verbatim);
  //   this.CONSUME(t.RBlock);

  //   const value = this.SUBRULE(this.rawText).image;

  //   this.CONSUME1(t.LBlock);
  //   this.CONSUME1(t.EndVerbatim);
  //   this.CONSUME1(t.RBlock);

  //   return {
  //     type: 'VerbatimBlock',
  //     value,
  //   };
  // });
}
