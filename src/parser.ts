import { EmbeddedActionsParser } from 'chevrotain';
import * as t from './lexer.js';

export default class TwigParser extends EmbeddedActionsParser {
  constructor() {
    super(t);
    this.performSelfAnalysis();
  }

  Identifier = this.RULE('Identifier', () => ({
    type: 'Identifier',
    value: this.CONSUME(t.IdentifierToken).image,
  }));

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
      { ALT: () => this.SUBRULE(this.ParenthesizedExpression) },
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
      const property = this.OR([
        { ALT: () => this.SUBRULE(this.BoxMemberExpression) },
        { ALT: () => this.SUBRULE(this.DotMemberExpression) },
        { ALT: () => this.SUBRULE(this.Arguments) },
      ]);

      if (property) {
        object = {
          type: 'LeftHandSideExpression',
          object,
          property,
        };
      }
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
    this.CONSUME(t.OpenParenToken);
    const expr = this.SUBRULE(this.Expression_In);
    this.CONSUME(t.CloseParenToken);

    return expr;
  });

  ArrowFormalParameters = this.RULE('ArrowFormalParameters', () => {
    const params = [];

    this.CONSUME(t.OpenParenToken);
    this.MANY_SEP({
      SEP: t.CommaToken,
      DEF: () => {
        params.push(this.SUBRULE(this.Identifier));
      },
    });
    this.CONSUME(t.CloseParenToken);

    return params;
  });

  ArrowFunction = this.RULE('ArrowFunction', () => {
    const params = this.OR([
      { ALT: () => this.SUBRULE(this.ArrowFormalParameters) },
      { ALT: () => this.SUBRULE(this.Identifier) },
    ]);
    this.CONSUME(t.EqualsGreaterToken);
    const body = this.SUBRULE(this.AssignmentExpression);

    return {
      type: 'ArrowFunction',
      body,
      params,
    };
  });

  ArrowFunction_In = this.RULE('ArrowFunction_In', () => {
    const params = this.OR([
      { ALT: () => this.SUBRULE(this.ArrowFormalParameters) },
      { ALT: () => this.SUBRULE(this.Identifier) },
    ]);
    this.CONSUME(t.EqualsGreaterToken);
    const body = this.SUBRULE(this.AssignmentExpression_In);

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
        { ALT: () => this.SUBRULE(this.ArrowFunction) },
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
        { ALT: () => this.SUBRULE(this.ArrowFunction_In) },
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

  Expression = this.RULE('Expression', () => {
    return this.SUBRULE(this.AssignmentExpression);
  });

  Expression_In = this.RULE('Expression_In', () => {
    return this.SUBRULE(this.AssignmentExpression_In);
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

    // else
    this.OPTION1(() => {
      this.CONSUME1(t.LBlockToken);
      this.CONSUME1(t.ElseToken);
      this.CONSUME1(t.RBlockToken);

      result.alternate = this.SUBRULE1(this.SourceElement);
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

      elseIfStatement.alternate = this.SUBRULE4(this.SourceElement);
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

  Statement = this.RULE('Statement', () => {
    this.CONSUME(t.LBlockToken);
    const statement = this.OR({
      DEF: [
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
