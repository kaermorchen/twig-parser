export enum NodeKind {
  AdditiveExpression = 'AdditiveExpression',
  ApplyStatement = 'ApplyStatement',
  Arguments = 'Arguments',
  ArrayLiteral = 'ArrayLiteral',
  ArrowFunction = 'ArrowFunction',
  ArrowFunctionBody = 'ArrowFunctionBody',
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
  PropertyAssignment = 'PropertyAssignment',
  PropertyDefinition = 'PropertyDefinition',
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

export type Literal = NullLiteral | BooleanLiteral | NumericLiteral | StringLiteral;

export interface InterpolationExpression extends Node {
  type: NodeKind.InterpolationExpression;
  expression: Expression
}

export interface StringInterpolation extends Node {
  type: NodeKind.StringInterpolation;
  body: Array<InterpolationExpression | StringLiteral>
}

export interface PropertyDefinition extends Node {
  type: NodeKind.PropertyDefinition;
  key: Literal | Identifier,
  value: Expression;
  shorthand: boolean,
}

export interface ObjectLiteral extends Node {
  type: NodeKind.ObjectLiteral;
  properties: PropertyDefinition[];
}

export interface ArrayLiteral extends Node {
  type: NodeKind.ArrayLiteral;
  elements: AssignmentExpression_In[];
}

export type PrimaryExpression = ParenthesizedExpression | ArrowFunctionBody | SingleParamArrowFunction | Identifier | Literal | StringInterpolation | ArrayLiteral | ObjectLiteral;
export type PropertyName = Identifier | StringLiteral | NumericLiteral | AssignmentExpression_In;
export type LeftHandSideExpression = PrimaryExpression | MemberExpression | CallExpression;

export type BoxMemberExpression = Expression_In;
export type DotMemberExpression = Identifier;

export interface NamedArgument extends Node {
  type: NodeKind.ArrayLiteral;
  key: Identifier;
  value: AssignmentExpression_In;
}

export type Arguments = Array<NamedArgument | AssignmentExpression_In>;
export type ParenthesizedExpression = Expression;
export type ArrowParameters = Array<Identifier>;
export type SingleParamArrowFunction = ArrowFunctionBody;

export interface ArrowFunctionBody extends Node {
  type: NodeKind.ArrowFunctionBody;
  body: AssignmentExpression;
  params: Identifier[];
}

export type UpdateExpression = LeftHandSideExpression;

export interface UnaryExpression extends Node {
  type: NodeKind.UnaryExpression;
  operator: string;
  argument: UnaryExpression | UpdateExpression;
}

export interface BinaryExpression extends Node {
  type: NodeKind.BinaryExpression;
  operator: string;
  left: Expression;
  right: Expression;
}

export interface ConditionalExpression extends Node {
  type: NodeKind.ConditionalExpression;
  test: BinaryExpression,
  consequent: AssignmentExpression_In,
  alternate: AssignmentExpression,
}

export interface Text extends Node {
  type: NodeKind.Text;
  value: string,
}

export interface Comment extends Node {
  type: NodeKind.Comment;
  value: string,
}

export interface VariableStatement extends Node {
  type: NodeKind.VariableStatement;
  value: Expression,
}

type SourceElement = Text | Comment | VariableStatement | Statement;
type SourceElementList = SourceElement[];

export interface Template extends Node {
  type: NodeKind.Template;
  body: SourceElementList,
}
