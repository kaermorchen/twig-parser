import { EmbeddedActionsParser } from 'chevrotain';
import * as t from './lexer.js';

export default class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(t);
    this.performSelfAnalysis();
  }

  Identifier = this.RULE('Identifier', () => {
    const value = this.OR([
      { ALT: () => this.CONSUME(t.DivisibleByToken) },
      { ALT: () => this.CONSUME(t.SameAsToken) },
      { ALT: () => this.CONSUME(t.IdentifierToken) },
    ]);

    return {
      type: 'Identifier',
      value: value.image,
    };
  });

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

  StringInterpolation = this.RULE('StringInterpolation', () => {
    const result = {
      type: 'StringInterpolation',
      body: [],
    };

    this.CONSUME(t.OpenStringInterpolationToken);

    this.MANY(() => {
      const element = this.OR([
        {
          ALT: () => {
            const result = {
              type: 'InterpolationExpression',
              expr: null,
            };

            this.CONSUME(t.StringInterpolationOpenStatementToken);
            result.expr = this.SUBRULE(this.Expression);
            this.CONSUME(t.StringInterpolationCloseStatementToken);

            return result;
          },
        },
        {
          ALT: () => ({
            type: 'StringLiteral',
            value: this.CONSUME(t.StringInterpolationStringPartToken).image,
          }),
        },
      ]);

      result.body.push(element);
    });

    this.CONSUME(t.CloseStringInterpolationToken);

    return result;
  });

  PrimaryExpression = this.RULE('PrimaryExpression', () =>
    this.OR([
      {
        ALT: () => {
          this.CONSUME(t.OpenParenToken);

          return this.OR1([
            {
              ALT: () =>
                this.SUBRULE(this.ArrowFunctionBody, {
                  ARGS: [this.SUBRULE(this.ArrowParameters)],
                }),
            },
            {
              ALT: () => this.SUBRULE(this.ParenthesizedExpression),
            },
          ]);
        },
      },
      { ALT: () => this.SUBRULE(this.SingleParamArrowFunction) },
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.Literal) },
      { ALT: () => this.SUBRULE(this.StringInterpolation) },
      { ALT: () => this.SUBRULE(this.ArrayLiteral) },
      { ALT: () => this.SUBRULE(this.ObjectLiteral) },
    ])
  );

  ArrayLiteral = this.RULE('ArrayLiteral', () => {
    const elements = [];

    this.CONSUME(t.OpenBracketToken);
    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        elements.push(this.SUBRULE(this.AssignmentExpression_In));
      },
    });
    this.CONSUME(t.CloseBracketToken);

    return {
      type: 'ArrayLiteral',
      elements,
    };
  });

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

  PropertyDefinition = this.RULE('PropertyDefinition', () => {
    let key, value, shorthand;

    this.OR([
      {
        ALT: () => {
          key = this.SUBRULE(this.PropertyName);
          this.CONSUME(t.ColonToken);
          value = this.SUBRULE(this.AssignmentExpression_In);
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

  PropertyName = this.RULE('PropertyName', () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.Identifier) },
      { ALT: () => this.SUBRULE(this.StringLiteral) },
      { ALT: () => this.SUBRULE(this.NumericLiteral) },
      {
        ALT: () => {
          this.CONSUME(t.OpenParenToken);
          const expr = this.SUBRULE(this.AssignmentExpression_In);
          this.CONSUME(t.CloseParenToken);
          return expr;
        },
      },
    ])
  );

  LeftHandSideExpression = this.RULE('LeftHandSideExpression', () => {
    let object = this.SUBRULE(this.PrimaryExpression);

    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            object = {
              type: 'MemberExpression',
              object,
              property: this.SUBRULE(this.BoxMemberExpression),
            };
          },
        },
        {
          ALT: () => {
            object = {
              type: 'MemberExpression',
              object,
              property: this.SUBRULE(this.DotMemberExpression),
            };
          },
        },
        {
          ALT: () => {
            object = {
              type: 'CallExpression',
              callee: object,
              arguments: this.SUBRULE(this.Arguments),
            };
          },
        },
      ]);
    });

    return object;
  });

  BoxMemberExpression = this.RULE('BoxMemberExpression', () => {
    this.CONSUME(t.OpenBracketToken);
    const expr = this.SUBRULE(this.Expression_In);
    this.CONSUME(t.CloseBracketToken);

    return expr;
  });

  DotMemberExpression = this.RULE('DotMemberExpression', () => {
    this.CONSUME(t.DotToken);
    return this.SUBRULE(this.Identifier);
  });

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
              const value = this.SUBRULE1(this.AssignmentExpression_In);

              return {
                type: 'NamedArgument',
                key,
                value,
              };
            },
          },
          { ALT: () => this.SUBRULE(this.AssignmentExpression_In) },
        ]);

        args.push(arg);
      },
    });
    this.CONSUME(t.CloseParenToken);

    return args;
  });

  ParenthesizedExpression = this.RULE('ParenthesizedExpression', () => {
    const result = this.SUBRULE(this.Expression);
    this.CONSUME(t.CloseParenToken);

    return result;
  });

  ArrowParameters = this.RULE('ArrowParameters', () => {
    const params = [];

    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        params.push(this.SUBRULE(this.Identifier));
      },
    });

    this.CONSUME(t.CloseParenToken);

    return params;
  });

  // Short version has only one param: v => v + 1
  SingleParamArrowFunction = this.RULE('SingleParamArrowFunction', () => {
    const params = [this.SUBRULE(this.Identifier)];
    return this.SUBRULE(this.ArrowFunctionBody, { ARGS: [params] });
  });

  ArrowFunctionBody = this.RULE('ArrowFunctionBody', (params) => {
    this.CONSUME(t.EqualsGreaterToken);
    const body = this.SUBRULE(this.AssignmentExpression);

    return {
      type: 'ArrowFunction',
      body,
      params,
    };
  });

  // Twig don't have increment and decrement operators
  UpdateExpression = this.RULE('UpdateExpression', () =>
    this.SUBRULE(this.LeftHandSideExpression)
  );

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

  ExponentiationExpression = this.RULE('ExponentiationExpression', () => {
    let left = this.SUBRULE(this.UnaryExpression);

    this.MANY(() => {
      left = {
        type: 'BinaryExpression',
        left,
        operator: this.CONSUME(t.AsteriskAsteriskToken).image,
        right: this.SUBRULE1(this.UnaryExpression),
      };
    });

    return left;
  });

  AssociativityExpression = this.RULE('AssociativityExpression', () => {
    let result = this.SUBRULE(this.ExponentiationExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.IsNotToken).image },
        { ALT: () => this.CONSUME(t.IsToken).image },
      ]);

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.ExponentiationExpression),
      };
    });

    return result;
  });

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
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.AssociativityExpression),
      };
    });

    return result;
  });

  ConcatExpression = this.RULE('ConcatExpression', () => {
    let result = this.SUBRULE(this.MultiplicativeExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.TildeToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.MultiplicativeExpression),
      };
    });

    return result;
  });

  AdditiveExpression = this.RULE('AdditiveExpression', () => {
    let result = this.SUBRULE(this.ConcatExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.PlusToken).image },
        { ALT: () => this.CONSUME(t.MinusToken).image },
      ]);

      result = {
        type: 'BinaryExpression',
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
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.AdditiveExpression),
      };
    });

    return result;
  });

  RelationalExpression = this.RULE('RelationalExpression', () => {
    let result = this.SUBRULE(this.RangeExpression);

    this.MANY(() => {
      const operator = this.OR1([
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
        { ALT: () => this.CONSUME(t.SameAsToken).image },
      ]);

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.RangeExpression),
      };
    });

    return result;
  });

  RelationalExpression_In = this.RULE('RelationalExpression_In', () => {
    let result = this.SUBRULE(this.UnaryExpression);

    this.MANY(() => {
      const operator = this.OR1([
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
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.UnaryExpression),
      };
    });

    return result;
  });

  EqualityExpression = this.RULE('EqualityExpression', () => {
    let result = this.SUBRULE(this.RelationalExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.EqualEqualToken).image },
        { ALT: () => this.CONSUME(t.ExclamationEqualsToken).image },
        { ALT: () => this.CONSUME(t.SpaceshipToken).image },
      ]);

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.RelationalExpression),
      };
    });

    return result;
  });

  EqualityExpression_In = this.RULE('EqualityExpression_In', () => {
    let result = this.SUBRULE(this.RelationalExpression_In);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.EqualEqualToken).image },
        { ALT: () => this.CONSUME(t.ExclamationEqualsToken).image },
        { ALT: () => this.CONSUME(t.SpaceshipToken).image },
      ]);

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.RelationalExpression_In),
      };
    });

    return result;
  });

  BitwiseANDExpression = this.RULE('BitwiseANDExpression', () => {
    let result = this.SUBRULE(this.EqualityExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseAndToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.EqualityExpression),
      };
    });

    return result;
  });

  BitwiseANDExpression_In = this.RULE('BitwiseANDExpression_In', () => {
    let result = this.SUBRULE(this.EqualityExpression_In);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseAndToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.EqualityExpression_In),
      };
    });

    return result;
  });

  BitwiseXORExpression = this.RULE('BitwiseXORExpression', () => {
    let result = this.SUBRULE(this.BitwiseANDExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseXorToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseANDExpression),
      };
    });

    return result;
  });

  BitwiseXORExpression_In = this.RULE('BitwiseXORExpression_In', () => {
    let result = this.SUBRULE(this.BitwiseANDExpression_In);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseXorToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseANDExpression_In),
      };
    });

    return result;
  });

  BitwiseORExpression = this.RULE('BitwiseORExpression', () => {
    let result = this.SUBRULE(this.BitwiseXORExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseOrToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseXORExpression),
      };
    });

    return result;
  });

  BitwiseORExpression_In = this.RULE('BitwiseORExpression_In', () => {
    let result = this.SUBRULE(this.BitwiseXORExpression_In);

    this.MANY(() => {
      const operator = this.CONSUME(t.BitwiseOrToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseXORExpression_In),
      };
    });

    return result;
  });

  LogicalANDExpression = this.RULE('LogicalANDExpression', () => {
    let result = this.SUBRULE(this.BitwiseORExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.AndToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseORExpression),
      };
    });

    return result;
  });

  LogicalANDExpression_In = this.RULE('LogicalANDExpression_In', () => {
    let result = this.SUBRULE(this.BitwiseORExpression_In);

    this.MANY(() => {
      const operator = this.CONSUME(t.AndToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.BitwiseORExpression_In),
      };
    });

    return result;
  });

  LogicalORExpression = this.RULE('LogicalORExpression', () => {
    let result = this.SUBRULE(this.LogicalANDExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.OrToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.LogicalANDExpression),
      };
    });

    return result;
  });

  LogicalORExpression_In = this.RULE('LogicalORExpression_In', () => {
    let result = this.SUBRULE(this.LogicalANDExpression_In);

    this.MANY(() => {
      const operator = this.CONSUME(t.OrToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE2(this.LogicalANDExpression_In),
      };
    });

    return result;
  });

  CoalesceExpression = this.RULE('CoalesceExpression', () => {
    let result = this.SUBRULE(this.LogicalORExpression);

    this.MANY(() => {
      const operator = this.CONSUME(t.QuestionQuestionToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE1(this.LogicalORExpression),
      };
    });

    return result;
  });

  CoalesceExpression_In = this.RULE('CoalesceExpression_In', () => {
    let result = this.SUBRULE(this.LogicalORExpression_In);

    this.MANY(() => {
      const operator = this.CONSUME(t.QuestionQuestionToken).image;

      result = {
        type: 'BinaryExpression',
        left: result,
        operator,
        right: this.SUBRULE1(this.LogicalORExpression_In),
      };
    });

    return result;
  });

  ConditionalExpression = this.RULE('ConditionalExpression', () => {
    let result = this.SUBRULE(this.CoalesceExpression);

    this.OPTION(() => {
      this.CONSUME(t.QuestionToken);
      let consequent = result;
      this.OPTION1(() => {
        consequent = this.SUBRULE1(this.AssignmentExpression_In);
      });
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

  ConditionalExpression_In = this.RULE('ConditionalExpression_In', () => {
    let result = this.SUBRULE(this.CoalesceExpression_In);

    this.OPTION(() => {
      this.CONSUME(t.QuestionToken);
      let consequent = result;
      this.OPTION1(() => {
        consequent = this.SUBRULE1(this.AssignmentExpression_In);
      });
      this.CONSUME(t.ColonToken);
      const alternate = this.SUBRULE2(this.AssignmentExpression_In);

      result = {
        type: 'ConditionalExpression',
        test: result,
        consequent,
        alternate,
      };
    });

    return result;
  });

  AssignmentExpression = this.RULE('AssignmentExpression', () =>
    this.OR({
      MAX_LOOKAHEAD: 4,
      DEF: [
        // { ALT: () => this.SUBRULE(this.ArrowFunction) },
        { ALT: () => this.SUBRULE(this.ConditionalExpression) },
        // {
        //   ALT: () => ({
        //     type: 'AssignmentExpression',
        //     left: this.SUBRULE(this.LeftHandSideExpression),
        //     operator: this.CONSUME(t.EqualsToken).image,
        //     right: this.SUBRULE(this.AssignmentExpression),
        //   }),
        // },
      ],
    })
  );

  AssignmentExpression_In = this.RULE('AssignmentExpression_In', () =>
    this.OR({
      MAX_LOOKAHEAD: 4,
      DEF: [
        // { ALT: () => this.SUBRULE(this.ArrowFunction_In) },
        { ALT: () => this.SUBRULE(this.ConditionalExpression_In) },
        // {
        //   ALT: () => ({
        //     type: 'AssignmentExpression',
        //     left: this.SUBRULE(this.LeftHandSideExpression),
        //     operator: this.CONSUME(t.EqualsToken).image,
        //     right: this.SUBRULE(this.AssignmentExpression_In),
        //   }),
        // },
      ],
    })
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

  FilterExpression_In = this.RULE('FilterExpression_In', () => {
    let expression = this.SUBRULE(this.AssignmentExpression_In);

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
    let result = this.SUBRULE(this.Identifier);

    this.OPTION(() => {
      const args = this.SUBRULE(this.Arguments);

      result = {
        type: 'CallExpression',
        callee: result,
        arguments: args,
      };
    });

    return result;
  });

  CallExpression = this.RULE('CallExpression', () => {
    return {
      type: 'CallExpression',
      callee: this.SUBRULE(this.Identifier),
      arguments: this.SUBRULE(this.Arguments),
    };
  });

  Expression = this.RULE('Expression', () => {
    return this.SUBRULE(this.FilterExpression);
  });

  Expression_In = this.RULE('Expression_In', () => {
    return this.SUBRULE(this.FilterExpression_In);
  });

  ExpressionList = this.RULE('ExpressionList', () => {
    const arr = [];

    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        arr.push(this.SUBRULE(this.Expression));
      },
    });

    return arr;
  });

  ExpressionList_In = this.RULE('ExpressionList_In', () => {
    const arr = [];

    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        arr.push(this.SUBRULE(this.Expression_In));
      },
    });

    return arr;
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

  VariableDeclarationList = this.RULE('VariableDeclarationList', () => {
    const arr = [this.SUBRULE(this.VariableDeclaration)];

    this.MANY(() => {
      this.CONSUME(t.CommaToken);
      arr.push(this.SUBRULE2(this.VariableDeclaration));
    });

    return arr;
  });

  SetInlineStatement = this.RULE('SetInlineStatement', () => {
    this.CONSUME(t.SetToken);

    const variables = this.SUBRULE(this.VariableDeclarationList);

    this.CONSUME(t.EqualsToken);

    const values = this.SUBRULE(this.ExpressionList);

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
    this.CONSUME(t.SetToken);
    const name = this.SUBRULE(this.Identifier);
    this.CONSUME(t.RBlockToken);

    const init = this.SUBRULE1(this.Text);

    this.CONSUME1(t.LBlockToken);
    this.CONSUME1(t.EndSetToken);

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

    return {
      type: 'ApplyStatement',
      text,
      filter,
    };
  });

  ForInStatement = this.RULE('ForInStatement', () => {
    this.CONSUME(t.ForToken);
    const variables = this.SUBRULE(this.VariableDeclarationList);
    this.CONSUME(t.InToken);
    const expression = this.SUBRULE(this.Expression);
    this.CONSUME(t.RBlockToken);

    let body = [],
      alternate = null;

    this.MANY(() => {
      body.push(this.SUBRULE(this.SourceElement));
    });

    this.OPTION(() => {
      this.CONSUME1(t.LBlockToken);
      this.CONSUME(t.ElseToken);
      this.CONSUME1(t.RBlockToken);
      alternate = this.SUBRULE2(this.SourceElement);
    });

    this.CONSUME2(t.LBlockToken);
    this.CONSUME2(t.EndForToken);

    return {
      type: 'ForInStatement',
      body,
      variables,
      expression,
      alternate,
    };
  });

  IfStatement = this.RULE('IfStatement', () => {
    let result = {
      type: 'IfStatement',
      test: null,
      consequent: [],
      alternate: null,
    };

    this.CONSUME(t.IfToken);
    result.test = this.SUBRULE(this.Expression);
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.consequent.push(this.SUBRULE(this.SourceElement));
    });

    // elseif
    let elseIfStatement = result;
    this.MANY2(() => {
      this.CONSUME2(t.LBlockToken);
      this.CONSUME2(t.ElseIfToken);

      elseIfStatement = elseIfStatement.alternate = {
        type: 'IfStatement',
        test: this.SUBRULE2(this.Expression),
        consequent: [],
        alternate: null,
      };

      this.CONSUME2(t.RBlockToken);

      this.MANY3(() => {
        elseIfStatement.consequent.push(this.SUBRULE3(this.SourceElement));
      });
    });

    // else
    this.OPTION4(() => {
      this.CONSUME4(t.LBlockToken);
      this.CONSUME4(t.ElseToken);
      this.CONSUME4(t.RBlockToken);

      elseIfStatement.alternate = [];

      this.MANY4(() => {
        elseIfStatement.alternate.push(this.SUBRULE4(this.SourceElement));
      });
    });

    this.CONSUME5(t.LBlockToken);
    this.CONSUME5(t.EndIfToken);

    return result;
  });

  AutoescapeStatement = this.RULE('AutoescapeStatement', () => {
    const result = {
      type: 'AutoescapeStatement',
      value: [],
      strategy: null,
    };

    this.CONSUME(t.AutoescapeToken);

    this.OPTION(() => {
      result.strategy = this.OR([
        { ALT: () => this.SUBRULE(this.StringLiteral) },
        { ALT: () => this.SUBRULE(this.BooleanLiteral) },
      ]);
    });

    this.CONSUME5(t.RBlockToken);

    this.MANY(() => {
      result.value.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME5(t.LBlockToken);
    this.CONSUME5(t.EndAutoescapeToken);

    return result;
  });

  CacheStatement = this.RULE('CacheStatement', () => {
    const result = {
      type: 'CacheStatement',
      key: null,
      expiration: null,
      value: [],
    };

    this.CONSUME(t.CacheToken);
    result.key = this.SUBRULE(this.Expression);
    this.OPTION(() => {
      result.expiration = this.SUBRULE1(this.Expression);
    });
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.value.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME1(t.LBlockToken);
    this.CONSUME2(t.EndCacheToken);

    return result;
  });

  DeprecatedStatement = this.RULE('DeprecatedStatement', () => {
    const result = {
      type: 'DeprecatedStatement',
      expr: null,
    };

    this.CONSUME(t.DeprecatedToken);
    result.expr = this.SUBRULE(this.Expression);

    return result;
  });

  DoStatement = this.RULE('DoStatement', () => {
    this.CONSUME(t.DoToken);

    return {
      type: 'DoStatement',
      expr: this.SUBRULE(this.Expression),
    };
  });

  FlushStatement = this.RULE('FlushStatement', () => {
    this.CONSUME(t.FlushToken);

    return { type: 'FlushStatement' };
  });

  BlockInlineStatement = this.RULE('BlockInlineStatement', () => {
    const result = {
      type: 'BlockStatement',
      name: null,
      body: [],
      shortcut: true,
    };

    this.CONSUME(t.BlockToken);
    result.name = this.SUBRULE(this.Identifier);
    result.body.push(this.SUBRULE(this.Expression));

    return result;
  });

  BlockStatement = this.RULE('BlockStatement', () => {
    const result = {
      type: 'BlockStatement',
      name: null,
      body: [],
      shortcut: false,
    };

    this.CONSUME(t.BlockToken);
    result.name = this.SUBRULE(this.Identifier);

    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.EndBlockToken);

    this.OPTION(() => {
      this.SUBRULE1(this.Identifier);
    });

    return result;
  });

  ExtendsStatement = this.RULE('ExtendsStatement', () => {
    this.CONSUME(t.ExtendsToken);

    return { type: 'ExtendsStatement', expr: this.SUBRULE(this.Expression) };
  });

  WithStatement = this.RULE('WithStatement', () => {
    const result = {
      type: 'WithStatement',
      expr: null,
      body: [],
      accessToOuterScope: true,
    };

    this.CONSUME(t.WithToken);
    this.OPTION(() => {
      result.expr = this.SUBRULE(this.Expression);
    });
    this.OPTION1(() => {
      this.CONSUME(t.OnlyToken);
      result.accessToOuterScope = false;
    });
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.EndWithToken);

    return result;
  });

  AsOperator = this.RULE('AsOperator', () => {
    const result = {
      type: 'BinaryExpression',
      operator: 'as',
      left: null,
      right: null,
    };

    result.left = this.SUBRULE(this.Identifier);
    this.CONSUME(t.AsToken);
    result.right = this.SUBRULE1(this.Identifier);

    return result;
  });

  UseStatement = this.RULE('UseStatement', () => {
    const result = {
      type: 'UseStatement',
      name: null,
      importedBlocks: [],
    };

    this.CONSUME(t.UseToken);
    result.name = this.SUBRULE(this.Expression);
    this.OPTION(() => {
      this.CONSUME(t.WithToken);

      this.MANY_SEP({
        SEP: t.CommaToken,
        DEF: () => {
          result.importedBlocks.push(this.SUBRULE(this.AsOperator));
        },
      });
    });

    return result;
  });

  SandboxStatement = this.RULE('SandboxStatement', () => {
    const result = {
      type: 'SandboxStatement',
      body: [],
    };

    this.CONSUME(t.SandboxToken);
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.EndSandboxToken);

    return result;
  });

  IncludeStatement = this.RULE('IncludeStatement', () => {
    const result = {
      type: 'IncludeStatement',
      expr: null,
      variables: null,
      ignoreMissing: false,
      only: false,
    };

    this.CONSUME(t.IncludeToken);

    result.expr = this.SUBRULE(this.Expression);

    this.OPTION(() => {
      this.CONSUME(t.IgnoreMissingToken);
      result.ignoreMissing = true;
    });

    this.OPTION1(() => {
      this.CONSUME(t.WithToken);
      result.variables = this.SUBRULE1(this.Expression);
    });

    this.OPTION2(() => {
      this.CONSUME(t.OnlyToken);
      result.only = true;
    });

    return result;
  });

  MacroStatement = this.RULE('MacroStatement', () => {
    const result = {
      type: 'MacroStatement',
      name: null,
      arguments: null,
      body: [],
    };

    this.CONSUME(t.MacroToken);
    result.name = this.SUBRULE(this.Identifier);
    result.arguments = this.SUBRULE(this.Arguments);
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);

    this.OPTION(() => {
      this.SUBRULE1(this.Identifier);
    });

    this.CONSUME(t.EndMacroToken);

    return result;
  });

  ImportStatement = this.RULE('ImportStatement', () => {
    const result = {
      type: 'ImportStatement',
      expr: null,
      name: null,
    };

    this.CONSUME(t.ImportToken);

    result.expr = this.SUBRULE(this.Expression);

    this.CONSUME(t.AsToken);

    result.name = this.SUBRULE(this.Identifier);

    return result;
  });

  FromStatement = this.RULE('FromStatement', () => {
    const result = {
      type: 'FromStatement',
      expr: null,
      variables: [],
    };

    this.CONSUME(t.FromToken);

    result.expr = this.SUBRULE(this.Expression);

    this.CONSUME(t.ImportToken);

    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        const variable = this.OR([
          { ALT: () => this.SUBRULE(this.AsOperator) },
          { ALT: () => this.SUBRULE(this.Identifier) },
        ]);

        result.variables.push(variable);
      },
    });

    return result;
  });

  EmbedStatement = this.RULE('EmbedStatement', () => {
    const result = {
      type: 'EmbedStatement',
      expr: null,
      variables: null,
      ignoreMissing: false,
      only: false,
      body: [],
    };

    this.CONSUME(t.EmbedToken);

    result.expr = this.SUBRULE(this.Expression);

    this.OPTION(() => {
      this.CONSUME(t.IgnoreMissingToken);
      result.ignoreMissing = true;
    });

    this.OPTION1(() => {
      this.CONSUME(t.WithToken);
      result.variables = this.SUBRULE1(this.Expression);
    });

    this.OPTION2(() => {
      this.CONSUME(t.OnlyToken);
      result.only = true;
    });

    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.EndEmbedToken);

    return result;
  });

  VerbatimStatement = this.RULE('VerbatimStatement', () => {
    const result = {
      type: 'EmbedStatement',
      body: [],
    };

    this.CONSUME(t.VerbatimToken);
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.EndVerbatimToken);

    return result;
  });

  FormThemeStatement = this.RULE('FormThemeStatement', () => {
    const result = {
      type: 'FormThemeStatement',
      form: null,
      resources: [],
      only: false,
    };

    this.CONSUME(t.FormThemeToken);

    result.form = this.SUBRULE(this.Expression);

    this.OR([
      {
        ALT: () => {
          this.CONSUME(t.WithToken);
          result.resources = this.SUBRULE1(this.Expression);
        },
      },
      {
        ALT: () => {
          result.resources = [];
          this.AT_LEAST_ONE(() => {
            result.resources.push(this.SUBRULE2(this.Expression));
          });
        },
      },
    ]);

    this.OPTION(() => {
      this.CONSUME(t.OnlyToken);
      result.only = true;
    });

    return result;
  });

  TransStatement = this.RULE('TransStatement', () => {
    const result = {
      type: 'TransStatement',
      vars: [],
      domain: null,
      locale: null,
      body: [],
    };

    this.CONSUME(t.TransToken);

    this.OPTION(() => {
      this.CONSUME(t.WithToken);
      result.vars = this.SUBRULE(this.Expression);
    });

    this.OPTION1(() => {
      this.CONSUME(t.FromToken);
      result.domain = this.SUBRULE1(this.Expression);
    });

    this.OPTION2(() => {
      this.CONSUME(t.IntoToken);
      result.locale = this.SUBRULE2(this.Expression);
    });

    this.OPTION3(() => {
      this.CONSUME(t.RBlockToken);

      this.MANY(() => {
        result.body.push(this.SUBRULE3(this.SourceElement));
      });

      this.CONSUME(t.LBlockToken);
      this.CONSUME(t.EndTransToken);
    });

    return result;
  });

  TransDefaultDomainStatement = this.RULE('TransDefaultDomainStatement', () => {
    const result = {
      type: 'TransDefaultDomainStatement',
      domain: null,
    };

    this.CONSUME(t.TransDefaultDomainToken);

    result.domain = this.SUBRULE1(this.Expression);

    return result;
  });

  StopwatchStatement = this.RULE('StopwatchStatement', () => {
    const result = {
      type: 'StopwatchStatement',
      event_name: null,
      body: [],
    };

    this.CONSUME(t.StopwatchToken);
    result.event_name = this.SUBRULE1(this.Expression);
    this.CONSUME(t.RBlockToken);

    this.MANY(() => {
      result.body.push(this.SUBRULE3(this.SourceElement));
    });

    this.CONSUME(t.LBlockToken);
    this.CONSUME(t.EndStopwatchToken);

    return result;
  });

  Statement = this.RULE('Statement', () => {
    this.CONSUME(t.LBlockToken);
    const statement = this.OR({
      DEF: [
        // Twig
        { ALT: () => this.SUBRULE(this.SetInlineStatement) },
        { ALT: () => this.SUBRULE(this.SetBlockStatement) },
        { ALT: () => this.SUBRULE(this.ApplyStatement) },
        { ALT: () => this.SUBRULE(this.ForInStatement) },
        { ALT: () => this.SUBRULE(this.IfStatement) },
        { ALT: () => this.SUBRULE(this.AutoescapeStatement) },
        { ALT: () => this.SUBRULE(this.CacheStatement) },
        { ALT: () => this.SUBRULE(this.DeprecatedStatement) },
        { ALT: () => this.SUBRULE(this.DoStatement) },
        { ALT: () => this.SUBRULE(this.FlushStatement) },
        { ALT: () => this.SUBRULE(this.BlockInlineStatement) },
        { ALT: () => this.SUBRULE(this.BlockStatement) },
        { ALT: () => this.SUBRULE(this.ExtendsStatement) },
        { ALT: () => this.SUBRULE(this.WithStatement) },
        { ALT: () => this.SUBRULE(this.UseStatement) },
        { ALT: () => this.SUBRULE(this.SandboxStatement) },
        { ALT: () => this.SUBRULE(this.IncludeStatement) },
        { ALT: () => this.SUBRULE(this.MacroStatement) },
        { ALT: () => this.SUBRULE(this.ImportStatement) },
        { ALT: () => this.SUBRULE(this.FromStatement) },
        { ALT: () => this.SUBRULE(this.EmbedStatement) },
        { ALT: () => this.SUBRULE(this.VerbatimStatement) },
        // Symfony
        { ALT: () => this.SUBRULE(this.FormThemeStatement) },
        { ALT: () => this.SUBRULE(this.TransStatement) },
        { ALT: () => this.SUBRULE(this.TransDefaultDomainStatement) },
        { ALT: () => this.SUBRULE(this.StopwatchStatement) },
      ],
    });
    this.CONSUME1(t.RBlockToken);

    return statement;
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

  Template = this.RULE('Template', () => {
    return {
      type: 'Template',
      body: this.SUBRULE(this.SourceElementList),
    };
  });
}
