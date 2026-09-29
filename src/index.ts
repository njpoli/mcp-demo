// The stdio entry point. Run: npm run dev

import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';

serveStdio(createServer);

console.error('gameshelf MCP server running on stdio');
