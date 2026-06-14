# VectorShift Assessment Backend

This repository contains the FastAPI backend for the VectorShift assessment.

## Overview

The backend exposes a simple API to validate pipeline graphs and determine whether a pipeline is a directed acyclic graph (DAG).

## Requirements

- Python 3.10+
- `fastapi`
- `uvicorn[standard]`

Install dependencies with:

```bash
pip install -r requirements.txt
```

## Running the Backend

Start the FastAPI app with:

```bash
uvicorn main:app --reload
```

Then open `http://127.0.0.1:8000` in your browser or use the API directly.

## API Endpoints

### GET /

Returns a health check response.

Example response:

```json
{
  "Ping": "Pong"
}
```

### POST /pipelines/parse

Validates a pipeline definition and returns node/edge counts plus whether the graph is acyclic.

Request body example:

```json
{
  "nodes": [{"id": "a"}, {"id": "b"}],
  "edges": [{"source": "a", "target": "b"}]
}
```

Response example:

```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

## Tests

Run tests with:

```bash
pytest
```

## Notes

- The backend uses CORS middleware to allow local React development servers on `localhost:3000` and `localhost:3002`.
- Edges that reference missing node IDs are ignored when checking for cycles.
