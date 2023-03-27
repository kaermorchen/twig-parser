import { test, expect } from 'vitest';
import { tpl2asr } from './helpers.js';

test('Template', () => {
  expect(tpl2asr(''), 'Empty template').toMatchSnapshot();
  expect(tpl2asr('Hello world'), 'Only text').toMatchSnapshot();
});
