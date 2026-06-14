// apiNode.js — declarative definition (assembled by registry.js)
export const apiNode = {
  type: 'api',
  label: 'API',
  accent: '#ec4899',
  refPrefix: 'api',
  outputs: ['response'],
  icon: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.7 2.5 15.3 0 18" />
      <path d="M12 3c-2.5 2.7-2.5 15.3 0 18" />
    </>
  ),
  build: () => ({
    handles: [
      { type: 'target', id: 'body', position: 'left' },
      { type: 'source', id: 'response', position: 'right' },
    ],
    fields: [
      { name: 'url', label: 'URL', type: 'text', default: 'https://api.shoebox.com/send' },
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
  }),
};
