import { EmbeddedActionsParser } from 'chevrotain';
import * as t from './lexer.js';

export default class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(t);
    this.performSelfAnalysis();
  }

  // ok
  Identifier = this.RULE('Identifier', () => ({
    type: 'Identifier',
    value: this.CONSUME(t.IdentifierToken).image,
  }));

  // ok
  Literal = this.RULE('Literal', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.NullLiteral) },
      { ALT: () => this.SUBRULE(this.BooleanLiteral) },
      { ALT: () => this.SUBRULE(this.NumericLiteral) },
      { ALT: () => this.SUBRULE(this.StringLiteral) },
    ])
  );

  NumericLiteral = this.RULE('NumericLiteral', () => ({
    type: 'NumericLiteral',
    value: Number(this.CONSUME(t.NumberToken).image),
  }));

  StringLiteral = this.RULE('StringLiteral', () => ({
    type: 'StringLiteral',
    value: this.CONSUME(t.StringToken).image.slice(1, -1),
  }));

  BooleanLiteral = this.RULE('BooleanLiteral', () => ({
    type: 'BooleanLiteral',
    value: this.CONSUME(t.BooleanToken).image.toLowerCase() === 'true',
  }));

  NullLiteral = this.RULE('NullLiteral', () => ({
    type: 'NullLiteral',
    value: this.CONSUME(t.NullToken) ? null : undefined,
  }));

  PrimaryExpression = this.RULE('PrimaryExpression', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.Literal) },
      { ALT: () => this.SUBRULE(this.ArrayLiteral) },
      { ALT: () => this.SUBRULE(this.ObjectLiteral) },
      // TODO: FunctionExpression
      {
        ALT: () =>
          this.SUBRULE(this.CoverParenthesizedExpressionAndArrowParameterList),
      },
    ])
  );

  // ok
  ArrayLiteral = this.RULE('ArrayLiteral', () => {
    const elements = [];

    this.CONSUME(t.OpenBracketToken);
    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        elements.push(this.SUBRULE(this.AssignmentExpression));
      },
    });
    this.CONSUME(t.CloseBracketToken);

    return {
      type: 'ArrayLiteral',
      elements,
    };
  });

  // ok
  ObjectLiteral = this.RULE('ObjectLiteral', () => {
    const properties = [];

    this.CONSUME(t.OpenBraceToken);
    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        properties.push(this.SUBRULE(this.PropertyDefinition));
      },
    });
    this.CONSUME(t.CloseBraceToken);

    return {
      type: 'ObjectLiteral',
      properties,
    };
  });

  // ok
  PropertyDefinition = this.RULE('PropertyDefinition', () => {
    let key, value, shorthand;

    this.OR([
      {
        ALT: () => {
          key = this.SUBRULE(this.PropertyName);
          this.CONSUME(t.ColonToken);
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

  // ok
  PropertyName = this.RULE('PropertyName', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.StringLiteral) },
      { ALT: () => this.SUBRULE(this.NumericLiteral) },
      {
        ALT: () => {
          this.CONSUME(t.OpenParenToken);
          const expr = this.SUBRULE(this.AssignmentExpression);
          this.CONSUME(t.CloseParenToken);
          return expr;
        },
      },
    ])
  );

  // ok
  LeftHandSideExpression = this.RULE('LeftHandSideExpression', () =>
    this.OR({
      // MAX_LOOKAHEAD: 3,
      // IGNORE_AMBIGUITIES: true,
      DEF: [
        // TODO: MemberExpression should be first
        { ALT: () => this.SUBRULE(this.MemberExpression) },
        { ALT: () => this.SUBRULE(this.CallExpression) },
      ],
    })
  );

  CoverParenthesizedExpressionAndArrowParameterList = this.RULE(
    'CoverParenthesizedExpressionAndArrowParameterList',
    () => {
      const args = [];

      this.CONSUME(t.OpenParenToken);
      this.MANY_SEP({
        SEP: t.CommaToken,
        DEF: () => {
          args.push(this.SUBRULE(this.Expression));
        },
      });
      this.CONSUME(t.CloseParenToken);

      return args;
    }
  );

  // Ok
  ArrowFunction = this.RULE('ArrowFunction', () => {
    const params = this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      {
        ALT: () =>
          this.SUBRULE(this.CoverParenthesizedExpressionAndArrowParameterList),
      },
    ]);
    this.CONSUME(t.EqualsGreaterToken);
    const body = this.SUBRULE(this.AssignmentExpression);

    return {
      type: 'ArrowFunction',
      body,
      params,
    };
  });

  // ok
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

  // ok
  BoxMemberExpression = this.RULE('BoxMemberExpression', () => {
    this.CONSUME(t.OpenBracketToken);
    const expr = this.SUBRULE(this.Expression);
    this.CONSUME(t.CloseBracketToken);

    return expr;
  });

  // ok
  DotMemberExpression = this.RULE('DotMemberExpression', () => {
    this.CONSUME(t.DotToken);
    return this.SUBRULE(this.Identifier);
  });

  // ok
  CallExpression = this.RULE('CallExpression', () => {
    let object = {
      type: 'CallExpression',
      callee: this.SUBRULE(this.MemberExpression),
      arguments: this.SUBRULE1(this.Arguments),
    };

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

  // FormalParameterList = this.RULE('FormalParameterList', () => {
  //   const list = [];

  //   this.MANY_SEP({
  //     SEP: t.CommaToken,
  //     DEF: () => {
  //       const param = this.OR([
  //         {
  //           ALT: () => {
  //             const key = this.SUBRULE(this.Identifier);
  //             this.CONSUME(t.EqualsToken);
  //             const value = this.SUBRULE1(this.AssignmentExpression);

  //             return {
  //               type: 'NamedArgument',
  //               key,
  //               value,
  //             };
  //           },
  //         },
  //         { ALT: () => this.SUBRULE(this.Expression) },
  //       ]);

  //       list.push(param);
  //     },
  //   });

  //   return list;
  // });

  // ok
  Arguments = this.RULE('Arguments', () => {
    const args = [];

    this.CONSUME(t.OpenParenToken);
    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        const arg = this.OR([
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
          { ALT: () => this.SUBRULE(this.AssignmentExpression) },
        ]);

        args.push(arg);
      },
    });
    this.CONSUME(t.CloseParenToken);

    return args;
  });

  // Ok
  // Twig don't have increment and decrement operators
  UpdateExpression = this.RULE('UpdateExpression', () =>
    this.SUBRULE(this.LeftHandSideExpression)
  );

  // Ok
  UnaryExpression = this.RULE('UnaryExpression', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.UpdateExpression) },
      {
        ALT: () => ({
          type: 'UnaryExpression',
          operator: this.OR1([
            { ALT: () => this.CONSUME(t.PlusToken).image },
            { ALT: () => this.CONSUME(t.MinusToken).image },
            { ALT: () => this.CONSUME(t.NotToken).image },
          ]),
          argument: this.SUBRULE1(this.UnaryExpression),
        }),
      },
    ])
  );

  // Ok
  ExponentiationExpression = this.RULE('ExponentiationExpression', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.UnaryExpression) },
      {
        ALT: () => ({
          type: 'ExponentiationExpression',
          left: this.SUBRULE1(this.UpdateExpression),
          operator: this.CONSUME(t.AsteriskAsteriskToken).image,
          right: this.SUBRULE2(this.ExponentiationExpression),
        }),
      },
    ])
  );

  // Ok
  AssociativityExpression = this.RULE('AssociativityExpression', () => {
    let result = this.SUBRULE(this.ExponentiationExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.IsNotToken).image },
        { ALT: () => this.CONSUME(t.IsToken).image },
      ]);

      result = {
        type: 'AssociativityExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.ExponentiationExpression),
      };
    });

    return result;
  });

  // Ok
  MultiplicativeExpression = this.RULE('MultiplicativeExpression', () => {
    let result = this.SUBRULE(this.AssociativityExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.AsteriskToken).image },
        { ALT: () => this.CONSUME(t.SlashSlashToken).image },
        { ALT: () => this.CONSUME(t.SlashToken).image },
        { ALT: () => this.CONSUME(t.PercentToken).image },
      ]);

      result = {
        type: 'MultiplicativeExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.AssociativityExpression),
      };
    });

    return result;
  });

  // Ok
  ConcatExpression = this.RULE('ConcatExpression', () => {
    let result = this.SUBRULE(this.MultiplicativeExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.TildeToken).image;

      result = {
        type: 'ConcatExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.MultiplicativeExpression),
      };
    });

    return result;
  });

  // Ok
  AdditiveExpression = this.RULE('AdditiveExpression', () => {
    let result = this.SUBRULE(this.ConcatExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.PlusToken).image },
        { ALT: () => this.CONSUME(t.MinusToken).image },
      ]);

      result = {
        type: 'AdditiveExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.ConcatExpression),
      };
    });

    return result;
  });

  RangeExpression = this.RULE('RangeExpression', () => {
    let result = this.SUBRULE(this.AdditiveExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.DotDotToken).image;

      result = {
        type: 'RangeExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.AdditiveExpression),
      };
    });

    return result;
  });

  // Ok
  RelationalEqualityExpression = this.RULE(
    'RelationalEqualityExpression',
    () => {
      let result = this.SUBRULE(this.RangeExpression);

      this.MANY(() => {
        const operator = this.OR1([
          { ALT: () => this.CONSUME(t.EqualEqualToken).image },
          { ALT: () => this.CONSUME(t.ExclamationEqualsToken).image },
          { ALT: () => this.CONSUME(t.SpaceshipToken).image },
          { ALT: () => this.CONSUME(t.LessEqualToken).image },
          { ALT: () => this.CONSUME(t.LessToken).image },
          { ALT: () => this.CONSUME(t.GreaterEqualToken).image },
          { ALT: () => this.CONSUME(t.GreaterToken).image },
          { ALT: () => this.CONSUME(t.NotInToken).image },
          { ALT: () => this.CONSUME(t.InToken).image },
          { ALT: () => this.CONSUME(t.MatchesToken).image },
          { ALT: () => this.CONSUME(t.StartsWithToken).image },
          { ALT: () => this.CONSUME(t.EndsWithToken).image },
          { ALT: () => this.CONSUME(t.HasSomeToken).image },
          { ALT: () => this.CONSUME(t.HasEveryToken).image },
        ]);

        result = {
          type: 'RelationalEqualityExpression',
          left: result,
          operator,
          right: this.SUBRULE2(this.RangeExpression),
        };
      });

      return result;
    }
  );

  // Ok
  BitwiseANDExpression = this.RULE('BitwiseANDExpression', () => {
    let result = this.SUBRULE(this.RelationalEqualityExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseAndToken).image;

      result = {
        type: 'BitwiseANDExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.RelationalEqualityExpression),
      };
    });

    return result;
  });

  // Ok
  BitwiseXORExpression = this.RULE('BitwiseXORExpression', () => {
    let result = this.SUBRULE(this.BitwiseANDExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseXorToken).image;

      result = {
        type: 'BitwiseXORExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseANDExpression),
      };
    });

    return result;
  });

  // Ok
  BitwiseORExpression = this.RULE('BitwiseORExpression', () => {
    let result = this.SUBRULE(this.BitwiseXORExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseOrToken).image;

      result = {
        type: 'BitwiseORExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseXORExpression),
      };
    });

    return result;
  });

  // Ok
  LogicalANDExpression = this.RULE('LogicalANDExpression', () => {
    let result = this.SUBRULE(this.BitwiseORExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.AndToken).image;

      result = {
        type: 'LogicalANDExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseORExpression),
      };
    });

    return result;
  });

  // Ok
  LogicalORExpression = this.RULE('LogicalORExpression', () => {
    let result = this.SUBRULE(this.LogicalANDExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.QuestionQuestionToken).image;

      result = {
        type: 'LogicalORExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.LogicalANDExpression),
      };
    });

    return result;
  });

  // Ok
  CoalesceExpression = this.RULE('CoalesceExpression', () => {
    let result = this.SUBRULE(this.BitwiseORExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.QuestionQuestionToken).image;

      result = {
        type: 'CoalesceExpression',
        left: result,
        operator,
        right: this.SUBRULE1(this.BitwiseORExpression),
      };
    });

    return result;
  });

  // Ok
  ShortCircuitExpression = this.RULE('ShortCircuitExpression', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.LogicalORExpression) },
      { ALT: () => this.SUBRULE(this.CoalesceExpression) },
    ])
  );

  // Ok
  ConditionalExpression = this.RULE('ConditionalExpression', () => {
    let result = this.SUBRULE(this.ShortCircuitExpression);

    this.OPTION(() => {
      this.CONSUME(t.QuestionToken);
      const consequent = this.SUBRULE1(this.AssignmentExpression);
      this.CONSUME(t.ColonToken);
      const alternate = this.SUBRULE2(this.AssignmentExpression);

      result = {
        type: 'ConditionalExpression',
        test: result,
        consequent,
        alternate,
      };
    });

    return result;
  });

  // Ok
  AssignmentExpression = this.RULE('AssignmentExpression', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.ConditionalExpression) },
      { ALT: () => this.SUBRULE(this.ArrowFunction) },
      {
        ALT: () => ({
          type: 'AssignmentExpression',
          left: this.SUBRULE(this.LeftHandSideExpression),
          operator: this.CONSUME(t.EqualsToken).image,
          right: this.SUBRULE(this.AssignmentExpression),
        }),
      },
    ])
  );

  FilterExpression = this.RULE('FilterExpression', () => {
    let expression = this.SUBRULE(this.AssignmentExpression);

    this.MANY(() => {
      this.CONSUME(t.BarToken);
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
      value: this.CONSUME(t.TextToken).image,
    };
  });

  Comment = this.RULE('Comment', () => {
    let value = null;

    this.CONSUME(t.LCommentToken);
    this.OPTION(() => {
      value = this.CONSUME(t.CommentToken).image;
    });
    this.CONSUME(t.RCommentToken);

    return {
      type: 'Comment',
      value,
    };
  });

  VariableStatement = this.RULE('VariableStatement', () => {
    this.CONSUME(t.LVariableToken);
    const value = this.SUBRULE(this.Expression);
    this.CONSUME(t.RVariableToken);

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
      this.CONSUME(t.CommaToken);
      arr.push(this.SUBRULE2(this.Expression));
    });

    return arr;
  });

  VariableDeclarationList = this.RULE('VariableDeclarationList', () => {
    const arr = [this.SUBRULE(this.VariableDeclaration)];

    this.MANY(() => {
      this.CONSUME(t.CommaToken);
      arr.push(this.SUBRULE2(this.VariableDeclaration));
    });

    return arr;
  });

  SetInlineStatement = this.RULE('SetInlineStatement', () => {
    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.SetToken);

    const variables = this.SUBRULE(this.VariableDeclarationList);

    this.CONSUME(t.EqualsToken);

    const values = this.SUBRULE(this.ExpressionList);

    this.CONSUME(t.RBlockToken);

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
    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.SetToken);
    const name = this.SUBRULE(this.Identifier);
    this.CONSUME(t.RBlockToken);

    const init = this.SUBRULE1(this.Text);

    this.CONSUME1(t.LBlockToken);
    this.CONSUME1(t.EndSetToken);
    this.CONSUME1(t.RBlockToken);

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
    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.ApplyToken);

    let filter = this.SUBRULE(this.Filter);

    this.MANY(() => {
      this.CONSUME(t.BarToken);
      const nextFilter = this.SUBRULE1(this.Filter);

      filter = {
        type: 'FilterExpression',
        expression: filter,
        filter: nextFilter,
      };
    });

    this.CONSUME(t.RBlockToken);

    const text = this.SUBRULE(this.Text);

    this.CONSUME1(t.LBlockToken);
    this.CONSUME1(t.EndApplyToken);
    this.CONSUME1(t.RBlockToken);

    return {
      type: 'ApplyStatement',
      text,
      filter,
    };
  });

  ForInStatement = this.RULE('ForInStatement', () => {
    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.ForToken);
    const variables = this.SUBRULE(this.VariableDeclarationList);
    this.CONSUME(t.InToken);
    const expression = this.SUBRULE(this.Expression);
    this.CONSUME(t.RBlockToken);

    let body = [];

    this.MANY(() => {
      body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME1(t.LBlockToken);
    this.CONSUME1(t.EndForToken);
    this.CONSUME1(t.RBlockToken);

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
