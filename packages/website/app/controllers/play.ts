import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class PlayController extends Controller {
  @tracked
  code = 'hello';

  get ast() {
    return this.code;
  }
}
