import { EmbeddedActionsParser } from 'chevrotain';
import { tokens as t } from './lexer.js';
import {
  ApplyStatement,
  Arguments,
  ArrayLiteral,
  ArrowFunctionBody,
  ArrowParameters,
  AsOperator,
  AssignmentExpression,
  AssignmentExpression_In,
  AutoescapeStatement,
  BinaryExpression,
  BlockInlineStatement,
  BlockStatement,
  BooleanLiteral,
  BoxMemberExpression,
  CacheStatement,
  CallExpression,
  Comment,
  ConditionalExpression,
  ConditionalExpression_In,
  DeprecatedStatement,
  DoStatement,
  DotMemberExpression,
  EmbedStatement,
  Expression,
  ExpressionList,
  ExpressionList_In,
  Expression_In,
  ExtendsStatement,
  Filter,
  FilterExpression,
  FilterExpression_In,
  FlushStatement,
  ForInStatement,
  FormThemeStatement,
  FromStatement,
  Identifier,
  IfStatement,
  ImportStatement,
  IncludeStatement,
  LeftHandSideExpression,
  Literal,
  MacroStatement,
  NodeKind,
  NullLiteral,
  NumericLiteral,
  ObjectLiteral,
  ParenthesizedExpression,
  PrimaryExpression,
  PropertyDefinition,
  PropertyName,
  SandboxStatement,
  SetBlockStatement,
  SetInlineStatement,
  SingleParamArrowFunction,
  SourceElement,
  SourceElementList,
  Statement,
  StopwatchStatement,
  StringInterpolation,
  StringLiteral,
  Template,
  Text,
  TransDefaultDomainStatement,
  TransStatement,
  UnaryExpression,
  UpdateExpression,
  UseStatement,
  VariableDeclaration,
  VariableDeclarationList,
  VariableStatement,
  VerbatimStatement,
  WithStatement,
} from './types.js';

