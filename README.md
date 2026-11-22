# discord-mcp

Streamable HTTP [MCP](https://modelcontextprotocol.io) server for Discord, shipped as a Docker image. It lets Claude list your servers, channels and direct messages, read messages and – if enabled – send messages as your Discord account. A headless Chromium is only used to log in; all data is fetched through the Discord HTTP API.

The tool set follows [elyxlz/discord-mcp](https://github.com/elyxlz/discord-mcp); this is an independent Node.js/TypeScript implementation.

Documentation: https://www.marco-starker.de/en/projects/discord-mcp/docs

> [!WARNING]
> Automating a user account ("self-bot") is against the [Discord Terms of Service](https://discord.com/terms) and can get the account suspended. Use it at your own risk.

## Quick start

```sh
docker run -d --name mcp-discord \
  -p 3000:3000 \
  -v discord-mcp-data:/var/www/data \
  -e DISCORD_MCP_DISCORD_EMAIL=me@example.com \
  -e DISCORD_MCP_DISCORD_PASSWORD=your-password \
  ghcr.io/dasred/discord-mcp:1
```

The MCP endpoint is `http://localhost:3000/mcp`. Never expose it to the internet without TLS and access control.

## Local development

Requires Node.js 26 and npm 11.

```sh
npm ci
npx playwright install chromium
cp .env.example .env
npm run dev
npm test
npm run build
```

Releases are created by semantic-release from Conventional Commits on `main`.

## License

MIT
