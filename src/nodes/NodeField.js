// NodeField.js
// --------------------------------------------------
// Renders ONE field of a node, chosen by `field.type`. Extracted from BaseNode so
// the engine stays small and field types are easy to add/test.
//
// Supported types: text | select | number | range | textarea | display
//                  reference (single input slot) | inputs (dynamic input slots)
// --------------------------------------------------

import { useRef, useLayoutEffect } from 'react';
import { useStore } from '../store';

// default for an `inputs` field: one slot, so there's always a draggable handle
export const DEFAULT_SLOTS = [{ key: 'in1', ref: '' }];

// the current value for a field, with sensible fallbacks
export const fieldValue = (field, data) => {
  if (field.type === 'inputs') return data?.[field.name] ?? field.default ?? DEFAULT_SLOTS;
  if (field.type === 'select') {
    return data?.[field.name] ?? field.default ?? field.options?.[0] ?? '';
  }
  return data?.[field.name] ?? field.default ?? '';
};

// chain icon shown inside a reference field; lit (via CSS) when connected
const LinkIcon = () => (
  <svg className="link-icon" width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
  </svg>
);

// a textarea that grows to fit its content
const AutoGrowTextarea = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      className="base-node__control base-node__textarea"
      rows={2}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

// wraps a control with its label
const Labeled = ({ label, children }) => (
  <label className="base-node__field">
    {label && <span className="base-node__label">{label}</span>}
    {children}
  </label>
);

export const NodeField = ({ id, field, data, connectedHandles }) => {
  const updateNodeField = useStore((s) => s.updateNodeField);
  const value = fieldValue(field, data);
  const onChange = (e) => updateNodeField(id, field.name, e.target.value);
  const setValue = (v) => updateNodeField(id, field.name, v);
  const isConnected = (handleId) => connectedHandles.has(`${id}-${handleId}`);

  switch (field.type) {
    case 'display':
      return <div className="base-node__display">{value || field.label}</div>;

    case 'select':
      return (
        <Labeled label={field.label}>
          <select className="base-node__control" value={value} onChange={onChange}>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Labeled>
      );

    case 'number':
      return (
        <Labeled label={field.label}>
          <input
            className="base-node__control"
            type="number"
            value={value}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={onChange}
          />
        </Labeled>
      );

    case 'range':
      return (
        <Labeled label={field.label}>
          <div className="base-node__range">
            <input
              type="range"
              value={value}
              min={field.min ?? 0}
              max={field.max ?? 1}
              step={field.step ?? 0.1}
              onChange={onChange}
            />
            <span className="base-node__range-value">{value}</span>
          </div>
        </Labeled>
      );

    case 'textarea':
      return (
        <Labeled label={field.label}>
          <AutoGrowTextarea value={value} onChange={onChange} placeholder={field.placeholder} />
        </Labeled>
      );

    case 'reference':
      return (
        <Labeled label={field.label}>
          <div className={`base-node__ref-field${isConnected(field.name) ? ' is-connected' : ''}`}>
            <input
              className="base-node__control"
              type="text"
              value={value}
              onChange={onChange}
              placeholder={field.placeholder || 'e.g. input_1'}
            />
            <LinkIcon />
          </div>
        </Labeled>
      );

    case 'inputs': {
      const slots = value; // array of { key, ref }
      return (
        <div className="base-node__field">
          {field.label && <span className="base-node__label">{field.label}</span>}
          {slots.map((s) => (
            <div
              key={s.key}
              className={`base-node__ref-field${isConnected(s.key) ? ' is-connected' : ''}`}
            >
              <input
                className="base-node__control"
                type="text"
                value={s.ref}
                placeholder={field.placeholder || 'e.g. input_1'}
                onChange={(e) =>
                  setValue(slots.map((x) => (x.key === s.key ? { ...x, ref: e.target.value } : x)))
                }
              />
              <LinkIcon />
              {slots.length > 1 && (
                <button
                  type="button"
                  className="base-node__slot-remove"
                  title="Remove input"
                  onClick={() => setValue(slots.filter((x) => x.key !== s.key))}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="base-node__add"
            onClick={() => setValue([...slots, { key: `in${Date.now().toString(36)}`, ref: '' }])}
          >
            + Add input
          </button>
        </div>
      );
    }

    default:
      return (
        <Labeled label={field.label}>
          <input
            className="base-node__control"
            type="text"
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        </Labeled>
      );
  }
};
