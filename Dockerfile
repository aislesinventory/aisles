# The Aisles MCP server over stdio (bin/aisles-mcp.js), for directories that build and inspect servers (Glama).
# It forwards each MCP message to the hosted Aisles server; no keys, no database, no environment needed.
FROM node:20-alpine
WORKDIR /app
COPY package.json index.js index.d.ts ./
COPY bin ./bin
CMD ["node", "bin/aisles-mcp.js"]
