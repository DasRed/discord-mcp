# discord-mcp

Streamable HTTP [MCP](https://modelcontextprotocol.io) server for Discord, shipped as a Docker image. It lets an AI assistant list your servers and channels, read messages and (optionally) send messages as your Discord account.

The tool set follows [elyxlz/discord-mcp](https://github.com/elyxlz/discord-mcp) (Python, stdio). This implementation shares no code with it and works differently:

- **Login with a real browser, data via the API**: Playwright (headless Chromium) is only used to log in. It captures the session token the Discord web app uses and closes the browser again. Servers, channels and messages are then read through the same HTTP API the web app uses, instead of scraping the page.
- **Persistent session**: the browser session and the token are stored in the data directory, so a restart needs no new login.
- **Two-factor authentication** via TOTP secret.
- **Read-only by default**: `send_message` is only available with `DISCORD_MCP_READ_ONLY=false`.
- **Optional bearer token** for the MCP endpoint and a **health check** at `/healthz`.

> [!WARNING]
> Automating a user account ("self-bot") is against the [Discord Terms of Service](https://discord.com/terms) and can get the account suspended. Use it at your own risk, ideally with a dedicated account.

## Requirements

- Node.js 26 and npm 11
- A Discord account (email and password, or a session token)

## Local development

```sh
npm ci
npx playwright install chromium
cp .env.example .env   # set DISCORD_MCP_DISCORD_EMAIL and DISCORD_MCP_DISCORD_PASSWORD
npm run dev            # runs src/index.ts in watch mode
npm test               # vitest
npm run build          # compiles to dist/
```

### Captcha or new-location check

Discord sometimes answers a login from an unknown IP (for example a server) with a captcha or an email verification. In that case log in once on your own machine with a visible browser and copy the session to the server:

```sh
DISCORD_MCP_DISCORD_HEADLESS=false npm run dev
# solve the captcha in the browser window, then call any tool once
# copy ./data/storage-state.json and ./data/token into the data volume of the container
```

Alternatively set `DISCORD_MCP_DISCORD_TOKEN` to a session token; then no browser is started at all.

## Usage

The MCP endpoint is `http://<host>:3000/mcp` (stateless Streamable HTTP, `POST` only).

| Tool            | Arguments                                         | Description                                                                        |
|-----------------|---------------------------------------------------|------------------------------------------------------------------------------------|
| `get_servers`   | –                                                 | List all servers (guilds) of the account                                           |
| `get_channels`  | `server_id`                                       | List the channels of a server, sorted by position, including categories and threads |
| `read_messages` | `channel_id`, `max_messages` (1–500), `hours_back?` | Read the newest messages of a channel, newest first                               |
| `send_message`  | `channel_id`, `content`                           | Send a message, content longer than 2000 characters is split (write mode only)     |

Example request:

```sh
curl -X POST http://localhost:3000/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_servers", "arguments": {}}}'
```

## Environment variables

All variables are documented in [`.env.example`](.env.example).

| Variable                            | Default                      | Description                                                                 |
|-------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `DISCORD_MCP_SERVER_HOST`           | `0.0.0.0`                    | Listen address                                                              |
| `DISCORD_MCP_SERVER_PORT`           | `3000`                       | Listen port                                                                 |
| `DISCORD_MCP_SERVER_LOG_LEVEL`      | `info`                       | Log level                                                                   |
| `DISCORD_MCP_PATH`                  | `/mcp`                       | Path of the MCP endpoint                                                    |
| `DISCORD_MCP_READ_ONLY`             | `true`                       | Only expose read-only tools                                                 |
| `DISCORD_MCP_AUTH_TOKEN`            | –                            | Bearer token required on the MCP endpoint                                   |
| `DISCORD_MCP_DISCORD_EMAIL`         | –                            | Email of the Discord account                                                |
| `DISCORD_MCP_DISCORD_PASSWORD`      | –                            | Password of the Discord account                                             |
| `DISCORD_MCP_DISCORD_TOTP_SECRET`   | –                            | Base32 secret of the authenticator app for two-factor authentication        |
| `DISCORD_MCP_DISCORD_TOKEN`         | –                            | Session token; skips the browser login                                      |
| `DISCORD_MCP_DISCORD_DATA_DIR`      | `./data`                     | Directory for the stored session and token                                  |
| `DISCORD_MCP_DISCORD_HEADLESS`      | `true`                       | Run Chromium without a window                                               |
| `DISCORD_MCP_DISCORD_LOGIN_TIMEOUT` | `120000`                     | Maximum duration of a browser login in milliseconds                         |
| `DISCORD_MCP_DISCORD_API_URL`       | `https://discord.com/api/v9` | Base URL of the Discord API                                                 |

## Docker

```sh
docker run -d --name mcp-discord \
  -p 3000:3000 \
  -v discord-mcp-data:/var/www/data \
  -e DISCORD_MCP_DISCORD_EMAIL=me@example.com \
  -e DISCORD_MCP_DISCORD_PASSWORD=secret \
  ghcr.io/dasred/discord-mcp:latest
```

The image contains the headless shell of Chromium and runs as user `node`. Keep `/var/www/data` on a volume, otherwise every container start needs a new login. When exposing the endpoint to the internet, put it behind a reverse proxy with TLS and authentication or set `DISCORD_MCP_AUTH_TOKEN`.

Releases are created by semantic-release on every push to `main`; the CI pipeline publishes the multi-arch image (`linux/amd64`, `linux/arm64`) to `ghcr.io/dasred/discord-mcp`.
