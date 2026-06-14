// references.js
// --------------------------------------------------
// Pure helpers for VectorShift-style reference wiring: a node can reference
// another by a friendly name typed into a `reference`/`inputs` field — e.g.
// `input_1` or `classifier_1.order`. Kept free of React/store imports so it's
// easy to unit-test; the React hook lives in useReferenceWiring.js.
//
//   friendly name    = editable name field, else `${prefix}_${counter}` from id
//   reference syntax = `name`  or  `name.outputHandle` (multi-output nodes)
// --------------------------------------------------

import { NODE_TYPES } from './nodes/registry';

// Friendly reference name for a node. Uses the node's editable name field when
// the user set one (e.g. Input "Name"), else `prefix_counter` from the id.
export const refNameOf = (node) => {
  const meta = NODE_TYPES[node.type];
  const custom = meta?.nameField && node.data?.[meta.nameField];
  if (custom && custom.trim()) return custom.trim();
  const prefix = meta ? meta.refPrefix : node.type;
  return `${prefix}_${node.id.split('-').pop()}`;
};

// Resolve a typed reference to a concrete { sourceId, sourceHandle } or null.
export const resolveRef = (raw, nodes) => {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^\{\{\s*/, '').replace(/\s*\}\}$/, '');
  if (!cleaned) return null;
  const [name, handle] = cleaned.split('.').map((s) => s.trim());
  const node = nodes.find((n) => refNameOf(n) === name);
  if (!node) return null;
  const outputs = (NODE_TYPES[node.type] || {}).outputs || [];
  const handleName = handle || (outputs.length === 1 ? outputs[0] : null);
  if (!handleName) return null; // ambiguous bare ref on a multi/dynamic-output node
  return { sourceId: node.id, sourceHandle: `${node.id}-${handleName}` };
};
