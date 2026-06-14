// NodeIcon.js
// Renders a node type's glyph (declared in the registry), tinted with --accent.
// Used in both the palette chips and the node headers.

import { NODE_TYPES } from './nodes/registry';

export const NodeIcon = ({ type, size = 18 }) => {
  const glyph = NODE_TYPES[type]?.icon;
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="node-icon"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
};
