#!/usr/bin/env node
'use strict';
// MCP over stdio for Aisles: each JSON-RPC message from the client is sent to the Aisles MCP server
// (https://aislesinventory.com/mcp, Streamable HTTP) and its reply written back, one message per line.
// For MCP clients that start a local command:  { "command": "npx", "args": ["-y", "aisles-mcp"] }
const readline = require('node:readline');
const { createClient } = require('..');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write('aisles-mcp: Aisles MCP server over stdio (read-only, no key).\nAdd to your MCP client: {"command": "npx", "args": ["-y", "aisles-mcp"]}\nEnvironment: AISLES_BASE_URL (default https://aislesinventory.com)\n');
  process.exit(0);
}

const client = createClient();
const write = (msg) => process.stdout.write(`${JSON.stringify(msg)}\n`);
const failed = (id, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code: -32603, message } });

let queue = Promise.resolve();
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  if (!line.trim()) return;
  queue = queue.then(async () => {
    let msg;
    try { msg = JSON.parse(line); } catch { return write({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
    try {
      const reply = await client.mcp(msg);
      if (reply) write(reply);
    } catch (e) {
      // Notifications get no reply; requests get the error.
      if (Array.isArray(msg)) msg.filter((m) => m.id != null).forEach((m) => write(failed(m.id, `Aisles unreachable: ${e.message}`)));
      else if (msg.id != null) write(failed(msg.id, `Aisles unreachable: ${e.message}`));
    }
  });
});
rl.on('close', () => { queue.then(() => process.exit(0)); });
