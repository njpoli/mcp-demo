// The same server over Streamable HTTP. Run: npx tsx src/http.ts
//
// stdio means the host launches your server as a child process on this machine:
// one user, local files, no auth story. HTTP means one endpoint many clients
// connect to, and now you own authentication. Only the createMcpHandler line
// below is MCP-specific; the rest is ordinary Node plumbing.
//
// Not port 3000 on purpose — that one is usually already taken, and "my MCP
// server returned HTML" is a confusing five minutes.

import { createServer as createHttpServer } from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { createServer } from './server.js';

const handler = createMcpHandler(createServer);
const PORT = Number(process.env.PORT ?? 3333);

createHttpServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);

    const response = await handler.fetch(
        new Request(new URL(req.url ?? '/', `http://localhost:${PORT}`), {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
            duplex: 'half'
        } as RequestInit)
    );

    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
}).listen(PORT, () => {
    // stdout is fine here: only the stdio transport owns stdout.
    console.log(`gameshelf MCP server listening on http://localhost:${PORT}/mcp`);
});
