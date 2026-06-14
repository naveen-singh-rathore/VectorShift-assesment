// textVariables.js
// Parsing helpers for template-style {{ variable }} references in text.

// Matches {{ name }} where `name` is a valid JS identifier (optional spaces).
const VARIABLE_RE = /\{\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}\}/g;

// Unique variable names found in `text`, in first-seen order.
export const extractVariables = (text = '') => [
  ...new Set([...text.matchAll(VARIABLE_RE)].map((m) => m[1])),
];