export class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(t);
    this.performSelfAnalysis();
  }

  [NodeKind.Identifier] = this.RULE<() => Identifier>(
    NodeKind.Identifier,
    () => ({
      type: NodeKind.Identifier,
      name: this.OR([
        { ALT: () => this.CONSUME(t.DivisibleByToken).image },
        { ALT: () => this.CONSUME(t.SameAsToken).image },
        { ALT: () => this.CONSUME(t.IdentifierToken).image },
      ]),
    })
  );

  [NodeKind.Literal] = this.RULE<() => Literal>(NodeKind.Literal, () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.NullLiteral) },
      { ALT: () => this.SUBRULE(this.BooleanLiteral) },
      { ALT: () => this.SUBRULE(this.NumericLiteral) },
      { ALT: () => this.SUBRULE(this.StringLiteral) },
    ])
  );

  [NodeKind.NumericLiteral] = this.RULE<() => NumericLiteral>(
    NodeKind.NumericLiteral,
    () => ({
      type: NodeKind.NumericLiteral,
      value: Number(this.CONSUME(t.NumberToken).image),
    })
  );

  [NodeKind.StringLiteral] = this.RULE<() => StringLiteral>(
    NodeKind.StringLiteral,
    () => ({
      type: NodeKind.StringLiteral,
      value: this.CONSUME(t.StringToken).image.slice(1, -1),
    })
  );

  [NodeKind.BooleanLiteral] = this.RULE<() => BooleanLiteral>(
    NodeKind.BooleanLiteral,
    () => ({
      type: NodeKind.BooleanLiteral,
      value: this.CONSUME(t.BooleanToken).image.toLowerCase() === 'true',
    })
  );

  [NodeKind.NullLiteral] = this.RULE<() => NullLiteral>(
    NodeKind.NullLiteral,
    () => ({
      type: NodeKind.NullLiteral,
      value: this.CONSUME(t.NullToken) ? null : undefined,
    })
  );

  [NodeKind.StringInterpolation] = this.RULE<() => StringInterpolation>(
    NodeKind.StringInterpolation,
    () => {
      const result: StringInterpolation = {
        type: NodeKind.StringInterpolation,
        body: [],
      };

      this.CONSUME(t.OpenStringInterpolationToken);

      this.MANY(() => {
        const element = this.OR([
          {
            ALT: () => {
              const result = {
                type: NodeKind.InterpolationExpression,
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
              type: NodeKind.StringLiteral,
              value: this.CONSUME(t.StringInterpolationStringPartToken).image,
            }),
          },
        ]);

        result.body.push(element);
      });

      this.CONSUME(t.CloseStringInterpolationToken);

      return result;
    }
  );

  [NodeKind.PrimaryExpression] = this.RULE<() => PrimaryExpression>(
    NodeKind.PrimaryExpression,
    () =>
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

  [NodeKind.ArrayLiteral] = this.RULE<() => ArrayLiteral>(
    NodeKind.ArrayLiteral,
    () => {
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
        type: NodeKind.ArrayLiteral,
        elements,
      };
    }
  );

  [NodeKind.ObjectLiteral] = this.RULE<() => ObjectLiteral>(
    NodeKind.ObjectLiteral,
    () => {
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
        type: NodeKind.ObjectLiteral,
        properties,
      };
    }
  );

  [NodeKind.PropertyDefinition] = this.RULE<() => PropertyDefinition>(
    NodeKind.PropertyDefinition,
    () => {
      const result = {
        type: NodeKind.PropertyAssignment,
        key,
        value,
        shorthand,
      };

      return this.OR([
        {
          ALT: () => {
            result.key = this.SUBRULE(this.PropertyName);
            this.CONSUME(t.ColonToken);
            value = this.SUBRULE(this.AssignmentExpression_In);
            shorthand = false;
          },
        },
        {
          ALT: () => {
            value = this.SUBRULE(this.Identifier);
            key = { type: 'StringLiteral', value: value.name };
            shorthand = true;
          },
        },
      ]);

      return result;
    }
  );

  [NodeKind.PropertyName] = this.RULE<() => PropertyName>(
    NodeKind.PropertyName,
    () =>
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

  [NodeKind.LeftHandSideExpression] = this.RULE<() => LeftHandSideExpression>(
    NodeKind.LeftHandSideExpression,
    () => {
      let object = this.SUBRULE(this.PrimaryExpression);

      this.MANY(() => {
        this.OR([
          {
            ALT: () => {
              object = {
                type: NodeKind.MemberExpression,
                object,
                property: this.SUBRULE(this.BoxMemberExpression),
              };
            },
          },
          {
            ALT: () => {
              object = {
                type: NodeKind.MemberExpression,
                object,
                property: this.SUBRULE(this.DotMemberExpression),
              };
            },
          },
          {
            ALT: () => {
              object = {
                type: NodeKind.CallExpression,
                callee: object,
                arguments: this.SUBRULE(this.Arguments),
              };
            },
          },
        ]);
      });

      return object;
    }
  );

  [NodeKind.BoxMemberExpression] = this.RULE<() => BoxMemberExpression>(
    NodeKind.BoxMemberExpression,
    () => {
      this.CONSUME(t.OpenBracketToken);
      const expr = this.SUBRULE(this.Expression_In);
      this.CONSUME(t.CloseBracketToken);

      return expr;
    }
  );

  [NodeKind.DotMemberExpression] = this.RULE<() => DotMemberExpression>(
    NodeKind.DotMemberExpression,
    () => {
      this.CONSUME(t.DotToken);
      return this.SUBRULE(this.Identifier);
    }
  );

  [NodeKind.Arguments] = this.RULE<() => Arguments>(NodeKind.Arguments, () => {
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
                type: NodeKind.NamedArgument,
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

  [NodeKind.ParenthesizedExpression] = this.RULE<() => ParenthesizedExpression>(
    NodeKind.ParenthesizedExpression,
    () => {
      const result = this.SUBRULE(this.Expression);
      this.CONSUME(t.CloseParenToken);

      return result;
    }
  );

  [NodeKind.ArrowParameters] = this.RULE<() => ArrowParameters>(
    NodeKind.ArrowParameters,
    () => {
      const params = [];

      this.MANY_SEP({
        SEP: t.CommaToken,
        DEF: () => {
          params.push(this.SUBRULE(this.Identifier));
        },
      });

      this.CONSUME(t.CloseParenToken);

      return params;
    }
  );

  // Short version has only one param: v => v + 1
  [NodeKind.SingleParamArrowFunction] = this.RULE<
    () => SingleParamArrowFunction
  >(NodeKind.SingleParamArrowFunction, () => {
    const params = [this.SUBRULE(this.Identifier)];
    return this.SUBRULE(this.ArrowFunctionBody, { ARGS: [params] });
  });

  [NodeKind.ArrowFunctionBody] = this.RULE<() => ArrowFunctionBody>(
    NodeKind.ArrowFunctionBody,
    (params) => {
      this.CONSUME(t.EqualsGreaterToken);
      const body = this.SUBRULE(this.AssignmentExpression);

      return {
        type: NodeKind.ArrowFunction,
        body,
        params,
      };
    }
  );

  // Twig don't have increment and decrement operators
  [NodeKind.UpdateExpression] = this.RULE<() => UpdateExpression>(
    NodeKind.UpdateExpression,
    () => this.SUBRULE(this.LeftHandSideExpression)
  );

  [NodeKind.UnaryExpression] = this.RULE<() => UnaryExpression>(
    NodeKind.UnaryExpression,
    () =>
      this.OR([
        { ALT: () => this.SUBRULE(this.UpdateExpression) },
        {
          ALT: () => ({
            type: NodeKind.UnaryExpression,
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

  [NodeKind.ExponentiationExpression] = this.RULE<
    () => BinaryExpression
  >(NodeKind.ExponentiationExpression, () => {
    let left = this.SUBRULE(this.UnaryExpression);

    this.MANY(() => {
      left = {
        type: NodeKind.BinaryExpression,
        left,
        operator: this.CONSUME(t.AsteriskAsteriskToken).image,
        right: this.SUBRULE1(this.UnaryExpression),
      };
    });

    return left;
  });

  [NodeKind.AssociativityExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.AssociativityExpression,
    () => {
      let result = this.SUBRULE(this.ExponentiationExpression);

      this.MANY(() => {
        const operator = this.OR1([
          { ALT: () => this.CONSUME(t.IsNotToken).image },
          { ALT: () => this.CONSUME(t.IsToken).image },
        ]);

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.ExponentiationExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.MultiplicativeExpression] = this.RULE<
    () => BinaryExpression
  >(NodeKind.MultiplicativeExpression, () => {
    let result = this.SUBRULE(this.AssociativityExpression);

    this.MANY(() => {
      const operator = this.OR1([
        { ALT: () => this.CONSUME(t.AsteriskToken).image },
        { ALT: () => this.CONSUME(t.SlashSlashToken).image },
        { ALT: () => this.CONSUME(t.SlashToken).image },
        { ALT: () => this.CONSUME(t.PercentToken).image },
      ]);

      result = {
        type: NodeKind.BinaryExpression,
        left: result,
        operator,
        right: this.SUBRULE2(this.AssociativityExpression),
      };
    });

    return result;
  });

  [NodeKind.ConcatExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.ConcatExpression,
    () => {
      let result = this.SUBRULE(this.MultiplicativeExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.TildeToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.MultiplicativeExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.AdditiveExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.AdditiveExpression,
    () => {
      let result = this.SUBRULE(this.ConcatExpression);

      this.MANY(() => {
        const operator = this.OR1([
          { ALT: () => this.CONSUME(t.PlusToken).image },
          { ALT: () => this.CONSUME(t.MinusToken).image },
        ]);

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.ConcatExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.RangeExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.RangeExpression,
    () => {
      let result = this.SUBRULE(this.AdditiveExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.DotDotToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.AdditiveExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.RelationalExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.RelationalExpression,
    () => {
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
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.RangeExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.RelationalExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.RelationalExpression_In,
    () => {
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
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.UnaryExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.EqualityExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.EqualityExpression,
    () => {
      let result = this.SUBRULE(this.RelationalExpression);

      this.MANY(() => {
        const operator = this.OR1([
          { ALT: () => this.CONSUME(t.EqualEqualToken).image },
          { ALT: () => this.CONSUME(t.ExclamationEqualsToken).image },
          { ALT: () => this.CONSUME(t.SpaceshipToken).image },
        ]);

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.RelationalExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.EqualityExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.EqualityExpression_In,
    () => {
      let result = this.SUBRULE(this.RelationalExpression_In);

      this.MANY(() => {
        const operator = this.OR1([
          { ALT: () => this.CONSUME(t.EqualEqualToken).image },
          { ALT: () => this.CONSUME(t.ExclamationEqualsToken).image },
          { ALT: () => this.CONSUME(t.SpaceshipToken).image },
        ]);

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.RelationalExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.BitwiseANDExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.BitwiseANDExpression,
    () => {
      let result = this.SUBRULE(this.EqualityExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.BitwiseAndToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.EqualityExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.BitwiseANDExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.BitwiseANDExpression_In,
    () => {
      let result = this.SUBRULE(this.EqualityExpression_In);

      this.MANY(() => {
        const operator = this.CONSUME(t.BitwiseAndToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.EqualityExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.BitwiseXORExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.BitwiseXORExpression,
    () => {
      let result = this.SUBRULE(this.BitwiseANDExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.BitwiseXorToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.BitwiseANDExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.BitwiseXORExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.BitwiseXORExpression_In,
    () => {
      let result = this.SUBRULE(this.BitwiseANDExpression_In);

      this.MANY(() => {
        const operator = this.CONSUME(t.BitwiseXorToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.BitwiseANDExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.BitwiseORExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.BitwiseORExpression,
    () => {
      let result = this.SUBRULE(this.BitwiseXORExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.BitwiseOrToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.BitwiseXORExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.BitwiseORExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.BitwiseORExpression_In,
    () => {
      let result = this.SUBRULE(this.BitwiseXORExpression_In);

      this.MANY(() => {
        const operator = this.CONSUME(t.BitwiseOrToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.BitwiseXORExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.LogicalANDExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.LogicalANDExpression,
    () => {
      let result = this.SUBRULE(this.BitwiseORExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.AndToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.BitwiseORExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.LogicalANDExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.LogicalANDExpression_In,
    () => {
      let result = this.SUBRULE(this.BitwiseORExpression_In);

      this.MANY(() => {
        const operator = this.CONSUME(t.AndToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.BitwiseORExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.LogicalORExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.LogicalORExpression,
    () => {
      let result = this.SUBRULE(this.LogicalANDExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.OrToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.LogicalANDExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.LogicalORExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.LogicalORExpression_In,
    () => {
      let result = this.SUBRULE(this.LogicalANDExpression_In);

      this.MANY(() => {
        const operator = this.CONSUME(t.OrToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE2(this.LogicalANDExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.CoalesceExpression] = this.RULE<() => BinaryExpression>(
    NodeKind.CoalesceExpression,
    () => {
      let result = this.SUBRULE(this.LogicalORExpression);

      this.MANY(() => {
        const operator = this.CONSUME(t.QuestionQuestionToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE1(this.LogicalORExpression),
        };
      });

      return result;
    }
  );

  [NodeKind.CoalesceExpression_In] = this.RULE<() => BinaryExpression>(
    NodeKind.CoalesceExpression_In,
    () => {
      let result = this.SUBRULE(this.LogicalORExpression_In);

      this.MANY(() => {
        const operator = this.CONSUME(t.QuestionQuestionToken).image;

        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator,
          right: this.SUBRULE1(this.LogicalORExpression_In),
        };
      });

      return result;
    }
  );

  [NodeKind.ConditionalExpression] = this.RULE<() => ConditionalExpression>(
    NodeKind.ConditionalExpression,
    () => {
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
          type: NodeKind.ConditionalExpression,
          test: result,
          consequent,
          alternate,
        };
      });

      return result;
    }
  );

  [NodeKind.ConditionalExpression_In] = this.RULE<
    () => ConditionalExpression_In
  >(NodeKind.ConditionalExpression_In, () => {
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
        type: NodeKind.ConditionalExpression,
        test: result,
        consequent,
        alternate,
      };
    });

    return result;
  });

  [NodeKind.AssignmentExpression] = this.RULE<() => AssignmentExpression>(
    NodeKind.AssignmentExpression,
    () =>
      this.OR({
        MAX_LOOKAHEAD: 4,
        DEF: [
          // { ALT: () => this.SUBRULE(this.ArrowFunction) },
          { ALT: () => this.SUBRULE(this.ConditionalExpression) },
          // {
          //   ALT: () => ({
          //     type: NodeKind.AssignmentExpression,
          //     left: this.SUBRULE(this.LeftHandSideExpression),
          //     operator: this.CONSUME(t.EqualsToken).image,
          //     right: this.SUBRULE(this.AssignmentExpression),
          //   }),
          // },
        ],
      })
  );

  [NodeKind.AssignmentExpression_In] = this.RULE<() => AssignmentExpression_In>(
    NodeKind.AssignmentExpression_In,
    () =>
      this.OR({
        MAX_LOOKAHEAD: 4,
        DEF: [
          // { ALT: () => this.SUBRULE(this.ArrowFunction_In) },
          { ALT: () => this.SUBRULE(this.ConditionalExpression_In) },
          // {
          //   ALT: () => ({
          //     type: NodeKind.AssignmentExpression,
          //     left: this.SUBRULE(this.LeftHandSideExpression),
          //     operator: this.CONSUME(t.EqualsToken).image,
          //     right: this.SUBRULE(this.AssignmentExpression_In),
          //   }),
          // },
        ],
      })
  );

  [NodeKind.FilterExpression] = this.RULE<() => FilterExpression>(
    NodeKind.FilterExpression,
    () => {
      let expression = this.SUBRULE(this.AssignmentExpression);

      this.MANY(() => {
        this.CONSUME(t.BarToken);
        const filter = this.SUBRULE(this.Filter);

        expression = {
          type: NodeKind.FilterExpression,
          expression,
          filter,
        };
      });

      return expression;
    }
  );

  [NodeKind.FilterExpression_In] = this.RULE<() => FilterExpression>(
    NodeKind.FilterExpression_In,
    () => {
      let expression = this.SUBRULE(this.AssignmentExpression_In);

      this.MANY(() => {
        this.CONSUME(t.BarToken);
        const filter = this.SUBRULE(this.Filter);

        expression = {
          type: NodeKind.FilterExpression,
          expression,
          filter,
        };
      });

      return expression;
    }
  );

  [NodeKind.Filter] = this.RULE<() => Filter>(NodeKind.Filter, () => {
    let result = this.SUBRULE(this.Identifier);

    this.OPTION(() => {
      const args = this.SUBRULE(this.Arguments);

      result = {
        type: NodeKind.CallExpression,
        callee: result,
        arguments: args,
      };
    });

    return result;
  });

  [NodeKind.CallExpression] = this.RULE<() => CallExpression>(
    NodeKind.CallExpression,
    () => {
      return {
        type: NodeKind.CallExpression,
        callee: this.SUBRULE(this.Identifier),
        arguments: this.SUBRULE(this.Arguments),
      };
    }
  );

  [NodeKind.Expression] = this.RULE<() => Expression>(
    NodeKind.Expression,
    () => {
      return this.SUBRULE(this.FilterExpression);
    }
  );

  [NodeKind.Expression_In] = this.RULE<() => Expression_In>(
    NodeKind.Expression_In,
    () => {
      return this.SUBRULE(this.FilterExpression_In);
    }
  );

  [NodeKind.ExpressionList] = this.RULE<() => ExpressionList>(
    NodeKind.ExpressionList,
    () => {
      const arr = [];

      this.MANY_SEP({
        SEP: t.CommaToken,
        DEF: () => {
          arr.push(this.SUBRULE(this.Expression));
        },
      });

      return arr;
    }
  );

  // TODO: Is it used?
  [NodeKind.ExpressionList_In] = this.RULE<() => ExpressionList_In>(
    NodeKind.ExpressionList_In,
    () => {
      const arr = [];

      this.MANY_SEP({
        SEP: t.CommaToken,
        DEF: () => {
          arr.push(this.SUBRULE(this.Expression_In));
        },
      });

      return arr;
    }
  );

  [NodeKind.Text] = this.RULE<() => Text>(NodeKind.Text, () => {
    return {
      type: NodeKind.Text,
      value: this.CONSUME(t.TextToken).image,
    };
  });

  [NodeKind.Comment] = this.RULE<() => Comment>(NodeKind.Comment, () => {
    let value = null;

    this.CONSUME(t.LCommentToken);
    this.OPTION(() => {
      value = this.CONSUME(t.CommentToken).image;
    });
    this.CONSUME(t.RCommentToken);

    return {
      type: NodeKind.Comment,
      value,
    };
  });

  [NodeKind.VariableStatement] = this.RULE<() => VariableStatement>(
    NodeKind.VariableStatement,
    () => {
      this.CONSUME(t.LVariableToken);
      const value = this.SUBRULE(this.Expression);
      this.CONSUME(t.RVariableToken);

      return {
        type: NodeKind.VariableStatement,
        value,
      };
    }
  );

  [NodeKind.VariableDeclaration] = this.RULE<() => VariableDeclaration>(
    NodeKind.VariableDeclaration,
    () => {
      return this.SUBRULE(this.Identifier);
    }
  );

  [NodeKind.VariableDeclarationList] = this.RULE<() => VariableDeclarationList>(
    NodeKind.VariableDeclarationList,
    () => {
      const arr = [this.SUBRULE(this.VariableDeclaration)];

      this.MANY(() => {
        this.CONSUME(t.CommaToken);
        arr.push(this.SUBRULE2(this.VariableDeclaration));
      });

      return arr;
    }
  );

  [NodeKind.SetInlineStatement] = this.RULE<() => SetInlineStatement>(
    NodeKind.SetInlineStatement,
    () => {
      this.CONSUME(t.SetToken);

      const variables = this.SUBRULE(this.VariableDeclarationList);

      this.CONSUME(t.EqualsToken);

      const values = this.SUBRULE(this.ExpressionList);

      const declarations = [];

      for (let i = 0; i < variables.length; i++) {
        declarations.push({
          type: NodeKind.VariableDeclaration,
          name: variables[i],
          init: values[i],
        });
      }

      return {
        type: NodeKind.SetStatement,
        declarations,
      };
    }
  );

  [NodeKind.SetBlockStatement] = this.RULE<() => SetBlockStatement>(
    NodeKind.SetBlockStatement,
    () => {
      this.CONSUME(t.SetToken);
      const name = this.SUBRULE(this.Identifier);
      this.CONSUME(t.RBlockToken);

      const init = this.SUBRULE1(this.Text);

      this.CONSUME1(t.LBlockToken);
      this.CONSUME1(t.EndSetToken);

      return {
        type: NodeKind.SetStatement,
        declarations: [
          {
            type: NodeKind.VariableDeclaration,
            name,
            init,
          },
        ],
      };
    }
  );

  [NodeKind.ApplyStatement] = this.RULE<() => ApplyStatement>(
    NodeKind.ApplyStatement,
    () => {
      this.CONSUME(t.ApplyToken);

      let filter = this.SUBRULE(this.Filter);

      this.MANY(() => {
        this.CONSUME(t.BarToken);
        const nextFilter = this.SUBRULE1(this.Filter);

        filter = {
          type: NodeKind.FilterExpression,

          expression: filter,
          filter: nextFilter,
        };
      });

      this.CONSUME(t.RBlockToken);

      const text = this.SUBRULE(this.Text);

      this.CONSUME1(t.LBlockToken);
      this.CONSUME1(t.EndApplyToken);

      return {
        type: NodeKind.ApplyStatement,
        text,
        filter,
      };
    }
  );

  [NodeKind.ForInStatement] = this.RULE<() => ForInStatement>(
    NodeKind.ForInStatement,
    () => {
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
        type: NodeKind.ForInStatement,
        body,
        variables,
        expression,
        alternate,
      };
    }
  );

  [NodeKind.IfStatement] = this.RULE<() => IfStatement>(
    NodeKind.IfStatement,
    () => {
      let result = {
        type: NodeKind.IfStatement,
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
          type: NodeKind.IfStatement,
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
    }
  );

  [NodeKind.AutoescapeStatement] = this.RULE<() => AutoescapeStatement>(
    NodeKind.AutoescapeStatement,
    () => {
      const result = {
        type: NodeKind.AutoescapeStatement,
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
    }
  );

  [NodeKind.CacheStatement] = this.RULE<() => CacheStatement>(
    NodeKind.CacheStatement,
    () => {
      const result = {
        type: NodeKind.CacheStatement,
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
    }
  );

  [NodeKind.DeprecatedStatement] = this.RULE<() => DeprecatedStatement>(
    NodeKind.DeprecatedStatement,
    () => {
      const result = {
        type: NodeKind.DeprecatedStatement,
        expr: null,
      };

      this.CONSUME(t.DeprecatedToken);
      result.expr = this.SUBRULE(this.Expression);

      return result;
    }
  );

  [NodeKind.DoStatement] = this.RULE<() => DoStatement>(
    NodeKind.DoStatement,
    () => {
      this.CONSUME(t.DoToken);

      return {
        type: NodeKind.DoStatement,
        expr: this.SUBRULE(this.Expression),
      };
    }
  );

  [NodeKind.FlushStatement] = this.RULE<() => FlushStatement>(
    NodeKind.FlushStatement,
    () => {
      this.CONSUME(t.FlushToken);

      return { type: 'FlushStatement' };
    }
  );

  [NodeKind.BlockInlineStatement] = this.RULE<() => BlockInlineStatement>(
    NodeKind.BlockInlineStatement,
    () => {
      const result = {
        type: NodeKind.BlockStatement,
        name: null,
        body: [],
        shortcut: true,
      };

      this.CONSUME(t.BlockToken);
      result.name = this.SUBRULE(this.Identifier);
      result.body.push(this.SUBRULE(this.Expression));

      return result;
    }
  );

  [NodeKind.BlockStatement] = this.RULE<() => BlockStatement>(
    NodeKind.BlockStatement,
    () => {
      const result = {
        type: NodeKind.BlockStatement,
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
    }
  );

  [NodeKind.ExtendsStatement] = this.RULE<() => ExtendsStatement>(
    NodeKind.ExtendsStatement,
    () => {
      this.CONSUME(t.ExtendsToken);

      return {
        type: NodeKind.ExtendsStatement,
        expr: this.SUBRULE(this.Expression),
      };
    }
  );

  [NodeKind.WithStatement] = this.RULE<() => WithStatement>(
    NodeKind.WithStatement,
    () => {
      const result = {
        type: NodeKind.WithStatement,
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
    }
  );

  [NodeKind.AsOperator] = this.RULE<() => BinaryExpression>(
    NodeKind.AsOperator,
    () => {
      const result = {
        type: NodeKind.BinaryExpression,
        operator: 'as',
        left: null,
        right: null,
      };

      result.left = this.SUBRULE(this.Identifier);
      this.CONSUME(t.AsToken);
      result.right = this.SUBRULE1(this.Identifier);

      return result;
    }
  );

  [NodeKind.UseStatement] = this.RULE<() => UseStatement>(
    NodeKind.UseStatement,
    () => {
      const result = {
        type: NodeKind.UseStatement,
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
    }
  );

  [NodeKind.SandboxStatement] = this.RULE<() => SandboxStatement>(
    NodeKind.SandboxStatement,
    () => {
      const result = {
        type: NodeKind.SandboxStatement,
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
    }
  );

  [NodeKind.IncludeStatement] = this.RULE<() => IncludeStatement>(
    NodeKind.IncludeStatement,
    () => {
      const result = {
        type: NodeKind.IncludeStatement,
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
    }
  );

  [NodeKind.MacroStatement] = this.RULE<() => MacroStatement>(
    NodeKind.MacroStatement,
    () => {
      const result = {
        type: NodeKind.MacroStatement,
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
    }
  );

  [NodeKind.ImportStatement] = this.RULE<() => ImportStatement>(
    NodeKind.ImportStatement,
    () => {
      const result = {
        type: NodeKind.ImportStatement,
        expr: null,
        name: null,
      };

      this.CONSUME(t.ImportToken);

      result.expr = this.SUBRULE(this.Expression);

      this.CONSUME(t.AsToken);

      result.name = this.SUBRULE(this.Identifier);

      return result;
    }
  );

  [NodeKind.FromStatement] = this.RULE<() => FromStatement>(
    NodeKind.FromStatement,
    () => {
      const result = {
        type: NodeKind.FromStatement,
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
    }
  );

  [NodeKind.EmbedStatement] = this.RULE<() => EmbedStatement>(
    NodeKind.EmbedStatement,
    () => {
      const result = {
        type: NodeKind.EmbedStatement,
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
    }
  );

  [NodeKind.VerbatimStatement] = this.RULE<() => VerbatimStatement>(
    NodeKind.VerbatimStatement,
    () => {
      const result = {
        type: NodeKind.EmbedStatement,
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
    }
  );

  [NodeKind.FormThemeStatement] = this.RULE<() => FormThemeStatement>(
    NodeKind.FormThemeStatement,
    () => {
      const result = {
        type: NodeKind.FormThemeStatement,
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
    }
  );

  [NodeKind.TransStatement] = this.RULE<() => TransStatement>(
    NodeKind.TransStatement,
    () => {
      const result = {
        type: NodeKind.TransStatement,
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
    }
  );

  [NodeKind.TransDefaultDomainStatement] = this.RULE<
    () => TransDefaultDomainStatement
  >(NodeKind.TransDefaultDomainStatement, () => {
    const result = {
      type: NodeKind.TransDefaultDomainStatement,
      domain: null,
    };

    this.CONSUME(t.TransDefaultDomainToken);

    result.domain = this.SUBRULE1(this.Expression);

    return result;
  });

  [NodeKind.StopwatchStatement] = this.RULE<() => StopwatchStatement>(
    NodeKind.StopwatchStatement,
    () => {
      const result = {
        type: NodeKind.StopwatchStatement,
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
    }
  );

  [NodeKind.Statement] = this.RULE<() => Statement>(NodeKind.Statement, () => {
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

  [NodeKind.SourceElement] = this.RULE<() => SourceElement>(
    NodeKind.SourceElement,
    () => {
      return this.OR([
        { ALT: () => this.SUBRULE(this.Text) },
        { ALT: () => this.SUBRULE(this.Comment) },
        { ALT: () => this.SUBRULE(this.VariableStatement) },
        { ALT: () => this.SUBRULE(this.Statement) },
      ]);
    }
  );

  [NodeKind.SourceElementList] = this.RULE<() => SourceElementList>(
    NodeKind.SourceElementList,
    () => {
      let body = [];

      this.MANY(() => {
        body.push(this.SUBRULE(this.SourceElement));
      });

      return body;
    }
  );

  [NodeKind.Template] = this.RULE<() => Template>(NodeKind.Template, () => {
    return {
      type: NodeKind.Template,
      body: this.SUBRULE(this.SourceElementList),
    };
  });
}
