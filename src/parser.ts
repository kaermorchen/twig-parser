import { EmbeddedActionsParser } from 'chevrotain';
import { off } from 'process';
import { tokens } from './lexer.js';

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
    let binaryExpression;
    const atomicExpression = this.SUBRULE(this.atomicExpression);

    this.OPTION(() => {
      binaryExpression = this.SUBRULE1(this.binaryExpression);
    });

    if (atomicExpression && binaryExpression) {
      return Object.assign({}, binaryExpression, { left: atomicExpression });
    }

    if (atomicExpression) {
      return atomicExpression;
    }
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

  operator = this.RULE('operator', () => {
    return this.OR([
      { ALT: () => this.CONSUME(tokens.OrBinary).image },
      { ALT: () => this.CONSUME(tokens.AndBinary).image },
      { ALT: () => this.CONSUME(tokens.BitwiseOrBinary).image },
      { ALT: () => this.CONSUME(tokens.BitwiseXorBinary).image },
      { ALT: () => this.CONSUME(tokens.BitwiseAndBinary).image },
      { ALT: () => this.CONSUME(tokens.EqualBinary).image },
      { ALT: () => this.CONSUME(tokens.NotEqualBinary).image },
      { ALT: () => this.CONSUME(tokens.SpaceshipBinary).image },
      { ALT: () => this.CONSUME(tokens.GreaterEqualBinary).image },
      { ALT: () => this.CONSUME(tokens.LessEqualBinary).image },
      { ALT: () => this.CONSUME(tokens.LessBinary).image },
      { ALT: () => this.CONSUME(tokens.GreaterBinary).image },
      { ALT: () => this.CONSUME(tokens.NotInBinary).image },
      { ALT: () => this.CONSUME(tokens.InBinary).image },
      { ALT: () => this.CONSUME(tokens.MatchesBinary).image },
      { ALT: () => this.CONSUME(tokens.StartsWithBinary).image },
      { ALT: () => this.CONSUME(tokens.EndsWithBinary).image },
      { ALT: () => this.CONSUME(tokens.HasSomeBinary).image },
      { ALT: () => this.CONSUME(tokens.HasEveryBinary).image },
      { ALT: () => this.CONSUME(tokens.RangeBinary).image },
      { ALT: () => this.CONSUME(tokens.AddBinary).image },
      { ALT: () => this.CONSUME(tokens.SubBinary).image },
      { ALT: () => this.CONSUME(tokens.ConcatBinary).image },
      { ALT: () => this.CONSUME(tokens.NotUnary).image },
      { ALT: () => this.CONSUME(tokens.MulBinary).image },
      { ALT: () => this.CONSUME(tokens.DivBinary).image },
      { ALT: () => this.CONSUME(tokens.FloorDivBinary).image },
      { ALT: () => this.CONSUME(tokens.ModBinary).image },
      { ALT: () => this.CONSUME(tokens.IsNotBinary).image },
      { ALT: () => this.CONSUME(tokens.IsBinary).image },
      { ALT: () => this.CONSUME(tokens.PowerBinary).image },
      { ALT: () => this.CONSUME(tokens.NullCoalesceExpression).image },
    ]);
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

  binaryExpression = this.RULE('binaryExpression', () => {
    let operator, right;

    this.OPTION(() => {
      operator = this.SUBRULE1(this.operator);
      right = this.SUBRULE2(this.expression);

      // this.OPTION1(() => this.SUBRULE3(this.binaryExpression));
    });

    if (operator && right) {
      return {
        type: 'BinaryExpression',
        operator,
        right,
      };
    }
  });

  atomicExpression = this.RULE('atomicExpression', () => {
    return this.OR([
      { ALT: () => this.SUBRULE(this.parenthesisExpression) },
      { ALT: () => this.SUBRULE(this.arrayExpression) },
      { ALT: () => this.SUBRULE(this.hashExpression) },
      { ALT: () => this.SUBRULE(this.identifier) },
      { ALT: () => this.SUBRULE(this.literal) },
    ]);
  });

  parenthesisExpression = this.RULE('parenthesisExpression', () => {
    let expression;

    this.CONSUME(tokens.LParen);
    expression = this.SUBRULE(this.expression);
    this.CONSUME(tokens.RParen);

    return expression;
  });
}
