import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { parse } from 'twig-parser';

export default class PlayController extends Controller {
  @tracked
  code = `{% set greeting = 'Hello World' %}

{{ greeting|lower }}

{% for i in range(low=1, high=10, step=2) %}
  {{ i }},
{% endfor %}`;

  get twig() {
    return parse(this.code);
  }

  get ast() {
    const ast = this.twig.ast;

    return JSON.stringify(ast, null, 2);
  }

  get errors() {
    const errors = this.twig.errors;

    return errors;
  }
}
