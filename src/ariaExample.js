// ariaExample.js
// A ready-made "Aria" support-assistant pipeline, loadable from the toolbar so
// you can see a coherent end-to-end story on the canvas. Wired with explicit
// edges (drag-style) so it renders immediately; reference fields stay empty.
//
//   Input ─▶ Classifier ─┬─order──▶ KB(Order History) ─┐
//                        ├─return─▶ KB(Store Policies) ─┤─▶ LLM.prompt
//                        └─other──────────────▶ Output(escalate)
//   Text ─▶ LLM.system ;  LLM ─▶ Condition ─┬─true──▶ API ─▶ Output(sent_reply)
//                                           └─false─▶ Output(escalate)
//   Note: annotation only
import { MarkerType } from 'reactflow';

const node = (id, type, position, data) => ({
  id,
  type,
  position,
  data: { id, nodeType: type, ...data },
});

export const ariaNodes = [
  node('customInput-1', 'customInput', { x: 40, y: 220 }, { inputName: 'customer_message', inputType: 'Text' }),
  node('text-1', 'text', { x: 360, y: -120 }, { text: 'You are Aria, a friendly ShoeBox support agent. Be concise and warm.' }),
  node('classifier-1', 'classifier', { x: 360, y: 200 }, { categories: 'order, return, other' }),
  node('note-1', 'note', { x: 360, y: 420 }, { text: 'Order/return are auto-handled. "Other" & low-confidence replies go to a human.' }),
  node('knowledgeBase-1', 'knowledgeBase', { x: 680, y: 80 }, { source: 'Order History' }),
  node('knowledgeBase-2', 'knowledgeBase', { x: 680, y: 250 }, { source: 'Store Policies' }),
  node('customOutput-2', 'customOutput', { x: 680, y: 430 }, { outputName: 'escalate_to_human', outputType: 'Text' }),
  node('llm-1', 'llm', { x: 1010, y: 110 }, { model: 'claude-opus-4-8', temperature: 0.7, maxTokens: 1024 }),
  node('condition-1', 'condition', { x: 1320, y: 160 }, { expression: 'confidence > 0.8' }),
  node('api-1', 'api', { x: 1620, y: 60 }, { url: 'https://api.shoebox.com/email', method: 'POST' }),
  node('customOutput-1', 'customOutput', { x: 1900, y: 60 }, { outputName: 'sent_reply', outputType: 'Text' }),
];

const edge = (n, source, sourceHandle, target, targetHandle) => ({
  id: `aria-e${n}`,
  source,
  sourceHandle,
  target,
  targetHandle,
  type: 'deletable',
  animated: true,
  markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' },
});

export const ariaEdges = [
  edge(1, 'customInput-1', 'customInput-1-value', 'classifier-1', 'classifier-1-in1'),
  edge(2, 'classifier-1', 'classifier-1-order', 'knowledgeBase-1', 'knowledgeBase-1-query'),
  edge(3, 'classifier-1', 'classifier-1-return', 'knowledgeBase-2', 'knowledgeBase-2-query'),
  edge(4, 'classifier-1', 'classifier-1-other', 'customOutput-2', 'customOutput-2-value'),
  edge(5, 'knowledgeBase-1', 'knowledgeBase-1-results', 'llm-1', 'llm-1-prompt'),
  edge(6, 'knowledgeBase-2', 'knowledgeBase-2-results', 'llm-1', 'llm-1-prompt'),
  edge(7, 'text-1', 'text-1-output', 'llm-1', 'llm-1-system'),
  edge(8, 'llm-1', 'llm-1-response', 'condition-1', 'condition-1-input'),
  edge(9, 'condition-1', 'condition-1-true', 'api-1', 'api-1-body'),
  edge(10, 'condition-1', 'condition-1-false', 'customOutput-2', 'customOutput-2-value'),
  edge(11, 'api-1', 'api-1-response', 'customOutput-1', 'customOutput-1-value'),
];

// keeps getNodeID from colliding with the loaded ids
export const ariaNodeIDs = {
  customInput: 1,
  text: 1,
  classifier: 1,
  note: 1,
  knowledgeBase: 2,
  customOutput: 2,
  llm: 1,
  condition: 1,
  api: 1,
};
