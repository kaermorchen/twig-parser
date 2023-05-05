import { module, test } from 'qunit';
import { setupTest } from 'website/tests/helpers';

module('Unit | Route | play', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:play');
    assert.ok(route);
  });
});
