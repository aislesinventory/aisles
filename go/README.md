# aisles (Go)

Go client for [Aisles](https://aislesinventory.com): whether a product is in stock at stores near a covered US city or ZIP, with the store, price and the time Aisles last checked. Read-only, free, no key.

```
go get github.com/aislesinventory/aisles/go
```

```go
c := aisles.New()
r, err := c.Search(ctx, aisles.SearchParams{Q: "oat milk", City: "chicago", Availability: "available"})
for _, l := range r.Results {
	fmt.Println(l.Summary, l.Links.AislesOfferURL)
}
```

Also `Ask(ctx, "oat milk in Chicago")` and `Locations(ctx, "TX")`. Docs: https://aislesinventory.com/developers
