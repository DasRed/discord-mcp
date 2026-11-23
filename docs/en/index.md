---
title: Overview
description: discord-mcp exposes your Discord account as a remote MCP server for Claude, with access to servers, channels and direct messages. How it works and its status.
order: 0
section: Getting started
---

## What is discord-mcp?

discord-mcp is an [MCP](https://modelcontextprotocol.io) server for Discord. It runs as a Docker container and speaks Streamable HTTP, so you can add it to Claude as a custom connector.

Claude can then list your servers, channels and direct messages, read messages and, if you allow it, send messages on your behalf.

## What for?

- **Summaries**: "What was discussed in #announcements today?"
- **Catching up**: "Did anyone send me a direct message?"
- **Replies**: "Post in #orga that Saturday's training is cancelled." (write mode only)

## How does it work?

discord-mcp uses a regular user account, not a bot. Claude sees exactly what you see in Discord, including direct messages.

- **Browser login**: a headless Chromium (Playwright) logs in once, captures the session token of the Discord web app and closes again.
- **Data via API**: servers, channels and messages are then fetched through the same HTTP API the web app uses. No page scraping.
- **Persistent session**: session and token are stored in the data directory. A restart needs no new login.

Alternatively you set the session token directly, then no browser is started at all.

> [!WARNING]
> Automating a user account ("self-bot") is against the [Discord Terms of Service](https://discord.com/terms) and can get the account suspended. Use at your own risk.

## Tools

| Tool                  | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `get_servers`         | List the account's servers (guilds)           |
| `get_channels`        | List the channels of a server                 |
| `get_direct_messages` | List direct messages and group DMs            |
| `read_messages`       | Read messages of a channel or DM              |
| `send_message`        | Send a message (write mode only)              |

Details and parameters are in [Tools](tools.md).

## Base

The tool set follows [elyxlz/discord-mcp](https://github.com/elyxlz/discord-mcp) (Python, stdio). The code is an independent Node.js/TypeScript implementation with HTTP transport, read-only mode by default, two-factor login via TOTP and direct messages.

## Status

Actively used. The image is built automatically to `ghcr.io/dasred/discord-mcp` on every release.

## Next

1. [Installation](installation.md)
2. [Configuration](configuration.md)
3. [Connect to Claude](claude.md)
4. [Other MCP clients](clients.md)
