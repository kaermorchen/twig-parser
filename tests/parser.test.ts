import { test, expect } from 'vitest';
import { tpl2asr } from './helpers.js';

test('Template', () => {
  expect(tpl2asr(''), 'Empty template').toMatchSnapshot();
  expect(tpl2asr('Hello world'), 'Only text').toMatchSnapshot();
});

// test('Variable', () => {
//   expect(tpl2asr('{{ }}'), 'Empty variable').toMatchSnapshot();
// });

// test('Name', () => {
//   expect(tpl2asr('{{ user }}')).toMatchSnapshot();
// });

// test('Number', () => {
//   expect(tpl2asr('{{ 0 }}'), 'Zero').toMatchSnapshot();
//   expect(tpl2asr('{{ 42 }}'), 'Integer').toMatchSnapshot();
//   expect(tpl2asr('{{ 42.23 }}'), 'Float').toMatchSnapshot();
// });

// test('String', () => {
//   expect(tpl2asr('{{ "Hello world" }}')).toMatchSnapshot();
//   expect(tpl2asr(`{{ 'Hello world' }}`)).toMatchSnapshot();
//   expect(tpl2asr(`{{ 'It\\'s good' }}`)).toMatchSnapshot();
// });
