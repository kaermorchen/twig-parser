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
    return this.OR({
      // MAX_LOOKAHEAD: 3,
      // IGNORE_AMBIGUITIES: true,
      DEF: [
        { ALT: () => this.SUBRULE(this.CallExpression) },
        // {
        //   ALT: () => this.SUBRULE(this.ArrowFunctionExpression),
        // },
        { ALT: () => this.SUBRULE(this.MemberExpression) },
      ],
    });
  });

  ArrowFunctionExpression = this.RULE('ArrowFunctionExpression', () => {
    let params = this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.Arguments) },
    ]);
    this.CONSUME(t.Arrow);
    let body = this.SUBRULE(this.Expression);

    return {
      type: 'ArrowFunctionExpression',
      body,
      params,
    };
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

  CallExpression = this.RULE('CallExpression', () => {
    let args = [];
    const callee = this.SUBRULE(this.Identifier);

    this.CONSUME(t.LParen);
    this.OPTION(() => {
      args = this.SUBRULE(this.FormalParameterList);
    });
    this.CONSUME(t.RParen);

    return {
      type: 'CallExpression',
      callee,
      arguments: args,
    };
  });

  FormalParameterList = this.RULE('FormalParameterList', () => {
    const list = [];

    this.MANY_SEP({
      SEP: t.Comma,
      DEF: () => {
        const param = this.OR([
          {
            ALT: () => {
              const key = this.SUBRULE(this.Identifier);
              this.CONSUME(t.EqualsToken);
              const value = this.SUBRULE1(this.AssignmentExpression);

              return {
                type: 'NamedArgument',
                key,
                value,
              };
            },
          },
          { ALT: () => this.SUBRULE(this.Expression) },
        ]);

        list.push(param);
      },
    });

    return list;
  });

  Arguments = this.RULE('Arguments', () => {
    const args = [];

    this.CONSUME(t.LParen);
    this.OPTION(() => {
      args.push(this.SUBRULE(this.AssignmentExpression));
      this.MANY(() => {
        this.CONSUME(t.Comma);
        args.push(this.SUBRULE2(this.AssignmentExpression));
      });
    });
    this.CONSUME(t.RParen);

    return args;
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

  FilterExpression = this.RULE('FilterExpression', () => {
    let expression = this.SUBRULE(this.AssignmentExpression);

    this.MANY(() => {
      this.CONSUME(t.VerticalBar);
      const filter = this.SUBRULE(this.Filter);

      expression = {
        type: 'FilterExpression',
        expression,
        filter,
      };
    });

    return expression;
  });

  Filter = this.RULE('Filter', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.CallExpression) },
      { ALT: () => this.SUBRULE(this.Identifier) },
    ]);
  });

  Expression = this.RULE('Expression', () => {
    return this.SUBRULE(this.FilterExpression);
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

  VariableStatement = this.RULE('VariableStatement', () => {
    this.CONSUME(t.LVariable);
    const value = this.SUBRULE(this.Expression);
    this.CONSUME(t.RVariable);

    return {
      type: 'VariableStatement',
      value,
    };
  });

  VariableDeclaration = this.RULE('VariableDeclaration', () => {
    return this.SUBRULE(this.Identifier);
  });

  ExpressionList = this.RULE('ExpressionList', () => {
    const arr = [this.SUBRULE(this.Expression)];

    this.MANY(() => {
      this.CONSUME(t.Comma);
      arr.push(this.SUBRULE2(this.Expression));
    });

    return arr;
  });

  VariableDeclarationList = this.RULE('VariableDeclarationList', () => {
    const arr = [this.SUBRULE(this.VariableDeclaration)];

    this.MANY(() => {
      this.CONSUME(t.Comma);
      arr.push(this.SUBRULE2(this.VariableDeclaration));
    });

    return arr;
  });

  SetInlineStatement = this.RULE('SetInlineStatement', () => {
    this.CONSUME(t.LBlock);
    this.CONSUME(t.SetToken);

    const variables = this.SUBRULE(this.VariableDeclarationList);

    this.CONSUME(t.EqualsToken);

    const values = this.SUBRULE(this.ExpressionList);

    this.CONSUME(t.RBlock);

    const declarations = [];

    for (let i = 0; i < variables.length; i++) {
      declarations.push({
        type: 'VariableDeclaration',
        name: variables[i],
        init: values[i],
      });
    }

    return {
      type: 'SetStatement',
      declarations,
    };
  });

  SetBlockStatement = this.RULE('SetBlockStatement', () => {
    this.CONSUME(t.LBlock);
    this.CONSUME(t.SetToken);
    const name = this.SUBRULE(this.Identifier);
    this.CONSUME(t.RBlock);

    const init = this.SUBRULE1(this.Text);

    this.CONSUME1(t.LBlock);
    this.CONSUME1(t.EndSetToken);
    this.CONSUME1(t.RBlock);

    return {
      type: 'SetStatement',
      declarations: [
        {
          type: 'VariableDeclaration',
          name,
          init,
        },
      ],
    };
  });

  ApplyStatement = this.RULE('ApplyStatement', () => {
    this.CONSUME(t.LBlock);
    this.CONSUME(t.ApplyToken);

    let filter = this.SUBRULE(this.Filter);

    this.MANY(() => {
      this.CONSUME(t.VerticalBar);
      const nextFilter = this.SUBRULE1(this.Filter);

      filter = {
        type: 'FilterExpression',
        expression: filter,
        filter: nextFilter,
      };
    });

    this.CONSUME(t.RBlock);

    const text = this.SUBRULE(this.Text);

    this.CONSUME1(t.LBlock);
    this.CONSUME1(t.EndApplyToken);
    this.CONSUME1(t.RBlock);

    return {
      type: 'ApplyStatement',
      text,
      filter,
    };
  });

  ForInStatement = this.RULE('ForInStatement', () => {
    this.CONSUME(t.LBlock);
    this.CONSUME(t.ForToken);
    const variables = this.SUBRULE(this.VariableDeclarationList);
    this.CONSUME(t.InBinary);
    const expression = this.SUBRULE(this.Expression);
    this.CONSUME(t.RBlock);

    let body = [];

    this.MANY(() => {
      body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME1(t.LBlock);
    this.CONSUME1(t.EndForToken);
    this.CONSUME1(t.RBlock);

    return {
      type: 'ForInStatement',
      body,
      variables,
      expression,
    };
  });

  Statement = this.RULE('Statement', () => {
    return this.OR({
      MAX_LOOKAHEAD: 4,
      DEF: [
        { ALT: () => this.SUBRULE(this.SetInlineStatement) },
        { ALT: () => this.SUBRULE(this.SetBlockStatement) },
        { ALT: () => this.SUBRULE(this.ApplyStatement) },
        { ALT: () => this.SUBRULE(this.ForInStatement) },
      ],
    });
  });

  SourceElement = this.RULE('SourceElement', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.Text) },
      { ALT: () => this.SUBRULE(this.Comment) },
      { ALT: () => this.SUBRULE(this.VariableStatement) },
      { ALT: () => this.SUBRULE(this.Statement) },
    ]);
  });

  SourceElementList = this.RULE('SourceElementList', () => {
    let body = [];

    this.MANY(() => {
      body.push(this.SUBRULE(this.SourceElement));
    });

    return body;
  });

  Program = this.RULE('Program', () => {
    return {
      type: 'Program',
      body: this.SUBRULE(this.SourceElementList),
    };
  });
}
