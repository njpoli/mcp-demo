# Running this server in Cline

`mcp.json` next to this file is the config for [Cline](https://cline.bot). Unlike
`.continue/mcpServers/gameshelf.yaml`, **Cline will not find it here** — Cline keeps MCP
servers in one global file, not per project. So this is a copy-me, not a drop-in.

## Where the real file lives

| | Path |
|---|---|
| VS Code extension | `cline_mcp_settings.json` in Cline's settings directory — open it from the MCP Servers icon → **Configure**, which is easier than hunting for it |
| CLI | `~/.cline/mcp.json` |

Both take the same `mcpServers` object. (The settings directory defaults to `~/.cline` and
moves with `CLINE_MCP_SETTINGS_PATH`, `CLINE_DATA_DIR` or `CLINE_DIR` — but those relocate
*all* of Cline's data, so don't set them just for this.)

## Copying it in

1. Open Cline's settings file. If it already has servers, paste `gameshelf` **inside** the
   existing `mcpServers` object rather than adding a second one.
2. Set `cwd` to wherever you cloned this repo. It matters twice: `args` is relative to it,
   and `npx` only finds the `tsx` you installed if it runs inside the project. On Windows
   write `C:/Users/you/mcp-demo` or `C:\\Users\\you\\mcp-demo` — a single backslash is not
   valid JSON.
3. Save. Cline watches the file and reconnects on its own; no reload needed.

Strict JSON, so no comments and no trailing commas — Cline answers a syntax error with
*"Invalid JSON in MCP settings file"* and connects nothing.

## Two notes

**Leave `autoApprove` alone.** It's a Cline-only key that skips the approval prompt for the
tools you list. The prompt is the interesting part — it's the moment the model asks to use
something you wrote.

**Over HTTP instead:** on the branch that has `src/http.ts`, start it and swap the three
stdio keys for `"type": "streamableHttp"` and `"url": "http://localhost:3333/mcp"`.

---

Worth noticing: one global file with absolute paths is how **most** hosts do this — Claude
Desktop, Cursor, Claude Code's user scope. Continue's project-level file is the exception.
Either way the server itself is unchanged; only the paperwork moves.
