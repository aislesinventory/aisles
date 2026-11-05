// Package aisles is a client for Aisles (https://aislesinventory.com): whether a product is in stock at
// stores near a covered US city or ZIP, with the store, price and the time Aisles last checked.
// Read-only and free; no key or sign-in.
//
//	c := aisles.New()
//	r, err := c.Search(ctx, aisles.SearchParams{Q: "oat milk", City: "chicago", Availability: "available"})
package aisles

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// DefaultBaseURL is the public Aisles site.
const DefaultBaseURL = "https://aislesinventory.com"

// Client calls the public Aisles endpoints.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
	UserAgent  string
}

// New returns a client for the public site.
func New() *Client {
	return &Client{BaseURL: DefaultBaseURL, HTTPClient: &http.Client{Timeout: 30 * time.Second}, UserAgent: "aisles-go/1.0"}
}

// Error is an error reply from Aisles: { "error": { "code", "message" } }.
type Error struct {
	Status  int    `json:"-"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *Error) Error() string { return fmt.Sprintf("aisles: %s (%d): %s", e.Code, e.Status, e.Message) }

// Listing is one product at one store.
type Listing struct {
	Summary  string `json:"summary"`
	Retailer struct {
		Name string `json:"name"`
	} `json:"retailer"`
	Product struct {
		Brand    string `json:"brand"`
		Title    string `json:"title"`
		Category string `json:"category"`
	} `json:"product"`
	Store struct {
		Name          string  `json:"name"`
		AddressText   string  `json:"address_text"`
		DistanceMiles float64 `json:"distance_miles"`
	} `json:"store"`
	Offer struct {
		Availability string `json:"availability"`
		Price        *struct {
			Amount   float64 `json:"amount"`
			Currency string  `json:"currency"`
		} `json:"price"`
		LastCheckedAt string `json:"last_checked_at"`
	} `json:"offer"`
	Links struct {
		AislesOfferURL string `json:"aisles_offer_url"`
		PurchaseURL    string `json:"purchase_url"`
	} `json:"links"`
}

// SearchResult is one page of listings.
type SearchResult struct {
	Pagination struct {
		Total      int     `json:"total"`
		Page       int     `json:"page"`
		PerPage    int     `json:"per_page"`
		NextCursor *string `json:"next_cursor"`
	} `json:"pagination"`
	Results []Listing `json:"results"`
}

// SearchParams are the search API's parameters. Q is required; give City or ZIP.
type SearchParams struct {
	Q            string
	City         string
	ZIP          string
	Availability string // "available" for in stock or low stock only
	Fulfillment  []string
	MaxPrice     float64
	PerPage      int
	Cursor       string // a previous result's Pagination.NextCursor
}

// Search finds a product at stores near a city or ZIP.
func (c *Client) Search(ctx context.Context, p SearchParams) (*SearchResult, error) {
	if p.Q == "" {
		return nil, &Error{Code: "invalid_parameter", Message: "Q is required"}
	}
	v := url.Values{"q": {p.Q}}
	set := func(k, val string) {
		if val != "" {
			v.Set(k, val)
		}
	}
	set("city", p.City)
	set("zip", p.ZIP)
	set("availability", p.Availability)
	set("fulfillment", strings.Join(p.Fulfillment, ","))
	set("cursor", p.Cursor)
	if p.MaxPrice > 0 {
		v.Set("max_price", strconv.FormatFloat(p.MaxPrice, 'f', -1, 64))
	}
	if p.PerPage > 0 {
		v.Set("per_page", strconv.Itoa(p.PerPage))
	}
	var out SearchResult
	return &out, c.get(ctx, "/api/v1/search?"+v.Encode(), &out)
}

// AskResult is an NLWeb answer to a question in plain words.
type AskResult struct {
	QueryID string `json:"query_id"`
	Message string `json:"message"`
	Results []struct {
		URL         string `json:"url"`
		Name        string `json:"name"`
		Description string `json:"description"`
	} `json:"results"`
}

// Ask answers a question such as "oat milk in Chicago".
func (c *Client) Ask(ctx context.Context, question string) (*AskResult, error) {
	var out AskResult
	return &out, c.get(ctx, "/ask?"+url.Values{"query": {question}}.Encode(), &out)
}

// Location is one covered metro.
type Location struct {
	Slug   string   `json:"slug"`
	Name   string   `json:"name"`
	Chains []string `json:"chains"`
	Malls  []string `json:"malls"`
	Stores int      `json:"stores"`
	Page   string   `json:"page"`
}

// Locations lists the covered metros; filter (optional) narrows them, e.g. "TX" or "Kroger".
func (c *Client) Locations(ctx context.Context, filter string) ([]Location, error) {
	args := map[string]any{}
	if filter != "" {
		args["filter"] = filter
	}
	var r struct {
		StructuredContent struct {
			Locations []Location `json:"locations"`
		} `json:"structuredContent"`
	}
	if err := c.callTool(ctx, "list_locations", args, &r); err != nil {
		return nil, err
	}
	return r.StructuredContent.Locations, nil
}

func (c *Client) do(req *http.Request, out any) error {
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", c.UserAgent)
	hc := c.HTTPClient
	if hc == nil {
		hc = http.DefaultClient
	}
	res, err := hc.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, 8<<20))
	if err != nil {
		return err
	}
	if res.StatusCode >= 400 {
		var e struct {
			Error Error `json:"error"`
		}
		if json.Unmarshal(body, &e) == nil && e.Error.Code != "" {
			e.Error.Status = res.StatusCode
			return &e.Error
		}
		return &Error{Status: res.StatusCode, Code: "http_error", Message: strings.TrimSpace(string(body))}
	}
	return json.Unmarshal(body, out)
}

func (c *Client) get(ctx context.Context, path string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(c.BaseURL, "/")+path, nil)
	if err != nil {
		return err
	}
	return c.do(req, out)
}

func (c *Client) callTool(ctx context.Context, name string, args map[string]any, out any) error {
	msg, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": map[string]any{"name": name, "arguments": args}})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, strings.TrimRight(c.BaseURL, "/")+"/mcp", bytes.NewReader(msg))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	var reply struct {
		Result json.RawMessage `json:"result"`
		Error  *struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := c.do(req, &reply); err != nil {
		return err
	}
	if reply.Error != nil {
		return &Error{Code: "mcp_error", Message: reply.Error.Message}
	}
	return json.Unmarshal(reply.Result, out)
}
