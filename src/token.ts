import LexerState from './enums/lexer-state';
import TokenKind from './enums/token-kind';

export default class Token implements Token {
  kind: TokenKind;
  state: LexerState;
}
