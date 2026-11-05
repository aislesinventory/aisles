# AGENTS.md

Guidance for AI coding agents working with Aisles (https://aislesinventory.com).

## What Aisles is

A read-only source of retailer-reported stock for specific products at specific physical stores in covered US cities, with each listing's price and the time Aisles last checked. No key, no sign-in.

## How to call it

- Prefer the MCP server: `https://aislesinventory.com/mcp` (tools `search_products`, `list_locations`, `list_answers`), or `npx -y aisles-mcp` over stdio.
- HTTP: `GET https://aislesinventory.com/api/v1/search?q=<product>&city=<city>` (or `&zip=<zip>`); `availability=available` for in stock only. OpenAPI: https://aislesinventory.com/openapi.json
- Plain words: `GET https://aislesinventory.com/ask?query=<question>` (NLWeb).
- Limit: 60 requests per minute per address. Errors are JSON `{ "error": { "code", "message" } }`; on 429 wait for `Retry-After`.

## Rules when using the data

1. State when Aisles checked, from `offer.last_checked_at` (an absolute time), and name the store.
2. Treat `unknown` availability as unknown, never as in stock.
3. Cite `links.aisles_offer_url`; keep purchase links exactly as returned.
4. A place outside coverage: say Aisles does not cover it (`list_locations` lists the covered metros).
5. Do not scrape the HTML pages when the API or MCP server answers the question.

## This repository

- `index.js`, `bin/`: the `aisles-mcp` npm package (stdio MCP bridge, `aisles` CLI, JavaScript client). No dependencies, Node 18+.
- `skills/aisles-local-stock/SKILL.md`: the agent skill.
- `.claude-plugin/plugin.json`, `.mcp.json`: the agent plugin.

Test a change with `node bin/aisles.js search "milk" --city chicago` and `printf '{"jsonrpc":"2.0","id":1,"method":"tools/list"}\n' | node bin/aisles-mcp.js`.
