# Twig Parser

This tool transforms twig tempalte to AST.

## How to use it
```js
import { parse } from 'twig-parser';

const twig = `
  {% set foo = range(0, 3) %}

  {% for i in foo %}
      {{ i }},
  {% endfor %}
`

const { ast, tokens, errors } = parse(twig);
```

## Notes
1. [Whitespace trimming](https://twig.symfony.com/doc/3.x/templates.html#whitespace-control) is not supported
1. The body of the verbatim tag is parsed as a regular template
