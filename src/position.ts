export class Position {
  line: number; //zero-based
  character: number; //zero-based

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }
}
