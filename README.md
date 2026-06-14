# VectorShift — Pipeline Builder

A visual, node-based **pipeline builder** (think Zapier / n8n / ComfyUI, but for AI
workflows). You drag nodes onto a canvas, wire their outputs into other nodes'
inputs, and submit the graph to a backend that validates it.

This repo contains the four-part take-home:

| Part | What it covers |
|------|----------------|
| **1. Node Abstraction** | A reusable engine so new nodes are tiny declarative files |
| **2. Styling** | A unified dark/light themed design |
| **3. Text Node Logic** | Auto-resize + `{{variable}}` → input handles |
| **4. Backend Integration** | Submit the graph → backend counts nodes/edges + checks DAG |

---

## Table of contents

1. [The domain — what is a node editor?](#1-the-domain)
2. [The Aria story (the example pipeline)](#2-the-aria-story)
3. [Quick start](#3-quick-start)
4. [Architecture overview](#4-architecture-overview)
5. [Part 1 — the node abstraction](#5-part-1--the-node-abstraction)
6. [Part 2 — styling](#6-part-2--styling)
7. [Part 3 — the Text node](#7-part-3--the-text-node)
8. [Part 4 — backend integration](#8-part-4--backend-integration)
9. [Reference wiring (the "jinja" system)](#9-reference-wiring)
10. [Extras](#10-extras)
11. [Testing](#11-testing)
12. [Adding a new node](#12-adding-a-new-node)
13. [Project structure](#13-project-structure)

---

## 1. The domain

A **node editor** is a visual way to build a **graph**: boxes (**nodes**) connected
by arrows (**edges**). It's the natural UI for anything that is *dataflow* — data
comes out of one box, flows into the next, gets transformed, and flows onward.

- **Node** = one step of work (an input, an LLM call, a text template, an output…).
- **Edge** = data flowing from one node's **output handle** (right side) into
  another's **input handle** (left side).
- **Handle** = a connection point (the little dots on a node's border).

VectorShift uses this pattern so non-programmers can assemble **AI pipelines**
visually. This project is the *authoring tool* for those pipelines.

---

## 2. The Aria story

To make the nodes feel purposeful, the demo models **Aria**, an AI support
assistant for a fictional store ("ShoeBox"). Click **Load Aria** in the toolbar to
see it pre-wired:

```
[Input: customer_message]
       └─▶ [Classifier] ──order──▶ [KB: Order History] ──┐
                        ──return─▶ [KB: Store Policies] ──┤──▶ [LLM].prompt
                        ──other──────────────────────────┼──▶ [Output: escalate]
                                                          │
[Text: "You are Aria…"] ──────────────────▶ [LLM].system │
                                                          ▼
                                          [LLM] ──▶ [Condition: confident?]
                                                     ──true──▶ [API] ──▶ [Output: sent_reply]
                                                     ──false─▶ [Output: escalate]
[Note: "low-confidence → human"]
```

Each of the five **new** node types stresses a different part of the abstraction:

| Node | What it proves |
|------|----------------|
| **Classifier** | multiple, user-defined outputs + dynamic inputs |
| **Condition** | branching (1 in → 2 out) |
| **Knowledge Base** | a dropdown-driven node |
| **API** | mixed field types (text + dropdown) |
| **Note** | the zero-handles edge case + a non-card visual variant |

> The nodes don't actually call an LLM or send email — the assignment is a
> pipeline *editor* + a graph *validator*, not an execution engine.

---

## 3. Quick start

**Frontend** (React, port 3000):

```bash
cd frontend
npm install
npm start
```

**Backend** (FastAPI, port 8000):

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Then open the app, build (or **Load Aria**) a pipeline, and click **Submit**.

---

## 4. Architecture overview

```
                       ┌────────────────────────────┐
                       │   nodes/<type>Node.js      │   one declarative file per
                       │   (definition objects)     │   node type: label, accent,
                       └─────────────┬──────────────┘   icon, outputs, build(id,data)
                                     │ assembled by
                                     ▼
                       ┌────────────────────────────┐
                       │     nodes/registry.js      │   SINGLE SOURCE OF TRUTH
                       └─────────────┬──────────────┘
            ┌────────────┬───────────┼───────────┬─────────────┐
            ▼            ▼           ▼           ▼             ▼
        nodeTypes     palette     colors       icons      reference meta
        (ui.js)     (toolbar)  (draggable)  (NodeIcon)   (references.js)
                                     │
                                     ▼ every node renders via
                       ┌────────────────────────────┐
                       │     nodes/BaseNode.js      │   the engine: wrapper, header,
                       │   + nodes/NodeField.js     │   handles, wiring, fields
                       └─────────────┬──────────────┘
                                     ▼
                       ┌────────────────────────────┐
                       │         store.js           │   zustand: nodes, edges,
                       │      (single state)        │   theme, undo/redo
                       └────────────────────────────┘
```

**Key idea:** node-type knowledge lives in **one place** (the registry, fed by
per-node files). Everything else — the canvas node map, the palette, colors,
icons, reference resolution, default seeding — is *derived* from it. Adding a node
is a one-file change.

---

## 5. Part 1 — the node abstraction

### The problem
The four original node files were ~80% identical boilerplate (a wrapper, a title,
some `<Handle>`s, some fields with their own `useState`). Copy-pasting to add nodes
doesn't scale.

### The solution: a config-driven `BaseNode`
Every node is described by a plain **config object**; `BaseNode` renders it:

```js
// what BaseNode renders, in five parts:
// ① WRAPPER  — the resizable, accent-tinted card
// ② HEADER   — type icon + title + friendly reference name
// ③ HANDLES  — one <Handle> per config.handles[] (auto-spaced per side)
// ④ FIELDS   — one input per config.fields[]  (delegated to <NodeField>)
// ⑤ ESCAPE HATCH — {children}, for the rare case config can't express
```

A node definition is just data ([src/nodes/inputNode.js](src/nodes/inputNode.js)):

```js
export const inputNode = {
  type: 'customInput',
  label: 'Input',
  accent: '#7c83ff',
  refPrefix: 'input',
  nameField: 'inputName',
  outputs: ['value'],
  icon: (<>…</>),
  build: (id) => ({
    handles: [{ type: 'source', id: 'value', position: 'right' }],
    fields: [
      { name: 'inputName', label: 'Name', type: 'text', default: '…' },
      { name: 'inputType', label: 'Type', type: 'select', options: ['Text', 'File'] },
    ],
  }),
};
```

### Field types (rendered by [NodeField.js](src/nodes/NodeField.js))
`text` · `select` · `number` · `range` (slider) · `textarea` (auto-grows) ·
`display` · `reference` (single input slot) · `inputs` (dynamic input slots).

Adding a field type = one entry in `NodeField`.

### The "hybrid" design
Config covers ~95% of cases. For anything config can't express, `BaseNode` also
accepts **`children`** (the escape hatch) — raw JSX for that one node, without
weakening the abstraction for the rest.

---

## 6. Part 2 — styling

- **Theme tokens** drive everything ([index.css](src/index.css)). The `.app`
  wrapper carries `--surface`, `--text`, `--border`, etc.; swapping
  `.app--dark` / `.app--light` re-themes the whole UI.
- **Dark mode** is a deep, desaturated, purple-led "tech" look (Obsidian/Dagster
  register) with a layered gradient and glassy nodes; **light mode** is clean soft
  neutrals. Toggle in the toolbar.
- Each node's identity is a single `--accent` (from its registry entry) used as a
  subtle header tint, a glowing dot, the focus ring, and connected handles — not a
  loud color bar.
- Typography: **Inter** (UI) + **JetBrains Mono** (code/ids).
- Background dots dim by default and **brighten under the cursor** (a spotlight
  mask), in both themes.

---

## 7. Part 3 — the Text node

[src/nodes/textNode.js](src/nodes/textNode.js) implements two behaviors:

1. **`{{variable}}` → input handles.** Typing a valid identifier in double braces
   (e.g. `Hi {{name}}`) spawns a left-side input handle named `name`, live. Parsing
   is [textVariables.js](src/nodes/textVariables.js); the handles are produced by
   `build(id, data)` so `BaseNode` positions them correctly on the border.
2. **Auto-resize.** Width grows with the longest line; height grows via an
   auto-growing textarea (`AutoGrowTextarea` in `NodeField`).

---

## 8. Part 4 — backend integration

- **Submit** ([src/submit.js](src/submit.js)) POSTs `{ nodes, edges }` to
  `http://localhost:8000/pipelines/parse` and shows an alert with the result.
- **Backend** ([../backend/main.py](../backend/main.py)) returns
  `{ num_nodes, num_edges, is_dag }`. The DAG check uses **Kahn's algorithm**
  (topological sort): repeatedly remove nodes with no incoming edges; if all are
  removed, there's no cycle. CORS is enabled for the dev origins.

Example alert: *"Nodes: 11 — Edges: 11 — Valid DAG: Yes"*. Wire an output back
into an upstream node to create a cycle and see *"Valid DAG: No"*.

---

## 9. Reference wiring

Beyond dragging arrows, a node can reference another by a **friendly name** typed
into a field — VectorShift's "jinja" style.

- Each node shows its name in the header (`input_1`, `llm_1`, …). Rename an Input's
  **Name** and the reference name follows it.
- In an LLM's **Prompt** or a Classifier's **Inputs**, type `input_1` (or
  `classifier_1.order` for multi-output nodes) and the edge **auto-wires**.
- A **chain icon** lights up when a reference field is connected.
- Pure resolution logic is in [references.js](src/references.js) (unit-tested); the
  React glue is [useReferenceWiring.js](src/useReferenceWiring.js); edges are
  reconciled in the store's `syncRefEdges`.

Both methods coexist: every reference field's handle is also draggable.

---

## 10. Extras

- **Deletable edges** — every arrow has a glowing **×** at its midpoint
  ([DeletableEdge.js](src/DeletableEdge.js)).
- **Undo / redo** — toolbar buttons + `Cmd/Ctrl+Z` / `Shift+Z`. Field edits
  coalesce into one undo step per field.
- **Resizable nodes** — select a node and drag its handles.
- **Load Aria / Clear** — load the example pipeline or empty the canvas.
- **No self-connections** and friendly-name collision-safe resolution.

---

## 11. Testing

```bash
# frontend (Jest via react-scripts)
cd frontend && CI=true npx react-scripts test --watchAll=false

# backend (pytest)
cd backend && python3 -m pytest -q
```

Covered: `extractVariables`, `refNameOf`, `resolveRef`, and the backend `is_dag`
(acyclic / cycle / self-loop / dangling edges / empty).

---

## 12. Adding a new node

1. Create `src/nodes/myNode.js` exporting a definition object (`type, label,
   accent, refPrefix, outputs, icon, build`).
2. Import it in [src/nodes/registry.js](src/nodes/registry.js) and add it to the
   `DEFINITIONS` array.

That's it — the palette, canvas, colors, icon, reference resolution, and default
seeding all update automatically.

---

## 13. Project structure

```
frontend/src/
  App.js                  app shell + theme class
  store.js                zustand: nodes, edges, theme, undo/redo, edge sync
  ui.js                   the ReactFlow canvas (drag/drop, spotlight, keyboard)
  toolbar.js              palette + theme/undo/redo/load/clear (derived from registry)
  draggableNode.js        a palette chip
  submit.js               Part 4 — POST to backend + alert
  references.js           pure: friendly names + reference resolution
  useReferenceWiring.js   React hook that keeps reference edges in sync
  NodeIcon.js             renders a node's glyph from the registry
  DeletableEdge.js        custom edge with a × delete button
  ariaExample.js          the Load-Aria demo pipeline
  nodes/
    registry.js           SINGLE SOURCE OF TRUTH (assembles the defs)
    index.js              generates ReactFlow nodeTypes from the registry
    BaseNode.js           the node engine (wrapper/header/handles/wiring)
    NodeField.js          one renderer per field type
    textVariables.js      {{variable}} parser
    <type>Node.js         one declarative definition per node type
backend/
  main.py                 FastAPI: /pipelines/parse → {num_nodes, num_edges, is_dag}
  test_main.py            DAG unit tests
  requirements.txt
```

---

Built with React, [ReactFlow](https://reactflow.com), [Zustand](https://github.com/pmndrs/zustand), and FastAPI.
