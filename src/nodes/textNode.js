// textNode.js — declarative definition (assembled by registry.js)
// Part 3: {{variable}} in the text spawns a left input handle per variable, and
// the node auto-resizes (width here; height via the auto-growing textarea).
import { extractVariables } from './textVariables';

export const textNode = {
  type: 'text',
  label: 'Text',
  accent: '#2dd4bf',
  refPrefix: 'text',
  outputs: ['output'],
  icon: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h11" />
      <path d="M4 18h7" />
    </>
  ),
  build: (id, data) => {
    const text = data?.text ?? '{{input}}';
    const variables = extractVariables(text);
    const longestLine = Math.max(10, ...text.split('\n').map((l) => l.length));
    return {
      minWidth: Math.min(440, Math.max(210, longestLine * 7.5 + 36)),
      handles: [
        ...variables.map((v) => ({ type: 'target', id: v, position: 'left' })),
        { type: 'source', id: 'output', position: 'right' },
      ],
      fields: [{ name: 'text', label: 'Text', type: 'textarea', default: '{{input}}' }],
    };
  },
};
