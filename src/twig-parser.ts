import { EmbeddedActionsParser } from 'chevrotain';
import { tokens as t } from './lexer.js';
import {
  ApplyStatement,
  Arguments,
  ArrayLiteral,
  ArrowParameters,
  AsOperator,
  AssignmentExpression,
  AssignmentExpression_In,
  AutoescapeStatement,
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
  Property,
  PropertyName,
  SandboxStatement,
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
  UseStatement,
  VariableDeclarationList,
  VariableStatement,
  VerbatimStatement,
  WithStatement,
  ArrowFunction,
  CoalesceExpression,
  RelationalExpression_In,
  EqualityExpression_In,
  CoalesceExpression_In,
  ExponentiationExpression,
  AssociativityExpression,
  AdditiveExpression,
  BitwiseANDExpression,
  BitwiseANDExpression_In,
  BitwiseORExpression,
  BitwiseORExpression_In,
  BitwiseXORExpression,
  BitwiseXORExpression_In,
  ConcatExpression,
  EqualityExpression,
  LogicalANDExpression,
  LogicalANDExpression_In,
  LogicalORExpression,
  LogicalORExpression_In,
  MultiplicativeExpression,
  RangeExpression,
  RelationalExpression,
  SetStatement,
  InterpolationExpression,
} from './types.js';

