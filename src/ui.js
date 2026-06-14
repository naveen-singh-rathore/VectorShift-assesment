// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes } from './nodes';
import { seedData } from './nodes/registry';
import { DeletableEdge } from './DeletableEdge';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const edgeTypes = {
  deletable: DeletableEdge,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  undo: state.undo,
  redo: state.redo,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      undo,
      redo,
    } = useStore(selector, shallow);

    // Move the spotlight: store cursor position as CSS vars on the wrapper so the
    // dot-grid glow layer (masked by a radial gradient) lights up near the cursor.
    const onMouseMove = useCallback((event) => {
      const el = reactFlowWrapper.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    }, []);

    // Keyboard: Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z (or Ctrl+Y) = redo
    useEffect(() => {
      const onKey = (e) => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;
        const k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [undo, redo]);

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();

          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }

            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: seedData(type, nodeID),
            };

            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // disallow connecting a node to itself
    const isValidConnection = useCallback(
        (connection) => connection.source !== connection.target,
        []
    );

    return (
        <>
        <div
          ref={reactFlowWrapper}
          className="pipeline-canvas"
          style={{width: '100vw', height: '70vh'}}
          onMouseMove={onMouseMove}
        >
            {/* spotlight dot grid: base = faint everywhere; glow = lit near cursor */}
            <div className="dotgrid dotgrid--base" />
            <div className="dotgrid dotgrid--glow" />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnection}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
        </>
    )
}
