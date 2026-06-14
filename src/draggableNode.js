// draggableNode.js

import { NODE_TYPES } from './nodes/registry';
import { NodeIcon } from './NodeIcon';

export const DraggableNode = ({ type, label }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType };
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };

    return (
      <div
        className="palette-node"
        style={{ '--accent': NODE_TYPES[type]?.accent || '#7c83ff' }}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        draggable
        title={label}
      >
        <NodeIcon type={type} />
        <span className="palette-node__label">{label}</span>
      </div>
    );
  };
