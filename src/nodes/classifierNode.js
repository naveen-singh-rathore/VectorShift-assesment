// classifierNode.js — declarative definition (assembled by registry.js)
// User-defined routing buckets: each typed category becomes a right output handle.
// The `inputs` field provides one or more always-present, draggable input handles.
const parseList = (raw) => [
  ...new Set((raw || '').split(',').map((s) => s.trim()).filter(Boolean)),
];

export const classifierNode = {
  type: 'classifier',
  label: 'Classifier',
  accent: '#a855f7',
  refPrefix: 'classifier',
  outputs: [], // dynamic -> reference as classifier_1.<category>
  icon: <path d="M3 5h18l-7 8v5l-4 2v-7z" />,
  build: (id, data) => {
    const categories = parseList(data?.categories ?? 'order, return, other');
    return {
      handles: categories.map((cat) => ({ type: 'source', id: cat, position: 'right' })),
      fields: [
        { name: 'inputs', label: 'Inputs', type: 'inputs', placeholder: 'e.g. input_1' },
        { name: 'categories', label: 'Categories', type: 'text', default: 'order, return, other', placeholder: 'comma, separated' },
      ],
    };
  },
};
