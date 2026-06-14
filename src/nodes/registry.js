// registry.js
// --------------------------------------------------
// Assembles the per-node definition files into a single source of truth. The
// rest of the app derives from this — adding a node = add ONE file + one import.
//   - ui.js          -> nodeTypes (via ./index)
//   - toolbar.js     -> the palette (NODE_TYPE_LIST)
//   - draggableNode  -> chip accent
//   - NodeIcon.js    -> the glyph
//   - references.js  -> friendly names + output resolution
//   - seedData()     -> initial field values when a node is created
//
// A node definition (see e.g. ./inputNode.js):
//   type, label, accent, refPrefix, nameField?, outputs, icon,
//   build(id, data) -> { handles, fields, variant?, minWidth?, description? }
// --------------------------------------------------

import { inputNode } from './inputNode';
import { llmNode } from './llmNode';
import { outputNode } from './outputNode';
import { textNode } from './textNode';
import { classifierNode } from './classifierNode';
import { conditionNode } from './conditionNode';
import { knowledgeBaseNode } from './knowledgeBaseNode';
import { apiNode } from './apiNode';
import { noteNode } from './noteNode';

// order here = palette order
const DEFINITIONS = [
  inputNode,
  llmNode,
  outputNode,
  textNode,
  classifierNode,
  conditionNode,
  knowledgeBaseNode,
  apiNode,
  noteNode,
];

export const NODE_TYPES = Object.fromEntries(DEFINITIONS.map((d) => [d.type, d]));
export const NODE_TYPE_LIST = DEFINITIONS.map((d) => d.type);

// Build the full config for a node (title + accent merged with build()).
export const buildNodeConfig = (type, id, data) => {
  const def = NODE_TYPES[type];
  return { title: def.label, accentColor: def.accent, ...def.build(id, data) };
};

// Initial data for a freshly-created node: seeds every field's default value so
// the saved graph carries real values (not just whatever the user later edits).
export const seedData = (type, id) => {
  const { fields = [] } = NODE_TYPES[type].build(id, {});
  const data = { id, nodeType: type };
  fields.forEach((f) => {
    if (f.type === 'inputs') data[f.name] = f.default ?? [{ key: 'in1', ref: '' }];
    else if (f.type === 'select') data[f.name] = f.default ?? f.options?.[0] ?? '';
    else if (f.default !== undefined) data[f.name] = f.default;
    else if (f.type === 'reference') data[f.name] = '';
  });
  return data;
};
