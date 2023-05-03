import { Node, NodeKind } from '../types.js';

export function isOfType<N extends Node>(
  node: unknown,
  type: NodeKind
): node is N {
  return (node as Node).type === type;
}
