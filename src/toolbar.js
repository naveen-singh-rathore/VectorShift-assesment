// toolbar.js

import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { ariaNodes, ariaEdges, ariaNodeIDs } from './ariaExample';
import { NODE_TYPES, NODE_TYPE_LIST } from './nodes/registry';

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
);

const UndoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14L4 9l5-5" />
        <path d="M4 9h11a5 5 0 0 1 0 10h-1" />
    </svg>
);

const RedoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14l5-5-5-5" />
        <path d="M20 9H9a5 5 0 0 0 0 10h1" />
    </svg>
);

export const PipelineToolbar = () => {
    const theme = useStore((state) => state.theme);
    const toggleTheme = useStore((state) => state.toggleTheme);
    const undo = useStore((state) => state.undo);
    const redo = useStore((state) => state.redo);
    const canUndo = useStore((state) => state.past.length > 0);
    const canRedo = useStore((state) => state.future.length > 0);
    const loadGraph = useStore((state) => state.loadGraph);
    const clearGraph = useStore((state) => state.clearGraph);

    return (
        <div className="toolbar">
            <div className="toolbar__bar">
                <span className="toolbar__brand">Aria Pipeline</span>
                <div className="toolbar__actions">
                    <button
                        className="text-button"
                        onClick={() => loadGraph({ nodes: ariaNodes, edges: ariaEdges, nodeIDs: ariaNodeIDs })}
                        title="Load the Aria support-assistant example"
                    >
                        Load Aria
                    </button>
                    <button
                        className="text-button"
                        onClick={clearGraph}
                        title="Clear the canvas"
                    >
                        Clear
                    </button>
                    <button
                        className="icon-button"
                        onClick={undo}
                        disabled={!canUndo}
                        aria-label="Undo"
                        title="Undo (Cmd/Ctrl+Z)"
                    >
                        <UndoIcon />
                    </button>
                    <button
                        className="icon-button"
                        onClick={redo}
                        disabled={!canRedo}
                        aria-label="Redo"
                        title="Redo (Cmd/Ctrl+Shift+Z)"
                    >
                        <RedoIcon />
                    </button>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>
                </div>
            </div>
            <div className="toolbar__nodes">
                {NODE_TYPE_LIST.map((type) => (
                    <DraggableNode key={type} type={type} label={NODE_TYPES[type].label} />
                ))}
            </div>
        </div>
    );
};
