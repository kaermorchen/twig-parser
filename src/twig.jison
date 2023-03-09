

%%

/* Module
  :
  | ElementList { return ast.Module($1) }
  ;

ElementList
  : Element
  | ElementList Element
  ;


Element
  : Text
  | Text
  ;

Text
  :
  | TEXT
  ;
*/

A
  : A x
  |
  ;
