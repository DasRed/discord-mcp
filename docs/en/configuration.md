---
title: Configuration
description: All environment variables of discord-mcp with defaults, plus login via password, TOTP or session token.
order: 20
slug: configuration
section: Setup
---

## Environment variables

discord-mcp is configured entirely through environment variables. All variables start with `DISCORD_MCP_`. A template is in [`.env.example`](https://github.com/DasRed/discord-mcp/blob/main/.env.example).

| Name                                | Default                      | Description                                                                          |
|-------------------------------------|------------------------------|--------------------------------------------------------------------------------------|
| `DISCORD_MCP_SERVER_HOST`           | `0.0.0.0`                    | Listen address.                                                                      |
| `DISCORD_MCP_SERVER_PORT`           | `3000`                       | Listen port.                                                                         |
| `DISCORD_MCP_SERVER_LOG_LEVEL`      | `info`                       | Log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`.           |
| `DISCORD_MCP_PATH`                  | `/mcp`                       | Path of the MCP endpoint.                                                            |
| `DISCORD_MCP_READ_ONLY`             | `true`                       | Expose only read-only tools. With `false`, `send_message` is added.                  |
| `DISCORD_MCP_AUTH_TOKEN`            | –                            | If set, `/mcp` requires the header `Authorization: Bearer <token>`.                  |
| `DISCORD_MCP_DISCORD_EMAIL`         | –                            | Email of the Discord account for the browser login.                                  |
| `DISCORD_MCP_DISCORD_PASSWORD`      | –                            | Password of the Discord account.                                                     |
| `DISCORD_MCP_DISCORD_TOTP_SECRET`   | –                            | Base32 secret of the authenticator app, needed for two-factor login.                 |
| `DISCORD_MCP_DISCORD_TOKEN`         | –                            | Session token. If set, no browser is started.                                        |
| `DISCORD_MCP_DISCORD_DATA_DIR`      | `./data`                     | Directory for session and token. `/var/www/data` in the image.                       |
| `DISCORD_MCP_DISCORD_HEADLESS`      | `true`                       | Run Chromium without a window. Set to `false` locally to solve a captcha.            |
| `DISCORD_MCP_DISCORD_LOGIN_TIMEOUT` | `120000`                     | Maximum duration of a browser login in milliseconds.                                 |
| `DISCORD_MCP_DISCORD_API_URL`       | `https://discord.com/api/v9` | Base URL of the Discord API.                                                         |

## Login

The server gets the session token in this order:

1. **`DISCORD_MCP_DISCORD_TOKEN`**, if set.
2. **Stored token** from the data directory (file `token`).
3. **Browser login** with email, password and TOTP if needed. Token and browser session are then stored in the data directory.

If Discord answers with `401`, the server drops the token and logs in again. That requires email and password. With a token alone and no credentials, you have to set a new one yourself when it expires.

### Two-factor login

If 2FA is enabled, the server needs the secret of your authenticator app, not a single code.

1. In Discord: **Settings** → **My Account** → **Enable Authenticator App** (or set it up again).
2. At the QR code, show the key as text.
3. Set the key as `DISCORD_MCP_DISCORD_TOTP_SECRET` and add it to your authenticator app at the same time.

### Read the session token yourself

Instead of a password you can take the token from your own browser:

1. Open Discord in the browser and log in.
2. Open the developer tools, tab **Network**.
3. Select any request to `discord.com/api/`.
4. Copy the value of the request header `Authorization` and set it as `DISCORD_MCP_DISCORD_TOKEN`.

> [!CAUTION]
> The token is worth as much as your password. Whoever has it is logged in as you. Logging out in Discord invalidates it.

### Captcha or new location

Discord sometimes answers a login from an unknown IP (e.g. a server) with a captcha or an email confirmation. Then log in once locally with a visible browser and copy the session to the server:

```sh
DISCORD_MCP_DISCORD_HEADLESS=false npm run dev
```

1. Solve the captcha in the browser window.
2. Call any tool once.
3. Copy `./data/storage-state.json` and `./data/token` into the data volume of the container.

Or simply set `DISCORD_MCP_DISCORD_TOKEN`.

## Example

```sh
DISCORD_MCP_DISCORD_EMAIL=me@example.com
DISCORD_MCP_DISCORD_PASSWORD=your-password
DISCORD_MCP_DISCORD_TOTP_SECRET=JBSWY3DPEHPK3PXP
DISCORD_MCP_READ_ONLY=true
```
