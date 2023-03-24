import { createToken, CstParser, Lexer } from 'chevrotain';

const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const TagCommentOpen = createToken({
  name: 'TagCommentOpen',
  pattern: /\{\#/,
});

const TagCommentClose = createToken({
  name: 'TagCommentClose',
  pattern: /\#\}/,
});

const Text = createToken({
  name: 'Text',
  pattern: /(?:(?!\{[{%#][~-]?|[~-]?[{%#]\})[\s\S])+/,
  line_breaks: true,
});

// const Text = createToken({
//   name: 'Text',
//   pattern: (text: string, offset: number) => {
//     const lex_tokens_start = /[\s\S]+?(?=\{[{%#])/y;

//     lex_tokens_start.lastIndex = offset;

//     const execResult = lex_tokens_start.exec(text);

//     if (execResult !== null) {
//       return execResult;
//     } else {
//       return [text.substring(offset)];
//     }
//   },
//   line_breaks: true,
// });

// Lexer
let allTokens = [
  TagCommentOpen,
  TagCommentClose,

  WhiteSpace,
  Text,
];

const TwigLexer = new Lexer(allTokens);

// class TwigParser extends CstParser {
//   constructor() {
//     super(allTokens);

//     const $ = this;

//     // $.RULE('template', () => {
//     //   $.OR([{ ALT: () => $.CONSUME(Text) }]);
//     // });

//     $.RULE('comment', () => {
//       $.CONSUME(TagCommentOpen);
//       $.CONSUME(Text);
//       $.CONSUME(TagCommentClose);
//     });

//     this.performSelfAnalysis();
//   }
// }

// const parser = new TwigParser();

const text = `{# Comment #}`;

console.log(TwigLexer.tokenize(text).tokens);

// parser.input = TwigLexer.tokenize(text).tokens;
// parser.comment();

// if (parser.errors.length > 0) {
//   console.log(parser.errors);

// }
