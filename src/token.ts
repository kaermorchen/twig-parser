// export enum TokenType {
//   EOF_TYPE = 'EOF_TYPE',
//   TEXT_TYPE = 'TEXT_TYPE',
//   BLOCK_START_TYPE = 'BLOCK_START_TYPE',
//   VAR_START_TYPE = 'VAR_START_TYPE',
//   BLOCK_END_TYPE = 'BLOCK_END_TYPE',
//   VAR_END_TYPE = 'VAR_END_TYPE',
//   NAME_TYPE = 'NAME_TYPE',
//   NUMBER_TYPE = 'NUMBER_TYPE',
//   STRING_TYPE = 'STRING_TYPE',
//   OPERATOR_TYPE = 'OPERATOR_TYPE',
//   PUNCTUATION_TYPE = 'PUNCTUATION_TYPE',
//   INTERPOLATION_START_TYPE = 'INTERPOLATION_START_TYPE',
//   INTERPOLATION_END_TYPE = 'INTERPOLATION_END_TYPE',
//   ARROW_TYPE = 'ARROW_TYPE',
// }

// export class Token {
//   private type: keyof TokenType;
//   private value: unknown;

//   public constructor(type: keyof TokenType, value: unknown) {
//     this.type = type;
//     this.value = value;
//   }
// }

export class Token {
  private value;
  private type;
  private lineno;

  public static EOF_TYPE = -1;
  public static TEXT_TYPE = 0;
  public static BLOCK_START_TYPE = 1;
  public static VAR_START_TYPE = 2;
  public static BLOCK_END_TYPE = 3;
  public static VAR_END_TYPE = 4;
  public static NAME_TYPE = 5;
  public static NUMBER_TYPE = 6;
  public static STRING_TYPE = 7;
  public static OPERATOR_TYPE = 8;
  public static PUNCTUATION_TYPE = 9;
  public static INTERPOLATION_START_TYPE = 10;
  public static INTERPOLATION_END_TYPE = 11;
  public static ARROW_TYPE = 12;

  public constructor(type_: number, value, lineno: number) {
    this.type = type_;
    this.value = value;
    this.lineno = lineno;
  }

  public toString() {
    return `${Token.typeToString(this.type, true)} ${this.value}`;
  }

  /**
   * Tests the current token for a type and/or a value.
   *
   * Parameters may be:
   *  * just type
   *  * type and value (or array of possible values)
   *  * just value (or array of possible values) (NAME_TYPE is used as type)
   *
   * @param array|string|int  $type   The type to test
   * @param array|string|null $values The token value
   */
  public test(
    type_: unknown[] | string | number,
    values: unknown[] | string | null = null
  ): boolean {
    if (null === values && !Number.isInteger(type_)) {
      values = type_;
      type_ = Token.NAME_TYPE;
    }
    return (
      this.type === type_ &&
      (null === values ||
        (Array.isArray(values) && this.value.includes(values)) ||
        this.value == values)
    );
  }
  public getLine(): number {
    return this.lineno;
  }
  public getType(): number {
    return this.type;
  }
  public getValue() {
    return this.value;
  }
  public static typeToString(type_: number, short = false): string {
    let name;
    switch (type_) {
      case Token.EOF_TYPE:
        name = 'EOF_TYPE';
        break;
      case Token.TEXT_TYPE:
        name = 'TEXT_TYPE';
        break;
      case Token.BLOCK_START_TYPE:
        name = 'BLOCK_START_TYPE';
        break;
      case Token.VAR_START_TYPE:
        name = 'VAR_START_TYPE';
        break;
      case Token.BLOCK_END_TYPE:
        name = 'BLOCK_END_TYPE';
        break;
      case Token.VAR_END_TYPE:
        name = 'VAR_END_TYPE';
        break;
      case Token.NAME_TYPE:
        name = 'NAME_TYPE';
        break;
      case Token.NUMBER_TYPE:
        name = 'NUMBER_TYPE';
        break;
      case Token.STRING_TYPE:
        name = 'STRING_TYPE';
        break;
      case Token.OPERATOR_TYPE:
        name = 'OPERATOR_TYPE';
        break;
      case Token.PUNCTUATION_TYPE:
        name = 'PUNCTUATION_TYPE';
        break;
      case Token.INTERPOLATION_START_TYPE:
        name = 'INTERPOLATION_START_TYPE';
        break;
      case Token.INTERPOLATION_END_TYPE:
        name = 'INTERPOLATION_END_TYPE';
        break;
      case Token.ARROW_TYPE:
        name = 'ARROW_TYPE';
        break;
      default:
        throw new Error(`Token of type ${type_} does not exist.`);
    }
    return short ? name : 'Twig\\Token::' + name;
  }
  public static typeToEnglish(type_: number): string {
    switch (type_) {
      case Token.EOF_TYPE:
        return 'end of template';
      case Token.TEXT_TYPE:
        return 'text';
      case Token.BLOCK_START_TYPE:
        return 'begin of statement block';
      case Token.VAR_START_TYPE:
        return 'begin of print statement';
      case Token.BLOCK_END_TYPE:
        return 'end of statement block';
      case Token.VAR_END_TYPE:
        return 'end of print statement';
      case Token.NAME_TYPE:
        return 'name';
      case Token.NUMBER_TYPE:
        return 'number';
      case Token.STRING_TYPE:
        return 'string';
      case Token.OPERATOR_TYPE:
        return 'operator';
      case Token.PUNCTUATION_TYPE:
        return 'punctuation';
      case Token.INTERPOLATION_START_TYPE:
        return 'begin of string interpolation';
      case Token.INTERPOLATION_END_TYPE:
        return 'end of string interpolation';
      case Token.ARROW_TYPE:
        return 'arrow function';
      default:
        throw new Error(`Token of type ${type_} does not exist`);
    }
  }
}
