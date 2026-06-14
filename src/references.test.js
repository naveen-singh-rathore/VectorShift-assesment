import { refNameOf, resolveRef } from './references';

const nodes = [
  { id: 'customInput-1', type: 'customInput', data: {} },
  { id: 'customInput-2', type: 'customInput', data: { inputName: 'customer' } },
  { id: 'llm-1', type: 'llm', data: {} },
  { id: 'classifier-1', type: 'classifier', data: {} },
];

describe('refNameOf', () => {
  test('derives prefix_counter from the id', () => {
    expect(refNameOf(nodes[0])).toBe('input_1');
    expect(refNameOf(nodes[2])).toBe('llm_1');
  });

  test('uses the editable name field when set', () => {
    expect(refNameOf(nodes[1])).toBe('customer');
  });
});

describe('resolveRef', () => {
  test('single-output node resolves from a bare name', () => {
    expect(resolveRef('input_1', nodes)).toEqual({
      sourceId: 'customInput-1',
      sourceHandle: 'customInput-1-value',
    });
  });

  test('strips a {{ }} wrapper', () => {
    expect(resolveRef('{{ llm_1 }}', nodes)).toEqual({
      sourceId: 'llm-1',
      sourceHandle: 'llm-1-response',
    });
  });

  test('multi/dynamic-output node requires .handle', () => {
    expect(resolveRef('classifier_1', nodes)).toBeNull();
    expect(resolveRef('classifier_1.order', nodes)).toEqual({
      sourceId: 'classifier-1',
      sourceHandle: 'classifier-1-order',
    });
  });

  test('renamed node resolves by its new name', () => {
    expect(resolveRef('customer', nodes)).toEqual({
      sourceId: 'customInput-2',
      sourceHandle: 'customInput-2-value',
    });
  });

  test('unknown or empty reference returns null', () => {
    expect(resolveRef('nope', nodes)).toBeNull();
    expect(resolveRef('', nodes)).toBeNull();
  });
});
