#!/usr/bin/env node
'use strict';
// aisles: look up local store stock from the command line (read-only, no key).
//   aisles search "oat milk" --city chicago [--zip 60614] [--in-stock] [--limit 5] [--json]
//   aisles ask "where can I buy oat milk in chicago"
//   aisles cities [filter]
//   aisles answers <city>
const { createClient } = require('..');

const HELP = `aisles: local store stock from Aisles (https://aislesinventory.com)

Usage:
  aisles search <product words> --city <city> | --zip <zip> [--in-stock] [--limit N] [--json]
  aisles ask "<question>" [--json]
  aisles cities [filter]            covered metros, e.g. "aisles cities TX"
  aisles answers <city>             ready answers for one metro
  aisles --version

Every listing shows when Aisles last checked it; stock can change after a check.
`;

function parse(argv) {
  const out = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--') && ['city', 'zip', 'limit', 'base'].includes(k)) { out.flags[k] = next; i++; } else out.flags[k] = true;
    } else out._.push(a);
  }
  return out;
}

const line = (x) => {
  const price = x.offer?.price ? ` · $${Number(x.offer.price.amount).toFixed(2)}` : '';
  return `${x.product?.title}\n  ${x.store?.name}, ${x.store?.address_text}\n  ${String(x.offer?.availability || 'unknown').replace(/_/g, ' ')}${price} · checked ${x.offer?.last_checked_at}\n  ${x.links?.aisles_offer_url}`;
};

(async () => {
  const { _: args, flags } = parse(process.argv.slice(2));
  if (flags.version) return console.log(require('../package.json').version);
  const [cmd, ...rest] = args;
  if (!cmd || flags.help || cmd === 'help') return process.stdout.write(HELP);
  const client = createClient(flags.base ? { baseUrl: flags.base } : {});
  if (cmd === 'search') {
    const q = rest.join(' ');
    const r = await client.search({ q, city: flags.city, zip: flags.zip, availability: flags['in-stock'] ? 'available' : undefined, perPage: flags.limit || 5 });
    if (flags.json) return console.log(JSON.stringify(r, null, 2));
    if (!r.results.length) return console.log('No matching listings.');
    return console.log(r.results.map(line).join('\n\n'));
  }
  if (cmd === 'ask') {
    const r = await client.ask(rest.join(' '), { limit: flags.limit || 5 });
    if (flags.json) return console.log(JSON.stringify(r, null, 2));
    if (r.message) console.log(`${r.message}\n`);
    if (!r.results.length) return console.log('No matching listings.');
    return console.log(r.results.map((x) => `${x.description}\n  ${x.url}`).join('\n\n'));
  }
  if (cmd === 'cities') {
    const list = await client.locations(rest.join(' ') || undefined);
    if (flags.json) return console.log(JSON.stringify(list, null, 2));
    return console.log(list.map((l) => `${l.name} (${l.slug}): ${l.stores} stores`).join('\n') || 'No covered metro matches.');
  }
  if (cmd === 'answers') {
    const list = await client.answers(rest[0]);
    if (flags.json) return console.log(JSON.stringify(list, null, 2));
    return console.log(list.map((x) => `${x.question}\n  ${x.page}`).join('\n'));
  }
  process.stderr.write(`Unknown command: ${cmd}\n\n${HELP}`);
  process.exit(2);
})().catch((e) => { process.stderr.write(`aisles: ${e.message}\n`); process.exit(1); });
