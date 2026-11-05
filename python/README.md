# aisles-client (Python)

Python client for [Aisles](https://aislesinventory.com): whether a product is in stock at stores near a covered US city or ZIP, with the store, price and the time Aisles last checked. Read-only, free, no key. Standard library only.

```
pip install aisles-client
```

```python
from aisles_client import Aisles

r = Aisles().search("oat milk", city="chicago", availability="available")
for l in r["results"]:
    print(l["summary"], l["links"]["aisles_offer_url"])
```

Also `search_batch([...])`, `ask("oat milk in Chicago")` and `locations("TX")`, and a command line: `aisles-py search "oat milk" --city chicago`.

Docs: https://aislesinventory.com/developers · Source: https://github.com/aislesinventory/aisles
