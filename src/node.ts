export default class Node {
  type = 'node';
  protected nodes: Node[];
  protected attributes: Record<string, unknown>;
  protected lineno: number;
  protected tag: string | null;

  constructor(
    nodes: Node[] = [],
    attributes: Record<string, unknown> = {},
    lineno: number = 0,
    tag: string | null = null
  ) {
    this.nodes = nodes;
    this.attributes = attributes;
    this.lineno = lineno;
    this.tag = tag;
  }

  toString() {
    return JSON.stringify(this);
  }
}
