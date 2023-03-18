export enum TokenType {
  EOF_TYPE = 'EOF_TYPE',
  TEXT_TYPE = 'TEXT_TYPE',
  BLOCK_START_TYPE = 'BLOCK_START_TYPE',
  VAR_START_TYPE = 'VAR_START_TYPE',
  BLOCK_END_TYPE = 'BLOCK_END_TYPE',
  VAR_END_TYPE = 'VAR_END_TYPE',
  NAME_TYPE = 'NAME_TYPE',
  NUMBER_TYPE = 'NUMBER_TYPE',
  STRING_TYPE = 'STRING_TYPE',
  OPERATOR_TYPE = 'OPERATOR_TYPE',
  PUNCTUATION_TYPE = 'PUNCTUATION_TYPE',
  INTERPOLATION_START_TYPE = 'INTERPOLATION_START_TYPE',
  INTERPOLATION_END_TYPE = 'INTERPOLATION_END_TYPE',
  ARROW_TYPE = 'ARROW_TYPE',
}

export class Token {
  private type: keyof TokenType;
  private value: unknown;

  public constructor(type: keyof TokenType, value: unknown) {
    this.type = type;
    this.value = value;
  }
}
