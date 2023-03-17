/**
 * @file Grammar
 * @module docast-parse/Grammar
 */

import { Kind, Modifier } from '@flex-development/docast';
import regexp from 'escape-string-regexp';
import { LexerState } from './enums';
import type Reader from './reader';

/**
 * Defines the syntax of tokens produced by [lexers][1].
 *
 * [1]: {@link ./lexer.ts}
 *
 * @class
 */
class Grammar {
  /**
   * Returns the regular expression for a docblock comment.
   *
   * @public
   *
   * @return {RegExp} Docblock comment regex
   */
  public get COMMENT(): RegExp {
    return /\/\*\*.*?\*\//gms;
  }

  /**
   * Returns the regular expression for a [`COMMENT_END` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.COMMENT_END` regex
   */
  public get COMMENT_END(): RegExp {
    return /\*\/$/;
  }

  /**
   * Returns the regular expression for a [`COMMENT_START` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.COMMENT_START` regex
   */
  public get COMMENT_START(): RegExp {
    return /^\/\*\*/;
  }

  /**
   * Returns the regular expression for an [`IDENTIFIER` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.IDENTIFIER` regex
   */
  public get IDENTIFIER(): RegExp {
    return /^(?<id>(?:[*#]?[$_\p{ID_Start}][$\u200C\u200D\p{ID_Continue}]*(?:(?:\.[$_\p{ID_Start}][$\u200C\u200D\p{ID_Continue}]*)+)?)|(?:["'].*?["'])|(?:\[[\w\s.:]+?\]))(?=[\n ?:(<]?)/su;
  }

  /**
   * Returns the regular expression for an ignorable comment.
   *
   * @public
   *
   * @return {RegExp} Ignorable comment regex
   */
  public get IGNORABLE_COMMENT(): RegExp {
    return /^(?<ignorable>(?:\/\*|\/\/)\s+.+?(?:(?:\s+\*\/)|(?=\n\s+\b)))/s;
  }

  /**
   * Returns the regular expression for an [`IMPLICIT_DESCRIPTION_END`
   * token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.IMPLICIT_DESCRIPTION_END` regex
   */
  public get IMPLICIT_DESCRIPTION_END(): RegExp {
    return /^(?:(?:(?:\n +\*\n)+ +\* +@)|(?:\n +\*\/)|(?: +\*\/))/;
  }

  /**
   * Returns the regular expression for an [`IMPLICIT_DESCRIPTION_START`
   * token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.IMPLICIT_DESCRIPTION_START` regex
   */
  public get IMPLICIT_DESCRIPTION_START(): RegExp {
    return /^[^@][\w\s,;'"\p{P}\p{S}]/u;
  }

  /**
   * Returns the regular expression for a [`KEYWORD` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.KEYWORD` regex
   */
  public get KEYWORD(): RegExp {
    /**
     * Keywords as regex pattern.
     *
     * @const {string} keywords
     */
    const keywords: string = [...this.keywords]
      .map((keyword) => regexp(keyword))
      .sort((keyword1, keyword2) => keyword2.length - keyword1.length)
      .join('|');

    return new RegExp(`^(?<keyword>${keywords})[\\n ]`);
  }

  /**
   * Returns the regular expression for a [`KIND` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.KIND` regex
   */
  public get KIND(): RegExp {
    /**
     * Syntax kinds as regex pattern.
     *
     * @const {string} kinds
     */
    const kinds: string = [...this.kinds]
      .map((kind) => regexp(kind).replace(' ', '\\s+'))
      .sort((kind1, kind2) => kind2.length - kind1.length)
      .join('|');

    return new RegExp(`^(?<kind>${kinds})[\\n (]`);
  }

  /**
   * Returns the regular expression for a [`MODIFIER` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.MODIFIER` regex
   */
  public get MODIFIER(): RegExp {
    /**
     * Modifier keywords as regex pattern.
     *
     * @const {string} kinds
     */
    const modifiers: string = [...this.modifiers]
      .map((modifier) => regexp(modifier).replace(' ', '\\s+'))
      .sort((modifier1, modifier2) => modifier2.length - modifier1.length)
      .join('|');

    return new RegExp(`^(?<modifier>${modifiers})[\\n ]`);
  }

  /**
   * Returns the regular expression for a [`TAG_BLOCK_END` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.TAG_BLOCK_END` regex
   */
  public get TAG_BLOCK_END(): RegExp {
    return /^(?=(?:\n +\* @\w+)|(?:\n +\*\n)|(?:\n +\*\/)|(?: +\*\/))/;
  }

  /**
   * Returns the regular expression for a [`TAG_BLOCK_START` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.TAG_BLOCK_START` regex
   */
  public get TAG_BLOCK_START(): RegExp {
    return /^@\S+\s+/;
  }

  /**
   * Returns the regular expression for a [`TAG_INLINE_START` token][1].
   *
   * [1]: {@link ../enums/token.ts}
   *
   * @public
   *
   * @return {RegExp} `TokenKind.TAG_INLINE_START` regex
   */
  public get TAG_INLINE(): RegExp {
    return /^(?<tag>{@\S+\s+.+?})/s;
  }

  /**
   * Returns a set of keywords.
   *
   * @public
   *
   * @return {Set<string>} Keywords
   */
  public get keywords(): Set<string> {
    return new Set<string>([
      'await',
      'break',
      'case',
      'catch',
      'continue',
      'debugger',
      'delete',
      'do',
      'else',
      'eval',
      'extends',
      'false',
      'finally',
      'for',
      'from',
      'if',
      'implements',
      'import',
      'in',
      'instanceof',
      'new',
      'null',
      'of',
      'package',
      'return',
      'satisfies',
      'super',
      'switch',
      'this',
      'throw',
      'true',
      'try',
      'typeof',
      'void',
      'while',
      'with',
      'yield',
      'yield*',
    ]);
  }

  /**
   * Returns a set of syntax kind keywords.
   *
   * @public
   *
   * @return {Set<Kind>} Syntax kind keywords
   */
  public get kinds(): Set<Kind> {
    return new Set<Kind>([
      Kind.ACCESSOR,
      Kind.CLASS,
      Kind.CONST,
      Kind.CONSTRUCTOR,
      Kind.ENUM,
      Kind.ENUM_CONST,
      Kind.FUNCTION,
      Kind.GENERATOR,
      Kind.GET,
      Kind.INTERFACE,
      Kind.LET,
      Kind.MODULE,
      Kind.NAMESPACE,
      Kind.SET,
      Kind.TYPE,
      Kind.VAR,
    ]);
  }

  /**
   * Returns a set of modifier keywords.
   *
   * @public
   *
   * @return {Set<Modifier>} Modifier keywords
   */
  public get modifiers(): Set<Modifier> {
    return new Set<Modifier>([
      Modifier.ABSTRACT,
      Modifier.ASYNC,
      Modifier.DECLARE,
      Modifier.DEFAULT,
      Modifier.EXPORT,
      Modifier.OVERRIDE,
      Modifier.PRIVATE,
      Modifier.PROTECTED,
      Modifier.PUBLIC,
      Modifier.READONLY,
      Modifier.STATIC,
    ]);
  }

  /**
   * Returns the regular expression for a docblock comment with or without
   * context.
   *
   * @public
   *
   * @param {number} indent - Current indent size
   * @param {number} [size=2] - Base indent size (in single-spaced characters)
   * @return {RegExp} Docblock comment regex
   */
  public docblock(indent: number, size: number = 2): RegExp {
    /**
     * Regular expression for a top level docblock comment.
     *
     * @const {RegExp} DOCBLOCK_TOP_LEVEL
     */
    const DOCBLOCK_TOP_LEVEL: RegExp =
      /(?<comment>(?<=^|\n)\/\*\*.*?\*\/)(?<context>(?:\n\n)|(?:\n.+?(?:(?=\n+\/\*\*)|(?=\n\n+\b)|(?=\n*$))))/gs;

    // return top level regex for ident level 0
    if (indent === 0) return DOCBLOCK_TOP_LEVEL;

    /**
     * Previous indent level.
     *
     * @const {number} prev
     */
    const prev: number = indent - size;

    return new RegExp(
      `(?<comment>(?<=\n {${indent}})\\/\\*\\*.*?\\*\\/)(?<context>(?:\\n\\n)|(?:\\n {${indent}}.+?(?:(?=\\n+ {${indent}}\\/)|(?=\\n\\n+ {${indent}}\\b)|(?=\\n {${prev}}[}]))))`,
      'gs'
    );
  }

  /**
   * Checks if an empty line has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at empty line
   */
  public emptyline(k: number, state: LexerState, reader: Reader): boolean {
    return state === LexerState.READY && /^\n\n$/.test(reader.peekUntil(k, k));
  }

  /**
   * Checks if the end of a comment has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at end of comment
   */
  public endComment(k: number, state: LexerState, reader: Reader): boolean {
    return (
      state === LexerState.COMMENT &&
      this.COMMENT_END.test(reader.peekUntil(k - 1, k))
    );
  }

  /**
   * Checks if the end of an implicit description has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at end of implicit description
   */
  public endImplicitDescription(
    k: number,
    state: LexerState,
    reader: Reader
  ): boolean {
    return (
      state === LexerState.IMPLICIT_DESCRIPTION &&
      this.IMPLICIT_DESCRIPTION_END.test(reader.peekUntil(k))
    );
  }

  /**
   * Checks if the end of a block tag has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at end of block tag
   */
  public endTagBlock(k: number, state: LexerState, reader: Reader): boolean {
    return (
      state === LexerState.TAG_BLOCK &&
      this.TAG_BLOCK_END.test(reader.peekUntil(k))
    );
  }

  /**
   * Checks if an identifier has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at identifier
   */
  public identifier(k: number, state: LexerState, reader: Reader): boolean {
    if (state !== LexerState.READY) return false;
    if (!/^[\n ]$/.test(reader.peek(k - 1))) return false;
    return this.IDENTIFIER.test(reader.peekUntil(k));
  }

  /**
   * Checks if an ignorable comment has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at beginning of ignorable comment
   */
  public ignorable(k: number, state: LexerState, reader: Reader): boolean {
    return (
      state === LexerState.READY &&
      this.IGNORABLE_COMMENT.test(reader.peekUntil(k))
    );
  }

  /**
   * Checks if a keyword has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at keyword
   */
  public keyword(k: number, state: LexerState, reader: Reader): boolean {
    if (state !== LexerState.READY) return false;
    if (!/^[\n ]$/.test(reader.peek(k - 1))) return false;
    return this.KEYWORD.test(reader.peekUntil(k));
  }

  /**
   * Checks if a syntax kind keyword has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at syntax kind keyword
   */
  public kind(k: number, state: LexerState, reader: Reader): boolean {
    if (state !== LexerState.READY) return false;
    if (!/^[\n ]$/.test(reader.peek(k - 1))) return false;
    return this.KIND.test(reader.peekUntil(k));
  }

  /**
   * Checks if a modifier keyword has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at modifier keyword
   */
  public modifier(k: number, state: LexerState, reader: Reader): boolean {
    if (state !== LexerState.READY) return false;
    if (!/^[\n ]$/.test(reader.peek(k - 1))) return false;
    return this.MODIFIER.test(reader.peekUntil(k));
  }

  /**
   * Checks if the beginning of a comment has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at beginning of comment
   */
  public startComment(k: number, state: LexerState, reader: Reader): boolean {
    return (
      state === LexerState.READY &&
      this.COMMENT_START.test(reader.peekUntil(k, k + 2))
    );
  }

  /**
   * Checks if the beginning of an implicit description has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at beginning of implicit description
   */
  public startImplicitDescription(
    k: number,
    state: LexerState,
    reader: Reader
  ): boolean {
    return (
      state === LexerState.COMMENT &&
      reader.peek(k - 2) === '*' &&
      reader.peek(k - 1) === ' ' &&
      this.IMPLICIT_DESCRIPTION_START.test(reader.peekUntil(k))
    );
  }

  /**
   * Checks if the beginning of a block tag has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at beginning of block tag
   */
  public startTagBlock(k: number, state: LexerState, reader: Reader): boolean {
    return (
      state === LexerState.COMMENT &&
      this.TAG_BLOCK_START.test(reader.peekUntil(k))
    );
  }

  /**
   * Checks if the beginning of an inline tag has been reached.
   *
   * @public
   *
   * @param {number} k - Difference between index of next `k`-th character and
   * current position in source file
   * @param {LexerState} state - Current lexer state
   * @param {Reader} reader - Character reader
   * @return {boolean} `true` if at beginning of inline tag
   */
  public startTagInline(k: number, state: LexerState, reader: Reader): boolean {
    /**
     * Lexer state check.
     *
     * @const {boolean} state_check
     */
    const state_check: boolean =
      state === LexerState.IMPLICIT_DESCRIPTION ||
      state === LexerState.TAG_BLOCK;

    return state_check && this.TAG_INLINE.test(reader.peekUntil(k));
  }
}

export default Grammar;
