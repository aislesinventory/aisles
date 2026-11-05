---
name: aisles-price-compare
description: Compare a product's in-store price across nearby stores and chains in a covered US city, from Aisles' retailer-reported listings with check times. Use for "where is X cheapest near me" or "is X cheaper at Kroger or Mariano's".
---

# Aisles: compare store prices nearby

## How to use it

1. `GET https://aislesinventory.com/api/v1/search?q=<product>&city=<city>&availability=available&per_page=20` (or `search_products` on the MCP server `https://aislesinventory.com/mcp`).
2. Compare `offer.price.amount` across listings of the same product (same title and size).
3. For a city-wide view, `list_answers` for the city includes ready answers such as the cheapest product per category and chain price comparisons.

## Answering

- Compare only the same product and size; package sizes differ between chains.
- Prices are each store's own reported price, including any promotion it reported, as of the check time shown. Say when Aisles checked.
- Name the cheapest store and the price difference; link each listing's Aisles page.
