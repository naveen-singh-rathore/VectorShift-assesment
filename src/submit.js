// submit.js

import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const API_URL = 'http://localhost:8000/pipelines/parse';

const selector = (state) => ({ nodes: state.nodes, edges: state.edges });

export const SubmitButton = () => {
    const { nodes, edges } = useStore(selector, shallow);

    const handleSubmit = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges }),
            });
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            const { num_nodes, num_edges, is_dag } = await response.json();
            alert(
                `Pipeline submitted ✅\n\n` +
                `Nodes: ${num_nodes}\n` +
                `Edges: ${num_edges}\n` +
                `Valid DAG: ${is_dag ? 'Yes — no cycles 🎉' : 'No — there is a cycle ⚠️'}`
            );
        } catch (error) {
            alert(
                `Couldn't reach the backend.\n\n${error.message}\n\n` +
                `Start it with:\n  cd backend\n  uvicorn main:app --reload`
            );
        }
    };

    return (
        <div className="submit-wrap">
            <button type="button" className="submit-button" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
};
