// The tool takes arguments now, described once in Zod. Inspect it: npm run inspect
//
// That one schema does three jobs: it becomes the JSON Schema the model is
// shown, it validates every incoming call before the handler runs, and it types
// the handler's arguments. Try direction=backward count=3, then count=99.

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

function createServer(): McpServer {
    const server = new McpServer({ name: 'gameshelf', version: '1.0.0' });

    server.registerTool(
        'do-a-flip',
        {
            title: 'Do a flip',
            description: 'Performs one or more flips in a given direction.',
            inputSchema: z.object({
                direction: z.enum(['forward', 'backward']).describe('Which way to flip'),
                count: z
                    .number()
                    .int()
                    .min(1)
                    .max(5)
                    .default(1)
                    .describe('How many flips to perform, 1 to 5')
            }),
            annotations: { readOnlyHint: true }
        },
        async ({ direction, count }) => ({
            content: [
                {
                    type: 'text',
                    text: `Performed ${count} ${direction} flip${count === 1 ? '' : 's'}. Stuck the landing.`
                }
            ]
        })
    );

    return server;
}

serveStdio(createServer);

console.error('gameshelf MCP server running on stdio');
