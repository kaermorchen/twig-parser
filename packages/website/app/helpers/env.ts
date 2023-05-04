import { helper } from '@ember/component/helper';
import { get } from '@ember/object';
import config from 'twig-parser-demo/config/environment';

export default helper(function env([path]: [keyof typeof config]) {
  return get(config, path);
});
