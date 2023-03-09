import { readFileSync } from 'fs';
import Jison from 'jison-gho/dist/jison-es6';

const bnf = readFileSync('./src/twig.jison', 'utf8');

export default Jison.Parser(bnf);
