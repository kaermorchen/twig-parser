/* lexical grammar */
%lex

VAR_START_TYPE        \{\{[~]?
VAR_END_TYPE          [~]?\}\}

%%

\s+                   /* skip whitespace */
.+                     return 'TEXT'

/lex

/* operator associations and precedence */

/* %left '+' '-' */


/* %start expressions */

%% /* language grammar */

Module
  :
  | Elements
  ;

Elements
  : Element
  | Elements Element
  ;

Element
  : Block
  | Text
  ;

Block
  : VAR_START_TYPE Text VAR_END_TYPE { return {type: 'Block'} }
  ;

Text
  :
  | TEXT
  | Text TEXT
  ;
