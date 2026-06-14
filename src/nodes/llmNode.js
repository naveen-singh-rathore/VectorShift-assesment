// llmNode.js — declarative definition (assembled by registry.js)
export const llmNode = {
  type: 'llm',
  label: 'LLM',
  accent: '#c05cff',
  refPrefix: 'llm',
  outputs: ['response'],
  icon: (
    <>
      <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />
      <path d="M18.5 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  build: () => ({
    handles: [{ type: 'source', id: 'response', position: 'right' }],
    fields: [
      {
        name: 'model',
        label: 'Model',
        type: 'select',
        options: ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5', 'gpt-4o'],
        default: 'claude-opus-4-8',
      },
      { name: 'system', label: 'System', type: 'reference', placeholder: 'e.g. text_1' },
      { name: 'prompt', label: 'Prompt', type: 'reference', placeholder: 'e.g. classifier_1.order' },
      { name: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 1, step: 0.1, default: 0.7 },
      { name: 'maxTokens', label: 'Max Tokens', type: 'number', min: 1, max: 8192, default: 1024 },
    ],
  }),
};
