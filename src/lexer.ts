import Source from './source';
import { Token } from './Token';
import TokenStream from './token-stream';

export default class Lexer {
  private tokens: Token[] = [];
  private code: string;
  private cursor: number = 0;
  private lineno: number = 1;
  private end: number;
  private state: number;
  private states: number[];
  private brackets;
  private env: Environment;

  private position = -1;
  private positions: Array<Array<[string, number]>> = [];
  private currentVarBlockLine: number;

  public static STATE_DATA = 0;
  public static STATE_BLOCK = 1;
  public static STATE_VAR = 2;
  public static STATE_STRING = 3;
  public static STATE_INTERPOLATION = 4;
  public static REGEX_NAME = /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/y;
  public static REGEX_NUMBER = /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/y;
  // public static REGEX_STRING =
  //   /"([^#"\\\\]*(?:\\\\.[^#"\\\\]*)*)"|'([^'\\\\]*(?:\\\\.[^'\\\\]*)*)'/sy;
  // public static REGEX_DQ_STRING_DELIM = /"/y;
  // public static REGEX_DQ_STRING_PART =
  //   /[^#"\\\\]*(?:(?:\\\\.|#(?!\\{))[^#"\\\\]*)*/sy;
  // public static PUNCTUATION = '()[]{}?:.,|';

