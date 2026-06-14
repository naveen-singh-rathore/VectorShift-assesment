// knowledgeBaseNode.js — declarative definition (assembled by registry.js)
export const knowledgeBaseNode = {
  type: 'knowledgeBase',
  label: 'Knowledge Base',
  accent: '#8b8cff',
  refPrefix: 'kb',
  outputs: ['results'],
  icon: (
    <>
      <path d="M12 4c4.4 0 8 1.2 8 2.7S16.4 9.4 12 9.4 4 8.2 4 6.7 7.6 4 12 4z" />
      <path d="M4 6.7v5.3c0 1.5 3.6 2.7 8 2.7s8-1.2 8-2.7V6.7" />
      <path d="M4 12v5.3C4 18.8 7.6 20 12 20s8-1.2 8-2.7V12" />
    </>
  ),
  build: () => ({
    handles: [
      { type: 'target', id: 'query', position: 'left' },
      { type: 'source', id: 'results', position: 'right' },
    ],
    fields: [
      { name: 'source', label: 'Source', type: 'select', options: ['Store Policies', 'Order History', 'Product Catalog'] },
    ],
  }),
};
