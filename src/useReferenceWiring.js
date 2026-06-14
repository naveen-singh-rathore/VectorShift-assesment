// useReferenceWiring.js
// React hook that keeps a node's reference-field edges in sync with the typed
// values. Separated from references.js (pure helpers) so that module stays
// dependency-free and unit-testable.

import { useEffect } from 'react';
import { useStore } from './store';
import { refNameOf, resolveRef } from './references';

// `references` = [{ handleId, value }]. Re-runs only when the typed values or the
// set of node names change (not on every drag); the store no-ops if unchanged.
export const useReferenceWiring = (id, references) => {
  const syncRefEdges = useStore((s) => s.syncRefEdges);
  const nameSig = useStore((s) => s.nodes.map((n) => `${n.id}:${refNameOf(n)}`).join('|'));
  const refSig = JSON.stringify(references);

  useEffect(() => {
    const nodes = useStore.getState().nodes;
    const entries = references.map(({ handleId, value }) => ({
      handleId,
      source: resolveRef(value, nodes),
    }));
    syncRefEdges(id, entries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, refSig, nameSig]);
};
