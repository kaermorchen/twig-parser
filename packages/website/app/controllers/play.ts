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

  get ast() {
    const { ast } = parse(this.code);

    return JSON.stringify(ast, null, 2);
  }
}
