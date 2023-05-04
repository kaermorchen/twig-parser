import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { parse } from 'twig-parser';

export default class PlayController extends Controller {
  @tracked
  code = 'hello';

  get ast() {
    const { ast } = parse(this.code);

    return JSON.stringify(ast, null, 2);
  }
}
