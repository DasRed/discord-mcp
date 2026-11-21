---
title: Überblick
description: discord-mcp macht dein Discord-Konto als Remote-MCP-Server für Claude nutzbar – Server, Kanäle, Direktnachrichten.
order: 0
section: Einstieg
---

## Was ist discord-mcp?

discord-mcp ist ein [MCP](https://modelcontextprotocol.io)-Server für Discord. Er läuft als Docker-Container und spricht Streamable HTTP, damit du ihn in Claude als Custom Connector einbinden kannst.

Damit kann Claude deine Server, Kanäle und Direktnachrichten auflisten, Nachrichten lesen und, wenn du es erlaubst, Nachrichten in deinem Namen schicken.

## Wofür?

- **Zusammenfassen**: „Was wurde heute im Kanal #ankündigungen besprochen?"
- **Nachlesen**: „Hat mir jemand per Direktnachricht geschrieben?"
- **Antworten**: „Schreib in #orga, dass das Training am Samstag ausfällt." (nur im Schreibmodus)

## Wie funktioniert das?

discord-mcp arbeitet mit einem normalen Benutzerkonto, nicht mit einem Bot. So sieht Claude genau das, was du in Discord auch siehst, inklusive Direktnachrichten.

- **Login per Browser**: Ein Headless-Chromium (Playwright) meldet sich einmal an, liest das Session-Token der Discord-Web-App aus und schließt sich wieder.
- **Daten per API**: Server, Kanäle und Nachrichten kommen danach über dieselbe HTTP-API, die auch die Web-App nutzt. Es wird keine Seite gescrapt.
- **Dauerhafte Session**: Session und Token liegen im Datenverzeichnis. Nach einem Neustart ist kein neuer Login nötig.

Alternativ trägst du das Session-Token direkt ein, dann startet gar kein Browser.

> [!WARNING]
> Ein Benutzerkonto zu automatisieren („Self-Bot") verstößt gegen die [Nutzungsbedingungen von Discord](https://discord.com/terms) und kann zur Sperrung des Kontos führen. Die Nutzung erfolgt auf eigenes Risiko.

## Tools

| Tool                  | Zweck                                         |
|-----------------------|-----------------------------------------------|
| `get_servers`         | Server (Guilds) des Kontos auflisten          |
| `get_channels`        | Kanäle eines Servers auflisten                |
| `get_direct_messages` | Direktnachrichten und Gruppen-DMs auflisten   |
| `read_messages`       | Nachrichten eines Kanals oder einer DM lesen  |
| `send_message`        | Nachricht schicken (nur im Schreibmodus)      |

Details und Parameter stehen unter [Tools](tools.md).

## Basis

Der Tool-Umfang orientiert sich an [elyxlz/discord-mcp](https://github.com/elyxlz/discord-mcp) (Python, stdio). Der Code ist eine eigene Implementierung in Node.js und TypeScript mit HTTP-Transport, Nur-Lesen-Modus als Standard, Zwei-Faktor-Login per TOTP und Direktnachrichten.

## Status

Aktiv im Einsatz. Das Image wird bei jedem Release automatisch nach `ghcr.io/dasred/discord-mcp` gebaut.

## Weiter

1. [Installation](installation.md)
2. [Konfiguration](configuration.md)
3. [In Claude einbinden](claude.md)
