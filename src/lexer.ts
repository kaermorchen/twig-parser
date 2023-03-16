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
  public static REGEX_STRING =
    /"([^#"\\\\]*(?:\\\\.[^#"\\\\]*)*)"|'([^'\\\\]*(?:\\\\.[^'\\\\]*)*)'/sy;
  public static REGEX_DQ_STRING_DELIM = /"/y;
  public static REGEX_DQ_STRING_PART =
    /[^#"\\\\]*(?:(?:\\\\.|#(?!\\{))[^#"\\\\]*)*/sy;
  public static PUNCTUATION = '()[]{}?:.,|';

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
        case Lexer.STATE_DATA:
          this.lexData();
          break;
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

  private lexData(): void {
    // if no matches are left we return the rest of the template as simple text token
    if (this.position === this.positions[0].length - 1) {
      this.pushToken(Token.TEXT_TYPE, this.code.substring(this.cursor));
      this.cursor = this.end;
      return;
    }

    // Find the first token after the current cursor
    let position = this.positions[0][++this.position];
    while (position[1] < this.cursor) {
      if (this.position === this.positions[0].length - 1) {
        return;
      }
      position = this.positions[0][++this.position];
    }

    // push the template text first
    let textContent;
    let text = (textContent = this.code.substring(
      this.cursor,
      position[1] - this.cursor
    ));

    // trim?
    if (this.positions?.[2]?.[this.position]?.[0]) {
      if (
        this.options.whitespace_trim === this.positions[2][this.position][0]
      ) {
        // whitespace_trim detected ({%-, {{- or {#-)
        text = text.trimStart();
      } else if (
        this.options.whitespace_line_trim ===
        this.positions[2][this.position][0]
      ) {
        // whitespace_line_trim detected ({%~, {{~ or {#~)
        // don't trim \r and \n
        text = text.replace(/ \t\0\v/g, '');
      }
    }

    this.pushToken(Token.TEXT_TYPE, text);
    this.moveCursor(textContent + position[0]);

    let match: RegExpMatchArray | null;

    switch (this.positions[1][this.position][0]) {
      case this.options['tag_comment'][0]:
        this.lexComment();
        break;
      case this.options['tag_block'][0]:
        if (
          (match = this.code
            .substring(this.cursor)
            .match(this.regexes.lex_block_raw))
        ) {
          this.moveCursor(match[0]);
          this.lexRawData();
          // {% line \d+ %}
        } else if (
          (match = this.code
            .substring(this.cursor)
            .match(this.regexes.lex_block_line))
        ) {
          this.moveCursor(match[0]);
          this.lineno = parseInt(match[1]);
        } else {
          this.pushToken(Token.BLOCK_START_TYPE);
          this.pushState(Lexer.STATE_BLOCK);
          this.currentVarBlockLine = this.lineno;
        }
        break;
      case this.options['tag_variable'][0]:
        this.pushToken(Token.VAR_START_TYPE);
        this.pushState(Lexer.STATE_VAR);
        this.currentVarBlockLine = this.lineno;
        break;
    }
  }

  private pushToken(type_: number, value = ''): void {
    // do not push empty text tokens
    if (Token.TEXT_TYPE === type_ && '' === value) {
      return;
    }

    this.tokens.push(new Token(type_, value, this.lineno));
  }

  private lexComment(): void {
    // // let match: RegExpMatchArray | null;
    // const matches = this.code.substring(this.cursor).matchAll(this.regexes.lex_comment);
    // for (const match of matches) {
    //   this.positions.push([[match[0], match.index]]);
    // }
    // if (
    //   !(match = this.code
    //     .substring(this.cursor)
    //     .match(this.regexes.lex_comment)
    //   !preg_match(
    //     this.regexes['lex_comment'],
    //     this.code,
    //     match,
    //     PREG_OFFSET_CAPTURE,
    //     this.cursor
    //   )
    // ) {
    //   throw new Error('Unclosed comment.', this.lineno, this.source);
    // }
    // this.moveCursor(
    //   this.code.substring(this.cursor, match[0][1] - this.cursor) + match[0][0]
    // );
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
    } else if (Lexer.PUNCTUATION.includes(this.code[this.cursor])) {
      // punctuation
      // opening bracket
      if ('([{'.includes(this.code[this.cursor])) {
        this.brackets.push([this.code[this.cursor], this.lineno]);
      }
      // closing bracket
      else if (')]}'.includes(this.code[this.cursor])) {
        if (this.brackets.length === 0) {
          throw new Error(
            `Unexpected ${this.code[this.cursor]} ${this.lineno} ${this.code}`
          );
        }

        const [expect, lineno] = this.brackets.pop();

        if (
          this.code[this.cursor] !==
          expect.replace('(', ')').replace('[', ']').replace('{', '}')
        ) {
          throw new Error(`Unclosed ${expect} ${lineno} ${this.code}`);
        }
      }
      this.pushToken(Token.PUNCTUATION_TYPE, this.code[this.cursor]);
      ++this.cursor;
    } else if (
      (match = this.code.substring(this.cursor).match(Lexer.REGEX_STRING))
    ) {
      // strings
      this.pushToken(Token.STRING_TYPE, match[0].substring(1, -1));
      this.moveCursor(match[0]);
    } else if (
      // opening double quoted string
      (match = this.code
        .substring(this.cursor)
        .match(Lexer.REGEX_DQ_STRING_DELIM))
    ) {
      this.brackets.push(['"', this.lineno]);
      this.pushState(Lexer.STATE_STRING);
      this.moveCursor(match[0]);
    }
    // unlexable
    else {
      throw new Error(
        `Unexpected character ${this.code[this.cursor]} ${this.lineno} ${
          this.code
        }`
      );
    }
  }

  private moveCursor(text: string): void {
    this.cursor += text.length;
    this.lineno += text.match(/\n/g)?.length ?? 0;
  }

  private pushState(state: number): void {
    this.states.push(this.state);
    this.state = state;
  }

  private popState(): void {
    const state = this.states.pop();

    if (state !== undefined) {
      this.state = state;
    } else {
      throw new Error('Cannot pop state without a previous state.');
    }
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
