import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PlayController extends Controller {
  @action
  onCodeChanged(event: Event) {
    // console.log(event.target?.);
  }

  ast() {
    return { name: 'hello' };
  }
}
