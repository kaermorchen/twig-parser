import { Token } from "../token.js";
import * as allTokens from "../tokens.js";

export default function getTokenType(tokenId: number) {
  switch (tokenId) {
    case Token.EOF_TYPE:
      return allTokens.EOF;
    case Token.TEXT_TYPE:
      return allTokens.text;
    case Token.BLOCK_START_TYPE:
      return allTokens.blockStart;
    case Token.VAR_START_TYPE:
      return allTokens.varStart;
    case Token.BLOCK_END_TYPE:
      return allTokens.blockEnd;
    case Token.VAR_END_TYPE:
      return allTokens.varEnd;
    case Token.NAME_TYPE:
      return allTokens.name;
    case Token.NUMBER_TYPE:
      return allTokens.number;
    case Token.STRING_TYPE:
      return allTokens.string;
    case Token.OPERATOR_TYPE:
      return allTokens.operator;
    case Token.PUNCTUATION_TYPE:
      return allTokens.punctuation;
    case Token.INTERPOLATION_START_TYPE:
      return allTokens.interpolationStart;
    case Token.INTERPOLATION_END_TYPE:
      return allTokens.interpolationEnd;
    case Token.ARROW_TYPE:
      return allTokens.arrow;
  }
}
