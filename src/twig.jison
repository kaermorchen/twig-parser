%lex

TRIM_CHAR [~-]
ANY_CHAR [\s\S]

VAR_START_TYPE \{\{{TRIM_CHAR}?\s*
VAR_END_TYPE \s*{TRIM_CHAR}?\}\}

BLOCK_START_TYPE \{\%{TRIM_CHAR}?
BLOCK_END_TYPE {TRIM_CHAR}?\%\}

COMMENT_START_TYPE \{\#{TRIM_CHAR}?
COMMENT_END_TYPE {TRIM_CHAR}?\#\}

TEXT [^{]+

%x VariableBlock
%options flex
%%

{VAR_START_TYPE}                    this.pushState("VariableBlock"); return "VAR_START_TYPE";
<VariableBlock>{VAR_END_TYPE}       this.popState(); return "VAR_END_TYPE";
<VariableBlock>\s+  /* skip whitespaces */
<VariableBlock>.*?(?={VAR_END_TYPE})  return "Comment";

{TEXT}                              return "TEXT";
<<EOF>>                            return "EOF";

%%
/lex

%start Program
%%

Program
  : ElementList EOF
  ;

ElementList
  : Element -> [$1]
  | ElementList Element -> $1.concat($2)
  ;

Element
  : Block
  | Text
  ;

Text
  : TEXT -> {type: 'Text', value: $1}
  ;

Block
  : VariableBlock
  ;

VariableBlock
  : VAR_START_TYPE Comment VAR_END_TYPE -> {type: 'VariableBlock', value: $2}
  ;
