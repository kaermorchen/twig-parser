export enum NodeKind {
  AdditiveExpression = 'AdditiveExpression',
  ApplyStatement = 'ApplyStatement',
  Arguments = 'Arguments',
  ArrayLiteral = 'ArrayLiteral',
  ArrowFunction = 'ArrowFunction',
  ArrowParameters = 'ArrowParameters',
  AsOperator = 'AsOperator',
  AssignmentExpression = 'AssignmentExpression',
  AssignmentExpression_In = 'AssignmentExpression_In',
  AssociativityExpression = 'AssociativityExpression',
  AutoescapeStatement = 'AutoescapeStatement',
  BinaryExpression = 'BinaryExpression',
  BitwiseANDExpression = 'BitwiseANDExpression',
  BitwiseANDExpression_In = 'BitwiseANDExpression_In',
  BitwiseORExpression = 'BitwiseORExpression',
  BitwiseORExpression_In = 'BitwiseORExpression_In',
  BitwiseXORExpression = 'BitwiseXORExpression',
  BitwiseXORExpression_In = 'BitwiseXORExpression_In',
  BlockInlineStatement = 'BlockInlineStatement',
  BlockStatement = 'BlockStatement',
  BooleanLiteral = 'BooleanLiteral',
  BoxMemberExpression = 'BoxMemberExpression',
  CacheStatement = 'CacheStatement',
  CallExpression = 'CallExpression',
  CoalesceExpression = 'CoalesceExpression',
  CoalesceExpression_In = 'CoalesceExpression_In',
  Comment = 'Comment',
  ConcatExpression = 'ConcatExpression',
  ConditionalExpression = 'ConditionalExpression',
  ConditionalExpression_In = 'ConditionalExpression_In',
  DeprecatedStatement = 'DeprecatedStatement',
  DoStatement = 'DoStatement',
  DotMemberExpression = 'DotMemberExpression',
  EmbedStatement = 'EmbedStatement',
  EqualityExpression = 'EqualityExpression',
  EqualityExpression_In = 'EqualityExpression_In',
  ExponentiationExpression = 'ExponentiationExpression',
  Expression = 'Expression',
  ExpressionList = 'ExpressionList',
  ExpressionList_In = 'ExpressionList_In',
  Expression_In = 'Expression_In',
  ExtendsStatement = 'ExtendsStatement',
  Filter = 'Filter',
  FilterExpression = 'FilterExpression',
  FilterExpression_In = 'FilterExpression_In',
  FlushStatement = 'FlushStatement',
  ForInStatement = 'ForInStatement',
  FormThemeStatement = 'FormThemeStatement',
  FromStatement = 'FromStatement',
  Identifier = 'Identifier',
  IfStatement = 'IfStatement',
  ImportStatement = 'ImportStatement',
  IncludeStatement = 'IncludeStatement',
  InterpolationExpression = 'InterpolationExpression',
  LeftHandSideExpression = 'LeftHandSideExpression',
  Literal = 'Literal',
  LogicalANDExpression = 'LogicalANDExpression',
  LogicalANDExpression_In = 'LogicalANDExpression_In',
  LogicalORExpression = 'LogicalORExpression',
  LogicalORExpression_In = 'LogicalORExpression_In',
  MacroStatement = 'MacroStatement',
  MemberExpression = 'MemberExpression',
  MultiplicativeExpression = 'MultiplicativeExpression',
  NamedArgument = 'NamedArgument',
  Node = 'Node',
  NullLiteral = 'NullLiteral',
  NumericLiteral = 'NumericLiteral',
  ObjectLiteral = 'ObjectLiteral',
  ParenthesizedExpression = 'ParenthesizedExpression',
  PrimaryExpression = 'PrimaryExpression',
  Property = 'Property',
  PropertyName = 'PropertyName',
  RangeExpression = 'RangeExpression',
  RelationalExpression = 'RelationalExpression',
  RelationalExpression_In = 'RelationalExpression_In',
  SandboxStatement = 'SandboxStatement',
  SetBlockStatement = 'SetBlockStatement',
  SetInlineStatement = 'SetInlineStatement',
  SetStatement = 'SetStatement',
  SingleParamArrowFunction = 'SingleParamArrowFunction',
  SourceElement = 'SourceElement',
  SourceElementList = 'SourceElementList',
  Statement = 'Statement',
  StopwatchStatement = 'StopwatchStatement',
  StringInterpolation = 'StringInterpolation',
  StringLiteral = 'StringLiteral',
  Template = 'Template',
  Text = 'Text',
  TransDefaultDomainStatement = 'TransDefaultDomainStatement',
  TransStatement = 'TransStatement',
  UnaryExpression = 'UnaryExpression',
  UpdateExpression = 'UpdateExpression',
  UseStatement = 'UseStatement',
  VariableDeclaration = 'VariableDeclaration',
  VariableDeclarationList = 'VariableDeclarationList',
  VariableStatement = 'VariableStatement',
  VerbatimStatement = 'VerbatimStatement',
  WithStatement = 'WithStatement',
}

