/**
 * @author Fabien Potencier <fabien@symfony.com>
 */
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
    public __toString() {
        return sprintf("%s(%s)", self.typeToString(this.type, true), this.value);
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
    public test(type_: unknown[] | string | number, values: unknown[] | string | null = null): boolean {
        if (null === values && !is_int(type_)) {
            values = type_;
            type_ = self.NAME_TYPE;
        }
        return this.type === type_ && (null === values || is_array(values) && in_array(this.value, values) || this.value == values);
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
    public static typeToString(type_: number, short: boolean = false): string {
        switch (type_) {
            case self.EOF_TYPE:
                name = "EOF_TYPE";
                break;
            case self.TEXT_TYPE:
                name = "TEXT_TYPE";
                break;
            case self.BLOCK_START_TYPE:
                name = "BLOCK_START_TYPE";
                break;
            case self.VAR_START_TYPE:
                name = "VAR_START_TYPE";
                break;
            case self.BLOCK_END_TYPE:
                name = "BLOCK_END_TYPE";
                break;
            case self.VAR_END_TYPE:
                name = "VAR_END_TYPE";
                break;
            case self.NAME_TYPE:
                name = "NAME_TYPE";
                break;
            case self.NUMBER_TYPE:
                name = "NUMBER_TYPE";
                break;
            case self.STRING_TYPE:
                name = "STRING_TYPE";
                break;
            case self.OPERATOR_TYPE:
                name = "OPERATOR_TYPE";
                break;
            case self.PUNCTUATION_TYPE:
                name = "PUNCTUATION_TYPE";
                break;
            case self.INTERPOLATION_START_TYPE:
                name = "INTERPOLATION_START_TYPE";
                break;
            case self.INTERPOLATION_END_TYPE:
                name = "INTERPOLATION_END_TYPE";
                break;
            case self.ARROW_TYPE:
                name = "ARROW_TYPE";
                break;
            default: throw new LogicException(sprintf("Token of type \"%s\" does not exist.", type_));
        }
        return short ? name : "Twig\\Token::" + name;
    }
    public static typeToEnglish(type_: number): string {
        switch (type_) {
            case self.EOF_TYPE: return "end of template";
            case self.TEXT_TYPE: return "text";
            case self.BLOCK_START_TYPE: return "begin of statement block";
            case self.VAR_START_TYPE: return "begin of print statement";
            case self.BLOCK_END_TYPE: return "end of statement block";
            case self.VAR_END_TYPE: return "end of print statement";
            case self.NAME_TYPE: return "name";
            case self.NUMBER_TYPE: return "number";
            case self.STRING_TYPE: return "string";
            case self.OPERATOR_TYPE: return "operator";
            case self.PUNCTUATION_TYPE: return "punctuation";
            case self.INTERPOLATION_START_TYPE: return "begin of string interpolation";
            case self.INTERPOLATION_END_TYPE: return "end of string interpolation";
            case self.ARROW_TYPE: return "arrow function";
            default: throw new LogicException(sprintf("Token of type \"%s\" does not exist.", type_));
        }
    }
}
