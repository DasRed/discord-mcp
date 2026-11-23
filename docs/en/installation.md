---
title: Installation
description: Run discord-mcp as a Docker container with a data volume for the Discord session, using docker run or Compose, with ports, endpoints and local development.
order: 10
slug: installation
section: Setup
---

## Image

The image is published to the GitHub Container Registry for `linux/amd64` and `linux/arm64`:

```text
ghcr.io/dasred/discord-mcp
```

Available tags: `latest`, `<major>` (e.g. `1`), `<major>.<minor>` and the full version. For long-running setups use the major tag.

The image contains the headless shell of Chromium for the login and runs as user `node`.

## Quick start

```sh
docker run -d --name mcp-discord \
  -p 3000:3000 \
  -v discord-mcp-data:/var/www/data \
  -e DISCORD_MCP_DISCORD_EMAIL=me@example.com \
  -e DISCORD_MCP_DISCORD_PASSWORD=your-password \
  ghcr.io/dasred/discord-mcp:1
```

Check that the server is running:

```sh
curl http://localhost:3000/healthz
```

The login happens on the first tool call, not at startup.

## Docker Compose

```yaml
services:
  mcp-discord:
    image: ghcr.io/dasred/discord-mcp:1
    restart: unless-stopped
    shm_size: 256m
    security_opt:
      - no-new-privileges:true
    environment:
      DISCORD_MCP_DISCORD_EMAIL: ${DISCORD_EMAIL}
      DISCORD_MCP_DISCORD_PASSWORD: ${DISCORD_PASSWORD}
      DISCORD_MCP_DISCORD_TOTP_SECRET: ${DISCORD_TOTP_SECRET}
      DISCORD_MCP_READ_ONLY: 'true'
    volumes:
      - ./data:/var/www/data
    ports:
      - '127.0.0.1:3000:3000'
```

Put the credentials into a `.env` file next to `compose.yaml`, not into the file itself.

> [!IMPORTANT]
> `/var/www/data` must be on a volume. Without it every restart needs a new login, and frequent logins from a server IP attract Discord's attention.

`shm_size: 256m` gives Chromium enough shared memory for the login. With the default of 64 MB the browser may crash.

If you use a bind mount like `./data`, the folder must be writable for user `node` (UID `1000`):

```sh
mkdir -p data && sudo chown 1000:1000 data
```

## Ports and endpoints

| Path       | Method | Description                                             |
|------------|--------|---------------------------------------------------------|
| `/mcp`     | `POST` | MCP endpoint (path configurable via `DISCORD_MCP_PATH`) |
| `/healthz` | `GET`  | Health check, no authentication                         |

The container listens on port `3000`. The server is stateless and only accepts `POST` on `/mcp`.

## Local development

For development you need Node.js 26 and npm 11:

```sh
npm ci
npx playwright install chromium
cp .env.example .env
npm run dev
```

How to solve a login captcha locally is described in [Configuration](configuration.md#captcha-or-new-location).
