// nodes/index.js
// Generates the reactflow `nodeTypes` map from the registry. Every node type is
// the same generic component that builds its config from the registry — so there
// are no per-node component files to maintain.

import { BaseNode } from './BaseNode';
import { NODE_TYPES, buildNodeConfig } from './registry';

const makeNodeComponent = (type) => {
  const Node = ({ id, data }) => (
    <BaseNode id={id} data={data} config={buildNodeConfig(type, id, data)} />
  );
  Node.displayName = `Node(${type})`;
  return Node;
};

export const nodeTypes = Object.fromEntries(
  Object.keys(NODE_TYPES).map((type) => [type, makeNodeComponent(type)])
);
