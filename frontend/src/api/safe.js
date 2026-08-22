/** Coerce Neo4j-style {low,high} integers (and similar) into plain numbers. */
export function asNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value && typeof value === 'object' && ('low' in value || 'toNumber' in value)) {
    if (typeof value.toNumber === 'function') return value.toNumber();
    if (typeof value.low === 'number') return value.low;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Deep-clean API payloads so React never receives non-renderable integer objects. */
export function sanitize(value) {
  if (value == null) return value;
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (value && typeof value === 'object' && ('low' in value || typeof value.toNumber === 'function')) {
    return asNumber(value);
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v);
    return out;
  }
  return value;
}
