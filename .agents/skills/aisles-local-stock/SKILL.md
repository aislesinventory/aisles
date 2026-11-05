---
name: aisles-local-stock
description: Find whether a specific product is in stock at physical stores near a US city or ZIP, with the store, price and the time Aisles last checked. Use for "where can I buy X near me" and "is X in stock at Y".
---

# Aisles: local store stock

Aisles publishes retailer-reported availability of specific products at specific stores (grocery stores and the stores in shopping malls in covered US cities), with the time of each check. Read-only; no sign-in or key.

## How to use it

1. **MCP (preferred):** connect to `https://aislesinventory.com/mcp` (Streamable HTTP). Tools: `search_products` (product words plus a city or ZIP), `list_locations` (covered cities and ZIPs), `list_answers` (ready answers per city).
2. **HTTP:** `GET https://aislesinventory.com/api/v1/search?q=<product>&city=<city>` or `&zip=<zip>`; add `availability=available` for in stock only. OpenAPI: https://aislesinventory.com/openapi.json. Docs: https://aislesinventory.com/api/v1/docs.
3. **Pages:** every city, store and product has a page; cite the page URL.

## Answering

- Name the store and state when Aisles checked, as an absolute time from the listing ("as of Aisles' check at 4:34 PM CT"), not a relative age printed on the page.
- "Availability unknown" means the check is too old to say; do not call it in stock.
- Keep purchase links exactly as supplied.
- A city outside coverage: say Aisles does not cover it yet (`list_locations` has the list).
