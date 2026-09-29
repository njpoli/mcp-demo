// A real MCP server that exposes absolutely nothing. Run: npm run dev
//
// It prints one line and then sits there. That's correct — an stdio server is
// waiting on stdin for a client to start the conversation.
//
// In the Inspector (npm run inspect) it connects and names itself, and there is
// no Tools section at all: capabilities are derived from what you register, so a
// server with nothing registered doesn't advertise tools in the first place.

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

// A factory, not an instance — the SDK builds one server per connection.
function createServer(): McpServer {
    return new McpServer({ name: 'gameshelf', version: '1.0.0' });
}

serveStdio(createServer);

// stderr, not stdout. stdout is the protocol channel from here on.
console.error('gameshelf MCP server running on stdio');
