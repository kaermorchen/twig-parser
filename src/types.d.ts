import {
  Parent as UnistParent,
  Literal as UnistLiteral,
  Node as UnistNode,
} from 'unist';

declare module 'twigast' {
  export { UnistNode as Node };

  export interface TemplateContentMap {
    text: Text;
    block: Block;
    variable: Variable;
    comment: Comment;
  }

  export type TemplateContent = TemplateContentMap[keyof TemplateContentMap];

  export interface Text extends UnistLiteral {
    type: 'text';
  }

  export interface Variable extends UnistLiteral {
    type: 'variable';
  }

  export interface Comment extends UnistLiteral<string> {
    type: 'comment';
  }

  export interface Block extends UnistParent {
    type: 'block';
    children: TemplateContent[];
  }

  export interface Template extends UnistParent {
    type: 'template';
    children: TemplateContent[];
  }
}
