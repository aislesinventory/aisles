# Aisles: local store stock for AI agents

Is it in stock nearby? [Aisles](https://aislesinventory.com) reports whether specific products were in stock at specific physical stores (grocery stores and the stores inside shopping malls in covered US cities), with the store's price and the exact time Aisles last checked.

This repository holds the public ways to use it. All of them are read-only, free, and need no key or sign-in.

| What | Where |
|---|---|
| MCP server (remote) | `https://aislesinventory.com/mcp` (Streamable HTTP); official MCP Registry: `com.aislesinventory/aisles` |
| MCP server (local, stdio), CLI and JavaScript client | npm: [`aisles-mcp`](https://www.npmjs.com/package/aisles-mcp) (this repository's root) |
| Agent skills | [`aisles-local-stock`](skills/aisles-local-stock/SKILL.md), [`aisles-mall-stores`](skills/aisles-mall-stores/SKILL.md), [`aisles-grocery-pickup`](skills/aisles-grocery-pickup/SKILL.md), [`aisles-price-compare`](skills/aisles-price-compare/SKILL.md) |
| Go client | [`go/`](go/): `go get github.com/aislesinventory/aisles/go` |
| Python client | [`python/`](python/): `pip install aisles-client` |
| Agent plugin | [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) with [`.mcp.json`](.mcp.json) |
| Rules for coding agents | [`AGENTS.md`](AGENTS.md) |
| Docs | https://aislesinventory.com/developers |

## MCP server

Remote (clients that support it):

```json
{ "mcpServers": { "aisles": { "type": "http", "url": "https://aislesinventory.com/mcp" } } }
```

Local over stdio:

```json
{ "mcpServers": { "aisles": { "command": "npx", "args": ["-y", "aisles-mcp"] } } }
```

Tools: `search_products`, `list_locations`, `list_answers`.

## Command line

```
npx -p aisles-mcp aisles search "oat milk" --city chicago --in-stock
npx -p aisles-mcp aisles ask "where can I buy a dozen eggs near 60614"
npx -p aisles-mcp aisles cities TX
```

## JavaScript client

```js
const { createClient } = require('aisles-mcp');
const aisles = createClient();

const { results } = await aisles.search({ q: 'oat milk', city: 'chicago', availability: 'available' });
for (const r of results) console.log(r.summary, r.links.aisles_offer_url);
```

Methods: `search(params)`, `ask(question)`, `locations(filter?)`, `answers(city)`. Errors throw `AislesError` with a stable `code`.

## Agent skill

```
npx skills add aislesinventory/aisles
```

## Using the data

- Stock is what each store reported at the check time shown, not a live shelf count. Say when Aisles checked.
- "unknown" means the check is too old to say; do not call it in stock.
- Link the Aisles page (`links.aisles_offer_url`) when you cite a listing.

API: https://aislesinventory.com/api/v1/docs · OpenAPI: https://aislesinventory.com/openapi.json · Contact: https://aislesinventory.com/contact

MIT license. This repository contains only these public client files; the Aisles service itself is not open source.
