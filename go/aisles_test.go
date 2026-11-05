package aisles

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSearchAndErrors(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.URL.Query().Get("q") == "bad" {
			w.WriteHeader(400)
			w.Write([]byte(`{"error":{"code":"invalid_parameter","message":"nope"}}`))
			return
		}
		w.Write([]byte(`{"pagination":{"total":1,"page":1,"per_page":10,"next_cursor":null},"results":[{"summary":"s","store":{"name":"Store"},"offer":{"availability":"in_stock","last_checked_at":"2026-11-04T15:00:00Z"}}]}`))
	}))
	defer srv.Close()
	c := New()
	c.BaseURL = srv.URL
	r, err := c.Search(context.Background(), SearchParams{Q: "milk", City: "chicago"})
	if err != nil || len(r.Results) != 1 || r.Results[0].Store.Name != "Store" {
		t.Fatalf("search: %v %+v", err, r)
	}
	if _, err := c.Search(context.Background(), SearchParams{Q: "bad"}); err == nil {
		t.Fatal("want error")
	} else if e, ok := err.(*Error); !ok || e.Code != "invalid_parameter" || e.Status != 400 {
		t.Fatalf("error: %#v", err)
	}
}
