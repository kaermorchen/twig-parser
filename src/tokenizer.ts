import Lexer from "./lexer";

const lexer = new Lexer();

console.log(lexer.tokenize('{# "23" #}'));
