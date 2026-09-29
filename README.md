# Build an MCP server in seven branches

A Model Context Protocol server, built from nothing in seven steps. Each step is a
git branch, and **every branch runs**. You are on `main`, which is the finished state.

The server exposes a shelf of board games as a single `find-games` tool, reading a
local JSON file. **No network calls, no API keys.** You can follow the whole build
offline.

```
find-games({ players: 5, maxMinutes: 60 })

5 of 12 games match players=5, maxMinutes=60:
Codenames — 2-8 players, 15 min, party
Just One — 3-7 players, 20 min, party
7 Wonders — 3-7 players, 30 min, strategy
Ticket to Ride — 2-5 players, 45 min, family
Wingspan — 1-5 players, 60 min, strategy

Nobody has timed these, so they were not compared against the time limit: Hues and Cues.
```

## Setup

```bash
npm install
```

That is the only install you need. Every branch ships the identical `package.json`,
so this survives every `git switch` — no reinstalling as you move through the steps.

Requires **Node 20 or newer** (`node --version`). Nothing is compiled: `tsx` runs
the TypeScript directly.

## The branches

Walk them in order.

| Branch | What it adds |
|---|---|
| `00-start` | Project scaffold. `package.json`, `tsconfig.json`, a hello-world `src/index.ts`. No MCP yet. |
| `01-server` | A real MCP server that exposes *nothing*. Shows what a server with no capabilities looks like to a client. |
| `02-first-tool` | `registerTool` with no arguments. One function becomes one tool. |
| `03-tool-args` | A tool with a Zod schema. One schema does three jobs: published JSON Schema, runtime validation, and TypeScript types in the handler. |
| `04-real-data` | The `find-games` tool over `data/games.json`. Two optional arguments, real data, still no network. |
| `05-continue` | `.continue/mcpServers/gameshelf.yaml` — registers the server with the Continue.dev VS Code extension so a real model can call it. |
| `06-http` | The same server over Streamable HTTP instead of stdio. `src/server.ts` holds the server, `src/index.ts` and `src/http.ts` are the two transports. |
| `main` | `06-http` plus this README. |

```bash
git switch 02-first-tool
```

Each branch's `src/index.ts` opens with a comment explaining what changed and how to
run it. Read those; they are the real documentation.

## Running a branch

**Directly** — starts, prints a banner on stderr, then waits for a client on stdin:

```bash
npx tsx src/index.ts
```

It looks like it has hung. It hasn't; it is waiting to be spoken to. Ctrl+C to quit.

**With the MCP Inspector** — a browser UI that acts as an MCP client. Needs no model
and no account, which is why steps 01–04 use it:

```bash
npm run inspect
```

**Over HTTP** (branch `06-http` only):

```bash
npx tsx src/http.ts
# then, in another terminal:
curl -s -X POST http://localhost:3333/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Set `PORT` to use a different port. It is not 3000 on purpose — that port is already
taken on most developers' machines, and an MCP client that mysteriously receives HTML
is a confusing thing to debug.

**In Continue.dev** (branch `05-continue` onward): open this folder as your VS Code
workspace, then switch Continue to **Agent mode** — MCP tools are invisible in Chat
and Edit mode. Ask it something like *"there are five of us and about an hour before
dinner — what should we play?"* and watch it pick the tool, and the arguments, on its
own. You never mention `find-games`.

## Versions

Built against the **MCP TypeScript SDK v2** (`@modelcontextprotocol/server` 2.x).
If you have seen an MCP tutorial that imports `@modelcontextprotocol/sdk` and calls
`server.tool(...)`, that is the v1 API — still supported, but this repo uses v2:

| v1 | v2 |
|---|---|
| `@modelcontextprotocol/sdk` | `@modelcontextprotocol/server` |
| `server.tool(name, shape, cb)` | `server.registerTool(name, config, handler)` |
| bare Zod shape | `inputSchema: z.object({ ... })` |
| `new StdioServerTransport()` + `await server.connect(t)` | `serveStdio(createServer)` |
| `StreamableHTTPServerTransport` | `createMcpHandler(createServer)` |

## Three things that will bite you

1. **On stdio, stdout *is* the protocol channel.** A stray `console.log` in your
   server is a malformed message to the client, and the connection dies with a
   parse error that points nowhere useful. Log with `console.error`.
2. **Resolve your file paths relative to the module, not the process.** Hosts launch
   your server from whatever directory they like. See `GAMES` in `src/server.ts`.
3. **Unknown is not zero.** Two games on the shelf have never been timed, so their
   `minutes` is `null` — and `null <= 60` is `true` in JavaScript. The obvious time
   filter reports a four-hour campaign game as fitting a twenty-minute slot. A tool
   that quietly guesses is worse than one that says "I don't know".

And one that is really about prompting: **a tool result is a prompt.** When
`find-games` finds nothing it says what it searched and how to get a result. The
version that just said "no matches" left a model with nothing to reason about, so it
invented a reason, retried the identical call, and gave up.

## Links

- Spec and docs — <https://modelcontextprotocol.io>
- TypeScript SDK — <https://github.com/modelcontextprotocol/typescript-sdk>
- Inspector — <https://github.com/modelcontextprotocol/inspector>
- Continue.dev MCP docs — <https://docs.continue.dev/customize/deep-dives/mcp>
