---
title: Installation
description: discord-mcp als Docker-Container mit Datenvolume für die Discord-Session starten, per docker run oder Compose, mit Ports, Endpunkten und lokaler Entwicklung.
order: 10
slug: installation
section: Einrichtung
---

## Image

Das Image liegt in der GitHub Container Registry und ist für `linux/amd64` und `linux/arm64` gebaut:

```text
ghcr.io/dasred/discord-mcp
```

Verfügbare Tags: `latest`, `<major>` (z. B. `1`), `<major>.<minor>` und die volle Version. Für den Dauerbetrieb nimmst du am besten den Major-Tag.

Das Image enthält die Headless-Shell von Chromium für den Login und läuft als Benutzer `node`.

## Schnellstart

```sh
docker run -d --name mcp-discord \
  -p 3000:3000 \
  -v discord-mcp-data:/var/www/data \
  -e DISCORD_MCP_DISCORD_EMAIL=ich@example.com \
  -e DISCORD_MCP_DISCORD_PASSWORD=dein-passwort \
  ghcr.io/dasred/discord-mcp:1
```

Prüfen, ob der Server läuft:

```sh
curl http://localhost:3000/healthz
```

Der Login passiert erst beim ersten Tool-Aufruf, nicht beim Start.

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

Zugangsdaten legst du in eine `.env` neben der `compose.yaml`, nicht direkt in die Datei.

> [!IMPORTANT]
> `/var/www/data` muss auf einem Volume liegen. Ohne Volume ist nach jedem Neustart ein neuer Login nötig, und häufige Logins von einer Server-IP fallen Discord auf.

`shm_size: 256m` gibt Chromium genug Shared Memory für den Login. Mit dem Standardwert von 64 MB kann der Browser abstürzen.

Wenn du ein Bind-Mount wie `./data` nutzt, muss der Ordner für den Benutzer `node` (UID `1000`) beschreibbar sein:

```sh
mkdir -p data && sudo chown 1000:1000 data
```

## Ports und Endpunkte

| Pfad       | Methode | Beschreibung                                                 |
|------------|---------|--------------------------------------------------------------|
| `/mcp`     | `POST`  | MCP-Endpunkt (Pfad über `DISCORD_MCP_PATH` änderbar)         |
| `/healthz` | `GET`   | Health-Check, ohne Authentifizierung                         |

Der Container lauscht auf Port `3000`. Der Server läuft stateless und nimmt auf `/mcp` nur `POST` an.

## Lokal entwickeln

Für die Entwicklung brauchst du Node.js 26 und npm 11:

```sh
npm ci
npx playwright install chromium
cp .env.example .env
npm run dev
```

Wie du einen Login mit Captcha lokal löst, steht unter [Konfiguration](configuration.md#captcha-oder-neuer-standort).