export interface Node {
  type: NodeKind;
}

export interface Identifier extends Node {
  type: NodeKind.Identifier;
  name: string;
}

export interface StringLiteral extends Node {
  type: NodeKind.StringLiteral;
  value: string;
}

export interface NumericLiteral extends Node {
  type: NodeKind.NumericLiteral;
  value: number;
}

export interface BooleanLiteral extends Node {
  type: NodeKind.BooleanLiteral;
  value: boolean;
}

export interface NullLiteral extends Node {
  type: NodeKind.NullLiteral;
  value: null;
}

export type Literal =
  | NullLiteral
  | BooleanLiteral
  | NumericLiteral
  | StringLiteral;

export interface InterpolationExpression extends Node {
  type: NodeKind.InterpolationExpression;
  expression: Expression;
}

export interface StringInterpolation extends Node {
  type: NodeKind.StringInterpolation;
  body: Array<InterpolationExpression | StringLiteral>;
}

export interface Property extends Node {
  type: NodeKind.Property;
  key: Literal | Identifier;
  value: Expression;
  shorthand: boolean;
}

export interface ObjectLiteral extends Node {
  type: NodeKind.ObjectLiteral;
  properties: Property[];
}

export interface ArrayLiteral extends Node {
  type: NodeKind.ArrayLiteral;
  elements: AssignmentExpression_In[];
}

export type PrimaryExpression =
  | ParenthesizedExpression
  | ArrowFunction
  | Identifier
  | Literal
  | StringInterpolation
  | ArrayLiteral
  | ObjectLiteral;

export type PropertyName =
  | Identifier
  | StringLiteral
  | NumericLiteral
  | AssignmentExpression_In;

export type LeftHandSideExpression =
  | PrimaryExpression
  | MemberExpression
  | CallExpression;

export type BoxMemberExpression = Expression_In;
export type DotMemberExpression = Identifier;

export interface NamedArgument extends Node {
  type: NodeKind.NamedArgument;
  key: Identifier;
  value: AssignmentExpression_In;
}

export interface MemberExpression extends Node {
  type: NodeKind.MemberExpression;
  object: PrimaryExpression;
  property: BoxMemberExpression | DotMemberExpression;
}

export type Arguments = Array<NamedArgument | AssignmentExpression_In>;
export type ParenthesizedExpression = Expression;
export type ArrowParameters = Array<Identifier>;

export interface ArrowFunction extends Node {
  type: NodeKind.ArrowFunction;
  body: AssignmentExpression;
  params: Identifier[];
}

export type UpdateExpression = LeftHandSideExpression;

export type UnaryExpression =
  | UpdateExpression
  | {
      type: NodeKind.UnaryExpression;
      operator: string;
      argument: UnaryExpression | UpdateExpression;
    };

export type EqualityExpression_In = RelationalExpression_In | BinaryExpression;

export interface BinaryExpression extends Node {
  type: NodeKind.BinaryExpression;
  left: Expression;
  operator: string;
  right: Expression;
}

