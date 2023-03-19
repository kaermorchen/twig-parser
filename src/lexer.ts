import { createToken, Lexer } from 'chevrotain';

const Text = createToken({
  name: 'Text',
  pattern: /[^{]+/,
  line_breaks: true,
});

// Comment
const TagCommentOpen = createToken({
  name: 'TagCommentOpen',
  pattern: /\{\#/,
  push_mode: 'COMMENT',
});

const TagCommentClose = createToken({
  name: 'TagCommentClose',
  pattern: /\#\}/,
  pop_mode: true,
});

const Comment = createToken({
  name: 'Comment',
  pattern: /(\s|\S)+(?=\#\})/,
  line_breaks: true,
});

// Variable
const TagVariableOpen = createToken({
  name: 'TagVariableOpen',
  pattern: /\{\{/,
  push_mode: 'VARIABLE',
});

const TagVariableClose = createToken({
  name: 'TagVariableClose',
  pattern: /\}\}/,
  pop_mode: true,
});

// Block
const TagBlockOpen = createToken({
  name: 'TagBlockOpen',
  pattern: /\{\%/,
  push_mode: 'BLOCK',
});

const TagBlockClose = createToken({
  name: 'TagBlockClose',
  pattern: /\%\}/,
  pop_mode: true,
});

// Expression
const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const ArrowFunction = createToken({
  name: 'ArrowFunction',
  pattern: /\=\>/,
});

const Operator = createToken({
  name: 'Operator',
  pattern: /not|\-|\+|or|and|b-or|b-xor|b-and|\=\=|\!\=|\<\=\>|\<|\>|\>\=|\<\=|not in|in|matches|starts with|ends with|\.\.|\+|\-|\~|\*|\/|\/\/|\%|is|is not|\*\*|\?\?/,
});

const Name = createToken({
  name: 'Name',
  pattern: /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/y,
});

const Number = createToken({
  name: 'Number',
  pattern: /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/y,
});

const String = createToken({
  name: 'String',
  pattern: /"([^#"\\\\]*(?:\\\\.[^#"\\\\]*)*)"|'([^'\\\\]*(?:\\\\.[^'\\\\]*)*)'/ys,
});

const Punctuation = createToken({
  name: 'Punctuation',
  pattern: //,
});

// Lexer
const Expressions = [
  WhiteSpace,
  ArrowFunction,
  Operator,
  Name,
  Number,
  String,
]

let TwigLexer = new Lexer({
  defaultMode: 'TEMPLATE',
  modes: {
    TEMPLATE: [Text, TagCommentOpen, TagVariableOpen, TagBlockOpen],
    COMMENT: [WhiteSpace, TagCommentClose],
    VARIABLE: Expressions.concat(TagVariableClose),
    BLOCK: Expressions.concat(TagBlockClose),
  },
});

const inputText = `
  Hello {{ '45' }}
`;
const tokens = TwigLexer.tokenize(inputText);

console.debug(tokens.tokens);

// import type { VFile } from 'vfile';
// import Grammar from './grammar.js';
// import Reader from './reader.js';
// import { Token, TokenType } from './token.js';

// export enum LexerState {
//   STATE_DATA = 'STATE_DATA',
//   STATE_BLOCK = 'STATE_BLOCK',
//   STATE_VAR = 'STATE_VAR',
//   STATE_STRING = 'STATE_STRING',
//   STATE_INTERPOLATION = 'STATE_INTERPOLATION',
// }

// export class Lexer {
//   public readonly file: VFile;
//   protected readonly grammar: Grammar;
//   protected position: number;
//   protected readonly reader: Reader;
//   protected readonly sequence: Token[];
//   protected state: LexerState;

//   constructor(document: string, file: VFile) {
//     file.value = document.replace(/\r\n/gm, '\n');

//     this.file = file;
//     this.grammar = new Grammar();
//     this.position = -1;
//     this.reader = new Reader(file.value);
//     this.sequence = [];
//     this.state =
//       this.reader.eof || !this.grammar.COMMENT.test(file.value)
//         ? LexerState.DONE
//         : LexerState.READY;

//     this.tokenize();
//   }

//   public get done(): boolean {
//     return this.offset >= this.tokens.length - 1;
//   }

//   public get offset(): number {
//     return this.position;
//   }

//   public get tokens(): Token[] {
//     return this.sequence;
//   }

//   protected addToken(
//     kind: keyof typeof TokenKind,
//     k: number,
//     value: Nullable<string> = null
//   ): { sequenced: boolean; token: Token } {}

//   public peek(k: number = 1): Nullable<Token> {
//     return this.sequence[this.offset + k] ?? null;
//   }

//   public peekUntil(condition: Predicate<Token>, k: number = 1): Token[] {
//     const peeked: Token[] = [];

//     for (let j = k; j <= this.tokens.length; j++) {
//       const token: Token = this.peek(j)!;

//       peeked.push(token);

//       if (condition(token, this.offset + j, this.tokens)) break;
//     }

//     return peeked;
//   }

//   public read(k: number = 1): Nullable<Token> {
//     return this.sequence[(this.position += k)] ?? null;
//   }

//   protected tokenize(): void {
//     for (const match of this.reader.peekUntil().matchAll(regex)) {
//       const { groups = {}, index = 0, input = '' } = match;
//       let { context: ctx = '' } = groups;

//       // two empty lines => no comment context
//       if (ctx !== '\n\n') {
//         // trim context
//         ctx = ctx.trim();

//         /**
//          * Index of comment context in source file.
//          *
//          * @const {number} offset
//          */
//         const offset: number = input.indexOf(ctx, index) + 1;

//         // add context start and end tokens
//         this.addToken('CONTEXT_START', offset, ctx);
//         const { column, line } = this.tokens[this.tokens.length - 1]!.point;
//         this.addToken('CONTEXT_END', offset + ctx.length, `${line}:${column}`);
//       }
//     }
//   }
// }
