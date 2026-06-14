// conditionNode.js — declarative definition (assembled by registry.js)
export const conditionNode = {
  type: 'condition',
  label: 'Condition',
  accent: '#fb7185',
  refPrefix: 'condition',
  outputs: [], // reference as condition_1.true / condition_1.false
  icon: (
    <>
      <path d="M4 12h6" />
      <path d="M10 12l6-5" />
      <path d="M10 12l6 5" />
    </>
  ),
  build: () => ({
    handles: [
      { type: 'target', id: 'input', position: 'left' },
      { type: 'source', id: 'true', position: 'right', style: { top: '33%' } },
      { type: 'source', id: 'false', position: 'right', style: { top: '66%' } },
    ],
    fields: [{ name: 'expression', label: 'If', type: 'text', default: 'confidence > 0.8' }],
  }),
};
