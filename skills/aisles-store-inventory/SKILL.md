---
name: aisles-store-inventory
description: See what one specific physical store reports carrying and having in stock (for example "what does the Bricks & Minifigs in Frisco have" or "is the Macy's at Roosevelt Field carrying X"), with prices and the time Aisles last checked. Use when the user names a store, not just a product.
---

# Aisles: one store's inventory

Every store Aisles covers has its own page listing the products that store reported, grouped by category, with each listing's availability, price and check time.

## How to use it

1. Find the store: `search_products` on the MCP server `https://aislesinventory.com/mcp` with a product the store sells and the store's city or ZIP. Each listing names its store and links its page (`links.aisles_offer_url` leads to the listing; the store page is the address without the last path segment). Or call `list_locations` with the store's chain or mall as `filter` to confirm Aisles covers it.
2. Read the store page (HTML, or the same address with `.md` for Markdown, or `.json` for the data). It lists the store's products by category with availability and prices.
3. For one product at that store: `GET https://aislesinventory.com/api/v1/search?q=<product>&city=<city>` and keep the listings whose `store.name` is that store.

## Answering

- Name the store and its address, and say when Aisles last checked (absolute time from the page).
- A store page shows what the store reports, not its full shelf: say "Aisles lists" rather than "the store only has".
- "Availability unknown" means the check is too old to say; do not call it in stock.
- Link the store page so the user can browse it.