export type CoalesceExpression = LogicalORExpression | BinaryExpression;

export type ConditionalExpression =
  | CoalesceExpression
  | {
      type: NodeKind.ConditionalExpression;
      test: BinaryExpression;
      consequent: AssignmentExpression_In;
      alternate: AssignmentExpression;
    };

export interface Text extends Node {
  type: NodeKind.Text;
  value: string;
}

export interface Comment extends Node {
  type: NodeKind.Comment;
  value: string;
}

export interface VariableStatement extends Node {
  type: NodeKind.VariableStatement;
  value: Expression;
}

export type SourceElement = Text | Comment | VariableStatement | Statement;
export type SourceElementList = SourceElement[];

export interface Template extends Node {
  type: NodeKind.Template;
  body: SourceElementList;
}

export interface StopwatchStatement extends Node {
  type: NodeKind.StopwatchStatement;
  event_name: Expression;
  body: SourceElementList;
}

export interface TransDefaultDomainStatement extends Node {
  type: NodeKind.TransDefaultDomainStatement;
  domain: Expression;
}

export interface TransStatement extends Node {
  type: NodeKind.TransStatement;
  vars?: Expression;
  domain?: Expression;
  locale?: Expression;
  body: SourceElementList;
}

export interface FormThemeStatement extends Node {
  type: NodeKind.FormThemeStatement;
  form: Expression;
  resources: Expression | Expression[];
  only: boolean;
}

export interface VerbatimStatement extends Node {
  type: NodeKind.VerbatimStatement;
  body: SourceElementList;
}

export interface EmbedStatement extends Node {
  type: NodeKind.EmbedStatement;
  expr: Expression;
  variables: Expression;
  ignoreMissing: boolean;
  only: boolean;
  body: SourceElementList;
}

export interface FromStatement extends Node {
  type: NodeKind.FromStatement;
  expr: Expression;
  variables: Array<AsOperator | Identifier>;
}

export interface ImportStatement extends Node {
  type: NodeKind.ImportStatement;
  expr: Expression;
  name: Identifier;
}

export interface MacroStatement extends Node {
  type: NodeKind.MacroStatement;
  name: Identifier;
  arguments: Arguments;
  body: SourceElementList;
}

export interface IncludeStatement extends Node {
  type: NodeKind.IncludeStatement;
  expr: Expression;
  variables: Expression;
  ignoreMissing: boolean;
  only: boolean;
}

export interface SandboxStatement extends Node {
  type: NodeKind.SandboxStatement;
  body: SourceElementList;
}

export interface UseStatement extends Node {
  type: NodeKind.UseStatement;
  name: Expression;
  importedBlocks: BinaryExpression[];
}

export type AsOperator = BinaryExpression;

export interface WithStatement extends Node {
  type: NodeKind.WithStatement;
  expr: Expression;
  body: SourceElementList;
  accessToOuterScope: boolean;
}

export interface ExtendsStatement extends Node {
  type: NodeKind.ExtendsStatement;
  expr: Expression;
}

export interface BlockStatement extends Node {
  type: NodeKind.BlockStatement;
  name: Identifier;
  body: SourceElementList;
  shortcut: boolean;
}

export interface BlockInlineStatement extends Node {
  type: NodeKind.BlockStatement;
  name: Identifier;
  body: SourceElementList | Expression;
  shortcut: boolean;
}

export interface FlushStatement extends Node {
  type: NodeKind.FlushStatement;
}

export interface DoStatement extends Node {
  type: NodeKind.DoStatement;
  expr: Expression;
}

export interface DeprecatedStatement extends Node {
  type: NodeKind.DeprecatedStatement;
  expr: Expression;
}

export interface CacheStatement extends Node {
  type: NodeKind.CacheStatement;
  expiration: Expression;
  key: Expression;
  value: SourceElementList;
}

export interface AutoescapeStatement extends Node {
  type: NodeKind.AutoescapeStatement;
  strategy: StringLiteral | BooleanLiteral;
  value: SourceElementList;
}

