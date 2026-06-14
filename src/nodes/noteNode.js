// noteNode.js — declarative definition (assembled by registry.js)
export const noteNode = {
  type: 'note',
  label: 'Note',
  accent: '#f5b14a',
  refPrefix: 'note',
  outputs: [],
  icon: (
    <>
      <path d="M5 4h9l5 5v11H5z" />
      <path d="M14 4v5h5" />
    </>
  ),
  build: () => ({
    variant: 'note',
    handles: [],
    fields: [{ name: 'text', label: '', type: 'textarea', default: 'Low-confidence cases go to a human.' }],
  }),
};
