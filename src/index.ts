// One tool, no arguments. Inspect it: npm run inspect
//
// A Tools section has appeared that wasn't there last branch, and registering
// the tool is what made the server advertise one. No route table, no manifest,
// no hand-written schema — a tool is a function you registered.
//
// (Switched branches with the Inspector already open? Toggle the connection off
// and back on. The tool list is read once, at connect time.)

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

function createServer(): McpServer {
    const server = new McpServer({ name: 'gameshelf', version: '1.0.0' });

    server.registerTool(
        'do-a-barrel-roll',
        {
            title: 'Do a barrel roll',
            description: 'Performs a single celebratory barrel roll and reports back.',
            annotations: { readOnlyHint: true, idempotentHint: true }
        },
        async () => ({
            content: [{ type: 'text', text: 'Barrel roll complete. Nothing was harmed.' }]
        })
    );

    return server;
}

serveStdio(createServer);

console.error('gameshelf MCP server running on stdio');
