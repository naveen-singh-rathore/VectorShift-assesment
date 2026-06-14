import { extractVariables } from './textVariables';

describe('extractVariables', () => {
  test('extracts unique variables in first-seen order', () => {
    expect(extractVariables('Hi {{name}}, {{topic}} and {{name}}')).toEqual(['name', 'topic']);
  });

  test('ignores invalid identifiers and empty braces', () => {
    expect(extractVariables('{{ 1bad }} {{ }} {{good}}')).toEqual(['good']);
  });

  test('allows surrounding spaces inside braces', () => {
    expect(extractVariables('{{  spaced  }}')).toEqual(['spaced']);
  });

  test('handles empty / undefined input', () => {
    expect(extractVariables('')).toEqual([]);
    expect(extractVariables()).toEqual([]);
  });
});
