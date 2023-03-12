%lex

Text [^<{]+

%x Block
%options flex
%%

{Text}                              return "TEXT";

"{#"                                this.begin("Block"); return "{#";
<Block>"#}"                         this.popState(); return "#}";
<Block>\s+                          /* skip whitespaces */
<Block>((?!\#\})(.|$|\r\n|\r|\n))*  return "Comment";

<<EOF>>                            return "EOF";

%%
/lex

%start Program
%%

Program
  : ElementList EOF
  ;

ElementList
  : -> []
  | Element -> [$1]
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
  : CommentBlock
  ;

CommentBlock
  : '{#' Comment '#}' -> {type: 'CommentBlock', value: $2}
  ;
