from collections import defaultdict, deque

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow the React dev server to call this API from the browser. CRA picks the
# next free port if 3000 is taken (e.g. 3002), so list the common dev origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PipelineData(BaseModel):
    nodes: list
    edges: list


def is_dag(nodes, edges) -> bool:
    """True if the nodes/edges form a Directed Acyclic Graph (no cycles).

    Uses Kahn's algorithm: repeatedly remove nodes with no remaining incoming
    edges. If every node can be removed, there is no cycle -> it's a DAG.
    """
    ids = {node.get("id") for node in nodes}
    adjacency = defaultdict(list)
    in_degree = {node_id: 0 for node_id in ids}

    for edge in edges:
        source, target = edge.get("source"), edge.get("target")
        # ignore edges that don't connect two real nodes
        if source in ids and target in ids:
            adjacency[source].append(target)
            in_degree[target] += 1

    queue = deque(node_id for node_id in ids if in_degree[node_id] == 0)
    visited = 0
    while queue:
        current = queue.popleft()
        visited += 1
        for neighbour in adjacency[current]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    return visited == len(ids)


@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: PipelineData):
    return {
        "num_nodes": len(pipeline.nodes),
        "num_edges": len(pipeline.edges),
        "is_dag": is_dag(pipeline.nodes, pipeline.edges),
    }
