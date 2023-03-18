import type { VFile } from 'vfile';
import Grammar from './grammar.js';
import Reader from './reader.js';
import { Token, TokenType } from './token.js';

export enum LexerState {
  STATE_DATA = 'STATE_DATA',
  STATE_BLOCK = 'STATE_BLOCK',
  STATE_VAR = 'STATE_VAR',
  STATE_STRING = 'STATE_STRING',
  STATE_INTERPOLATION = 'STATE_INTERPOLATION',
}

export class Lexer {
  public readonly file: VFile;
  protected readonly grammar: Grammar;
  protected position: number;
  protected readonly reader: Reader;
  protected readonly sequence: Token[];
  protected state: LexerState;

  constructor(document: string, file: VFile) {
    file.value = document.replace(/\r\n/gm, '\n');

    this.file = file;
    this.grammar = new Grammar();
    this.position = -1;
    this.reader = new Reader(file.value);
    this.sequence = [];
    this.state =
      this.reader.eof || !this.grammar.COMMENT.test(file.value)
        ? LexerState.DONE
        : LexerState.READY;

    this.tokenize();
  }

  public get done(): boolean {
    return this.offset >= this.tokens.length - 1;
  }

  public get offset(): number {
    return this.position;
  }

  public get tokens(): Token[] {
    return this.sequence;
  }

  protected addToken(
    kind: keyof typeof TokenKind,
    k: number,
    value: Nullable<string> = null
  ): { sequenced: boolean; token: Token } {}

  public peek(k: number = 1): Nullable<Token> {
    return this.sequence[this.offset + k] ?? null;
  }

  public peekUntil(condition: Predicate<Token>, k: number = 1): Token[] {
    const peeked: Token[] = [];

    for (let j = k; j <= this.tokens.length; j++) {
      const token: Token = this.peek(j)!;

      peeked.push(token);

      if (condition(token, this.offset + j, this.tokens)) break;
    }

    return peeked;
  }

  public read(k: number = 1): Nullable<Token> {
    return this.sequence[(this.position += k)] ?? null;
  }

  protected tokenize(): void {
    for (const match of this.reader.peekUntil().matchAll(regex)) {
      const { groups = {}, index = 0, input = '' } = match;
      let { context: ctx = '' } = groups;

      // two empty lines => no comment context
      if (ctx !== '\n\n') {
        // trim context
        ctx = ctx.trim();

        /**
         * Index of comment context in source file.
         *
         * @const {number} offset
         */
        const offset: number = input.indexOf(ctx, index) + 1;

        // add context start and end tokens
        this.addToken('CONTEXT_START', offset, ctx);
        const { column, line } = this.tokens[this.tokens.length - 1]!.point;
        this.addToken('CONTEXT_END', offset + ctx.length, `${line}:${column}`);
      }
    }
  }
}
