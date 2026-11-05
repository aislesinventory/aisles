'use strict';
// Aisles client: the public, read-only Aisles endpoints (no key). https://aislesinventory.com/developers

const DEFAULT_BASE = 'https://aislesinventory.com';
const VERSION = require('./package.json').version;

class AislesError extends Error {
  constructor(code, message, status) { super(message); this.name = 'AislesError'; this.code = code; this.status = status; }
}

function createClient({ baseUrl = process.env.AISLES_BASE_URL || DEFAULT_BASE, fetch: f = globalThis.fetch } = {}) {
  if (typeof f !== 'function') throw new Error('aisles-mcp needs Node 18 or later (global fetch)');
  const base = baseUrl.replace(/\/+$/, '');
  const headers = { Accept: 'application/json', 'User-Agent': `aisles-mcp/${VERSION}` };

  async function getJson(path) {
    const r = await f(base + path, { headers });
    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch { throw new AislesError('bad_response', `Unexpected response (${r.status})`, r.status); }
    if (!r.ok) throw new AislesError(body.error?.code || 'error', body.error?.message || `HTTP ${r.status}`, r.status);
    return body;
  }

  // One JSON-RPC message to the Aisles MCP server; resolves with its reply (null for a notification).
  async function mcp(message) {
    const r = await f(`${base}/mcp`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify(message),
    });
    if (r.status === 202 || r.status === 204) return null;
    const text = await r.text();
    if (!text) return null;
    // A stream reply: take the JSON from its data lines.
    if (/^(event|data):/m.test(text) && !/^\s*[[{]/.test(text)) {
      const data = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).filter(Boolean);
      return data.length ? JSON.parse(data[data.length - 1]) : null;
    }
    return JSON.parse(text);
  }

  let id = 0;
  async function callTool(name, args = {}) {
    const reply = await mcp({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name, arguments: args } });
    if (!reply || reply.error) throw new AislesError('mcp_error', reply?.error?.message || 'No reply', 0);
    return reply.result;
  }

  return {
    baseUrl: base,
    /** Listings for a product near a covered city or ZIP: { pagination, results: [...] }. */
    search({ q, city, zip, availability, fulfillment, maxPrice, perPage, radius } = {}) {
      if (!q) return Promise.reject(new AislesError('invalid_parameter', 'q is required', 0));
      const p = new URLSearchParams({ q });
      if (city) p.set('city', city);
      if (zip) p.set('zip', zip);
      if (availability) p.set('availability', availability);
      if (fulfillment) p.set('fulfillment', Array.isArray(fulfillment) ? fulfillment.join(',') : fulfillment);
      if (maxPrice != null) p.set('max_price', String(maxPrice));
      if (perPage != null) p.set('per_page', String(perPage));
      if (radius != null) p.set('radius', String(radius));
      return getJson(`/api/v1/search?${p}`);
    },
    /** A question in plain words ("oat milk in Chicago"): NLWeb { query_id, results }. */
    ask(query, { city, zip, limit } = {}) {
      const p = new URLSearchParams({ query });
      if (city) p.set('city', city);
      if (zip) p.set('zip', zip);
      if (limit != null) p.set('limit', String(limit));
      return getJson(`/ask?${p}`);
    },
    /** Covered metros with their chains and malls; filter by words such as "TX" or "Kroger". */
    async locations(filter) {
      const r = await callTool('list_locations', filter ? { filter } : {});
      return r.structuredContent?.locations || [];
    },
    /** The ready answers Aisles publishes for one metro: [{ question, page }]. */
    async answers(location) {
      const r = await callTool('list_answers', { location });
      return r.structuredContent?.questions || [];
    },
    mcp,
    callTool,
  };
}

module.exports = { createClient, AislesError, DEFAULT_BASE };
