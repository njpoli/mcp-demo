// The server itself, with no transport attached. index.ts runs it over stdio,
// http.ts runs the same factory over HTTP.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

type Game = {
    title: string;
    minPlayers: number;
    maxPlayers: number;
    minutes: number | null; // null when nobody has ever timed it
    kind: string;
};

// Resolved against this file, not the working directory — the host decides where
// it launches you from, and it is rarely where you expect.
const GAMES = fileURLToPath(new URL('../data/games.json', import.meta.url));

const describe = (g: Game) =>
    `${g.title} — ${g.minPlayers}-${g.maxPlayers} players, ` +
    `${g.minutes === null ? 'never timed' : `${g.minutes} min`}, ${g.kind}`;

export function createServer(): McpServer {
    const server = new McpServer({ name: 'gameshelf', version: '1.0.0' });

    server.registerTool(
        'find-games',
        {
            title: 'Find games',
            description:
                'Search the board games on the office shelf. Use it whenever someone asks ' +
                'what to play, or whether a group size or a time slot works. Both arguments ' +
                'are optional; with neither, you get the whole shelf.',
            inputSchema: z.object({
                players: z
                    .number()
                    .int()
                    .min(1)
                    .max(12)
                    .optional()
                    .describe('How many people are playing.'),
                maxMinutes: z
                    .number()
                    .int()
                    .min(5)
                    .max(240)
                    .optional()
                    .describe('The longest game you have time for, in minutes.')
            }),
            annotations: { readOnlyHint: true }
        },
        async ({ players, maxMinutes }) => {
            const games: Game[] = JSON.parse(await readFile(GAMES, 'utf8'));

            const filters: string[] = [];
            if (players !== undefined) filters.push(`players=${players}`);
            if (maxMinutes !== undefined) filters.push(`maxMinutes=${maxMinutes}`);
            const searched = filters.join(', ') || 'no filters';

            const group = games.filter(
                g => players === undefined || (players >= g.minPlayers && players <= g.maxPlayers)
            );

            // `null <= 60` is TRUE in JavaScript, because null coerces to 0. Filter
            // on minutes alone and a four-hour campaign comes back as fitting a
            // one-hour slot. Unknown is not zero, so the untimed games are set
            // aside and reported, never guessed at.
            const timed =
                maxMinutes === undefined
                    ? group
                    : group.filter(g => g.minutes !== null && g.minutes <= maxMinutes);
            const untimed =
                maxMinutes === undefined ? [] : group.filter(g => g.minutes === null);

            // A tool result is a prompt, and "no matches" is a dead end: given
            // nothing to reason about, a model invents a reason and retries the
            // identical call. Say what was searched and how to recover.
            const head = timed.length
                ? `${timed.length} of ${games.length} games match ${searched}:\n` +
                  timed.map(describe).join('\n')
                : `No games match ${searched}. The shelf holds ${games.length} games — ` +
                  `call find-games with no arguments to see all of them.`;

            const tail = untimed.length
                ? `\n\nNobody has timed these, so they were not compared against the time ` +
                  `limit: ${untimed.map(g => g.title).join(', ')}.`
                : '';

            return { content: [{ type: 'text', text: head + tail }] };
        }
    );

    return server;
}
