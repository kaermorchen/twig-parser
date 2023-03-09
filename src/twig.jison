/* lexical grammar */
%lex

VAR_START_TYPE \{\{(~|-)?
VAR_END_TYPE (~|-)?\}\}

BLOCK_START_TYPE \{\%(~|-)?
BLOCK_END_TYPE (~|-)?\%\}

COMMENT_START_TYPE \{\#(~|-)?
COMMENT_END_TYPE (~|-)?\#\}

%%

\s+                     /* skip whitespace */
.+                     /* skip whitespace */
/* .+?                           return 'TEXT' */
{VAR_START_TYPE}              return 'VAR_START_TYPE'
{VAR_END_TYPE}                return 'VAR_END_TYPE'
{BLOCK_START_TYPE}            return 'BLOCK_START_TYPE'
{BLOCK_END_TYPE}              return 'BLOCK_END_TYPE'
{COMMENT_START_TYPE}          return 'COMMENT_START_TYPE'
{COMMENT_END_TYPE}            return 'COMMENT_END_TYPE'

/lex

/* operator associations and precedence */

/* %left '+' '-' */


/* %start Block */

%% /* language grammar */

Module
  :
  | Elements -> {type: 'Module', body: $1}
  ;

Elements
  : Element -> [$1]
  | Elements Element -> $1.concat([$2])
  ;

Element
  : Text
  | Block
  | VariableBlock
  | CommentBlock
  ;

Block
  : BLOCK_START_TYPE Expression BLOCK_END_TYPE -> {type: 'Block', body: [$2]}
  ;

VariableBlock
  : VAR_START_TYPE Expression VAR_END_TYPE -> {type: 'VariableBlock', body: [$2]}
  ;

CommentBlock
  : VAR_START_TYPE Text VAR_END_TYPE -> {type: 'CommentBlock', body: [$2]}
  ;

Expression
  : Text
  |
  ;

Text
  :
  | TEXT -> {type: 'Text', value: $1}
  ;
