---
name: aisles-mall-stores
description: Find which stores inside a US shopping mall carry a product or brand, and whether it is in stock there, with the time Aisles last checked. Use for "does any store at Roosevelt Field have X" or "which stores at the mall sell Y".
---

# Aisles: stores inside shopping malls

Aisles covers the stores inside specific shopping malls (for example Roosevelt Field, Mall of Georgia, Woodfield Mall, The Galleria in Houston, King of Prussia), as each retailer reports its in-store stock.

## How to use it

1. Find the mall's metro: call `list_locations` on the MCP server `https://aislesinventory.com/mcp` with `filter` set to the mall's name (e.g. "Roosevelt Field"). It returns the metro slug and the malls covered there.
2. Search: `search_products` with the product or brand and that metro (or the mall's ZIP).
3. For broad questions ("what stores at the mall sell sneakers"), `list_answers` for the metro lists the mall's ready answers, each with its page.

HTTP alternative: `GET https://aislesinventory.com/api/v1/search?q=<product>&city=<metro>`.

## Answering

- Name the store and the mall, and say when Aisles checked (an absolute time from the listing).
- Mall listings show in-store availability only; they do not report pickup or delivery.
- Products come in several sizes and colors, so a price may be a range.
- "Availability unknown" means the check is too old to say; do not call it in stock.
