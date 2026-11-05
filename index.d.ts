export interface Listing {
  summary: string;
  retailer: { name: string };
  product: { brand?: string; title: string; category?: string };
  store: { name: string; address_text: string; distance_miles?: number };
  offer: { availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown'; price?: { amount: number; currency: string }; last_checked_at: string };
  links: { aisles_offer_url: string; purchase_url?: string };
}
export interface SearchParams { q: string; city?: string; zip?: string; availability?: 'available' | 'out_of_stock' | 'unknown' | 'any'; fulfillment?: string | string[]; maxPrice?: number; perPage?: number; radius?: number }
export interface AskResult { query_id: string; query: { text: string; product_words: string; location: string; location_named: boolean }; message?: string; results: { url: string; name: string; site: string; score: number; description: string; schema_object: object }[] }
export interface Location { slug: string; name: string; chains: string[]; malls: string[]; stores: number; page: string }
export interface AislesClient {
  baseUrl: string;
  search(params: SearchParams): Promise<{ pagination: { total: number; page: number; per_page: number }; results: Listing[] }>;
  ask(query: string, opts?: { city?: string; zip?: string; limit?: number }): Promise<AskResult>;
  locations(filter?: string): Promise<Location[]>;
  answers(location: string): Promise<{ question: string; page: string }[]>;
  mcp(message: object): Promise<object | null>;
  callTool(name: string, args?: object): Promise<object>;
}
export class AislesError extends Error { code: string; status: number }
export function createClient(opts?: { baseUrl?: string; fetch?: typeof fetch }): AislesClient;
export const DEFAULT_BASE: string;
