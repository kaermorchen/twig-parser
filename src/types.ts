export enum NodeKind {
  Node = 'Node',
  Identifier = 'Identifier',
}

export interface Node {
  type: NodeKind;
}

export interface Identifier extends Node {
  type: NodeKind.Identifier;
  name: 'string'
}
