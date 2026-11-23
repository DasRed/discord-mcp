---
title: Security
description: What discord-mcp may do with your Discord account, what the Terms of Service say about it, where credentials are stored and how to protect the endpoint.
order: 50
slug: security
section: Reference
---

## Terms of Service

> [!WARNING]
> discord-mcp controls a regular user account. Discord considers that a "self-bot", which is against its [Terms of Service](https://discord.com/terms). Discord may suspend the account. Ideally use a dedicated account and expect that it may be noticed at some point.

To keep the risk low, the server behaves like the web app as far as possible: same API, browser user agent, stored session instead of frequent logins and a short pause between the parts of long messages.

## Default: read-only

Without further settings the server only exposes `get_servers`, `get_channels`, `get_direct_messages` and `read_messages`. Claude can read everything your account sees, but cannot send anything.

Even read-only that is a lot: private servers, direct messages and group DMs. Think about whether Claude should see all of it.

## Write mode

With `DISCORD_MCP_READ_ONLY=false` Claude can use `send_message` to write into every channel and DM your account may write to, on your behalf.

> [!CAUTION]
> Others cannot tell that Claude wrote the message. Configure Claude to always ask before `send_message`.

Deleting, editing, reactions, joining or leaving servers are intentionally not available.

## Credentials

- Email, password and TOTP secret are only used for the browser login on `discord.com` and are never sent to Claude.
- The session token is stored in the data directory in the file `token` with permissions `600`. Next to it, the browser session is stored in `storage-state.json`.
- Anyone who can read the data volume can log in as you. Treat it like a password and keep it out of backups others can read.
- Logging out all sessions in Discord or changing the password invalidates the token.

## Protecting the endpoint

Anyone who can reach `/mcp` can read your messages and, in write mode, write on your behalf. Never leave the endpoint open on the internet.

| Option                                  | Suitable for                  | How                                                          |
|-----------------------------------------|-------------------------------|--------------------------------------------------------------|
| IP allowlist at reverse proxy           | Claude (web, desktop, mobile) | Allow only [Anthropic's IPs](https://docs.claude.com/en/api/ip-addresses) and your own network. |
| Bearer token (`DISCORD_MCP_AUTH_TOKEN`) | Claude Code, own clients      | Set a long random value, e.g. `openssl rand -hex 32`.        |
| Internal only                           | Clients in the same network   | Bind the port to `127.0.0.1` or an internal network.         |

`/healthz` is intentionally unauthenticated and reveals nothing about the account.

## Container

- The image runs as user `node`, not `root`.
- Only `/var/www/data` needs to be writable.
- Chromium only starts for the login and is closed again afterwards.
- Secrets belong in a `.env` file or a secret store, not in a `compose.yaml` committed to Git.
