import LexerState from "./enums/lexer-state.js";
import Token from "./token.js";

export default class Lexer {
  protected position: number;
  protected state: LexerState;
  protected source: string;

  constructor(document: string) {
    this.source = document.replace(/\r\n?/gm, '\n');

    this.position = 0;
    this.state = LexerState.STATE_DATA;

    this.tokenize();
  }

  protected tokenize(): Token[] {

  }

  public get done(): boolean {
    return this.offset >= this.tokens.length - 1;
  }

  public get offset(): number {
    return this.position;
  }
}
