import { test, expect } from 'vitest';
import { tpl2asr } from './helpers.js';

test('Template', () => {
  expect(tpl2asr(''), 'Empty template').toMatchSnapshot();
  expect(tpl2asr('Hello world'), 'Only text').toMatchSnapshot();
});

test('Comment', () => {
  expect(tpl2asr('{# #}'), 'Empty comment').toMatchSnapshot();
  expect(tpl2asr('{# This is a comment #}'), 'Singleline comment').toMatchSnapshot();
  expect(tpl2asr(`{#
    First line
    Second line
  #}`), 'Multiline comment').toMatchSnapshot();
});

test('Variable', () => {
  expect(tpl2asr('{{ }}'), 'Empty variable').toMatchSnapshot();
  expect(tpl2asr('{{ 42 }}'), 'Value').toMatchSnapshot();
});

test('Literals', () => {
  expect(tpl2asr('{{ 42 }}'), 'Integer').toMatchSnapshot();
  expect(tpl2asr('{{ 42.23 }}'), 'Float').toMatchSnapshot();
});

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
