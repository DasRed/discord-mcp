---
title: In Claude einbinden
description: discord-mcp als Custom Connector in Claude oder als Remote-MCP-Server in Claude Code einbinden und testen.
order: 30
slug: claude
section: Einrichtung
---

## Voraussetzungen

- discord-mcp läuft und ist per HTTPS aus dem Internet erreichbar, z. B. unter `https://discord.mcp.example.com/mcp`.
- Der Zugriff ist abgesichert (siehe [Sicherheit](security.md)).

> [!IMPORTANT]
> Custom Connectors in Claude verbinden sich von den Servern von Anthropic aus, nicht von deinem Rechner. Eine URL, die nur in deinem Heimnetz funktioniert, reicht nicht.

## Claude (Web, Desktop, Mobile)

1. **Einstellungen** → **Connectors** → **Custom Connector hinzufügen**.
2. Name: z. B. `Discord`.
3. URL: `https://discord.mcp.example.com/mcp`
4. Speichern.

Claude-Connectors können keine eigenen Header mitschicken, also auch keinen Bearer-Token. Sichere den Endpunkt deshalb am Reverse Proxy ab, z. B. über eine IP-Allowlist mit den [ausgehenden IP-Adressen von Anthropic](https://docs.claude.com/en/api/ip-addresses).

Bei aktivem Schreibmodus solltest du in den Connector-Einstellungen von Claude festlegen, dass Claude vor `send_message` nachfragen muss. Sonst schickt Claude Nachrichten in deinem Namen ohne Rückfrage.

## Claude Code

In Claude Code kannst du den Bearer-Token direkt mitgeben:

```sh
claude mcp add --transport http discord https://discord.mcp.example.com/mcp \
  --header "Authorization: Bearer dein-mcp-auth-token"
```

Dafür muss `DISCORD_MCP_AUTH_TOKEN` am Server gesetzt sein.

## Testen

Frag Claude zum Beispiel:

- „Auf welchen Discord-Servern bin ich?"
- „Fass die Nachrichten der letzten 24 Stunden in #allgemein zusammen."
- „Hat mir jemand eine Direktnachricht geschrieben?"

Claude sollte dafür `get_servers`, `get_channels` und `read_messages` bzw. `get_direct_messages` aufrufen.

## Fehlersuche

| Symptom                              | Ursache                                                                                         |
|--------------------------------------|-------------------------------------------------------------------------------------------------|
| Connector lässt sich nicht verbinden | Server nicht öffentlich erreichbar oder der Reverse Proxy blockt die IPs von Anthropic.         |
| `401 Unauthorized`                   | `DISCORD_MCP_AUTH_TOKEN` ist gesetzt, der Client schickt aber keinen oder einen falschen Token. |
| `405 Method not allowed`             | Normal bei `GET`. Der Server ist stateless und nimmt nur `POST` an.                             |
| `send_message` fehlt                 | `DISCORD_MCP_READ_ONLY` steht auf `true`.                                                       |
| Tool meldet Login-Fehler             | Zugangsdaten falsch, TOTP-Secret fehlt oder Discord will ein Captcha (siehe [Konfiguration](configuration.md#captcha-oder-neuer-standort)). |
| Erster Aufruf dauert lange           | Normal: Beim ersten Aufruf läuft der Browser-Login, das kann bis zu zwei Minuten dauern.        |
| `Missing Access`                     | Das Konto hat keinen Zugriff auf diesen Kanal oder Server.                                      |

Nach Änderungen an den Tools musst du den Connector in Claude einmal trennen und neu verbinden, damit Claude die neue Tool-Liste lädt.
