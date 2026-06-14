// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

const HISTORY_LIMIT = 50;

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    theme: 'dark', // 'dark' | 'light'
    toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    loadGraph: ({ nodes, edges, nodeIDs }) =>
      set({ nodes, edges, nodeIDs: nodeIDs || {} }),
    clearGraph: () => set({ nodes: [], edges: [], nodeIDs: {} }),
    // Remove an edge. If it's an auto-wired reference edge (id `ref:target:handle`)
    // also clear the source reference text so it doesn't get re-created.
    deleteEdge: (edgeId) => {
      get().snapshot();
      set((state) => {
      const edges = state.edges.filter((e) => e.id !== edgeId);
      if (!edgeId.startsWith('ref:')) return { edges };

      const rest = edgeId.slice(4);
      const sep = rest.indexOf(':');
      const targetId = rest.slice(0, sep);
      const handleId = rest.slice(sep + 1);
      const nodes = state.nodes.map((n) => {
        if (n.id !== targetId) return n;
        const data = { ...n.data };
        if (typeof data[handleId] === 'string') {
          data[handleId] = ''; // single reference field
        } else {
          // inputs slots: clear the matching slot's ref
          Object.keys(data).forEach((k) => {
            if (Array.isArray(data[k])) {
              data[k] = data[k].map((s) =>
                s && s.key === handleId ? { ...s, ref: '' } : s
              );
            }
          });
        }
        return { ...n, data };
      });
      return { edges, nodes };
      });
    },

    // ---- Undo / redo history ----
    past: [],
    future: [],
    _isDragging: false,
    _lastEdit: null, // {nodeId, fieldName} — coalesces continuous field edits
    // push the current nodes/edges onto the undo stack and clear redo
    snapshot: () => {
      const { nodes, edges, past } = get();
      set({
        past: [...past, { nodes, edges }].slice(-HISTORY_LIMIT),
        future: [],
        _lastEdit: null, // any non-field action breaks the edit-coalescing chain
      });
    },
    undo: () => {
      const { past, future, nodes, edges } = get();
      if (past.length === 0) return;
      const prev = past[past.length - 1];
      set({
        nodes: prev.nodes,
        edges: prev.edges,
        past: past.slice(0, -1),
        future: [{ nodes, edges }, ...future].slice(0, HISTORY_LIMIT),
      });
    },
    redo: () => {
      const { past, future, nodes, edges } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        nodes: next.nodes,
        edges: next.edges,
        past: [...past, { nodes, edges }].slice(-HISTORY_LIMIT),
        future: future.slice(1),
      });
    },

    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        get().snapshot();
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      // snapshot before structural changes so undo restores the prior state:
      //  - removing a node
      //  - the start of a drag (first position change with dragging === true)
      const removing = changes.some((c) => c.type === 'remove');
      const startDrag = changes.some((c) => c.type === 'position' && c.dragging === true);
      const endDrag = changes.some((c) => c.type === 'position' && c.dragging === false);

      if (removing) {
        get().snapshot();
      } else if (startDrag && !get()._isDragging) {
        get().snapshot();
        set({ _isDragging: true });
      }
      if (endDrag) set({ _isDragging: false });

      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      if (changes.some((c) => c.type === 'remove')) {
        get().snapshot();
      }
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      get().snapshot();
      set({
        edges: addEdge({...connection, type: 'deletable', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    // Reconcile ALL of a node's reference edges in one pass. `entries` is
    // [{ handleId, source }] for the node's current reference handles; source is
    // { sourceId, sourceHandle } or null. Ref edges for handles no longer present
    // (e.g. an input the user removed) are dropped. No-ops when nothing changed.
    syncRefEdges: (targetId, entries) => set((state) => {
      const prefix = `ref:${targetId}:`;
      const kept = state.edges.filter((e) => !e.id.startsWith(prefix));
      const additions = entries
        .filter((entry) => entry.source)
        .map(({ handleId, source }) => ({
          id: `${prefix}${handleId}`,
          source: source.sourceId,
          sourceHandle: source.sourceHandle,
          target: targetId,
          targetHandle: `${targetId}-${handleId}`,
          type: 'deletable',
          animated: true,
          markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
          data: { ref: true },
        }));

      // bail if the ref edges are unchanged (avoids render loops)
      const prev = state.edges.filter((e) => e.id.startsWith(prefix));
      const same =
        prev.length === additions.length &&
        additions.every((a) =>
          prev.find((p) => p.id === a.id && p.source === a.source && p.sourceHandle === a.sourceHandle)
        );
      if (same) return {};

      return { edges: [...kept, ...additions] };
    }),
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      // snapshot once per "edit session" — continuous edits to the SAME field
      // coalesce into a single undo step (not one per keystroke).
      const { _lastEdit } = get();
      const sameField = _lastEdit && _lastEdit.nodeId === nodeId && _lastEdit.fieldName === fieldName;
      if (!sameField) get().snapshot();
      set({
        _lastEdit: { nodeId, fieldName },
        nodes: get().nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
            : node
        ),
      });
    },
  }));
