---
name: aisles-grocery-pickup
description: Find a grocery item in stock near a US city or ZIP with curbside pickup, store pickup or delivery, and its store price and check time. Use for "where can I pick up X today near me" or "which store near me has X for curbside pickup".
---

# Aisles: groceries with pickup or delivery

Aisles reports grocery stock and the store's own pickup and delivery options for chains such as Kroger, Ralphs, Fry's, Mariano's, QFC, Fred Meyer, Harris Teeter and Food 4 Less, checked about once a day.

## How to use it

- HTTP: `GET https://aislesinventory.com/api/v1/search?q=<item>&zip=<zip>&availability=available&fulfillment=curbside_pickup` (or `store_pickup`, `pickup_today`, `local_delivery`, `same_day_delivery`; a comma list means all are required).
- MCP: `search_products` on `https://aislesinventory.com/mcp` with the item and the city or ZIP, then keep listings whose fulfillment includes the way the user wants.
- Several items at once: `POST https://aislesinventory.com/api/v1/search/batch` with up to 10 searches.

## Answering

- Pickup and delivery are reported separately from stock: say both ("in stock, curbside pickup available").
- Ship-to-store is not same-day pickup.
- Give the store price as reported and the time Aisles checked; stock can change after a check.