  private regexes = {
    lex_tokens_start: /(\{\{|\{\%|\{\#)(-|~)?/gs,
    interpolation_start: /\#\{\s*/y,
    interpolation_end: /\s*\}/y,
  };

  private options = {
    tag_comment: ['{#', '#}'],
    tag_block: ['{%', '%}'],
    tag_variable: ['{{', '}}'],
    whitespace_trim: '-',
    whitespace_line_trim: '~',
    whitespace_line_chars: ' \\t\\0\\x0B',
    interpolation: ['\\#\\{', '\\}'],
  };

  public tokenize(code: string) {
    this.code = code.replace(/\r\n|\r/g, '\n');
    this.cursor = 0;
    this.lineno = 1;
    this.end = this.code.length;
    this.tokens = [];
    this.state = Lexer.STATE_DATA;
    this.states = [];
    this.brackets = [];
    this.position = -1;
    this.positions = [];

    const matches = this.code.matchAll(this.regexes.lex_tokens_start);

    for (const match of matches) {
      this.positions.push([[match[0], match.index]]);
    }

    while (this.cursor < this.end) {
      // dispatch to the lexing functions depending
      // on the current state
      switch (this.state) {
        // case Lexer.STATE_DATA:
        //   this.lexData();
        //   break;
        // case Lexer.STATE_BLOCK:
        //   this.lexBlock();
        //   break;
        // case Lexer.STATE_VAR:
        //   this.lexVar();
        //   break;
        // case Lexer.STATE_STRING:
        //   this.lexString();
        //   break;
        case Lexer.STATE_INTERPOLATION:
          this.lexInterpolation();
          break;
      }
    }

    this.pushToken(Token.EOF_TYPE);

    if (this.brackets.length) {
      const [expect, lineno] = this.brackets.pop;

      throw new Error(`Unclosed ${expect} ${lineno} ${this.code}`);
    }

    console.log(this.tokens);

    // return new TokenStream(this.tokens, this.code);
  }

  private pushToken(type_: number, value = ''): void {
    // do not push empty text tokens
    if (Token.TEXT_TYPE === type_ && '' === value) {
      return;
    }

    this.tokens.push(new Token(type_, value, this.lineno));
  }

  private lexInterpolation(): void {
    let match: RegExpMatchArray | null;

    const bracket = this.brackets[this.brackets.length - 1];

    if (
      this.options['interpolation'][0] === bracket[0] &&
      (match = this.code
        .substring(this.cursor)
        .match(this.regexes.interpolation_end))
    ) {
      this.brackets.pop();
      this.pushToken(Token.INTERPOLATION_END_TYPE);

      this.moveCursor(match[0]);
      this.popState();
    } else {
      this.lexExpression();
    }
  }

  private lexExpression(): void {
    let match: RegExpMatchArray | null;

    // whitespace
    if ((match = this.code.substring(this.cursor).match(/\s+/y))) {
      this.moveCursor(match[0]);

      if (this.cursor >= this.end) {
        throw new Error(
          `Unclosed ${
            Lexer.STATE_BLOCK === this.state ? 'block' : 'variable'
          } ${this.currentVarBlockLine} ${this.code}`
        );
      }
    }

    // arrow function
    if ('=' === this.code[this.cursor] && '>' === this.code[this.cursor + 1]) {
      this.pushToken(Token.ARROW_TYPE, '=>');
      this.moveCursor('=>');
    }
    // operators
    // else if (
    //   match = this.code.substring(this.cursor).match(this.regexes.operator)
    // ) {
    //   this.pushToken(
    //     // Token::OPERATOR_TYPE
    //     8,
    //     preg_replace('/\\s+/', ' ', match[0])
    //   );
    //   this.moveCursor(match[0]);
    // }

    // names
    else if (
      (match = this.code.substring(this.cursor).match(Lexer.REGEX_NAME))
    ) {
      this.pushToken(Token.NAME_TYPE, match[0]);
      this.moveCursor(match[0]);
    }
    // numbers
    else if (
      (match = this.code.substring(this.cursor).match(Lexer.REGEX_NUMBER))
    ) {
      let number_;

      if (Number.isInteger(Number(match[0]))) {
        number_ = parseInt(match[0]);
      } else {
        number_ = parseFloat(match[0]);
      }

      this.pushToken(Token.NUMBER_TYPE, String(number_));
      this.moveCursor(match[0]);
    }
    // punctuation
    // else if (false !== strpos(Lexer.PUNCTUATION, this.code[this.cursor])) {
    //   // opening bracket
    //   if (false !== strpos('([{', this.code[this.cursor])) {
    //     this.brackets.push([this.code[this.cursor], this.lineno]);
    //   }
    //   // closing bracket
    //   else if (false !== strpos(')]}', this.code[this.cursor])) {
    //     if (empty(this.brackets)) {
    //       throw new Error(
    //         sprintf('Unexpected "%s".', this.code[this.cursor]),
    //         this.lineno,
    //         this.source
    //       );
    //     }
    //     const [expect, lineno] = array_pop(this.brackets);
    //     if (this.code[this.cursor] != strtr(expect, '([{', ')]}')) {
    //       throw new Error(
    //         sprintf('Unclosed "%s".', expect),
    //         lineno,
    //         this.source
    //       );
    //     }
    //   }
    //   this.pushToken(
    //     // Token::PUNCTUATION_TYPE
    //     9,
    //     this.code[this.cursor]
    //   );
    //   ++this.cursor;
    // }
    // // strings
    // else if (preg_match(Lexer.REGEX_STRING, this.code, match, 0, this.cursor)) {
    //   this.pushToken(
    //     // Token::STRING_TYPE
    //     7,
    //     stripcslashes(substr(match[0], 1, -1))
    //   );
    //   this.moveCursor(match[0]);
    // }
    // // opening double quoted string
    // else if (
    //   preg_match(Lexer.REGEX_DQ_STRING_DELIM, this.code, match, 0, this.cursor)
    // ) {
    //   this.brackets.push(['"', this.lineno]);
    //   this.pushState(Lexer.STATE_STRING);
    //   this.moveCursor(match[0]);
    // }
    // // unlexable
    // else {
    //   throw new Error(
    //     sprintf('Unexpected character "%s".', this.code[this.cursor]),
    //     this.lineno,
    //     this.source
    //   );
    // }
  }

  private moveCursor(text: string): void {
    this.cursor += text.length;
    this.lineno += text.match(/\n/g)?.length ?? 0;
  }

  private popState(): void {
    if (this.states.length === 0) {
      throw new Error('Cannot pop state without a previous state.');
    }

    this.state = this.states.pop();
  }

  // private getOperatorRegex(): string {
  //   let operators = array_merge(
  //     ['='],
  //     array_keys(this.env.getUnaryOperators()),
  //     array_keys(this.env.getBinaryOperators())
  //   );

  //   operators = array_combine(operators, array_map('strlen', operators));
  //   arsort(operators);
  //   const regex = [];

  //   for (const [operator, length] of Object.entries(operators)) {
  //     // an operator that ends with a character must be followed by
  //     // a whitespace, a parenthesis, an opening map [ or sequence {
  //     let r = preg_quote(operator, '/');
  //     if (ctype_alpha(operator[length - 1])) {
  //       r += '(?=[\\s()\\[{])';
  //     }
  //     // an operator that begins with a character must not have a dot or pipe before
  //     if (ctype_alpha(operator[0])) {
  //       r = '(?<![\\.\\|])' + r;
  //     }
  //     // an operator with a space can be any amount of whitespaces
  //     r = preg_replace('/\\s+/', '\\s+', r);
  //     regex.push(r);
  //   }

  //   return '/' + implode('|', regex) + '/A';
  // }
}
