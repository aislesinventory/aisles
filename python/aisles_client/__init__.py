"""Client for Aisles (https://aislesinventory.com): whether a product is in stock at stores near a
covered US city or ZIP, with the store, price and the time Aisles last checked. Read-only, no key.

    from aisles_client import Aisles
    r = Aisles().search("oat milk", city="chicago", availability="available")
"""
import json
import urllib.error
import urllib.parse
import urllib.request

__version__ = "1.0.0"
DEFAULT_BASE = "https://aislesinventory.com"


class AislesError(Exception):
    def __init__(self, code, message, status=0):
        super().__init__(f"{code} ({status}): {message}")
        self.code, self.message, self.status = code, message, status


class Aisles:
    def __init__(self, base_url=DEFAULT_BASE, timeout=30):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _request(self, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.base_url + path, data=data, method="POST" if data else "GET",
                                     headers={"Accept": "application/json", "Content-Type": "application/json",
                                              "User-Agent": f"aisles-python/{__version__}"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as res:
                return json.loads(res.read().decode())
        except urllib.error.HTTPError as e:
            try:
                err = json.loads(e.read().decode()).get("error", {})
            except ValueError:
                err = {}
            raise AislesError(err.get("code", "http_error"), err.get("message", str(e)), e.code) from None

    def search(self, q, city=None, zip=None, availability=None, fulfillment=None, max_price=None, per_page=None, cursor=None):
        """Listings for a product near a covered city or ZIP: {"pagination": {...}, "results": [...]}."""
        params = {"q": q, "city": city, "zip": zip, "availability": availability,
                  "fulfillment": ",".join(fulfillment) if isinstance(fulfillment, (list, tuple)) else fulfillment,
                  "max_price": max_price, "per_page": per_page, "cursor": cursor}
        return self._request("/api/v1/search?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None}))

    def search_batch(self, queries):
        """Up to 10 searches at once, each a dict like {"q": "oat milk", "city": "chicago"}."""
        return self._request("/api/v1/search/batch", {"queries": queries})

    def ask(self, question):
        """A question in plain words ("oat milk in Chicago"): NLWeb {"query_id", "results"}."""
        return self._request("/ask?" + urllib.parse.urlencode({"query": question}))

    def locations(self, filter=None):
        """Covered metros; filter narrows them, e.g. "TX" or "Kroger"."""
        args = {"filter": filter} if filter else {}
        reply = self._request("/mcp", {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                                       "params": {"name": "list_locations", "arguments": args}})
        if "error" in reply:
            raise AislesError("mcp_error", reply["error"].get("message", ""))
        return reply["result"].get("structuredContent", {}).get("locations", [])
