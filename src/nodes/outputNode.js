// outputNode.js — declarative definition (assembled by registry.js)
export const outputNode = {
  type: 'customOutput',
  label: 'Output',
  accent: '#4f9dff',
  refPrefix: 'output',
  nameField: 'outputName',
  outputs: [],
  icon: (
    <>
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  build: (id) => ({
    handles: [{ type: 'target', id: 'value', position: 'left' }],
    fields: [
      { name: 'outputName', label: 'Name', type: 'text', default: id.replace('customOutput-', 'output_') },
      { name: 'outputType', label: 'Type', type: 'select', options: ['Text', 'Image'] },
    ],
  }),
};
