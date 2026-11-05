"""aisles-py: look up local store stock from the command line.

    aisles-py search "oat milk" --city chicago --in-stock
    aisles-py ask "where can I buy eggs near 60614"
    aisles-py cities TX
"""
import argparse
import json
import sys

from . import Aisles, AislesError


def main(argv=None):
    p = argparse.ArgumentParser(prog="aisles-py", description="Local store stock from Aisles (https://aislesinventory.com).")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search")
    s.add_argument("words", nargs="+")
    s.add_argument("--city")
    s.add_argument("--zip")
    s.add_argument("--in-stock", action="store_true")
    s.add_argument("--limit", type=int, default=5)
    a = sub.add_parser("ask")
    a.add_argument("words", nargs="+")
    c = sub.add_parser("cities")
    c.add_argument("filter", nargs="*")
    p.add_argument("--json", action="store_true")
    args = p.parse_args(argv)
    client = Aisles()
    try:
        if args.cmd == "search":
            out = client.search(" ".join(args.words), city=args.city, zip=args.zip,
                                availability="available" if args.in_stock else None, per_page=args.limit)
            rows = [f"{r['summary']}\n  {r['links']['aisles_offer_url']}" for r in out["results"]] or ["No matching listings."]
        elif args.cmd == "ask":
            out = client.ask(" ".join(args.words))
            rows = ([out["message"]] if out.get("message") else []) + [f"{r['description']}\n  {r['url']}" for r in out["results"]]
        else:
            out = client.locations(" ".join(args.filter) or None)
            rows = [f"{l['name']} ({l['slug']}): {l['stores']} stores" for l in out] or ["No covered metro matches."]
    except AislesError as e:
        print(f"aisles-py: {e}", file=sys.stderr)
        return 1
    print(json.dumps(out, indent=2) if args.json else "\n\n".join(rows))
    return 0


if __name__ == "__main__":
    sys.exit(main())
