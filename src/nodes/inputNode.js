// inputNode.js — declarative definition (assembled by registry.js)
export const inputNode = {
  type: 'customInput',
  label: 'Input',
  accent: '#7c83ff',
  refPrefix: 'input',
  nameField: 'inputName',
  outputs: ['value'],
  icon: (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
  build: (id) => ({
    handles: [{ type: 'source', id: 'value', position: 'right' }],
    fields: [
      { name: 'inputName', label: 'Name', type: 'text', default: id.replace('customInput-', 'input_') },
      { name: 'inputType', label: 'Type', type: 'select', options: ['Text', 'File'] },
    ],
  }),
};
