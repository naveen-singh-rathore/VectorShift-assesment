// BaseNode.js
// --------------------------------------------------
// The single, reusable node engine. A node is described by a `config` object
// (see registry.js) and rendered here. Responsibilities kept in BaseNode:
//   ① WRAPPER  -> resizable, accent-tinted card
//   ② HEADER   -> type icon + title + friendly reference name
//   ③ HANDLES  -> config handles + auto-generated handles for reference/inputs
//                 fields; auto-spaced per side; reference edges kept in sync
//   ④ FIELDS   -> delegated to <NodeField> (one renderer per field type)
//   ⑤ ESCAPE HATCH -> {children}, for the rare node config can't express
//
// @typedef {Object} HandleSpec  { type:'source'|'target', id, position, style? }
// @typedef {Object} FieldSpec   { name, label?, type, default?, options?, placeholder?, min?, max?, step? }
// @typedef {Object} NodeConfig  { title, accentColor?, variant?, description?,
//                                 handles?: HandleSpec[], fields?: FieldSpec[],
//                                 minWidth?, minHeight? }
// --------------------------------------------------

import { useMemo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '../store';
import { NodeIcon } from '../NodeIcon';
import { refNameOf } from '../references';
import { useReferenceWiring } from '../useReferenceWiring';
import { NodeField, DEFAULT_SLOTS } from './NodeField';

// Returns a Set of every handle id (`${nodeId}-${handleId}`) that has an edge.
export const useConnectedHandleIds = () => {
  const edges = useStore((state) => state.edges);
  return useMemo(() => {
    const ids = new Set();
    edges.forEach((e) => {
      if (e.sourceHandle) ids.add(e.sourceHandle);
      if (e.targetHandle) ids.add(e.targetHandle);
    });
    return ids;
  }, [edges]);
};

const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

// Minimum vertical room (px) per handle on a side, so handles don't crowd.
const HANDLE_GAP = 30;

const slotsOf = (field, data) => data?.[field.name] ?? field.default ?? DEFAULT_SLOTS;

export const BaseNode = ({ id, data, config, children }) => {
  const {
    title,
    description,
    accentColor = '#7c83ff',
    variant = 'card',
    handles = [],
    fields = [],
    minHeight,
    minWidth,
  } = config;

  // Reference fields contribute their own left input handle(s):
  //   `reference` -> one handle (id = field name)
  //   `inputs`    -> one handle per slot (id = slot.key), always present
  const referenceHandles = fields.flatMap((f) => {
    if (f.type === 'reference') return [{ type: 'target', id: f.name, position: 'left' }];
    if (f.type === 'inputs') {
      return slotsOf(f, data).map((s) => ({ type: 'target', id: s.key, position: 'left' }));
    }
    return [];
  });
  const allHandles = [...handles, ...referenceHandles];

  // keep reference edges in sync with the typed values
  const wiringEntries = fields.flatMap((f) => {
    if (f.type === 'reference') return [{ handleId: f.name, value: data?.[f.name] ?? '' }];
    if (f.type === 'inputs') {
      return slotsOf(f, data).map((s) => ({ handleId: s.key, value: s.ref }));
    }
    return [];
  });
  useReferenceWiring(id, wiringEntries);

  const leftHandles = allHandles.filter((h) => h.position === 'left');
  const rightHandles = allHandles.filter((h) => h.position === 'right');
  const busiestSide = Math.max(leftHandles.length, rightHandles.length);
  const nodeMinHeight = minHeight ?? (busiestSide > 1 ? busiestSide * HANDLE_GAP : undefined);

  const connectedHandles = useConnectedHandleIds();

  // Evenly distribute handles down a side unless the config gives a position.
  const handleStyle = (h, sideHandles) => {
    if (h.style) return h.style;
    if (sideHandles.length <= 1) return undefined;
    const index = sideHandles.indexOf(h);
    return { top: `${((index + 1) * 100) / (sideHandles.length + 1)}%` };
  };

  return (
    <div
      className={`base-node base-node--${variant}`}
      style={{ '--accent': accentColor, minHeight: nodeMinHeight, minWidth }}
    >
      {/* drag-to-resize (styled via CSS; shown when node is selected) */}
      <NodeResizer minWidth={180} minHeight={nodeMinHeight || 72} />

      {/* ② HEADER */}
      <div className="base-node__header">
        <NodeIcon type={data?.nodeType} size={15} />
        <span>{title}</span>
        {data?.nodeType && (
          <span className="base-node__ref">{refNameOf({ id, type: data.nodeType, data })}</span>
        )}
      </div>

      {/* ③ HANDLES */}
      {allHandles.map((h) => (
        <Handle
          key={h.id}
          type={h.type}
          position={POSITION_MAP[h.position] ?? Position.Left}
          id={`${id}-${h.id}`}
          style={handleStyle(h, h.position === 'left' ? leftHandles : rightHandles)}
          className={`base-node__handle${
            connectedHandles.has(`${id}-${h.id}`) ? ' base-node__handle--connected' : ''
          }`}
        />
      ))}

      {/* ④ FIELDS + ⑤ ESCAPE HATCH */}
      <div className="base-node__body">
        {description && <div className="base-node__desc">{description}</div>}
        {fields.map((field) => (
          <NodeField
            key={field.name}
            id={id}
            field={field}
            data={data}
            connectedHandles={connectedHandles}
          />
        ))}
        {children}
      </div>
    </div>
  );
};
