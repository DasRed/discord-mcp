---
title: Connect to Claude
description: Add discord-mcp as a custom connector in Claude (web, desktop, mobile), as a remote MCP server in Claude Code or via JSON configuration in other MCP clients, test the connection and fix common problems.
order: 30
slug: claude
section: Setup
---

## Requirements

- discord-mcp is running and reachable from the internet via HTTPS, e.g. at `https://discord.mcp.example.com/mcp`.
- Access is restricted (see [Security](security.md)).

> [!IMPORTANT]
> Custom connectors in Claude connect from Anthropic's servers, not from your machine. A URL that only works in your home network is not enough.

## Claude (web, desktop, mobile)

1. **Settings** → **Connectors** → **Add custom connector**.
2. Name: e.g. `Discord`.
3. URL: `https://discord.mcp.example.com/mcp`
4. Save.

Claude connectors cannot send custom headers, so no bearer token either. Restrict the endpoint at the reverse proxy instead, e.g. with an IP allowlist containing [Anthropic's outbound IP addresses](https://docs.claude.com/en/api/ip-addresses).

With write mode enabled, set Claude's connector settings so that Claude has to ask before `send_message`. Otherwise Claude sends messages on your behalf without asking.

## Claude Code

In Claude Code you can pass the bearer token directly:

```sh
claude mcp add --transport http discord https://discord.mcp.example.com/mcp \
  --header "Authorization: Bearer your-mcp-auth-token"
```

This requires `DISCORD_MCP_AUTH_TOKEN` to be set on the server.

## Other MCP clients (JSON configuration)

Many MCP clients are configured with a JSON entry under `mcpServers`, e.g. the `.mcp.json` of Claude Code or clients with their own web UI. For discord-mcp the entry looks like this:

```json
{
  "mcpServers": {
    "discord": {
      "type": "http",
      "url": "https://discord.mcp.example.com/mcp",
      "headers": {
        "Authorization": "Bearer your-mcp-auth-token"
      }
    }
  }
}
```

- Depending on the client, `type` is `http` or `streamable-http`.
- Leave out `headers` if `DISCORD_MCP_AUTH_TOKEN` is not set on the server.
- These clients connect from your machine, so an address in your home network is enough, e.g. `http://192.168.1.10:3000/mcp`.

Clients that only start local servers via stdio (e.g. the `claude_desktop_config.json` of Claude Desktop) connect through [mcp-remote](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://discord.mcp.example.com/mcp",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer your-mcp-auth-token"
      }
    }
  }
}
```

The token goes into `env` because some clients do not pass spaces in `args` correctly. For an `http://` address other than `localhost`, mcp-remote also needs `--allow-http`.

## Test

Ask Claude for example:

- "Which Discord servers am I on?"
- "Summarize the last 24 hours in #general."
- "Did anyone send me a direct message?"

Claude should call `get_servers`, `get_channels` and `read_messages` or `get_direct_messages` for that.

## Troubleshooting

| Symptom                     | Cause                                                                                  |
|-----------------------------|----------------------------------------------------------------------------------------|
| Connector does not connect  | Server not publicly reachable, or the reverse proxy blocks Anthropic's IPs.            |
| `401 Unauthorized`          | `DISCORD_MCP_AUTH_TOKEN` is set but the client sends no or a wrong token.              |
| `405 Method not allowed`    | Expected for `GET`. The server is stateless and only accepts `POST`.                   |
| `send_message` is missing   | `DISCORD_MCP_READ_ONLY` is `true`.                                                     |
| Tool reports a login error  | Wrong credentials, missing TOTP secret or Discord wants a captcha (see [Configuration](configuration.md#captcha-or-new-location)). |
| First call takes long       | Expected: the first call runs the browser login, which can take up to two minutes.     |
| `Missing Access`            | The account has no access to this channel or server.                                   |

After changing the tool set, disconnect and reconnect the connector in Claude once so it loads the new tool list.
