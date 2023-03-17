import type { Node } from 'unist';
import type { VFile } from 'vfile';
import TokenKind from './enums/token-kind.js';
import Lexer from './lexer.js';
import { u } from 'unist-builder';
import Token from './token.js';

export class Parser<Tree extends Node = Node> {
  protected readonly lexer: Lexer;

  constructor(document: string, file: VFile) {
    this.lexer = new Lexer(document, file);
  }

  public parse(): Tree {
    const children = [];

    let index: number = 0;

    while (!this.lexer.done) {
      const k: number = index - this.lexer.offset;
      const token: Token = this.lexer.peek(k)!;

      switch (token.kind) {
        case value:
          children.push(this.parseText(token, k));
          break;
        default:
          break;
      }

      this.lexer.read(k);
      index++;
    }

    return u('Template', { children });
  }
}