export class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(t);
    this.performSelfAnalysis();
  }

  Identifier = this.RULE<() => Identifier>(NodeKind.Identifier, () => ({
    type: NodeKind.Identifier,
    name: this.OR([
      { ALT: () => this.CONSUME(t.DivisibleByToken).image },
      { ALT: () => this.CONSUME(t.SameAsToken).image },
      { ALT: () => this.CONSUME(t.IdentifierToken).image },
    ]),
  }));

  Literal = this.RULE<() => Literal>(NodeKind.Literal, () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.NullLiteral) },
      { ALT: () => this.SUBRULE(this.BooleanLiteral) },
      { ALT: () => this.SUBRULE(this.NumericLiteral) },
      { ALT: () => this.SUBRULE(this.StringLiteral) },
    ])
  );

  NumericLiteral = this.RULE<() => NumericLiteral>(
    NodeKind.NumericLiteral,
    () => ({
      type: NodeKind.NumericLiteral,
      value: Number(this.CONSUME(t.NumberToken).image),
    })
  );

  StringLiteral = this.RULE<() => StringLiteral>(
    NodeKind.StringLiteral,
    () => ({
      type: NodeKind.StringLiteral,
      value: this.CONSUME(t.StringToken).image.slice(1, -1),
    })
  );

  BooleanLiteral = this.RULE<() => BooleanLiteral>(
    NodeKind.BooleanLiteral,
    () => ({
      type: NodeKind.BooleanLiteral,
      value: this.CONSUME(t.BooleanToken).image.toLowerCase() === 'true',
    })
  );

  NullLiteral = this.RULE<() => NullLiteral>(NodeKind.NullLiteral, () => {
    this.CONSUME(t.NullToken);

    return {
      type: NodeKind.NullLiteral,
      value: null,
    };
  });

  StringInterpolation = this.RULE<() => StringInterpolation>(
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
              this.CONSUME(t.StringInterpolationOpenStatementToken);

              const result: InterpolationExpression = {
                type: NodeKind.InterpolationExpression,
                expr: this.SUBRULE(this.Expression),
              };

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

  PrimaryExpression = this.RULE<() => PrimaryExpression>(
    NodeKind.PrimaryExpression,
    () =>
      this.OR([
        {
          ALT: () => {
            this.CONSUME(t.OpenParenToken);

            return this.OR1([
              {
                ALT: () => this.SUBRULE(this.ArrowFunction),
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

  ArrayLiteral = this.RULE<() => ArrayLiteral>(NodeKind.ArrayLiteral, () => {
    const elements: AssignmentExpression_In[] = [];

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
  });

  ObjectLiteral = this.RULE<() => ObjectLiteral>(NodeKind.ObjectLiteral, () => {
    const properties: Property[] = [];

    this.CONSUME(t.OpenBraceToken);
    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        properties.push(this.SUBRULE(this.Property));
      },
    });
    this.CONSUME(t.CloseBraceToken);

    return {
      type: NodeKind.ObjectLiteral,
      properties,
    };
  });

  Property = this.RULE<() => Property>(NodeKind.Property, () => {
    return this.OR([
      {
        ALT: () => {
          const key = this.SUBRULE(this.PropertyName);
          this.CONSUME(t.ColonToken);
          const value = this.SUBRULE(this.AssignmentExpression_In);

          return {
            type: NodeKind.Property,
            value,
            key,
            shorthand: false,
          };
        },
      },
      {
        ALT: () => {
          const value = this.SUBRULE(this.Identifier);

          return {
            type: NodeKind.Property,
            value,
            key: { type: 'StringLiteral', value: value.name },
            shorthand: true,
          };
        },
      },
    ]);
  });

  PropertyName = this.RULE<() => PropertyName>(NodeKind.PropertyName, () =>
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

  LeftHandSideExpression = this.RULE<() => LeftHandSideExpression>(
    NodeKind.LeftHandSideExpression,
    () => {
      let object: LeftHandSideExpression = <PrimaryExpression>(
        this.SUBRULE(this.PrimaryExpression)
      );

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

  BoxMemberExpression = this.RULE<() => BoxMemberExpression>(
    NodeKind.BoxMemberExpression,
    () => {
      this.CONSUME(t.OpenBracketToken);
      const expr = this.SUBRULE(this.Expression_In);
      this.CONSUME(t.CloseBracketToken);

      return expr;
    }
  );

  DotMemberExpression = this.RULE<() => DotMemberExpression>(
    NodeKind.DotMemberExpression,
    () => {
      this.CONSUME(t.DotToken);
      return this.SUBRULE(this.Identifier);
    }
  );

  Arguments = this.RULE<() => Arguments>(NodeKind.Arguments, () => {
    const args: Arguments = [];

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

  ParenthesizedExpression = this.RULE<() => ParenthesizedExpression>(
    NodeKind.ParenthesizedExpression,
    () => {
      const expr = this.SUBRULE(this.Expression);
      this.CONSUME(t.CloseParenToken);

      return {
        type: NodeKind.ParenthesizedExpression,
        expr: expr,
      };
    }
  );

  ArrowParameters = this.RULE<() => ArrowParameters>(
    NodeKind.ArrowParameters,
    () => {
      const params: Identifier[] = [];

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

  // v => v + 1
  SingleParamArrowFunction = this.RULE<() => ArrowFunction>(
    NodeKind.SingleParamArrowFunction,
    () => {
      const params = [this.SUBRULE(this.Identifier)];
      this.CONSUME(t.EqualsGreaterToken);

      return {
        type: NodeKind.ArrowFunction,
        body: this.SUBRULE(this.AssignmentExpression),
        params,
      };
    }
  );

  ArrowFunction = this.RULE<() => ArrowFunction>(NodeKind.ArrowFunction, () => {
    const params = this.SUBRULE(this.ArrowParameters);
    this.CONSUME(t.EqualsGreaterToken);
    const body: AssignmentExpression = this.SUBRULE(this.AssignmentExpression);

    return {
      type: NodeKind.ArrowFunction,
      body,
      params,
    };
  });

  // TODO: fix `any` return type
  // @ts-ignore
  UnaryExpression = this.RULE<() => UnaryExpression>(
    NodeKind.UnaryExpression,
    () =>
      this.OR([
        { ALT: () => this.SUBRULE(this.LeftHandSideExpression) },
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

  ExponentiationExpression = this.RULE<() => ExponentiationExpression>(
    NodeKind.ExponentiationExpression,
    () => {
      let result: ExponentiationExpression = this.SUBRULE(this.UnaryExpression);

      this.MANY(() => {
        result = {
          type: NodeKind.BinaryExpression,
          left: result,
          operator: this.CONSUME(t.AsteriskAsteriskToken).image,
          right: this.SUBRULE1(this.UnaryExpression),
        };
      });

      return result;
    }
  );

  AssociativityExpression = this.RULE<() => AssociativityExpression>(
    NodeKind.AssociativityExpression,
    () => {
      let result: AssociativityExpression = this.SUBRULE(
        this.ExponentiationExpression
      );

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

  MultiplicativeExpression = this.RULE<() => MultiplicativeExpression>(
    NodeKind.MultiplicativeExpression,
    () => {
      let result: MultiplicativeExpression = this.SUBRULE(
        this.AssociativityExpression
      );

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
    }
  );

  ConcatExpression = this.RULE<() => ConcatExpression>(
    NodeKind.ConcatExpression,
    () => {
      let result: ConcatExpression = this.SUBRULE(
        this.MultiplicativeExpression
      );

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

  AdditiveExpression = this.RULE<() => AdditiveExpression>(
    NodeKind.AdditiveExpression,
    () => {
      let result: AdditiveExpression = this.SUBRULE(this.ConcatExpression);

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

  RangeExpression = this.RULE<() => RangeExpression>(
    NodeKind.RangeExpression,
    () => {
      let result: RangeExpression = this.SUBRULE(this.AdditiveExpression);

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

  RelationalExpression = this.RULE<() => RelationalExpression>(
    NodeKind.RelationalExpression,
    () => {
      let result: RelationalExpression = this.SUBRULE(this.RangeExpression);

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

  RelationalExpression_In = this.RULE<() => RelationalExpression>(
    NodeKind.RelationalExpression_In,
    () => {
      let result: RelationalExpression = this.SUBRULE(this.RangeExpression);

      this.MANY(() => {
        const operator = this.OR([
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
          right: this.SUBRULE1(this.RangeExpression),
        };
      });

      return result;
    }
  );

  EqualityExpression = this.RULE<() => EqualityExpression>(
    NodeKind.EqualityExpression,
    () => {
      let result: EqualityExpression = this.SUBRULE(this.RelationalExpression);

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

  EqualityExpression_In = this.RULE<() => EqualityExpression_In>(
    NodeKind.EqualityExpression_In,
    () => {
      let result: EqualityExpression_In = this.SUBRULE(
        this.RelationalExpression_In
      );

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

  BitwiseANDExpression = this.RULE<() => BitwiseANDExpression>(
    NodeKind.BitwiseANDExpression,
    () => {
      let result: BitwiseANDExpression = this.SUBRULE(this.EqualityExpression);

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

  BitwiseANDExpression_In = this.RULE<() => BitwiseANDExpression_In>(
    NodeKind.BitwiseANDExpression_In,
    () => {
      let result: BitwiseANDExpression_In = this.SUBRULE(
        this.EqualityExpression_In
      );

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

  BitwiseXORExpression = this.RULE<() => BitwiseXORExpression>(
    NodeKind.BitwiseXORExpression,
    () => {
      let result: BitwiseXORExpression = this.SUBRULE(
        this.BitwiseANDExpression
      );

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

  BitwiseXORExpression_In = this.RULE<() => BitwiseXORExpression_In>(
    NodeKind.BitwiseXORExpression_In,
    () => {
      let result: BitwiseXORExpression_In = this.SUBRULE(
        this.BitwiseANDExpression_In
      );

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

  BitwiseORExpression = this.RULE<() => BitwiseORExpression>(
    NodeKind.BitwiseORExpression,
    () => {
      let result: BitwiseORExpression = this.SUBRULE(this.BitwiseXORExpression);

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

  BitwiseORExpression_In = this.RULE<() => BitwiseORExpression_In>(
    NodeKind.BitwiseORExpression_In,
    () => {
      let result: BitwiseORExpression_In = this.SUBRULE(
        this.BitwiseXORExpression_In
      );

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

  LogicalANDExpression = this.RULE<() => LogicalANDExpression>(
    NodeKind.LogicalANDExpression,
    () => {
      let result: LogicalANDExpression = this.SUBRULE(this.BitwiseORExpression);

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

  LogicalANDExpression_In = this.RULE<() => LogicalANDExpression_In>(
    NodeKind.LogicalANDExpression_In,
    () => {
      let result: LogicalANDExpression_In = this.SUBRULE(
        this.BitwiseORExpression_In
      );

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

  LogicalORExpression = this.RULE<() => LogicalORExpression>(
    NodeKind.LogicalORExpression,
    () => {
      let result: LogicalORExpression = this.SUBRULE(this.LogicalANDExpression);

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

  LogicalORExpression_In = this.RULE<() => LogicalORExpression_In>(
    NodeKind.LogicalORExpression_In,
    () => {
      let result: LogicalORExpression_In = this.SUBRULE(
        this.LogicalANDExpression_In
      );

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

  // TODO: Should I replace LogicalORExpression to BitwiseORExpression?
  CoalesceExpression = this.RULE<() => CoalesceExpression>(
    NodeKind.CoalesceExpression,
    () => {
      let result: CoalesceExpression = this.SUBRULE(this.LogicalORExpression);

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

  CoalesceExpression_In = this.RULE<() => CoalesceExpression_In>(
    NodeKind.CoalesceExpression_In,
    () => {
      let result: CoalesceExpression_In = this.SUBRULE(
        this.LogicalORExpression_In
      );

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

  ConditionalExpression = this.RULE<() => ConditionalExpression>(
    NodeKind.ConditionalExpression,
    () => {
      let result: ConditionalExpression = this.SUBRULE(this.CoalesceExpression);

      this.OPTION(() => {
        this.CONSUME(t.QuestionToken);
        let consequent = result;
        this.OPTION1(() => {
          consequent = this.SUBRULE1(this.AssignmentExpression_In);
        });
        this.CONSUME(t.ColonToken);
        const alternate: AssignmentExpression = this.SUBRULE2(
          this.AssignmentExpression
        );

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

  ConditionalExpression_In = this.RULE<() => ConditionalExpression_In>(
    NodeKind.ConditionalExpression_In,
    () => {
      let result: ConditionalExpression_In = this.SUBRULE(
        this.CoalesceExpression_In
      );

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
          // @ts-ignore
          test: result,
          consequent,
          alternate,
        };
      });

      return result;
    }
  );

  AssignmentExpression = this.RULE<() => AssignmentExpression>(
    NodeKind.AssignmentExpression,
    () => this.SUBRULE(this.ConditionalExpression)
  );

  AssignmentExpression_In = this.RULE<() => AssignmentExpression_In>(
    NodeKind.AssignmentExpression_In,
    () => this.SUBRULE(this.ConditionalExpression_In)
  );

  FilterExpression = this.RULE<() => FilterExpression>(
    NodeKind.FilterExpression,
    () => {
      let expression: FilterExpression = this.SUBRULE(
        this.AssignmentExpression
      );

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

  FilterExpression_In = this.RULE<() => FilterExpression_In>(
    NodeKind.FilterExpression_In,
    () => {
      let expression: FilterExpression_In = this.SUBRULE(
        this.AssignmentExpression_In
      );

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

  Filter = this.RULE<() => Filter>(NodeKind.Filter, () => {
    let identifier = this.SUBRULE(this.Identifier);
    let callExpression: CallExpression | null = null;

    this.OPTION(() => {
      const args = this.SUBRULE(this.Arguments);

      callExpression = {
        type: NodeKind.CallExpression,
        callee: identifier,
        arguments: args,
      };
    });

    return callExpression ?? identifier;
  });

  CallExpression = this.RULE<() => CallExpression>(
    NodeKind.CallExpression,
    () => ({
      type: NodeKind.CallExpression,
      callee: this.SUBRULE(this.Identifier),
      arguments: this.SUBRULE(this.Arguments),
    })
  );

  Expression = this.RULE<() => Expression>(NodeKind.Expression, () =>
    this.SUBRULE(this.FilterExpression)
  );

  Expression_In = this.RULE<() => Expression_In>(NodeKind.Expression_In, () => {
    return this.SUBRULE(this.FilterExpression_In);
  });

  ExpressionList = this.RULE<() => ExpressionList>(
    NodeKind.ExpressionList,
    () => {
      const arr: ExpressionList = [];

      this.MANY_SEP({
        SEP: t.CommaToken,
        DEF: () => {
          arr.push(this.SUBRULE(this.Expression));
        },
      });

      return arr;
    }
  );

  Text = this.RULE<() => Text>(NodeKind.Text, () => {
    return {
      type: NodeKind.Text,
      value: this.CONSUME(t.TextToken).image,
    };
  });

  Comment = this.RULE<() => Comment>(NodeKind.Comment, () => {
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

  VariableStatement = this.RULE<() => VariableStatement>(
    NodeKind.VariableStatement,
    () => {
      this.CONSUME(t.LVariableToken);
      const value: Expression = this.SUBRULE(this.Expression);
      this.CONSUME(t.RVariableToken);

      return {
        type: NodeKind.VariableStatement,
        value,
      };
    }
  );

  VariableDeclarationList = this.RULE<() => VariableDeclarationList>(
    NodeKind.VariableDeclarationList,
    () => {
      const arr = [this.SUBRULE(this.Identifier)];

      this.MANY(() => {
        this.CONSUME(t.CommaToken);
        arr.push(this.SUBRULE2(this.Identifier));
      });

      return arr;
    }
  );

  SetStatement = this.RULE<() => SetStatement>(NodeKind.SetStatement, () => {
    this.CONSUME(t.SetToken);

    const result: SetStatement = {
      type: NodeKind.SetStatement,
      declarations: [],
    };

    this.OR([
      {
        ALT: () => {
          const name = this.SUBRULE(this.Identifier);
          this.CONSUME(t.RBlockToken);

          const init = this.SUBRULE1(this.Text);

          this.CONSUME1(t.LBlockToken);
          this.CONSUME1(t.EndSetToken);

          result.declarations.push({
            type: NodeKind.VariableDeclaration,
            name,
            init,
          });
        },
      },
      {
        ALT: () => {
          const variables = this.SUBRULE(this.VariableDeclarationList);
          this.CONSUME(t.EqualsToken);
          const values = this.SUBRULE(this.ExpressionList);

          for (let i = 0; i < variables.length; i++) {
            result.declarations.push({
              type: NodeKind.VariableDeclaration,
              name: variables[i],
              init: values[i],
            });
          }
        },
      },
    ]);

    return result;
  });

  ApplyStatement = this.RULE<() => ApplyStatement>(
    NodeKind.ApplyStatement,
    () => {
      this.CONSUME(t.ApplyToken);

      let filter: Filter | FilterExpression = this.SUBRULE(this.Filter);

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

  ForInStatement = this.RULE<() => ForInStatement>(
    NodeKind.ForInStatement,
    () => {
      this.CONSUME(t.ForToken);

      const variables = this.SUBRULE(this.VariableDeclarationList);

      this.CONSUME(t.InToken);

      const result: ForInStatement = {
        type: NodeKind.ForInStatement,
        body: [],
        variables,
        expression: this.SUBRULE(this.Expression),
        alternate: null,
      };

      this.CONSUME(t.RBlockToken);

      this.MANY(() => {
        result.body.push(this.SUBRULE(this.SourceElement));
      });

      this.OPTION(() => {
        this.CONSUME1(t.LBlockToken);
        this.CONSUME(t.ElseToken);
        this.CONSUME1(t.RBlockToken);
        result.alternate = this.SUBRULE2(this.SourceElement);
      });

      this.CONSUME2(t.LBlockToken);
      this.CONSUME2(t.EndForToken);

      return result;
    }
  );

  IfStatement = this.RULE<() => IfStatement>(NodeKind.IfStatement, () => {
    this.CONSUME(t.IfToken);

    let result: IfStatement = {
      type: NodeKind.IfStatement,
      test: this.SUBRULE(this.Expression),
      consequent: [],
      alternate: null,
    };

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
        if (Array.isArray(elseIfStatement.alternate)) {
          elseIfStatement.alternate.push(this.SUBRULE4(this.SourceElement));
        }
      });
    });

    this.CONSUME5(t.LBlockToken);
    this.CONSUME5(t.EndIfToken);

    return result;
  });

  AutoescapeStatement = this.RULE<() => AutoescapeStatement>(
    NodeKind.AutoescapeStatement,
    () => {
      this.CONSUME(t.AutoescapeToken);

      const result: AutoescapeStatement = {
        type: NodeKind.AutoescapeStatement,
        value: [],
        strategy: null,
      };

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

  CacheStatement = this.RULE<() => CacheStatement>(
    NodeKind.CacheStatement,
    () => {
      this.CONSUME(t.CacheToken);

      const result: CacheStatement = {
        type: NodeKind.CacheStatement,
        key: this.SUBRULE(this.Expression),
        expiration: null,
        value: [],
      };

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

  DeprecatedStatement = this.RULE<() => DeprecatedStatement>(
    NodeKind.DeprecatedStatement,
    () => {
      this.CONSUME(t.DeprecatedToken);

      return {
        type: NodeKind.DeprecatedStatement,
        expr: this.SUBRULE(this.Expression),
      };
    }
  );

  DoStatement = this.RULE<() => DoStatement>(NodeKind.DoStatement, () => {
    this.CONSUME(t.DoToken);

    return {
      type: NodeKind.DoStatement,
      expr: this.SUBRULE(this.Expression),
    };
  });

  FlushStatement = this.RULE<() => FlushStatement>(
    NodeKind.FlushStatement,
    () => {
      this.CONSUME(t.FlushToken);
      return { type: NodeKind.FlushStatement };
    }
  );

  BlockInlineStatement = this.RULE<() => BlockStatement>(
    NodeKind.BlockInlineStatement,
    () => {
      this.CONSUME(t.BlockToken);

      return {
        type: NodeKind.BlockStatement,
        name: this.SUBRULE(this.Identifier),
        body: [
          {
            type: NodeKind.VariableStatement,
            value: this.SUBRULE(this.Expression),
          },
        ],
        shortcut: true,
      };
    }
  );

  BlockStatement = this.RULE<() => BlockStatement>(
    NodeKind.BlockStatement,
    () => {
      this.CONSUME(t.BlockToken);

      const result: BlockStatement = {
        type: NodeKind.BlockStatement,
        name: this.SUBRULE(this.Identifier),
        body: [],
        shortcut: false,
      };

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

  ExtendsStatement = this.RULE<() => ExtendsStatement>(
    NodeKind.ExtendsStatement,
    () => {
      this.CONSUME(t.ExtendsToken);

      return {
        type: NodeKind.ExtendsStatement,
        expr: this.SUBRULE(this.Expression),
      };
    }
  );

  WithStatement = this.RULE<() => WithStatement>(NodeKind.WithStatement, () => {
    const result: WithStatement = {
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
  });

  AsOperator = this.RULE<() => AsOperator>(NodeKind.AsOperator, () => ({
    type: NodeKind.BinaryExpression,
    left: this.SUBRULE(this.Identifier),
    operator: this.CONSUME(t.AsToken).image,
    right: this.SUBRULE1(this.Identifier),
  }));

  UseStatement = this.RULE<() => UseStatement>(NodeKind.UseStatement, () => {
    this.CONSUME(t.UseToken);

    const result: UseStatement = {
      type: NodeKind.UseStatement,
      name: this.SUBRULE(this.Expression),
      importedBlocks: [],
    };

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

  SandboxStatement = this.RULE<() => SandboxStatement>(
    NodeKind.SandboxStatement,
    () => {
      const result: SandboxStatement = {
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

  IncludeStatement = this.RULE<() => IncludeStatement>(
    NodeKind.IncludeStatement,
    () => {
      this.CONSUME(t.IncludeToken);

      const result: IncludeStatement = {
        type: NodeKind.IncludeStatement,
        expr: this.SUBRULE(this.Expression),
        variables: null,
        ignoreMissing: false,
        only: false,
      };

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

  MacroStatement = this.RULE<() => MacroStatement>(
    NodeKind.MacroStatement,
    () => {
      this.CONSUME(t.MacroToken);

      const result: MacroStatement = {
        type: NodeKind.MacroStatement,
        name: this.SUBRULE(this.Identifier),
        arguments: this.SUBRULE(this.Arguments),
        body: [],
      };

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

  ImportStatement = this.RULE<() => ImportStatement>(
    NodeKind.ImportStatement,
    () => {
      this.CONSUME(t.ImportToken);
      const expr = this.SUBRULE(this.Expression);
      this.CONSUME(t.AsToken);

      return <ImportStatement>{
        type: NodeKind.ImportStatement,
        name: this.SUBRULE(this.Identifier),
        expr,
      };
    }
  );

  FromStatement = this.RULE<() => FromStatement>(NodeKind.FromStatement, () => {
    this.CONSUME(t.FromToken);

    const result: FromStatement = {
      type: NodeKind.FromStatement,
      expr: this.SUBRULE(this.Expression),
      variables: [],
    };

    this.CONSUME(t.ImportToken);

    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        result.variables.push(
          this.OR([
            { ALT: () => this.SUBRULE(this.AsOperator) },
            { ALT: () => this.SUBRULE(this.Identifier) },
          ])
        );
      },
    });

    return result;
  });

  EmbedStatement = this.RULE<() => EmbedStatement>(
    NodeKind.EmbedStatement,
    () => {
      this.CONSUME(t.EmbedToken);

      const result: EmbedStatement = {
        type: NodeKind.EmbedStatement,
        expr: this.SUBRULE(this.Expression),
        variables: null,
        ignoreMissing: false,
        only: false,
        body: [],
      };

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

  VerbatimStatement = this.RULE<() => VerbatimStatement>(
    NodeKind.VerbatimStatement,
    () => {
      const result: VerbatimStatement = {
        type: NodeKind.VerbatimStatement,
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

  FormThemeStatement = this.RULE<() => FormThemeStatement>(
    NodeKind.FormThemeStatement,
    () => {
      this.CONSUME(t.FormThemeToken);

      const result: FormThemeStatement = {
        type: NodeKind.FormThemeStatement,
        form: this.SUBRULE(this.Expression),
        only: false,
        resources: this.OR([
          {
            ALT: () => {
              this.CONSUME(t.WithToken);
              return this.SUBRULE1(this.Expression);
            },
          },
          {
            ALT: () => {
              const resources: ExpressionList = [];
              this.AT_LEAST_ONE(() => {
                resources.push(this.SUBRULE2(this.Expression));
              });
              return resources;
            },
          },
        ]),
      };

      this.OPTION(() => {
        this.CONSUME(t.OnlyToken);
        result.only = true;
      });

      return result;
    }
  );

  TransStatement = this.RULE<() => TransStatement>(
    NodeKind.TransStatement,
    () => {
      const result: TransStatement = {
        type: NodeKind.TransStatement,
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

  TransDefaultDomainStatement = this.RULE<() => TransDefaultDomainStatement>(
    NodeKind.TransDefaultDomainStatement,
    () => {
      this.CONSUME(t.TransDefaultDomainToken);

      return {
        type: NodeKind.TransDefaultDomainStatement,
        domain: this.SUBRULE(this.Expression),
      };
    }
  );

  StopwatchStatement = this.RULE<() => StopwatchStatement>(
    NodeKind.StopwatchStatement,
    () => {
      this.CONSUME(t.StopwatchToken);

      const result: StopwatchStatement = {
        type: NodeKind.StopwatchStatement,
        event_name: this.SUBRULE1(this.Expression),
        body: [],
      };

      this.CONSUME(t.RBlockToken);

      this.MANY(() => {
        result.body.push(this.SUBRULE2(this.SourceElement));
      });

      this.CONSUME(t.LBlockToken);
      this.CONSUME(t.EndStopwatchToken);

      return result;
    }
  );

  Statement = this.RULE<() => Statement>(NodeKind.Statement, () => {
    this.CONSUME(t.LBlockToken);
    const statement = this.OR({
      DEF: [
        // Twig
        { ALT: () => this.SUBRULE(this.SetStatement) },
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

  SourceElement = this.RULE<() => SourceElement>(NodeKind.SourceElement, () =>
    this.OR([
      { ALT: () => this.SUBRULE(this.Text) },
      { ALT: () => this.SUBRULE(this.Comment) },
      { ALT: () => this.SUBRULE(this.VariableStatement) },
      { ALT: () => this.SUBRULE(this.Statement) },
    ])
  );

  SourceElementList = this.RULE<() => SourceElementList>(
    NodeKind.SourceElementList,
    () => {
      let body: SourceElementList = [];

      this.MANY(() => {
        body.push(this.SUBRULE(this.SourceElement));
      });

      return body;
    }
  );

  Template = this.RULE<() => Template>(NodeKind.Template, () => {
    return {
      type: NodeKind.Template,
      body: this.SUBRULE(this.SourceElementList),
    };
  });
}
