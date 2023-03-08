import { test, expect } from 'vitest';
import Parser from '../out/parser.js';

test('Empty twig', () => {
  const twig = `43`;

  expect(Parser.parse(twig)).toMatchSnapshot();
});
