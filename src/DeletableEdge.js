// DeletableEdge.js
// A smoothstep edge with a "×" button at its midpoint to remove the connection.
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import { useStore } from './store';

export const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}) => {
  const deleteEdge = useStore((s) => s.deleteEdge);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <button
          type="button"
          className="edge-delete nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          title="Remove connection"
          onClick={(event) => {
            event.stopPropagation();
            deleteEdge(id);
          }}
        >
          ×
        </button>
      </EdgeLabelRenderer>
    </>
  );
};
