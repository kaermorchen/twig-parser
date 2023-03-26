import { IToken, TokenType } from 'chevrotain';
import * as tokens from './tokens.js';

const PREG_OFFSET_CAPTURE = 256;

export class Lexer {
  private tokens: IToken[] = [];
  private code: string;
  private cursor: number = 0;
  private lineno: number = 1;
  private end: number;
  private state: number;
  private states: number[];
  private brackets;
  private options = {
    tag_comment: ['{#', '#}'],
    tag_block: ['{%', '%}'],
    tag_variable: ['{{', '}}'],
    whitespace_trim: '-',
    whitespace_line_trim: '~',
    whitespace_line_chars: ' \\t\\0\\x0B',
    interpolation: ['\\#\\{', '\\}'],
  };
  private position = -1;
  private positions: Array<Array<[string, number]>> = [];
  private currentVarBlockLine: number;

  public static STATE_DATA = 0;
  public static STATE_BLOCK = 1;
  public static STATE_VAR = 2;
  public static STATE_STRING = 3;
  public static STATE_INTERPOLATION = 4;
  public static REGEX_NAME = /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/gy;
  public static REGEX_NUMBER = /[0-9]+(?:\\.[0-9]+)?([Ee][\\+\\-][0-9]+)?/gy;
  public static REGEX_STRING =
    /"([^#"\\\\]*(?:\\\\.[^#"\\\\]*)*)"|'([^'\\\\]*(?:\\\\.[^'\\\\]*)*)'/gsy;
  public static REGEX_DQ_STRING_DELIM = /"/y;
  public static REGEX_DQ_STRING_PART =
    /[^#"\\\\]*(?:(?:\\\\.|#(?!\\{))[^#"\\\\]*)*/sy;
  public static PUNCTUATION = '()[]{}?:.,|';

  private regexes = {
    lex_var: new RegExp(
      `\\s*(?:${preg_quote(
        this.options['whitespace_trim'] + this.options['tag_variable'][1],
        '#'
      )}\\s*|${preg_quote(
        this.options['whitespace_line_trim'] + this.options['tag_variable'][1],
        '#'
      )}[${this.options['whitespace_line_chars']}]*|${preg_quote(
        this.options['tag_variable'][1],
        '#'
      )})`,
      'gy'
    ),

    lex_block: new RegExp(
      `\\s*(?:${preg_quote(
        this.options['whitespace_trim'] + this.options['tag_block'][1],
        '#'
      )}\\s*\\n?|${preg_quote(
        this.options['whitespace_line_trim'] + this.options['tag_block'][1],
        '#'
      )}[${this.options['whitespace_line_chars']}]*|${preg_quote(
        this.options['tag_block'][1],
        '#'
      )}\\n?)`,
      'gy'
    ),

    lex_raw_data: new RegExp(
      `${preg_quote(this.options['tag_block'][0], '#')}(${
        this.options['whitespace_trim']
      }|${
        this.options['whitespace_line_trim']
      })?\\s*endverbatim\\s*(?:${preg_quote(
        this.options['whitespace_trim'] + this.options['tag_block'][1],
        '#'
      )}\\s*|${preg_quote(
        this.options['whitespace_line_trim'] + this.options['tag_block'][1],
        '#'
      )}[${this.options['whitespace_line_chars']}]*|${preg_quote(
        this.options['tag_block'][1],
        '#'
      )})`,
      'gs'
    ),

    operator: this.getOperatorRegex(),

    lex_comment: new RegExp(
      `(?:${preg_quote(
        this.options['whitespace_trim'] + this.options['tag_comment'][1],
        '#'
      )}\\s*\\n?|${preg_quote(
        this.options['whitespace_line_trim'] + this.options['tag_comment'][1],
        '#'
      )}[${this.options['whitespace_line_chars']}]*|${preg_quote(
        this.options['tag_comment'][1],
        '#'
      )}\\n?)`,
      'gs'
    ),

    lex_block_raw: new RegExp(
      `\\s*verbatim\\s*(?:${preg_quote(
        this.options['whitespace_trim'] + this.options['tag_block'][1],
        '#'
      )}\\s*|${preg_quote(
        this.options['whitespace_line_trim'] + this.options['tag_block'][1],
        '#'
      )}[${this.options['whitespace_line_chars']}]*|${preg_quote(
        this.options['tag_block'][1],
        '#'
      )})`,
      'gsy'
    ),

    lex_block_line: new RegExp(
      `\\s*line\\s+(\\d+)\\s*${preg_quote(this.options['tag_block'][1], '#')}`,
      'gsy'
    ),

    lex_tokens_start: new RegExp(
      `(${preg_quote(this.options['tag_variable'][0], '#')}|${preg_quote(
        this.options['tag_block'][0],
        '#'
      )}|${preg_quote(this.options['tag_comment'][0], '#')})(${preg_quote(
        this.options['whitespace_trim'],
        '#'
      )}|${preg_quote(this.options['whitespace_line_trim'], '#')})?`,
      'gs'
    ),
    interpolation_start: new RegExp(
      `${this.options['interpolation'][0]}\\s*`,
      'y'
    ),
    interpolation_end: new RegExp(
      `\\s*${this.options['interpolation'][1]}`,
      'y'
    ),
  };

  public tokenize(code: string): Token[] {
    this.code = code.replace(/(\r\n|\r)/g, '\n');
    this.cursor = 0;
    this.lineno = 1;
    this.end = this.code.length;
    this.tokens = [];
    this.state = Lexer.STATE_DATA;
    this.states = [];
    this.brackets = [];
    this.position = -1;
    this.positions = [[], [], []];

    const matches = this.code.matchAll(this.regexes.lex_tokens_start);

    for (const match of matches) {
      this.positions[0].push([match[0], match.index]);
      this.positions[1].push([match[1], match.index]);

      const trim =
        match[2] === undefined
          ? ['', -1]
          : [match[2], match[1].length + match.index];

      this.positions[2].push(trim);
    }

    while (this.cursor < this.end) {
      // dispatch to the lexing functions depending
      // on the current state
      switch (this.state) {
        case Lexer.STATE_DATA:
          this.lexData();
          break;
        case Lexer.STATE_BLOCK:
          this.lexBlock();
          break;
        case Lexer.STATE_VAR:
          this.lexVar();
          break;
        case Lexer.STATE_STRING:
          this.lexString();
          break;
        case Lexer.STATE_INTERPOLATION:
          this.lexInterpolation();
          break;
      }
    }

    if (this.brackets.length) {
      const [expect, lineno] = this.brackets.pop();

      throw new Error(`Unclosed ${expect}`);
    }

    return this.tokens;
  }

  private lexData(): void {
    // if no matches are left we return the rest of the template as simple text token
    if (this.position === this.positions[0].length - 1) {
      this.pushToken(tokens.text, this.code.substring(this.cursor));
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
    let text = (textContent = this.code.substring(this.cursor, position[1]));

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

    this.pushToken(tokens.text, text);
    this.moveCursor(textContent + position[0]);

    switch (this.positions[1][this.position][0]) {
      case this.options['tag_comment'][0]:
        this.lexComment();
        break;
      case this.options['tag_block'][0]: {
        let match = [];

        // raw data?
        if (
          preg_match(
            this.regexes.lex_block_raw,
            this.code,
            match,
            0,
            this.cursor
          )
        ) {
          this.moveCursor(match[0]);
          this.lexRawData();
          // {% line \d+ %}
        } else if (
          preg_match(
            this.regexes.lex_block_line,
            this.code,
            match,
            0,
            this.cursor
          )
        ) {
          this.moveCursor(match[0]);
          this.lineno = parseInt(match[1]);
        } else {
          this.pushToken(tokens.blockStart);
          this.pushState(Lexer.STATE_BLOCK);
          this.currentVarBlockLine = this.lineno;
        }
        break;
      }
      case this.options['tag_variable'][0]:
        this.pushToken(tokens.varStart);
        this.pushState(Lexer.STATE_VAR);
        this.currentVarBlockLine = this.lineno;
        break;
    }
  }

  private lexBlock(): void {
    let match = [];

    if (
      this.brackets.length === 0 &&
      preg_match(this.regexes.lex_block, this.code, match, 0, this.cursor)
    ) {
      this.pushToken(tokens.blockEnd);
      this.moveCursor(match[0]);
      this.popState();
    } else {
      this.lexExpression();
    }
  }

  private lexVar(): void {
    let match = [];

    if (
      this.brackets.length === 0 &&
      preg_match(this.regexes.lex_var, this.code, match, 0, this.cursor)
    ) {
      this.pushToken(tokens.varEnd);
      this.moveCursor(match[0]);
      this.popState();
    } else {
      this.lexExpression();
    }
  }

  private lexExpression(): void {
    let match = [];

    // whitespace
    if (preg_match(/\s+/gy, this.code, match, 0, this.cursor)) {
      this.moveCursor(match[0]);

      if (this.cursor >= this.end) {
        throw new Error(
          `Unclosed ${Lexer.STATE_BLOCK === this.state ? 'block' : 'variable'}`
        );
      }
    }

    // arrow function
    if ('=' === this.code[this.cursor] && '>' === this.code[this.cursor + 1]) {
      this.pushToken(tokens.arrow, '=>');
      this.moveCursor('=>');
    }

    // operators
    else if (
      preg_match(this.regexes['operator'], this.code, match, 0, this.cursor)
    ) {
      this.pushToken(tokens.operator, match[0].replace(/\s+/g, ' '));
      this.moveCursor(match[0]);
    }

    // names
    else if (preg_match(Lexer.REGEX_NAME, this.code, match, 0, this.cursor)) {
      this.pushToken(tokens.name, match[0]);
      this.moveCursor(match[0]);
    }

    // numbers
    else if (preg_match(Lexer.REGEX_NUMBER, this.code, match, 0, this.cursor)) {
      let number_ = parseFloat(match[0]);

      // floats
      if (Number.isInteger(number_) && number_ <= Number.MAX_SAFE_INTEGER) {
        number_ = parseInt(match[0]);
        // integers lower than the maximum
      }
      this.pushToken(tokens.number, number_);
      this.moveCursor(match[0]);
    }

    // punctuation
    else if (Lexer.PUNCTUATION.includes(this.code[this.cursor])) {
      // opening bracket
      if ('([{'.includes(this.code[this.cursor])) {
        this.brackets.push([this.code[this.cursor], this.lineno]);
      }
      // closing bracket
      else if (')]}'.includes(this.code[this.cursor])) {
        if (this.brackets.length === 0) {
          throw new Error(`Unexpected ${this.code[this.cursor]}`);
        }

        const [expect, lineno] = this.brackets.pop();

        if (
          this.code[this.cursor] !==
          expect.replace('(', ')').replace('[', ']').replace('{', '}')
        ) {
          throw new Error(`Unclosed ${expect}`);
        }
      }
      this.pushToken(tokens.punctuation, this.code[this.cursor]);
      ++this.cursor;
    }
    // strings
    else if (preg_match(Lexer.REGEX_STRING, this.code, match, 0, this.cursor)) {
      this.pushToken(tokens.string, match[0].slice(1, -1));
      this.moveCursor(match[0]);
    }
    // opening double quoted string
    else if (
      preg_match(Lexer.REGEX_DQ_STRING_DELIM, this.code, match, 0, this.cursor)
    ) {
      this.brackets.push(['"', this.lineno]);
      this.pushState(Lexer.STATE_STRING);
      this.moveCursor(match[0]);
    }
    // unlexable
    else {
      throw new Error(`Unexpected character ${this.code[this.cursor]}`);
    }
  }

  private lexRawData(): void {
    let match = [];
    if (
      !preg_match(
        this.regexes.lex_raw_data,
        this.code,
        match,
        PREG_OFFSET_CAPTURE,
        this.cursor
      )
    ) {
      throw new Error('Unexpected end of file: Unclosed "verbatim" block.');
    }

    let text = this.code.slice(this.cursor, match[0][1] - this.cursor);
    this.moveCursor(text + match[0][0]);
    // trim?
    if (match[1][0]) {
      if (this.options['whitespace_trim'] === match[1][0]) {
        // whitespace_trim detected ({%-, {{- or {#-)
        text = text.replace(/[ \t\n\r\0\v]+$/, '');
      } else {
        // whitespace_line_trim detected ({%~, {{~ or {#~)
        // don't trim \r and \n
        text = text.replace(/[ \t\0\v]+$/, '');
      }
    }
    this.pushToken(tokens.text, text);
  }

  private lexComment(): void {
    let match = [];

    if (
      !preg_match(
        this.regexes.lex_comment,
        this.code,
        match,
        PREG_OFFSET_CAPTURE,
        this.cursor
      )
    ) {
      throw new Error('Unclosed comment');
    }

    this.moveCursor(
      this.code.substring(this.cursor, match[0][1]).concat(match[0][0])
    );
  }

  private lexString(): void {
    let match = [];
    if (
      preg_match(
        this.regexes.interpolation_start,
        this.code,
        match,
        0,
        this.cursor
      )
    ) {
      this.brackets.push([this.options['interpolation'][0], this.lineno]);
      this.pushToken(tokens.interpolationStart);
      this.moveCursor(match[0]);
      this.pushState(Lexer.STATE_INTERPOLATION);
    } else if (
      preg_match(
        Lexer.REGEX_DQ_STRING_PART,
        this.code,
        match,
        0,
        this.cursor
      ) &&
      match[0].length > 0
    ) {
      this.pushToken(tokens.string, match[0]);
      this.moveCursor(match[0]);
    } else if (
      preg_match(Lexer.REGEX_DQ_STRING_DELIM, this.code, match, 0, this.cursor)
    ) {
      const [expect, lineno] = this.brackets.pop();
      if ('"' != this.code[this.cursor]) {
        throw new Error(`Unclosed ${expect}`);
      }
      this.popState();
      ++this.cursor;
    } else {
      // unlexable
      throw new Error(`Unexpected character ${this.code[this.cursor]}`);
    }
  }

  private lexInterpolation(): void {
    let match = [];
    const bracket = this.brackets[this.brackets.length - 1];

    if (
      this.options['interpolation'][0] === bracket[0] &&
      preg_match(
        this.regexes.interpolation_end,
        this.code,
        match,
        0,
        this.cursor
      )
    ) {
      this.brackets.pop();
      this.pushToken(tokens.interpolationEnd);
      this.moveCursor(match[0]);
      this.popState();
    } else {
      this.lexExpression();
    }
  }

  private pushToken(tokenType: TokenType, value = ''): void {
    // do not push empty text tokens
    if (tokenType.name === 'text' && '' === value) {
      return;
    }

    this.tokens.push({
      image: String(value),
      startOffset: 0,
      startLine: this.lineno,
      tokenType,
      tokenTypeIdx: tokenType.tokenTypeIdx!,
      payload: value,
    });
  }

  private moveCursor(text: string): void {
    this.cursor += text.length;
    this.lineno += text.match(/\n/g)?.length ?? 0;
  }

  // Just return a result of the original getOperatorRegex funcion
  private getOperatorRegex(): RegExp {
    return /(?<![\.\|])starts\s+with(?=[\s()\[{])|(?<![\.\|])ends\s+with(?=[\s()\[{])|(?<![\.\|])has\s+every(?=[\s()\[{])|(?<![\.\|])has\s+some(?=[\s()\[{])|(?<![\.\|])matches(?=[\s()\[{])|(?<![\.\|])not\s+in(?=[\s()\[{])|(?<![\.\|])is\s+not(?=[\s()\[{])|(?<![\.\|])b\-xor(?=[\s()\[{])|(?<![\.\|])b\-and(?=[\s()\[{])|(?<![\.\|])b\-or(?=[\s()\[{])|(?<![\.\|])not(?=[\s()\[{])|(?<![\.\|])and(?=[\s()\[{])|\<\=\>|(?<![\.\|])or(?=[\s()\[{])|\=\=|\!\=|\>\=|\<\=|(?<![\.\|])in(?=[\s()\[{])|\.\.|\/\/|(?<![\.\|])is(?=[\s()\[{])|\*\*|\?\?|\=|\-|\+|\<|\>|~|\*|\/|%/gy;
  }

  private pushState(state: number): void {
    this.states.push(this.state);
    this.state = state;
  }

  private popState(): void {
    if (0 === this.states.length) {
      throw new Error('Cannot pop state without a previous state.');
    }
    this.state = this.states.pop();
  }
}

function preg_quote(str: string, delimiter: string) {
  return (str + '').replace(
    new RegExp(
      '[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]',
      'g'
    ),
    '\\$&'
  );
}

function preg_match(
  re: RegExp,
  subject: string,
  matches = [],
  flags = 0 | PREG_OFFSET_CAPTURE,
  offset = 0
): boolean {
  const str = subject.substring(offset);

  // clear matches
  matches.length = 0;

  for (const match of str.matchAll(re)) {
    for (let i = 0; i < match.length; i++) {
      const item =
        flags === PREG_OFFSET_CAPTURE
          ? [match[i], match.index + offset]
          : match[i];

      matches.push(item);
    }
  }

  return matches.length > 0;
}
