import type { Node, Position } from 'unist';
import { u } from 'unist-builder';
import { source } from 'unist-util-source';
import type { VFile } from 'vfile';
import TokenKind from './enums/token-kind.js';
import Lexer from './lexer.js';

class Parser {
  protected readonly lexer: Lexer;

  constructor(document: string, file: VFile) {
    this.lexer = new Lexer(document, file);
  }

  public override parse(): Node {

  }

  protected parseComment(token: Token, k: number) {

  }

  protected source(value: Node | Position): Nullable<string> {
    return source(value, this.lexer.file);
  }
}

export default Parser;