export interface IfStatement extends Node {
  type: NodeKind.IfStatement;
  test: Expression;
  consequent: SourceElementList;
  alternate: SourceElementList | IfStatement;
}

export interface ForInStatement extends Node {
  type: NodeKind.ForInStatement;
  variables: VariableDeclarationList;
  expression: Expression;
  body: SourceElementList;
  alternate: SourceElement;
}

export interface ApplyStatement extends Node {
  type: NodeKind.ApplyStatement;
  text: Text;
  filter: Filter | FilterExpression;
}

export type FilterExpression =
  | AssignmentExpression
  | {
      type: NodeKind.FilterExpression;
      expression: AssignmentExpression | FilterExpression;
      filter: Filter;
    };

export interface VariableDeclaration extends Node {
  type: NodeKind.VariableDeclaration;
  name: Identifier;
  init: Text;
}

export interface SetStatement extends Node {
  type: NodeKind.SetStatement;
  declarations: VariableDeclaration[];
}

export type SetBlockStatement = SetStatement;
export type SetInlineStatement = SetStatement;

export type Statement =
  | SetInlineStatement
  | SetBlockStatement
  | ApplyStatement
  | ForInStatement
  | IfStatement
  | AutoescapeStatement
  | CacheStatement
  | DeprecatedStatement
  | DoStatement
  | FlushStatement
  | BlockInlineStatement
  | BlockStatement
  | ExtendsStatement
  | WithStatement
  | UseStatement
  | SandboxStatement
  | IncludeStatement
  | MacroStatement
  | ImportStatement
  | FromStatement
  | EmbedStatement
  | VerbatimStatement
  | FormThemeStatement
  | TransStatement
  | TransDefaultDomainStatement
  | StopwatchStatement;

export type VariableDeclarationList = Identifier[];

export interface VariableStatement extends Node {
  type: NodeKind.VariableStatement;
  value: Expression;
}

export type ExpressionList = Expression[];
export type ExpressionList_In = Expression_In[];
export type Expression = FilterExpression;

export interface CallExpression extends Node {
  type: NodeKind.CallExpression;
  callee: Identifier;
  arguments: Arguments;
}

export type Filter = Identifier | CallExpression;
export type AssignmentExpression_In = ConditionalExpression_In;
export type AssignmentExpression = ConditionalExpression;
export type ConditionalExpression_In = CoalesceExpression_In | ConditionalExpression;
export type Expression_In = FilterExpression_In;
export type FilterExpression_In = AssignmentExpression_In | FilterExpression;
export type RelationalExpression_In = UnaryExpression | BinaryExpression;
export type CoalesceExpression_In = BinaryExpression;

export type ExponentiationExpression = UnaryExpression | BinaryExpression;
export type AssociativityExpression = ExponentiationExpression | BinaryExpression;
export type MultiplicativeExpression = AssociativityExpression | BinaryExpression;
export type ConcatExpression = MultiplicativeExpression | BinaryExpression;
export type AdditiveExpression = ConcatExpression | BinaryExpression;
export type RangeExpression = AdditiveExpression | BinaryExpression;
export type RelationalExpression = RangeExpression | BinaryExpression;
export type EqualityExpression = RelationalExpression | BinaryExpression;
export type BitwiseANDExpression = EqualityExpression | BinaryExpression;
export type BitwiseANDExpression_In = EqualityExpression_In | BinaryExpression;
export type BitwiseXORExpression = BitwiseANDExpression | BinaryExpression;
export type BitwiseXORExpression_In = BitwiseANDExpression_In | BinaryExpression;
export type BitwiseORExpression = BitwiseXORExpression | BinaryExpression;
export type BitwiseORExpression_In = BitwiseXORExpression_In | BinaryExpression;
export type LogicalANDExpression = BitwiseORExpression | BinaryExpression;
export type LogicalANDExpression_In = BitwiseORExpression_In | BinaryExpression;
export type LogicalORExpression = LogicalANDExpression | BinaryExpression;
export type LogicalORExpression_In = LogicalANDExpression_In | BinaryExpression;
